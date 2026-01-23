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
  const [isWeekly, setIsWeekly] = useState(false);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGenerateReport = async (onClose: () => void) => {
    // Validation
    if (isWeekly) {
      if (!weekStart || !weekEnd) {
        alert("⚠️ Please enter both start and end dates for weekly report.");
        return;
      }
    } else if (isYearly) {
      if (!year) {
        alert("⚠️ Please enter a year.");
        return;
      }
    } else {
      if (!month || !year) {
        alert("⚠️ Please enter month and year for monthly report.");
        return;
      }
    }

    // Prepare payload
    const payload: any = { userName: user?.name };
    if (isWeekly) {
      payload.weekStart = weekStart;
      payload.weekEnd = weekEnd;
    } else if (isYearly) {
      payload.year = year;
    } else {
      payload.month = month;
      payload.year = year;
    }

    try {
      setLoading(true);
      setDownloadUrl(null);

      const res = await fetch(
        // "http://192.168.3.192:5678/webhook-test/08f51976-d032-4d9d-82c6-afb51aa755f8",
        "http://192.168.3.192:5678/webhook/08f51976-d032-4d9d-82c6-afb51aa755f8",
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
                {/* Yearly Checkbox */}
                <Checkbox
                  isSelected={isYearly}
                  onValueChange={(val) => {
                    setIsYearly(val);
                    if (val) setIsWeekly(false);
                  }}
                >
                  Generate Yearly Report
                </Checkbox>

                {/* Weekly Checkbox */}
                <Checkbox
                  isSelected={isWeekly}
                  onValueChange={(val) => {
                    setIsWeekly(val);
                    if (val) setIsYearly(false);
                  }}
                >
                  Generate Weekly Report
                </Checkbox>

                {/* Monthly Inputs */}
                {!isYearly && !isWeekly && (
                  <div className="flex gap-3">
                    <Input
                      label="Month"
                      variant="bordered"
                      placeholder="e.g. 09"
                      value={month}
                      onValueChange={setMonth}
                      type="number"
                      min={1}
                      max={12}
                      className="w-1/2"
                      isRequired
                    />
                    <Input
                      label="Year"
                      variant="bordered"
                      placeholder="e.g. 2025"
                      value={year}
                      onValueChange={setYear}
                      type="number"
                      min={2020}
                      max={2100}
                      className="w-1/2"
                      isRequired
                    />
                  </div>
                )}

                {/* Yearly Input */}
                {isYearly && (
                  <Input
                    label="Year"
                    variant="bordered"
                    placeholder="e.g. 2025"
                    value={year}
                    onValueChange={setYear}
                    type="number"
                    min={2020}
                    max={2100}
                    isRequired
                  />
                )}

                {/* Weekly Inputs */}
                {isWeekly && (
                  <div className="flex gap-3">
                    <Input
                      label="Start Date"
                      variant="bordered"
                      type="date"
                      value={weekStart}
                      onValueChange={setWeekStart}
                      isRequired
                      className="w-1/2"
                    />
                    <Input
                      label="End Date"
                      variant="bordered"
                      type="date"
                      value={weekEnd}
                      onValueChange={setWeekEnd}
                      isRequired
                      className="w-1/2"
                    />
                  </div>
                )}

                {loading && <p>Generating report, please wait...</p>}

                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`report-${
                      isWeekly
                        ? `${weekStart}_to_${weekEnd}`
                        : isYearly
                        ? year
                        : `${year}-${month}`
                    }.xlsx`}
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
