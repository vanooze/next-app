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
import {
  selectEboq,
  selectStatus,
  selectSboq,
  selectFiltiredPmo,
} from "@/helpers/data";

export const AddTask = () => {
  let defaultDate = today(getLocalTimeZone());
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [clientName, setClientName] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");
  const [dateStart, setDateStart] = useState<CalendarDate | null>(null);
  const [dateEnd, setDateEnd] = useState<CalendarDate | null>(null);
  const [personnel, setPersonnel] = useState(new Set<string>());
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("");
  const [filteredStatus, setFilteredStatus] = useState(selectStatus);

  const handleAddTask = async (onClose: () => void) => {
    const dateStartStr = formatDatetoStr(dateStart);
    const dateEndStr = formatDatetoStr(dateEnd);
    const dateFinishedStr = formatDatetoStr(date);
    const personnelAray = Array.from(personnel);

    const payload = {
      clientName,
      taskDesc,
      dateStart: dateStartStr,
      dateEnd: dateEndStr,
      personnel: personnelAray.length > 0 ? personnelAray.join(",") : null,
      dateFinished: dateFinishedStr,
      status,
    };

    try {
      const res = await fetch("/api/department/PMO/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create new task");
      }

      const data = await res.json();
      console.log("Task Created:", data);

      await mutate("/api/department/PMO/tasks/create");

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (date) {
      setStatus("Finished");
      setFilteredStatus(
        selectStatus.filter((item) => item.label === "Finished")
      );
      return;
    }

    if (!dateEnd) {
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
    const endDate = dateEnd.toDate(timeZone);
    const now = new Date();

    const diffTime = now.getTime() - endDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays > 1) {
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
  }, [date, dateStart, dateEnd]);

  return (
    <div>
      <>
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
                    className=""
                    label="Client Name"
                    variant="bordered"
                    value={clientName}
                    onValueChange={setClientName}
                  />
                  <Input
                    isRequired
                    label="Task Description"
                    variant="bordered"
                    value={taskDesc}
                    onValueChange={setTaskDesc}
                  />
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
                    selectionMode="multiple"
                    items={selectFiltiredPmo}
                    label="Assigned Personnel"
                    placeholder="Assigned Personnel"
                    variant="bordered"
                    selectedKeys={personnel}
                    onSelectionChange={(keys) => {
                      if (keys !== "all") {
                        setPersonnel(keys as Set<string>);
                      } else {
                        setPersonnel(
                          new Set(selectFiltiredPmo.map((item) => item.label))
                        );
                      }
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                  <DatePicker
                    label="Date Finished"
                    variant="bordered"
                    value={date}
                    onChange={setDate}
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
                  <Button
                    color="danger"
                    variant="flat"
                    onClick={() => {
                      setClientName("");
                      setTaskDesc("");
                      setDateStart(null);
                      setDateEnd(null);
                      setPersonnel(new Set());
                      setDate(null);
                      setStatus("");
                      setFilteredStatus(selectStatus);
                      onClose();
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleAddTask(onClose)}
                  >
                    Add Task
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
