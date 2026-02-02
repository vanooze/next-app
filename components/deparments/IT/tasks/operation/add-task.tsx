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
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import Image from "next/image";
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
  const [tasks, setTasks] = useState("");
  const [personnel, setPersonnel] = useState<string>("");
  const [dateStart, setDateStart] = useState<CalendarDate | null>(null);
  const [dateEnd, setDateEnd] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("Pending");

  const [loading, setLoading] = useState(false);

  const handleSelectionChange = (keys: Set<string>) => {
    const selectedKey = Array.from(keys)[0];
    setPersonnel(selectedKey);
  };

  useEffect(() => {
    if (dateEnd) {
      setStatus("Finished");
    } else {
      setStatus("Pending");
    }
  }, [dateEnd]);

  const handleAddTask = async (onClose: () => void) => {
    setLoading(true);
    try {
      const dateStartStr = formatDatetoStr(dateStart);
      const dateEndStr = formatDatetoStr(dateEnd);
      const name = user?.name || "Unknown User";
      const formData = new FormData();
      formData.append("project", project);
      formData.append("projectDesc", projectDesc);
      formData.append("tasks", tasks);
      formData.append("personnel", personnel);
      if (dateStart) {
        formData.append("dateStart", dateStartStr || "null");
      }
      if (dateEnd) {
        formData.append("dateEnd", dateEndStr || "null");
      }
      formData.append("status", status);
      formData.append("name", name);
      const res = await fetch("/api/department/ITDT/IT/tasks/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create task");

      await mutate("/api/department/ITDT/IT/tasks");

      setProject("");
      setProjectDesc("");
      setPersonnel("");
      setDateStart(null);
      setDateEnd(null);
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
                Add Task
              </ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Project"
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
                <Input
                  isRequired
                  label="Tasks"
                  variant="bordered"
                  value={tasks}
                  onValueChange={setTasks}
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
                    <SelectItem key="IVAN">Ivan Balo</SelectItem>
                    <SelectItem key="HASSAN">Hassan Ayonan</SelectItem>
                  </SelectSection>

                  <SelectSection title="Technical">
                    <SelectItem key="ASH">Ashly Alavaro</SelectItem>
                    <SelectItem key="ELI">Eliezer Manuel Herrera</SelectItem>
                    <SelectItem key="AARON">Aaron Opinaldo</SelectItem>
                  </SelectSection>

                  <SelectSection title="MMC">
                    <SelectItem key="CJ">Charles Joseph Cabrera</SelectItem>
                    <SelectItem key="RHON">Rhon Pacleb</SelectItem>
                  </SelectSection>
                </Select>
                <DatePicker
                  label="Date Start"
                  variant="bordered"
                  value={dateStart}
                  onChange={setDateStart}
                />
                <DatePicker
                  label="Date End"
                  variant="bordered"
                  value={dateEnd}
                  onChange={setDateEnd}
                />
                <Select
                  isRequired
                  label="Status"
                  variant="bordered"
                  isDisabled={!!dateEnd}
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
