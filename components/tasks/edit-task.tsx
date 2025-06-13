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
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState } from "react";
import { dtTask } from "../table/task";

export const selectStatus = [
  { key: "WIP", label: "WIP" },
  { key: "ongoing", label: "Ongoing" },
  { key: "Finished", label: "Finished" },
];

interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: dtTask | null;
}

export const EditTask = ({ isOpen, onClose, task }: EditTaskProps) => {
  let defaultDate = today(getLocalTimeZone());
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const safeParseDate = (isoString: string) => {
    return parseDate(isoString.split("T")[0]);
  };

  const [id, setId] = useState<number>();
  const [clientName, setClientName] = useState<string>("");
  const [projectDesc, setProjectDesc] = useState<string>("");
  const [salesPersonnel, setSalesPersonnel] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [eboq, setEboq] = useState<string>("");
  const [eboqDate, setEboqDate] = useState<CalendarDate | null>(null);
  const [sboq, setSboq] = useState<string>("");
  const [sboqDate, setSboqDate] = useState<CalendarDate | null>(null);
  const [sirme, setSirme] = useState<CalendarDate | null>(null);
  const [sirmjh, setSirmjh] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (task) {
      setId(task.id);
      setClientName(task.clientName ?? "");
      setProjectDesc(task.projectDesc ?? "");
      setSalesPersonnel(task.salesPersonnel ?? "");
      setDateReceived(
        typeof task.dateReceived === "string"
          ? safeParseDate(task.dateReceived)
          : task.dateReceived ?? null
      );
      setEboq(task.systemDiagram ?? "");
      setEboqDate(
        typeof task.eBoqDate === "string"
          ? safeParseDate(task.eBoqDate)
          : task.eBoqDate ?? null
      );
      setSboq(task.structuralBoq ?? "");
      setSboqDate(
        typeof task.sBoqDate === "string"
          ? safeParseDate(task.sBoqDate)
          : task.sBoqDate ?? null
      );
      setSirme(
        typeof task.sirME === "string"
          ? safeParseDate(task.sirME)
          : task.sirME ?? null
      );
      setSirmjh(
        typeof task.sirMJH === "string"
          ? safeParseDate(task.sirMJH)
          : task.sirMJH ?? null
      );
      setStatus(task.status ?? "");
    }
  }, [task]);

  const handleUpdateTask = async (onClose: () => void) => {
    const dateReceivedStr = formatDatetoStr(dateReceived);
    const eboqDateStr = formatDatetoStr(eboqDate);
    const sboqDateStr = formatDatetoStr(sboqDate);
    const sirmeDateStr = formatDatetoStr(sirme);
    const sirmjhDateStr = formatDatetoStr(sirmjh);

    const payload = {
      id,
      clientName,
      projectDesc,
      salesPersonnel,
      dateReceived: dateReceivedStr,
      eboq: eboq.trim() !== "" ? eboq : null,
      eboqdate: eboqDateStr,
      sboq: sboq.trim() !== "" ? sboq : null,
      sboqdate: sboqDateStr,
      sirME: sirmeDateStr,
      sirMJH: sirmjhDateStr,
      status,
    };

    try {
      const res = await fetch("/api/DT/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      const data = await res.json();
      console.log("Task update: ", data);
      onClose();
      location.reload();
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
                  <Input
                    label="System Diagram"
                    variant="bordered"
                    value={eboq ?? ""}
                    onValueChange={setEboq}
                  />
                  <DatePicker
                    label="Endorsed Date"
                    variant="bordered"
                    value={eboqDate}
                    onChange={setEboqDate}
                  />
                  <Input
                    label="Structural BOQ"
                    variant="bordered"
                    value={sboq ?? ""}
                    onValueChange={setSboq}
                  />
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
                    items={selectStatus}
                    label="Status"
                    placeholder="Select a status"
                    variant="bordered"
                    selectedKeys={[status]}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {(selectStatus) => (
                      <SelectItem>{selectStatus.label}</SelectItem>
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
