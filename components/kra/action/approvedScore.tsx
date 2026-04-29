"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";

interface ApproveScoreProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  month: number;
  year: number;
  onApproved?: () => void;
  kraType?: "employee" | "department" | "hr";
}

export const ApproveScore: React.FC<ApproveScoreProps> = ({
  isOpen,
  onClose,
  tableId,
  month,
  year,
  onApproved,
  kraType = "employee",
}) => {
  const { user } = useUserContext();
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const scoreEndpoint = useMemo(() => {
    switch (kraType) {
      case "department":
        return "/api/kra/dept/score";

      case "hr":
        return "/api/kra/hr/score";

      default:
        return "/api/kra/score";
    }
  }, [kraType]);

  useEffect(() => {
    if (!isOpen || !tableId) return;

    const load = async () => {
      const res = await fetch(
        `${scoreEndpoint}?tableId=${tableId}&month=${month}&year=${year}`,
      );
      const data = await res.json();
      setScore(data);
    };

    load();
  }, [isOpen, tableId, month, year, scoreEndpoint]);

  const handleApprove = async () => {
    if (!user?.name) return;

    setLoading(true);
    try {
      const res = await fetch(scoreEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          month,
          year,
          approverName: user.name,
          approvedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error();

      onApproved?.();
      onClose();
    } catch {
      alert("Failed to approve score");
    } finally {
      setLoading(false);
    }
  };

  if (!score) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader>Approve Score</ModalHeader>

        <ModalBody className="gap-4">
          <Input label="Rating" value={score.rating} isReadOnly />
          <Input label="Points" value={String(score.points)} isReadOnly />
          <Input label="Total" value={String(score.total)} isReadOnly />
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="success" onPress={handleApprove} isLoading={loading}>
            Confirm Approval
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
