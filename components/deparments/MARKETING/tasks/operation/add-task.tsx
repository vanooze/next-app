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
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import { selectStatus } from "@/helpers/data";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  const [project, setProject] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [personnel, setPersonnel] = useState<string>("");
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("Pending");

  const [loading, setLoading] = useState(false);

  const handleSelectionChange = (keys: Set<string>) => {
    const selectedKey = Array.from(keys)[0];
    setPersonnel(selectedKey);
  };

  const handleAddTask = async (onClose: () => void) => {
    setLoading(true);
    try {
      const dateStr = formatDatetoStr(date);
      const name = user?.name || "Unknown User";
      const formData = new FormData();
      formData.append("clientName", project);
      formData.append("projectDesc", projectDesc);
      formData.append("personnel", personnel);
      if (date) {
        formData.append("dateReceived", dateStr || "null");
      }
      formData.append("status", status);
      formData.append("name", name);
      const res = await fetch("/api/department/MARKETING/tasks/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create task");

      await mutate("/api/department/MARKETING/tasks");

      setProject("");
      setProjectDesc("");
      setPersonnel("");
      setDate(null);
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
              <ModalHeader
                {...moveProps}
                className="w-full flex flex-col gap-4"
              >
                Add Task
              </ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Client Name"
                  variant="bordered"
                  value={project}
                  onValueChange={setProject}
                />
                <Input
                  isRequired
                  label="Project Description"
                  variant="bordered"
                  value={projectDesc}
                  onValueChange={setProjectDesc}
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
                  <SelectItem key="ALI">Alliah Pearl Robles</SelectItem>
                  <SelectItem key="SHANIA">Mary Shania M. Camunias</SelectItem>
                </Select>
                <DatePicker
                  label="Date Start"
                  variant="bordered"
                  value={date}
                  onChange={setDate}
                />
                <Select
                  isRequired
                  label="Status"
                  variant="bordered"
                  items={selectStatus}
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
