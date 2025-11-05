"use client";

import React, { useRef, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Checkbox,
  useDisclosure,
  useDraggable,
} from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";

export const GenerateReport = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGenerateReport = async (onClose: () => void) => {
    if (!year) {
      alert("⚠️ Please enter a year.");
      return;
    }

    if (!isYearly && !month) {
      alert("⚠️ Please enter a month for monthly reports.");
      return;
    }

    const payload = isYearly
      ? { userName: user?.name, year }
      : { userName: user?.name, month, year };

    try {
      setLoading(true);
      setDownloadUrl(null);

      const res = await fetch(
        "http://localhost:5678/webhook-test/74e4ab54-d347-4631-bcc0-d9c40633e65f",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to generate report");

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      setLoading(false);
    } catch (err) {
      console.error("❌ Error generating report:", err);
      alert("Failed to generate report");
      setLoading(false);
    }
  };

  return (
    <div>
      <Button color="primary" onPress={onOpen}>
        Generate Report
      </Button>

      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="md"
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                {...moveProps}
                className="w-full flex flex-col gap-2"
              >
                Generate Report
              </ModalHeader>

              <ModalBody className="flex flex-col gap-4">
                <Checkbox
                  isSelected={isYearly}
                  onValueChange={setIsYearly}
                  className="mb-2"
                >
                  Generate Yearly Report
                </Checkbox>

                <div className="flex gap-3">
                  <Input
                    isDisabled={isYearly}
                    isRequired={!isYearly}
                    label="Month"
                    variant="bordered"
                    placeholder="e.g. 09"
                    value={month}
                    onValueChange={setMonth}
                    type="number"
                    min={1}
                    max={12}
                    className="w-1/2"
                  />
                  <Input
                    isRequired
                    label="Year"
                    variant="bordered"
                    placeholder="e.g. 2025"
                    value={year}
                    onValueChange={setYear}
                    type="number"
                    min={2020}
                    max={2100}
                    className="w-1/2"
                  />
                </div>

                {loading && <p>Generating report, please wait...</p>}
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`report-${year}${month ? `-${month}` : ""}.png`}
                    className="text-blue-500 underline"
                  >
                    📥 Download Report
                  </a>
                )}
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleGenerateReport(() => {})}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
