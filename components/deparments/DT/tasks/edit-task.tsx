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
import { selectEboq, selectStatus, selectSboq } from "@/helpers/data";
import { dtTask } from "../../../../helpers/task";

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
          : task.dateReceived ?? null
      );
      setEboq(
        task.systemDiagram
          ? new Set(task.systemDiagram.split(",").map((s) => s.trim()))
          : new Set()
      );
      setEboqDate(
        typeof task.eBoqDate === "string"
          ? safeParseDate(task.eBoqDate)
          : task.eBoqDate ?? null
      );
      setSboq(
        task.structuralBoq
          ? new Set(task.structuralBoq.split(",").map((s) => s.trim()))
          : new Set()
      );
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

  useEffect(() => {
    if (sirmjh) {
      setStatus("Finished");
    }
  }, [sirmjh]);

  useEffect(() => {
    const receivedDate = dateReceived?.toDate(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    if (dateReceived && status !== "Finished") {
      const now = new Date();

      // Convert CalendarDate to JS Date with time zone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const receivedDate = dateReceived.toDate(timeZone);

      const timeDiff = now.getTime() - receivedDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (daysDiff > 3) {
        setStatus("Overdue");
      } else {
        setStatus("Pending");
      }
    }
  }, [dateReceived]);

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

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      const data = await res.json();
      console.log("Task updated:", data);

      // ✅ Trigger SWR to refetch the tasks list
      await mutate("/api/department/ITDT/DT/tasks");

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
                    isDisabled
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
