"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDraggable,
  Select,
  SelectItem,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import {
  CalendarDate,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState } from "react";
import { Projects as Project } from "@/helpers/acumatica";

interface EditProjectProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const EditProject = ({ isOpen, onClose, project }: EditProjectProps) => {
  let defaultDate = today(getLocalTimeZone());
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const safeParseDate = (input: string): CalendarDate => {
    const datePart = input.split("T")[0];
    return parseDate(datePart);
  };

  const [id, setId] = useState<number>();
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [description, setDescription] = useState<string>("");
  const [projectManager, setProjectManager] = useState<string>("");

  useEffect(() => {
    if (project) {
      setId(project.id);
      setStatus(project.status ?? "");
      setStartDate(
        project.startDate ? safeParseDate(project.startDate as string) : null
      );
      setEndDate(
        project.endDate ? safeParseDate(project.endDate as string) : null
      );
      setDescription(project.description ?? "");
      setProjectManager(project.projectManager ?? "");
    }
  }, [project]);

  const handleSaveProject = async (onClose: () => void) => {
    const startDateStr = formatDatetoStr(startDate);
    const endDateStr = formatDatetoStr(endDate);

    const payload = {
      id,
      status,
      startDate: startDateStr,
      endDate: endDateStr,
      description,
      projectManager,
    };

    try {
      const res = await fetch("/api/department/PMO/project/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save project");
      }

      const data = await res.json();
      console.log("Project saved:", data);

      await mutate("/api/department/PMO/project");

      onClose();
      return data;
    } catch (err) {
      console.error("Error saving project:", err);
      throw err;
    }
  };

  return (
    <div>
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="xl"
        onOpenChange={onClose}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                {...moveProps}
                className="w-full flex flex-col gap-4"
              >
                {id ? "Update Project" : "Create Project"}
              </ModalHeader>
              <ModalBody className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Project Description"
                  variant="bordered"
                  value={description}
                  onValueChange={setDescription}
                />
                <Input
                  isRequired
                  label="Project Manager"
                  variant="bordered"
                  value={projectManager}
                  onValueChange={setProjectManager}
                />
                <DatePicker
                  label="Start Date"
                  variant="bordered"
                  value={startDate}
                  onChange={setStartDate}
                />
                <DatePicker
                  label="End Date"
                  variant="bordered"
                  value={endDate}
                  onChange={setEndDate}
                />
                <Select
                  isRequired
                  label="Status"
                  placeholder="Select a status"
                  variant="bordered"
                  selectedKeys={[status]}
                  onSelectionChange={(keys) =>
                    setStatus(Array.from(keys)[0] as string)
                  }
                >
                  {["OnHold", "Overdue", "OnGoing", "Pending", "Finished"].map(
                    (s) => (
                      <SelectItem key={s}>{s}</SelectItem>
                    )
                  )}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onClick={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSaveProject(onClose)}
                >
                  {id ? "Update Project" : "Create Project"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
