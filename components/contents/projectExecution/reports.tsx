"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";

interface ReportingProps {
  project: Projects | null;
}

export default function ReportPage({ project }: ReportingProps) {
  const { user } = useUserContext();
  const isPMO = user?.department === "PMO";

  /* ---------------- CREATE REPORT MODAL ---------------- */
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  /* ---------------- ADD NOTE MODAL ---------------- */
  const {
    isOpen: isNoteOpen,
    onOpen: onNoteOpen,
    onClose: onNoteClose,
  } = useDisclosure();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- CREATE REPORT FORM ---------------- */
  const [formData, setFormData] = useState({
    date: "",
    remarks: "",
    attachment: [] as File[],
  });

  /* ---------------- NOTE STATE ---------------- */
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [note, setNote] = useState("");

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleChange("attachment", files);
  };

  /* ---------------- FETCH REPORTS ---------------- */
  const fetchReports = useCallback(async () => {
    if (!project?.projectId) return;
    const res = await fetch(
      `/api/department/PMO/project_tasks/projectexecution/reports?project_id=${project.projectId}`
    );
    const data = await res.json();
    if (res.ok) setReports(data);
  }, [project?.projectId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /* ---------------- SAVE REPORT ---------------- */
  const handleSubmit = async () => {
    if (!project?.projectId || !formData.date) return;

    const data = new FormData();
    data.append("project_id", project.projectId);
    data.append("date", formData.date);
    data.append("personnel", user?.name || "Unknown");
    data.append("remarks", formData.remarks);

    formData.attachment.forEach((file, index) => {
      data.append("files[]", file);
      data.append(`attachment_name[${index}]`, file.name);
      data.append(`attachment_type[${index}]`, file.type);
    });

    setLoading(true);
    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectexecution/reports/create",
        { method: "POST", body: data }
      );

      if (res.ok) {
        onCreateClose();
        setFormData({ date: "", remarks: "", attachment: [] });
        fetchReports();
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OPEN NOTE MODAL ---------------- */
  const openNoteModal = (report: any) => {
    if (!isPMO) return;
    setSelectedReport(report);
    setNote(report.note || "");
    onNoteOpen();
  };

  /* ---------------- SAVE NOTE (API PLACEHOLDER) ---------------- */
  const handleSaveNote = async () => {
    if (!selectedReport) return;

    const res = await fetch(
      "/api/department/PMO/project_tasks/projectexecution/reports/note",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: selectedReport.id,
          note,
          note_personnel: user?.name || "Unknown",
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to save note");
      return;
    }
    setReports((prev) =>
      prev.map((r) => (r.id === selectedReport.id ? { ...r, note } : r))
    );

    onNoteClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daily Activity Reports</h2>
        <Button color="primary" onPress={onCreateOpen}>
          Create Report
        </Button>
      </div>

      <Table aria-label="Reports Table">
        <TableHeader>
          <TableColumn>Date</TableColumn>
          <TableColumn>Personnel</TableColumn>
          <TableColumn>Remarks</TableColumn>
          <TableColumn>Files</TableColumn>
          <TableColumn className="text-center">Note</TableColumn>
        </TableHeader>

        <TableBody>
          {reports.map((r) => {
            const files = r.attachment_name
              ? r.attachment_name.split(",").map((f: string) => f.trim())
              : [];

            return (
              <TableRow key={r.id}>
                <TableCell>
                  {new Date(r.report_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{r.personnel}</TableCell>
                <TableCell>{r.remarks}</TableCell>
                <TableCell>
                  {files.length ? (
                    files.map((file: string, i: number) => (
                      <div key={i}>
                        <a
                          href={`/uploads/reports/${r.project_id}/${file}`}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          {file}
                        </a>
                      </div>
                    ))
                  ) : (
                    <span className="text-default-500">No files</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-start justify-between gap-2">
                    {/* LEFT: Note content */}
                    <div className="flex-1 text-left">
                      {r.note ? (
                        <>
                          <p className="text-xs text-default-700 line-clamp-2">
                            {r.note}
                          </p>
                          {r.note_personnel && (
                            <p className="text-[10px] text-default-500 mt-1">
                              validated by: <b>{r.note_personnel}</b>
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-default-400 text-xs">
                          No note
                        </span>
                      )}
                    </div>

                    {isPMO && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => openNoteModal(r)}
                      >
                        <PlusIcon size={20} fill="#979797" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ---------------- ADD NOTE MODAL ---------------- */}
      <Modal isOpen={isNoteOpen} onClose={onNoteClose} backdrop="blur">
        <ModalContent>
          <ModalHeader>Add / Edit Note</ModalHeader>
          <ModalBody className="space-y-3">
            {selectedReport && (
              <>
                <div className="text-sm text-default-500">
                  <p>
                    <b>Date:</b>{" "}
                    {new Date(selectedReport.report_date).toLocaleDateString()}
                  </p>
                  <p>
                    <b>Personnel:</b> {selectedReport.personnel}
                  </p>
                  <p>
                    <b>Remarks:</b> {selectedReport.remarks}
                  </p>
                </div>

                <Textarea
                  label="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  minRows={3}
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onNoteClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveNote}
              isDisabled={!isPMO}
            >
              Save Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ---------------- CREATE REPORT MODAL ---------------- */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="5xl">
        <ModalContent>
          <ModalHeader>Create Daily Activity Report</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              isRequired
            />
            <Textarea
              label="Remarks"
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
            />
            <Input
              type="file"
              label="Attachment"
              multiple
              onChange={handleFileChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCreateClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
              Save Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
