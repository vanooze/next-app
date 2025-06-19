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
import { selectEboq, selectStatus, selectSboq } from "@/helpers/data";

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
  const [projectDesc, setProjectDesc] = useState<string>("");
  const [salesPersonnel, setSalesPersonnel] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [eboq, setEboq] = useState(new Set<string>());
  const [eboqDate, setEboqDate] = useState<CalendarDate | null>(null);
  const [sboq, setSboq] = useState(new Set<string>());
  const [sboqDate, setSboqDate] = useState<CalendarDate | null>(null);
  const [sirme, setSirme] = useState<CalendarDate | null>(null);
  const [sirmjh, setSirmjh] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("");
  const [filteredStatus, setFilteredStatus] = useState(selectStatus);

  const handleAddTask = async (onClose: () => void) => {
    const dateReceivedStr = formatDatetoStr(dateReceived);
    const eboqDateStr = formatDatetoStr(eboqDate);
    const sboqDateStr = formatDatetoStr(sboqDate);
    const sirmeDateStr = formatDatetoStr(sirme);
    const sirmjhDateStr = formatDatetoStr(sirmjh);
    const eboqArray = Array.from(eboq);
    const sboqArray = Array.from(sboq);

    const payload = {
      clientName,
      projectDesc,
      salesPersonnel,
      dateReceived: dateReceivedStr,
      eboq: eboqArray.length > 0 ? eboqArray.join(",") : null,
      eboqdate: eboqDateStr,
      sboq: sboqArray.length > 0 ? sboqArray.join(",") : null,
      sboqdate: sboqDateStr,
      sirME: sirmeDateStr,
      sirMJH: sirmjhDateStr,
      status,
    };

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

  useEffect(() => {
    if (sirmjh) {
      setStatus("Finished");
      setFilteredStatus(
        selectStatus.filter((item) => item.label === "Finished")
      );
      return;
    }

    if (!dateReceived) {
      setFilteredStatus(
        selectStatus.filter(
          (item) => item.label === "Pending" || item.label === "Rush"
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
          (item) => item.label === "Overdue" || item.label === "Rush"
        )
      );
    } else {
      setStatus("Pending");
      setFilteredStatus(
        selectStatus.filter(
          (item) => item.label === "Pending" || item.label === "Rush"
        )
      );
    }
  }, [dateReceived, sirmjh]);

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
                    selectionMode="multiple"
                    items={selectEboq}
                    label="System Diagram"
                    placeholder="System Diagram"
                    variant="bordered"
                    selectedKeys={eboq}
                    onSelectionChange={(keys) => {
                      if (keys !== "all") {
                        setEboq(keys as Set<string>);
                      } else {
                        setEboq(new Set(selectEboq.map((item) => item.key)));
                      }
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                  <DatePicker
                    label="Endorsed Date"
                    variant="bordered"
                    value={eboqDate}
                    onChange={setEboqDate}
                  />
                  <Select
                    selectionMode="multiple"
                    items={selectSboq}
                    label="Structural"
                    placeholder="Structural"
                    variant="bordered"
                    selectedKeys={sboq}
                    onSelectionChange={(keys) => {
                      if (keys !== "all") {
                        setSboq(keys as Set<string>);
                      } else {
                        setSboq(new Set(selectSboq.map((item) => item.key)));
                      }
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                  <DatePicker
                    label="Endorsed Date"
                    variant="bordered"
                    value={sboqDate}
                    onChange={setSboqDate}
                  />
                  <DatePicker
                    label="Sir M.E."
                    variant="bordered"
                    value={sirme}
                    onChange={setSirme}
                  />
                  <DatePicker
                    label="Sir MJ/Harold"
                    variant="bordered"
                    value={sirmjh}
                    onChange={setSirmjh}
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
