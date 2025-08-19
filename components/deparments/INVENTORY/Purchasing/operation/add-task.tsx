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
  NumberInput,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { selectPOStatus } from "@/helpers/data";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });
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

  const handleAddTask = async (onClose: () => void) => {
    const poDateStr = formatDatetoStr(poDate);

    const payload = {
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
      const res = await fetch("/api/department/INVENTORY/purchasing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create new item");
      }

      const data = await res.json();
      console.log("Item Created:", data);

      await mutate("/api/department/INVENTORY/purchasing");

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setTotal(qty * price);
  }, [qty, price]);

  return (
    <div>
      <>
        <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
          Add Item
        </Button>
        <Modal
          ref={targetRef}
          isOpen={isOpen}
          size="5xl"
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
                  Add Item
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
