"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  TimeInput,
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
import { Time } from "@internationalized/date";
import { ReportCategories } from "@/helpers/data";
import { Projects } from "@/helpers/acumatica";
import { Tab } from "react-aria-components";

interface ReportingProps {
  project: Projects | null;
}

export default function ReportPage({ project }: ReportingProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    timeIn: null as Time | null,
    timeOut: null as Time | null,
    category: "",
    activity: "",
    concern: "",
    actionTaken: "",
    remarks: "",
    attachment: [] as File[],
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleChange("attachment", files);
  };

  useEffect(() => {
    if (project) {
      setProjectId(project.projectId);
    }
  }, [project]);

  const fetchReports = async () => {
    if (!project?.projectId) return;
    try {
      const res = await fetch(
        `/api/department/PMO/project_tasks/projectexecution/reports?project_id=${project.projectId}`
      );
      const data = await res.json();
      if (res.ok) setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [project]);

  const handleSubmit = async () => {
    if (!project?.projectId) {
      alert("Missing project ID");
      return;
    }

    if (!formData.date || !formData.category) {
      alert("Please complete required fields.");
      return;
    }

    const data = new FormData();
    data.append("project_id", project.projectId);
    data.append("date", formData.date);
    if (formData.timeIn) data.append("time_in", formData.timeIn.toString());
    if (formData.timeOut) data.append("time_out", formData.timeOut.toString());
    data.append("category", formData.category);
    data.append("activity", formData.activity);
    data.append("concern", formData.concern);
    data.append("action_taken", formData.actionTaken);
    data.append("remarks", formData.remarks);
    if (formData.attachment.length > 0) {
      formData.attachment.forEach((file, index) => {
        data.append("files[]", file);
        data.append(`attachment_name[${index}]`, file.name);
        data.append(`attachment_type[${index}]`, file.type);
      });
    }

    setLoading(true);
    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectexecution/reports/create",
        { method: "POST", body: data }
      );

      if (!res.ok) {
        alert("Failed to save report.");
        return;
      }

      if (formData.concern?.trim()) {
        await fetch(
          "/api/department/PMO/project_tasks/postProject/post_project_review",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.projectId,
              list: formData.concern,
            }),
          }
        );
      }

      alert("Report saved successfully!");
      onClose();
      setFormData({
        date: "",
        timeIn: null,
        timeOut: null,
        category: "",
        activity: "",
        concern: "",
        actionTaken: "",
        remarks: "",
        attachment: [],
      });
      fetchReports();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daily Activity Reports</h2>
        <Button color="primary" onPress={onOpen}>
          Create Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-10 text-default-500">
          No reports found. Click <b>Create Report</b> to add one.
        </div>
      ) : (
        <Table aria-label="Reports Table" className="mt-4">
          <TableHeader>
            <TableColumn>Date</TableColumn>
            <TableColumn>Category</TableColumn>
            <TableColumn>Activity</TableColumn>
            <TableColumn>Concern</TableColumn>
            <TableColumn>Remarks</TableColumn>
            <TableColumn>Files</TableColumn>
          </TableHeader>
          <TableBody>
            {reports.map((r) => {
              const files: string[] = r.attachment_name
                ? r.attachment_name
                    .split(",")
                    .map((f: string) => f.trim())
                    .filter((f: string) => f.length > 0)
                : [];

              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.report_date
                      ? new Date(r.report_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })
                      : ""}
                  </TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.activity}</TableCell>
                  <TableCell>{r.concern}</TableCell>
                  <TableCell>{r.remarks}</TableCell>
                  <TableCell>
                    {files.length > 0 ? (
                      <ul className="text-xs sm:text-sm mt-1">
                        {files.map((file, i) => (
                          <li key={i}>
                            <a
                              href={`/uploads/reports/${r.project_id}/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {file}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-default-500">No files</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* 🧾 Modal Form */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          base: "mx-2 sm:mx-4",
          body: "px-2 sm:px-6",
          header: "px-2 sm:px-6",
          footer: "px-2 sm:px-6",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">
            Create Daily Activity Report
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  isRequired
                  size="sm"
                />

                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={formData.category ? [formData.category] : []}
                  onChange={(e) => handleChange("category", e.target.value)}
                  size="sm"
                  isRequired
                >
                  {ReportCategories.map((cat) => (
                    <SelectItem key={cat.key}>{cat.value}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <TimeInput
                  label="Time In"
                  value={formData.timeIn}
                  onChange={(value) => handleChange("timeIn", value)}
                  size="sm"
                />
                <TimeInput
                  label="Time Out"
                  value={formData.timeOut}
                  onChange={(value) => handleChange("timeOut", value)}
                  size="sm"
                />
              </div>

              <Textarea
                label="Activity"
                value={formData.activity}
                onChange={(e) => handleChange("activity", e.target.value)}
                size="sm"
                minRows={2}
              />

              <Textarea
                label="Concerns"
                value={formData.concern}
                onChange={(e) => handleChange("concern", e.target.value)}
                size="sm"
                minRows={2}
              />

              <Textarea
                label="Action Taken"
                value={formData.actionTaken}
                onChange={(e) => handleChange("actionTaken", e.target.value)}
                size="sm"
                minRows={2}
              />

              <Textarea
                label="Remarks / Status"
                value={formData.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
                size="sm"
                minRows={2}
              />

              <div>
                <Input
                  type="file"
                  label="Attachment"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  size="sm"
                  multiple
                />
                {formData.attachment.length > 0 && (
                  <ul className="text-xs sm:text-sm text-default-500 mt-1 break-words">
                    {formData.attachment.map((file, i) => (
                      <li key={i}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="light"
              onPress={onClose}
              className="w-full sm:w-auto"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={loading}
              className="w-full sm:w-auto"
              size="sm"
            >
              {loading ? "Saving..." : "Save Report"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
