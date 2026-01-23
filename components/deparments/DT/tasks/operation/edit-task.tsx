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
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState } from "react";
import { selectEboq, selectStatus, selectSboq } from "@/helpers/data";
import { dtTask } from "../../../../../helpers/db";

interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: dtTask | null;
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

  useEffect(() => {
    if (task) {
      setId(task.id);
      setClientName(task.clientName ?? "");
      setProjectDesc(task.projectDesc ?? "");
      setSalesPersonnel(task.salesPersonnel ?? "");
      setDateReceived(
        typeof task.dateReceived === "string"
          ? safeParseDate(task.dateReceived)
          : (task.dateReceived ?? null),
      );
      setEboq(
        task.systemDiagram
          ? new Set(task.systemDiagram.split(",").map((s) => s.trim()))
          : new Set(),
      );
      setEboqDate(
        typeof task.eBoqDate === "string"
          ? safeParseDate(task.eBoqDate)
          : (task.eBoqDate ?? null),
      );
      setSboq(
        task.structuralBoq
          ? new Set(task.structuralBoq.split(",").map((s) => s.trim()))
          : new Set(),
      );
      setSboqDate(
        typeof task.sBoqDate === "string"
          ? safeParseDate(task.sBoqDate)
          : (task.sBoqDate ?? null),
      );
      setSirme(
        typeof task.sirME === "string"
          ? safeParseDate(task.sirME)
          : (task.sirME ?? null),
      );
      setSirmjh(
        typeof task.sirMJH === "string"
          ? safeParseDate(task.sirMJH)
          : (task.sirMJH ?? null),
      );
      setStatus(task.status ?? "");
    }
  }, [task]);

  // Lock status to "For Proposal" if sirMJH is filled
  useEffect(() => {
    if (sirmjh) {
      setStatus("For Proposal");
    }
  }, [sirmjh]);

  const handleUpdateTask = async (onClose: () => void) => {
    const dateReceivedStr = formatDatetoStr(dateReceived);
    const eboqDateStr = formatDatetoStr(eboqDate);
    const sboqDateStr = formatDatetoStr(sboqDate);
    const sirmeDateStr = formatDatetoStr(sirme);
    const sirmjhDateStr = formatDatetoStr(sirmjh);
    const eboqArray = Array.from(eboq);
    const sboqArray = Array.from(sboq);

    const payload = {
      id,
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
      const res = await fetch("/api/department/ITDT/DT/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update task");

      await mutate("/api/department/ITDT/DT/tasks");
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  const getStatusOptions = () => {
    let options;
    if (sirmjh) {
      options = [{ key: "For Proposal", label: "For Proposal" }];
    } else if (status === "Pending" || status === "Overdue") {
      options = selectStatus.filter(
        (item) => item.key === "OnHold" || item.key === "Priority",
      );
    } else {
      options = selectStatus;
    }
    if (!options.find((item) => item.key === status)) {
      options.push({ key: status, label: status });
    }

    return options;
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
            <ModalHeader {...moveProps} className="w-full flex flex-col gap-4">
              Update Task
            </ModalHeader>
            <ModalBody className="grid grid-cols-2 gap-4">
              <Input
                isRequired
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
                onSelectionChange={(keys) =>
                  keys !== "all"
                    ? setEboq(keys as Set<string>)
                    : setEboq(new Set(selectEboq.map((item) => item.key)))
                }
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
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
                onSelectionChange={(keys) =>
                  keys !== "all"
                    ? setSboq(keys as Set<string>)
                    : setSboq(new Set(selectSboq.map((item) => item.key)))
                }
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
              <DatePicker
                label="Endorsed Date"
                variant="bordered"
                value={sboqDate}
                onChange={setSboqDate}
              />
              <DatePicker
                label="Sir Billy"
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
                selectedKeys={new Set([status])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (!sirmjh && typeof selected === "string") {
                    setStatus(selected);
                  }
                }}
                label="Status"
                placeholder="Select a status"
                variant="bordered"
                items={getStatusOptions()}
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
