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
  parseDate,
} from "@internationalized/date";
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState } from "react";
import { selectSalesStatus } from "@/helpers/data";
import { SalesManagement } from "@/helpers/db";
import { useUserContext } from "@/components/layout/UserContext";

interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: SalesManagement | null;
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

  const { user } = useUserContext();
  const [id, setId] = useState<number>();
  const [clientId, setClientId] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [projectDesc, setProjectDesc] = useState<string>("");
  const [salesPersonnel, setSalesPersonnel] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [sirmjh, setSirmjh] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [dateAwarded, setDateAwarded] = useState<CalendarDate | null>(null);
  const [newUpdate, setNewUpdate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setId(task.id);
      setClientId(task.clientId ?? "");
      setClientName(task.clientName ?? "");
      setProjectDesc(task.projectDesc ?? "");
      setSalesPersonnel(task.salesPersonnel ?? "");
      setDateReceived(
        typeof task.dateReceived === "string"
          ? safeParseDate(task.dateReceived)
          : (task.dateReceived ?? null),
      );
      setSirmjh(
        typeof task.sirMJH === "string"
          ? safeParseDate(task.sirMJH)
          : (task.sirMJH ?? null),
      );
      setStatus(task.status ?? "");
      setNotes(task.notes ?? "");
      setDateAwarded(
        typeof task.dateAwarded === "string"
          ? safeParseDate(task.dateAwarded)
          : (task.dateAwarded ?? null),
      );
    }
  }, [task]);

  const handleUpdateTask = async (onClose: () => void) => {
    if (!id) return;

    const dateReceivedStr = formatDatetoStr(dateReceived);
    const dateAwardedStr = formatDatetoStr(dateAwarded);
    const finalStatus = dateAwarded ? "Awarded" : status;

    const payload = {
      id,
      status: finalStatus,
      notes,
      dateAwarded: dateAwardedStr,
      updates: newUpdate?.trim() || "",
    };

    try {
      if (finalStatus === "Awarded" && clientId) {
        await sendToAcumatica(clientId, projectDesc, dateReceivedStr);
      }

      const res = await fetch("/api/department/SALES/sales_management/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update sales management");
      }

      await res.json();

      await mutate("/api/department/SALES/sales_management");
      onClose();
    } catch (err: any) {
      console.error("Update aborted:", err);
      alert(err?.message || "Update failed. Sales Management was NOT updated.");
      throw err;
    }
  };

  const sendToAcumatica = async (
    clientId: string,
    projectDesc: string,
    dateReceived: string | null,
  ) => {
    const username = user?.email;
    const password = user?.acu_password;

    const payload = {
      username,
      password,
      clientId,
      projectDesc,
      dateReceived,
    };

    const res = await fetch("/api/department/SALES/acumatica", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Acumatica sync failed");
    }

    return result;
  };

  const handleUpdateTaskWithLoading = async (onClose: () => void) => {
    setLoading(true);
    try {
      await handleUpdateTask(onClose);
    } finally {
      setLoading(false);
    }
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
                label="Client Name"
                value={clientName}
                onValueChange={setClientName}
                isDisabled
              />
              <Input
                label="Project Description"
                value={projectDesc}
                onValueChange={setProjectDesc}
                isDisabled
              />
              <Input
                label="Sales Personnel"
                value={salesPersonnel}
                onValueChange={setSalesPersonnel}
                isDisabled
              />
              <DatePicker
                label="Date Received"
                value={dateReceived}
                onChange={setDateReceived}
                isDisabled
              />
              <DatePicker
                label="Sir MJ/Harold"
                value={sirmjh}
                onChange={setSirmjh}
                isDisabled
              />
              <Input label="Notes" value={notes} onValueChange={setNotes} />
              <DatePicker
                label="Date Awarded"
                value={dateAwarded}
                onChange={setDateAwarded}
              />
              <Input
                label="New Update"
                value={newUpdate}
                onValueChange={setNewUpdate}
                placeholder="Add a new update..."
              />
              <Select
                isRequired
                selectedKeys={
                  dateAwarded ? new Set(["Awarded"]) : new Set([status])
                }
                onSelectionChange={(keys) => {
                  if (dateAwarded) return;
                  const selected = Array.from(keys)[0];
                  if (typeof selected === "string") setStatus(selected);
                }}
                label="Status"
                placeholder="Select a status"
                items={
                  dateAwarded
                    ? selectSalesStatus.filter((item) => item.key === "Awarded")
                    : selectSalesStatus.filter((item) =>
                        ["On Going", "On Hold", "Lost Account"].includes(
                          item.key,
                        ),
                      )
                }
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
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
                onPress={() => handleUpdateTaskWithLoading(onClose)}
                isLoading={loading}
                isDisabled={loading}
              >
                {loading ? "Updating..." : "Update Task"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
