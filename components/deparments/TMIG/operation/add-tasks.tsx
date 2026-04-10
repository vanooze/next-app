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
  Select,
  SelectItem,
  SelectSection,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import { TMIGSelectStatus } from "@/helpers/data";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);

  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [personnel, setPersonnel] = useState<string>("");
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("Pending");
  const [unit, setUnit] = useState<string>("");
  const [severity, setSeverity] = useState<string>("Low");
  const [completion, setCompletion] = useState<string>("0");

  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);

  const handleAddTask = async (onClose: () => void) => {
    setLoading(true);
    try {
      const dateStr = formatDatetoStr(date);
      const name = user?.name || "Unknown User";

      const formData = new FormData();
      formData.append("clientName", clientName);
      formData.append("description", description);
      formData.append("date", dateStr || "null");
      formData.append("personnel", personnel);
      formData.append("status", status);
      formData.append("unit", unit || "0");
      formData.append("severity", severity);
      formData.append("completion", completion);
      formData.append("dateCreated", new Date().toISOString());
      formData.append("createdBy", name);

      // ✅ Append files
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/department/TMIG/tasks/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create task");

      await mutate("/api/department/TMIG/tasks");

      // ✅ Reset fields correctly
      setClientName("");
      setDescription("");
      setPersonnel("");
      setDate(null);
      setStatus("Pending");
      setUnit("");
      setSeverity("Low");
      setCompletion("0");
      setFiles([]);

      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
        Add Task
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
              <ModalHeader {...moveProps} className="flex flex-col gap-4">
                Add Task
              </ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                {/* ✅ FIXED bindings */}
                <Input
                  isRequired
                  label="Client Name"
                  variant="bordered"
                  value={clientName}
                  onValueChange={setClientName}
                />

                <Input
                  isRequired
                  label="Description"
                  variant="bordered"
                  value={description}
                  onValueChange={setDescription}
                />

                <Select
                  isRequired
                  label="Personnel"
                  variant="bordered"
                  selectedKeys={personnel ? new Set([personnel]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setPersonnel(selectedKey);
                  }}
                >
                  <SelectItem key="PUNAY">Angelito Punay</SelectItem>
                  <SelectItem key="JAPITANA">Christopher Japitana</SelectItem>
                  <SelectItem key="MARFIL">John Q. Marfil</SelectItem>
                  <SelectItem key="JOMAR">Jomar A. David</SelectItem>
                  <SelectItem key="UNIDA">Joshua Venhur M. Unida</SelectItem>
                  <SelectItem key="JULIUS">Julius D. Lusterio</SelectItem>
                  <SelectItem key="BUMAAT">Mark Anthony Bumaat</SelectItem>
                  <SelectItem key="TAMO">Mark Louie F. Tamo</SelectItem>
                  <SelectItem key="VHAL">Vhal Joshua Tintero</SelectItem>
                </Select>

                <DatePicker
                  isRequired
                  label="Date Start"
                  variant="bordered"
                  value={date}
                  onChange={setDate}
                />

                <Select
                  isRequired
                  label="Status"
                  variant="bordered"
                  items={TMIGSelectStatus}
                  selectedKeys={new Set([status])}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setStatus(selectedKey);
                  }}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>

                <Input
                  isRequired
                  type="number"
                  label="Unit"
                  variant="bordered"
                  value={unit}
                  onValueChange={(val) => {
                    // allow only numbers
                    if (/^\d*$/.test(val)) setUnit(val);
                  }}
                />

                <Input
                  isRequired
                  type="number"
                  label="Completion (%)"
                  variant="bordered"
                  value={completion}
                  onValueChange={(val) => {
                    if (/^\d*$/.test(val) && Number(val) <= 100) {
                      setCompletion(val);
                    }
                  }}
                />

                <Select
                  isRequired
                  label="Severity"
                  variant="bordered"
                  selectedKeys={new Set([severity])}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setSeverity(selectedKey);
                  }}
                >
                  <SelectItem key="Low">Low</SelectItem>
                  <SelectItem key="Medium">Medium</SelectItem>
                  <SelectItem key="High">High</SelectItem>
                </Select>

                {/* ✅ NEW: File Upload */}
                <div className="col-span-2">
                  <label className="text-sm font-medium">
                    Upload Files (Images / Documents)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles(Array.from(e.target.files));
                      }
                    }}
                    className="mt-1 block w-full text-sm"
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onClick={onClose}
                  isDisabled={loading}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  onClick={() => handleAddTask(onClose)}
                  isLoading={loading}
                  isDisabled={loading}
                >
                  {loading ? "Adding..." : "Add Task"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
