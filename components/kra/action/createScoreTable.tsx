"use client";

import React, { useState } from "react";
import {
  Button,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  NumberInput,
} from "@heroui/react";
import { mutate } from "swr";
import { useUserContext } from "@/components/layout/UserContext";

interface KRAModalProps {
  triggerText?: string;
  employeeId?: string | null;
}

export const KRAModal: React.FC<KRAModalProps> = ({
  triggerText = "Add KRA",
  employeeId,
}) => {
  const { user } = useUserContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [kra, setKra] = useState("");
  const [kpi, setKpi] = useState("");
  const [achievement, setAchievement] = useState("");
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [excellent, setExcellent] = useState("");
  const [veryGood, setVeryGood] = useState("");
  const [good, setGood] = useState("");
  const [needImprovement, setNeedImprovement] = useState("");
  const [poor, setPoor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      alert("User information is not available.");
      return;
    }

    // Basic validation
    if (
      !kra.trim() &&
      !kpi.trim() &&
      !achievement.trim() &&
      !weight &&
      !excellent.trim() &&
      !veryGood.trim() &&
      !good.trim() &&
      !needImprovement.trim() &&
      !poor.trim()
    ) {
      alert("Please fill all required input before submitting.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        kra,
        kpi,
        achievement,
        weight,
        excellent,
        veryGood,
        good,
        needImprovement,
        poor,
        userId: employeeId,
        userName: user.name,
        userDepartment: user.department || "Unknown Department",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/kra/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([payload]),
      });

      if (!res.ok) throw new Error("Failed to save KRA data");

      alert("KRA saved successfully!");

      // Reset all fields
      setKra("");
      setKpi("");
      setAchievement("");
      setWeight(undefined);
      setExcellent("");
      setVeryGood("");
      setGood("");
      setNeedImprovement("");
      setPoor("");

      onOpenChange();
      await mutate(`/api/kra?employeeId=${employeeId}`);
    } catch (err) {
      console.error(err);
      alert("Error submitting KRA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        {triggerText}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add KRA</ModalHeader>
              <ModalBody className="space-y-4 max-h-[70vh] overflow-y-auto">
                <Textarea
                  label="KRA"
                  labelPlacement="outside"
                  placeholder="Enter KRA"
                  value={kra}
                  onValueChange={setKra}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="KPI"
                  labelPlacement="outside"
                  placeholder="Enter KPI"
                  value={kpi}
                  onValueChange={setKpi}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="Achievement"
                  labelPlacement="outside"
                  placeholder="Enter Achievement"
                  value={achievement}
                  onValueChange={setAchievement}
                  variant="underlined"
                  className="w-full"
                />
                <NumberInput
                  label="Weight"
                  labelPlacement="outside"
                  placeholder="Enter Weight Percentage"
                  formatOptions={{ style: "percent" }}
                  value={weight}
                  onValueChange={setWeight}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="Excellent"
                  labelPlacement="outside"
                  placeholder="Enter Excellent"
                  value={excellent}
                  onValueChange={setExcellent}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="Very Good"
                  labelPlacement="outside"
                  placeholder="Enter Very Good"
                  value={veryGood}
                  onValueChange={setVeryGood}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="Good"
                  labelPlacement="outside"
                  placeholder="Enter Good"
                  value={good}
                  onValueChange={setGood}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="Need Improvement"
                  labelPlacement="outside"
                  placeholder="Enter Need Improvement"
                  value={needImprovement}
                  onValueChange={setNeedImprovement}
                  variant="underlined"
                  className="w-full"
                />
                <Textarea
                  label="Poor"
                  labelPlacement="outside"
                  placeholder="Enter Poor"
                  value={poor}
                  onValueChange={setPoor}
                  variant="underlined"
                  className="w-full"
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => onClose()}
                  isDisabled={loading}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={loading}
                  isDisabled={loading}
                >
                  Save KRA
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
