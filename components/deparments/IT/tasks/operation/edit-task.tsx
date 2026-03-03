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
  SelectSection,
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
  const [clientName, setClientName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [salesPersonnel, setSalesPersonnel] = useState("");
  const [personnel, setPersonnel] = useState("");
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (date) {
      setStatus("Finished");
    }
  }, [date]);

  useEffect(() => {
    if (!task) return;

    setId(task.id);
    setClientName(task.clientName ?? "");
    setProjectDesc(task.projectDesc ?? "");
    setDateReceived(
      typeof task.dateReceived === "string"
        ? safeParseDate(task.dateReceived)
        : (task.dateReceived ?? null),
    );

    setPersonnel(task.personnel ?? "");
    setDate(
      typeof task.date === "string"
        ? safeParseDate(task.date)
        : (task.date ?? null),
    );
    setStatus(task.status ?? "");
  }, [task]);

  /* ✅ AUTO SET END DATE WHEN FINISHED */
  useEffect(() => {
    if (status === "Finished") {
      setDate(today(getLocalTimeZone()));
    }
  }, [status]);

  const handleUpdateTask = async (onClose: () => void) => {
    const payload = {
      id,
      personnel,
      date: formatDatetoStr(date),
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
                label="Client Name"
                variant="bordered"
                value={clientName}
                onValueChange={setClientName}
                disabled
              />
              <Input
                label="Project Description"
                variant="bordered"
                value={projectDesc}
                onValueChange={setProjectDesc}
                disabled
              />
              <DatePicker
                label="date Received"
                variant="bordered"
                value={dateReceived}
                onChange={setDateReceived}
              />
              <Select
                isRequired
                label="Personnel"
                variant="bordered"
                placeholder="Select a personnel"
                selectedKeys={personnel ? new Set([personnel]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setPersonnel(selectedKey);
                }}
              >
                <SelectSection title="Programmer">
                  <SelectItem key="MON">Ramon Christopher Co</SelectItem>
                  <SelectItem key="IVAN">Ivan Bradley Balo</SelectItem>
                  <SelectItem key="HASSAN">Hassan E. Ayonan</SelectItem>
                </SelectSection>

                <SelectSection title="Technical">
                  <SelectItem key="ERWIN">Erwin Del Rosario</SelectItem>
                  <SelectItem key="ASH">Ashly Alavaro</SelectItem>
                  <SelectItem key="ELI">Eliezer Manuel Herrera</SelectItem>
                  <SelectItem key="AARON">Aaron Vincent A. Opinaldo</SelectItem>
                </SelectSection>

                <SelectSection title="MMC">
                  <SelectItem key="CJ">Charles Joseph R. Cabrera</SelectItem>
                  <SelectItem key="RHON">Rhon Pacleb</SelectItem>
                  <SelectItem key="JOHNNY">John Carlo F. Suarez</SelectItem>
                </SelectSection>
              </Select>
              <DatePicker
                label="Date"
                variant="bordered"
                value={date}
                onChange={setDate}
              />

              <Select
                isRequired
                label="Status"
                placeholder="Select a status"
                variant="bordered"
                items={selectStatus}
                selectedKeys={status ? new Set([status]) : new Set()}
                isDisabled={!!date}
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
