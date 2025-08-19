import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
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
import { selectPOStatus } from "@/helpers/data";
import { POMonitoring } from "@/helpers/db";

interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: POMonitoring | null;
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
  const [poDate, setPoDate] = useState<CalendarDate | null>(null);
  const [poNumber, setPoNumber] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [items, setItems] = useState<string>("");
  const [qty, setQty] = useState<number>(0);
  const [uom, setUom] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [terms, setTerms] = useState<string>("");
  const [poStatus, setPoStatus] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [requester, setRequester] = useState<string>("");

  useEffect(() => {
    if (task) {
      setId(task.id);
      setPoDate(
        typeof task.poDate === "string"
          ? safeParseDate(task.poDate)
          : task.poDate ?? null
      );
      setPoNumber(task.poNumber ?? "");
      setSupplier(task.supplier ?? "");
      setItems(task.items ?? "");

      setQty(task.qty ?? "");
      setUom(task.uom ?? "");
      setPrice(task.price ?? "");
      setTotal(task.total ?? "");
      setTerms(task.supplier ?? "");
      setPoStatus(task.items ?? "");
      setRemarks(task.remarks ?? "");
      setPurpose(task.purpose ?? "");
      setRequester(task.requester ?? "");
    }
  }, [task]);

  const handleUpdateTask = async (onClose: () => void) => {
    const poDateStr = formatDatetoStr(poDate);

    const payload = {
      id,
      poDate: poDateStr,
      poNumber,
      supplier,
      items,
      qty,
      uom,
      price,
      total,
      terms,
      poStatus,
      remarks,
      purpose,
      requester,
    };

    try {
      const res = await fetch("/api/department/INVENTORY/purchasing/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update item");
      }

      const data = await res.json();
      await mutate("/api/department/INVENTORY/purchasing");

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
                <ModalBody className="grid grid-cols-3 gap-4">
                  <DatePicker
                    label="PO Date"
                    variant="bordered"
                    value={poDate}
                    onChange={setPoDate}
                  />
                  <Input
                    isRequired
                    className=""
                    label="PO Number"
                    variant="bordered"
                    value={poNumber}
                    onValueChange={setPoNumber}
                  />
                  <Input
                    isRequired
                    className=""
                    label="Supplier"
                    variant="bordered"
                    value={supplier}
                    onValueChange={setSupplier}
                  />
                  <Input
                    isRequired
                    className="col-span-2"
                    label="Items"
                    variant="bordered"
                    value={items}
                    onValueChange={setItems}
                  />
                  <Input
                    isRequired
                    className=""
                    label="Unit of Measure"
                    variant="bordered"
                    value={uom}
                    onValueChange={setUom}
                  />
                  <NumberInput
                    isRequired
                    className=""
                    label="Quantity"
                    variant="bordered"
                    value={qty}
                    onValueChange={setQty}
                  />
                  <NumberInput
                    isRequired
                    className=""
                    label="Price"
                    variant="bordered"
                    value={price}
                    onValueChange={setPrice}
                  />
                  <NumberInput
                    isRequired
                    disabled
                    className=""
                    label="Total"
                    variant="bordered"
                    value={total}
                  />
                  <Input
                    isRequired
                    className="col-span-2"
                    label="Remarks"
                    variant="bordered"
                    value={remarks}
                    onValueChange={setRemarks}
                  />
                  <Input
                    isRequired
                    className=""
                    label="Terms"
                    variant="bordered"
                    value={terms}
                    onValueChange={setTerms}
                  />
                  <Select
                    isRequired
                    items={selectPOStatus}
                    label="Status"
                    placeholder="Select a status"
                    variant="bordered"
                    selectedKeys={[poStatus]}
                    onSelectionChange={(keys) =>
                      setPoStatus(Array.from(keys)[0] as string)
                    }
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                  <Input
                    isRequired
                    className=""
                    label="Purpose"
                    variant="bordered"
                    value={purpose}
                    onValueChange={setPurpose}
                  />
                  <Input
                    isRequired
                    className=""
                    label="Request by: "
                    variant="bordered"
                    value={requester}
                    onValueChange={setRequester}
                  />
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
