"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  useDraggable,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";

export const AddProject = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  // form states
  const [status, setStatus] = useState<string>("Pending");
  const [projectManager, setProjectManager] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);

  const handleAddProject = async (onClose: () => void) => {
    const payload = {
      status,
      projectManager,
      description,
      startDate: formatDatetoStr(startDate),
    };

    try {
      const res = await fetch("/api/department/PMO/project/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const data = await res.json();
      console.log("✅ Project Created:", data);

      await mutate("/api/department/PMO/project");

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
        Add Project
      </Button>

      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="xl"
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                {...moveProps}
                className="w-full flex flex-col gap-4"
              >
                Add Project (Manual)
              </ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Project Manager"
                  variant="bordered"
                  value={projectManager}
                  onValueChange={setProjectManager}
                />
                <Input
                  isRequired
                  label="Description"
                  variant="bordered"
                  value={description}
                  onValueChange={setDescription}
                />
                <DatePicker
                  label="Start Date"
                  variant="bordered"
                  value={startDate}
                  onChange={setStartDate}
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
                  {["OnHold", "Overdue", "Pending", "Finished"].map((s) => (
                    <SelectItem key={s}>{s}</SelectItem>
                  ))}
                </Select>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="flat" onClick={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onClick={() => handleAddProject(onClose)}
                >
                  Add Project
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
