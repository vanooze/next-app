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
import { Select, SelectSection, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState } from "react";
import { selectStatus, selectFiltiredPmo } from "@/helpers/data";
import { PMOTasks } from "../../../../../helpers/db";

interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: PMOTasks | null;
}

export const EditTask = ({ isOpen, onClose, task }: EditTaskProps) => {
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
  const [clientName, setClientName] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");
  const [dateStart, setDateStart] = useState<CalendarDate | null>(null);
  const [dateEnd, setDateEnd] = useState<CalendarDate | null>(null);
  const [personnel, setPersonnel] = useState(new Set<string>());
  const [dateFinished, setDateFinished] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (task) {
      setId(task.id);
      setClientName(task.clientName ?? "");
      setTaskDesc(task.taskDesc ?? "");
      setDateStart(
        typeof task.dateStart === "string"
          ? safeParseDate(task.dateStart)
          : task.dateStart ?? null
      );
      setDateEnd(
        typeof task.dateEnd === "string"
          ? safeParseDate(task.dateEnd)
          : task.dateEnd ?? null
      );
      setPersonnel(
        task.personnel
          ? new Set(task.personnel.split(",").map((s) => s.trim()))
          : new Set()
      );
      setDateFinished(
        typeof task.dateFinished === "string"
          ? safeParseDate(task.dateFinished)
          : task.dateFinished ?? null
      );
      setStatus(task.status ?? "");
    }
  }, [task]);

  useEffect(() => {
    if (dateFinished && status !== "Finished") {
      setStatus("Finished");
    }
  }, [dateFinished]);

  // useEffect(() => {
  //   const receivedDate = dateReceived?.toDate(
  //     Intl.DateTimeFormat().resolvedOptions().timeZone
  //   );

  //   if (dateReceived && status !== "Finished") {
  //     const now = new Date();

  //     // Convert CalendarDate to JS Date with time zone
  //     const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //     const receivedDate = dateReceived.toDate(timeZone);

  //     const timeDiff = now.getTime() - receivedDate.getTime();
  //     const daysDiff = timeDiff / (1000 * 3600 * 24);

  //     if (daysDiff > 3) {
  //       setStatus("Overdue");
  //     } else {
  //       setStatus("Pending");
  //     }
  //   }
  // }, [dateReceived]);

  const handleUpdateTask = async (onClose: () => void) => {
    const dateStartStr = formatDatetoStr(dateStart);
    const dateEndStr = formatDatetoStr(dateEnd);
    const dateFinishedStr = formatDatetoStr(dateFinished);
    const personnelAray = Array.from(personnel);

    const payload = {
      id,
      clientName,
      taskDesc,
      dateStart: dateStartStr,
      dateEnd: dateEndStr,
      personnel: personnelAray.length > 0 ? personnelAray.join(",") : null,
      dateFinished: dateFinishedStr,
      status,
    };

    try {
      const res = await fetch("/api/department/PMO/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      const data = await res.json();
      console.log("Task updated:", data);

      // ✅ Trigger SWR to refetch the tasks list
      await mutate("/api/department/PMO/tasks");

      onClose();
      return data;
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  return (
    <div>
      <>
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
                  Update Task
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
                    label="Tasks Description"
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
                          new Set(selectFiltiredPmo.map((item) => item.key))
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
                    value={dateFinished}
                    onChange={setDateFinished}
                  />
                  <Select
                    isRequired
                    selectedKeys={new Set([status])}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      if (typeof selected === "string") setStatus(selected);
                    }}
                    label="Status"
                    placeholder="Select a status"
                    variant="bordered"
                    items={
                      dateFinished
                        ? selectStatus.filter((item) => item.key === "Finished")
                        : selectStatus.filter(
                            (item) =>
                              item.key === "Overdue" ||
                              item.key === "Priority" ||
                              item.key === "OnHold" ||
                              item.key === "Pending"
                          )
                    }
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => handleUpdateTask(onClose)}
                  >
                    Update Task
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
