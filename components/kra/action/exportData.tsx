"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ExportKRAModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  department: string | null;
  kraType?: "employee" | "department" | "hr";
}

export const ExportKRAModal = ({
  isOpen,
  onClose,
  employeeId,
  department,
  kraType = "employee",
}: ExportKRAModalProps) => {
  const [exportType, setExportType] = useState<string>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const quarters = [
    { key: "Q1", label: "1st Quarter (Jan - Mar)" },
    { key: "Q2", label: "2nd Quarter (Apr - Jun)" },
    { key: "Q3", label: "3rd Quarter (Jul - Sep)" },
    { key: "Q4", label: "4th Quarter (Oct - Dec)" },
  ];

  const currentQuarter = useMemo(() => {
    if (currentMonthIndex <= 2) return "Q1";
    if (currentMonthIndex <= 5) return "Q2";
    if (currentMonthIndex <= 8) return "Q3";
    return "Q4";
  }, [currentMonthIndex]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Auto defaults
  useEffect(() => {
    setSelectedYear(String(currentYear));

    if (exportType === "monthly") {
      setSelectedMonth(String(currentMonthIndex));
    }

    if (exportType === "quarterly") {
      setSelectedQuarter(currentQuarter);
    }
  }, [exportType, currentMonthIndex, currentQuarter, currentYear]);

  const handleExport = async () => {
    setLoading(true);
    setDownloadUrl(null);

    const payload: any = {
      type: exportType,
      employeeId,
      department,
      year: selectedYear,
      kraType,
    };

    if (exportType === "monthly") {
      payload.month = Number(selectedMonth) + 1;
    }

    if (exportType === "quarterly") {
      payload.quarter = selectedQuarter;
    }

    try {
      const response = await fetch(
        "http://localhost:5678/webhook-test/41f62eeb-1555-4e7f-a90b-8a3ae38a50dc",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to export file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const generatedFileName = `KRA-${exportType}-${selectedYear}.xlsx`;

      setFileName(generatedFileName);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (downloadUrl) {
          window.URL.revokeObjectURL(downloadUrl);
        }
        setDownloadUrl(null);
        onClose();
      }}
    >
      <ModalContent>
        <ModalHeader>Export KRA to Excel</ModalHeader>

        <ModalBody className="space-y-4">
          <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Note: Only <span className="font-semibold">approved scores</span>{" "}
              will be included in the export. Any unapproved or pending
              evaluations will not appear in the generated file.
            </p>
          </div>

          {/* Export Type */}
          <div>
            <label className="text-sm font-medium">Export Type</label>
            <select
              className="w-full mt-1 border rounded-md p-2 bg-white"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Monthly */}
          {exportType === "monthly" && (
            <>
              <div>
                <label className="text-sm font-medium">Select Month</label>
                <select
                  className="w-full mt-1 border rounded-md p-2 bg-white"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Select Year</label>
                <select
                  className="w-full mt-1 border rounded-md p-2 bg-white"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Quarterly */}
          {exportType === "quarterly" && (
            <>
              <div>
                <label className="text-sm font-medium">Select Quarter</label>
                <select
                  className="w-full mt-1 border rounded-md p-2 bg-white"
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                >
                  {quarters.map((q) => (
                    <option key={q.key} value={q.key}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Select Year</label>
                <select
                  className="w-full mt-1 border rounded-md p-2 bg-white"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Yearly */}
          {exportType === "yearly" && (
            <div>
              <label className="text-sm font-medium">Select Year</label>
              <select
                className="w-full mt-1 border rounded-md p-2 bg-white"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {downloadUrl && (
            <div className="mt-4 p-3 border rounded-md bg-green-50">
              <p className="text-sm text-green-700 mb-2">File is ready 🎉</p>
              <a
                href={downloadUrl}
                download={fileName}
                className="text-blue-600 underline font-medium"
              >
                Download {fileName}
              </a>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleExport} isLoading={loading}>
            Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
