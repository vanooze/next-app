"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDraggable,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate, parseDate } from "@internationalized/date";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import { useUserContext } from "@/components/layout/UserContext";
import { TMIGSelectStatus } from "@/helpers/data";
import { RepairTasks } from "@/helpers/db";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: RepairTasks | null;
}

type FormState = {
  clientName: string;
  description: string;
  personnel: string;
  date: CalendarDate | null;
  status: string;
  unit: string;
  severity: string;
  completion: string;
};

const initialForm: FormState = {
  clientName: "",
  description: "",
  personnel: "",
  date: null,
  status: "Pending",
  unit: "",
  severity: "Low",
  completion: "0",
};

const safeParseDate = (date?: string | null): CalendarDate | null => {
  if (!date) return null;
  try {
    return parseDate(date.split("T")[0]);
  } catch {
    return null;
  }
};

// ✅ ONLY STRING FILES (same as Add Task)
const normalizeFiles = (files: unknown): string[] => {
  if (!files) return [];

  try {
    if (typeof files === "string") {
      const raw = files.trim();
      if (!raw) return [];

      if (raw.startsWith("[")) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      }

      return raw
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    if (Array.isArray(files)) {
      return files.map(String);
    }
  } catch (err) {
    console.error("normalizeFiles error:", err);
  }

  return [];
};

export const EditTask = ({ isOpen, onClose, task }: Props) => {
  const { user } = useUserContext();
  const targetRef = useRef(null);

  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [form, setForm] = useState<FormState>(initialForm);

  // ✅ SAME FORMAT AS ADD TASK
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // PREFILL
  // ===============================
  useEffect(() => {
    if (!task || !isOpen) return;

    setForm({
      clientName: task.clientName || "",
      description: task.description || "",
      personnel: task.personnel || "",
      status: task.status || "Pending",
      unit: task.unit || "",
      severity: task.severity || "Low",
      completion: task.completion || "0",
      date: safeParseDate(task.date),
    });

    setExistingFiles(normalizeFiles(task.files));
    setFilesToDelete([]);
    setNewFiles([]);
  }, [task, isOpen]);

  // ===============================
  // HELPERS
  // ===============================
  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const incoming = Array.from(files);

    setNewFiles((prev) => {
      const merged = [...prev];

      incoming.forEach((file) => {
        const exists = merged.some(
          (f) => f.name === file.name && f.size === file.size,
        );

        if (!exists) merged.push(file);
      });

      return merged;
    });

    e.target.value = "";
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingFile = (file: string) => {
    setExistingFiles((prev) => prev.filter((f) => f !== file));

    setFilesToDelete((prev) => (prev.includes(file) ? prev : [...prev, file]));
  };

  // ===============================
  // SUBMIT (MATCH ADD TASK)
  // ===============================
  const handleSubmit = async () => {
    if (!task?.id) return;

    setLoading(true);

    try {
      const formData = new FormData();

      const payload = {
        id: String(task.id),
        clientName: form.clientName,
        description: form.description,
        date: formatDatetoStr(form.date) || "",
        personnel: form.personnel,
        status: form.status,
        unit: form.unit,
        severity: form.severity,
        completion: form.completion,
        updatedBy: user?.name || "Unknown",
      };

      Object.entries(payload).forEach(([k, v]) => {
        formData.append(k, v);
      });

      // ✅ NEW FILES (same as Add Task)
      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      // ✅ FILES TO DELETE
      formData.append("filesToDelete", JSON.stringify(filesToDelete));

      const res = await fetch("/api/department/TMIG/tasks/update", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      await mutate("/api/department/TMIG/tasks");

      setNewFiles([]);
      setFilesToDelete([]);

      onClose();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <Modal ref={targetRef} isOpen={isOpen} onOpenChange={onClose} size="xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader {...moveProps}>Edit Repair Task</ModalHeader>

            <ModalBody className="grid grid-cols-2 gap-4">
              <Input label="Client Name" value={form.clientName} isDisabled />
              <Input label="Description" value={form.description} isDisabled />

              <Select
                label="Personnel"
                selectedKeys={
                  form.personnel ? new Set([form.personnel]) : new Set()
                }
                onSelectionChange={(keys) =>
                  setField("personnel", Array.from(keys)[0] as string)
                }
              >
                <SelectItem key="PUNAY">Angelito Punay</SelectItem>
                <SelectItem key="JAPITANA">Christopher Japitana</SelectItem>
                <SelectItem key="MARFIL">John Q. Marfil</SelectItem>
              </Select>

              <DatePicker
                label="Date"
                value={form.date}
                onChange={(v) => setField("date", v)}
              />

              <Select
                label="Status"
                items={TMIGSelectStatus}
                selectedKeys={new Set([form.status])}
                onSelectionChange={(keys) =>
                  setField("status", Array.from(keys)[0] as string)
                }
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>

              <Input
                type="number"
                label="Unit"
                value={form.unit}
                onValueChange={(v) => /^\d*$/.test(v) && setField("unit", v)}
              />

              <Input
                type="number"
                label="Completion (%)"
                value={form.completion}
                onValueChange={(v) =>
                  /^\d*$/.test(v) &&
                  Number(v) <= 100 &&
                  setField("completion", v)
                }
              />

              <Select
                label="Severity"
                selectedKeys={new Set([form.severity])}
                onSelectionChange={(keys) =>
                  setField("severity", Array.from(keys)[0] as string)
                }
              >
                {["Low", "Medium", "High"].map((s) => (
                  <SelectItem key={s}>{s}</SelectItem>
                ))}
              </Select>

              {/* EXISTING FILES */}
              <div className="col-span-2">
                <p className="text-sm font-semibold">
                  Existing Files ({existingFiles.length})
                </p>

                {existingFiles.length === 0 ? (
                  <p className="text-sm text-gray-400">No files</p>
                ) : (
                  existingFiles.map((file) => (
                    <div
                      key={file}
                      className="flex justify-between items-center"
                    >
                      <a
                        href={`/uploads/Repair Reports/${encodeURIComponent(
                          file,
                        )}`}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {file}
                      </a>

                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => deleteExistingFile(file)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* NEW FILES */}
              <div className="col-span-2">
                <input type="file" multiple onChange={handleFileChange} />

                {newFiles.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-semibold">
                      New Files ({newFiles.length})
                    </p>

                    {newFiles.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex justify-between"
                      >
                        <span>{file.name}</span>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => removeNewFile(i)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button onClick={onClose} color="danger">
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                isLoading={loading}
                color="primary"
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
