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
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import {
  CalendarDate,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState } from "react";
import { selectStatus } from "@/helpers/data";
import { ItTasks } from "../../../../../helpers/db";

interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: ItTasks | null;
}

export const EditTask = ({ isOpen, onClose, task }: EditTaskProps) => {
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
  const [project, setProject] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [tasks, setTasks] = useState("");
  const [personnel, setPersonnel] = useState("");
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (endDate) {
      setStatus("Finished");
    }
  }, [endDate]);

  useEffect(() => {
    if (!task) return;

    setId(task.id);
    setProject(task.project ?? "");
    setProjectDesc(task.projectDesc ?? "");
    setTasks(task.tasks ?? "");
    setPersonnel(task.personnel ?? "");
    setStartDate(
      typeof task.dateStart === "string"
        ? safeParseDate(task.dateStart)
        : (task.dateStart ?? null),
    );
    setEndDate(
      typeof task.dateEnd === "string"
        ? safeParseDate(task.dateEnd)
        : (task.dateEnd ?? null),
    );
    setStatus(task.status ?? "");
  }, [task]);

  /* ✅ AUTO SET END DATE WHEN FINISHED */
  useEffect(() => {
    if (status === "Finished") {
      setEndDate(today(getLocalTimeZone()));
    }
  }, [status]);

  const handleUpdateTask = async (onClose: () => void) => {
    const payload = {
      id,
      project,
      projectDesc,
      tasks,
      personnel,
      dateStart: formatDatetoStr(startDate),
      dateEnd: formatDatetoStr(endDate),
      status,
    };

    try {
      const res = await fetch("/api/department/ITDT/IT/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update task");

      await mutate("/api/department/ITDT/IT/tasks");
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
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
            <ModalHeader {...moveProps}>Update Task</ModalHeader>

            <ModalBody className="grid grid-cols-2 gap-4">
              <Input
                label="Project"
                variant="bordered"
                value={project}
                onValueChange={setProject}
              />
              <Input
                label="Project Description"
                variant="bordered"
                value={projectDesc}
                onValueChange={setProjectDesc}
              />
              <Input
                label="Tasks"
                variant="bordered"
                value={tasks}
                onValueChange={setTasks}
              />
              <Input
                label="Personnel"
                variant="bordered"
                value={personnel}
                onValueChange={setPersonnel}
              />

              <DatePicker
                label="Date Start"
                variant="bordered"
                value={startDate}
                onChange={setStartDate}
              />

              <DatePicker
                label="Date End"
                variant="bordered"
                value={endDate}
                onChange={setEndDate}
              />

              <Select
                isRequired
                label="Status"
                placeholder="Select a status"
                variant="bordered"
                items={selectStatus}
                selectedKeys={status ? new Set([status]) : new Set()}
                isDisabled={!!endDate}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setStatus(selectedKey);
                }}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="flat" onClick={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => handleUpdateTask(onClose)}>
                Update Task
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
