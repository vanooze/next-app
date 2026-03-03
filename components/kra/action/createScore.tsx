"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";

interface CreateScoreProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  userId: number | null;
  weight?: number | string | null;
  month: number;
  year: number;
  onSaved?: () => void;
}

const ratingOptions = [
  { label: "Excellent", value: "excellent", points: 5 },
  { label: "Very Good", value: "very_good", points: 4 },
  { label: "Good", value: "good", points: 3 },
  { label: "Needs Improvement", value: "needs_improvement", points: 2 },
  { label: "Poor", value: "poor", points: 1 },
];

export const CreateScore: React.FC<CreateScoreProps> = ({
  isOpen,
  onClose,
  tableId,
  userId,
  weight,
  month,
  year,
  onSaved,
}) => {
  const [rating, setRating] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // loading existing score

  /** Normalize weight */
  const numericWeight = useMemo(() => {
    if (weight === null || weight === undefined) return 0;

    let parsed =
      typeof weight === "string" ? parseFloat(weight.replace("%", "")) : weight;

    if (isNaN(parsed)) return 0;

    if (parsed > 1) parsed = parsed / 100;

    return parsed;
  }, [weight]);

  /** Compute total */
  const total = useMemo(() => {
    if (!points) return 0;
    return points * numericWeight;
  }, [points, numericWeight]);

  const resetState = () => {
    setRating("");
    setPoints(0);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const handleSelectRating = (value: string) => {
    const selected = ratingOptions.find((r) => r.value === value);
    if (!selected) return;

    setRating(selected.value);
    setPoints(selected.points);
  };

  useEffect(() => {
    if (!isOpen || !tableId || !userId) return;

    const loadScore = async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `/api/kra/score?tableId=${tableId}&month=${month}&year=${year}`,
        );

        if (!res.ok) throw new Error("Failed to fetch score");

        const data = await res.json();

        if (data) {
          setRating(data.rating);
          setPoints(data.points);
        } else {
          resetState();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    loadScore();
  }, [isOpen, tableId, userId]);

  const handleSave = async () => {
    if (!tableId || !userId || !rating) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/kra/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_id: tableId,
          user_id: userId,
          date: new Date().toISOString(),
          month,
          year,
          rating,
          points,
          total,
        }),
      });

      if (!res.ok) throw new Error("Failed to save score");

      onSaved?.();
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} placement="center">
      <ModalContent>
        <ModalHeader>{rating ? "Edit Score" : "Add Score"}</ModalHeader>

        <ModalBody className="gap-4">
          {fetching ? (
            <p className="text-sm text-gray-500">Loading score...</p>
          ) : (
            <>
              <Select
                label="Rating"
                placeholder="Select rating"
                selectedKeys={rating ? [rating] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleSelectRating(value);
                }}
              >
                {ratingOptions.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </Select>

              <Input label="Points" value={String(points)} isReadOnly />
              <Input label="Total" value={String(total)} isReadOnly />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={loading}>
            Save Score
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
