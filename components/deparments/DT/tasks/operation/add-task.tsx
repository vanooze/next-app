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
  Tooltip,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { selectStatus } from "@/helpers/data";
import { useUserContext } from "@/components/layout/UserContext";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });
  const { user } = useUserContext();
  const [clientName, setClientName] = useState<string>("");
  const [projectDesc, setProjectDesc] = useState<string>("");
  const [salesPersonnel, setSalesPersonnel] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("");
  const [filteredStatus, setFilteredStatus] = useState(selectStatus);
  const username = user?.email;
  const password = user?.acu_password;

  const handleAddTask = async (onClose: () => void) => {
    const dateReceivedStr = formatDatetoStr(dateReceived);

    const payload = {
      clientName,
      projectDesc,
      salesPersonnel,
      dateReceived: dateReceivedStr,
      status,
      username,
      password,
    };
    console.log("User credentials:", { username, password });
    try {
      const res = await fetch("/api/department/ITDT/DT/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create new task");
      }

      const data = await res.json();
      console.log("Task Created:", data);

      await mutate("/api/department/ITDT/DT/tasks");

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const sendToAcumatica = async (clientName: string) => {
    try {
      const username = user?.email;
      const password = user?.acu_password;

      const res = await fetch("/api/department/ITDT/DT/acumatica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          clientName,
        }),
      });

      const result = await res.json();
      if (result.success) {
        console.log("Customer Created in Acumatica:", result.data);
      } else {
        console.error("Failed to create customer in Acumatica:", result.error);
      }
    } catch (error) {
      console.error("Error sending to Acumatica:", error);
    }
  };

  useEffect(() => {
    if (!dateReceived) {
      setFilteredStatus(
        selectStatus.filter(
          (item) =>
            item.label === "Pending" ||
            item.label === "Priority" ||
            item.label === "OnHold"
        )
      );
      return;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const receivedDate = dateReceived.toDate(timeZone);
    const now = new Date();

    const diffTime = now.getTime() - receivedDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays > 3) {
      setStatus("Overdue");
      setFilteredStatus(
        selectStatus.filter(
          (item) =>
            item.label === "Overdue" ||
            item.label === "Priority" ||
            item.label === "OnHold"
        )
      );
    } else {
      setStatus("Pending");
      setFilteredStatus(
        selectStatus.filter(
          (item) =>
            item.label === "Pending" ||
            item.label === "Priority" ||
            item.label === "OnHold"
        )
      );
    }
  }, [dateReceived]);

  return (
    <div>
      <>
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
                    className=""
                    label="Client Name"
                    variant="bordered"
                    value={clientName}
                    onValueChange={setClientName}
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
                    label="Sales Personnel"
                    variant="bordered"
                    value={salesPersonnel}
                    onValueChange={setSalesPersonnel}
                  />
                  <DatePicker
                    label="Date Received"
                    variant="bordered"
                    value={dateReceived}
                    onChange={setDateReceived}
                  />
                  <Select
                    isRequired
                    items={filteredStatus}
                    label="Status"
                    placeholder="Select a status"
                    variant="bordered"
                    selectedKeys={[status]}
                    onSelectionChange={(keys) =>
                      setStatus(Array.from(keys)[0] as string)
                    }
                  >
                    {(item) => (
                      <SelectItem key={item.label}>{item.label}</SelectItem>
                    )}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleAddTask(onClose)}
                  >
                    Add Project
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    </div>
  );
};
