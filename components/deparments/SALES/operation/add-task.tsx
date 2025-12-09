"use client";

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
  Select,
  SelectItem,
  SelectSection,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import Image from "next/image";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  const [clientName, setClientName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [salesPersonnel, setSalesPersonnel] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [status] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isCustom, setIsCustom] = useState(false);

  const username = user?.email;
  const password = user?.acu_password;

  const handleSelectionChange = (keys: any) => {
    const selected = Array.from(keys)[0] as string;
    if (selected === "OTHER") {
      setIsCustom(true);
      setSalesPersonnel("");
    } else {
      setIsCustom(false);
      setSalesPersonnel(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-rar-compressed",
      "application/octet-stream", // some RARs are detected as this
    ];

    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      alert(
        "Some files were skipped. Only PDF, images, Word, Excel, or RAR are allowed."
      );
    }

    setFiles(validFiles);
  };

  const handleAddTask = async (onClose: () => void) => {
    setLoading(true);
    try {
      const dateReceivedStr = formatDatetoStr(dateReceived);
      const name = user?.name || "Unknown User";

      const formData = new FormData();
      formData.append("clientName", clientName);
      formData.append("projectDesc", projectDesc);
      formData.append("salesPersonnel", salesPersonnel);
      if (dateReceived) {
        formData.append("dateReceived", dateReceivedStr || "null");
      }
      formData.append("status", status);
      formData.append("username", username || "");
      formData.append("password", password || "");
      formData.append("name", name);

      // ✅ Append multiple files
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/department/ITDT/DT/tasks/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create task");

      await mutate("/api/department/ITDT/DT/tasks");

      // Reset form
      setClientName("");
      setProjectDesc("");
      setSalesPersonnel("");
      setDateReceived(null);
      setFiles([]);
      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
                {!isCustom ? (
                  <Select
                    isRequired
                    label="Sales Personnel"
                    variant="bordered"
                    selectedKeys={salesPersonnel ? [salesPersonnel] : []}
                    onSelectionChange={handleSelectionChange}
                    placeholder="Select or add a name"
                  >
                    <SelectSection title="Executives">
                      <SelectItem key="LSC">Lani Campos</SelectItem>
                      <SelectItem key="MLB">Lea Bermudez</SelectItem>
                      <SelectItem key="MJ">Marvin Jimenez</SelectItem>
                      <SelectItem key="HAROLD">Harold David</SelectItem>
                    </SelectSection>
                    <SelectSection title="Sales">
                      <SelectItem key="ALI">Alliah Pear Robles</SelectItem>
                      <SelectItem key="KENNETH">Kenneth Bautista</SelectItem>
                      <SelectItem key="SAIRA">Saira Gatdula</SelectItem>
                      <SelectItem key="JHOAN">Jhoannah Sicat</SelectItem>
                      <SelectItem key="DESIREE">Desiree Salivio</SelectItem>
                      <SelectItem key="IDA">Ida Madamba</SelectItem>
                      <SelectItem key="EVE">Evelyn Pequiras</SelectItem>
                      <SelectItem key="GENEVEL">Genevel Garcia</SelectItem>
                      <SelectItem key="JAM">Judie Ann Manuel</SelectItem>
                      <SelectItem key="ERWIN T.">Erwin Talavera</SelectItem>
                      <SelectItem key="CYRIL">
                        Cellano Cyril D. Javan
                      </SelectItem>
                      <SelectItem key="RONALD">Ronaldo Francisco</SelectItem>
                    </SelectSection>
                    <SelectSection title="Technical">
                      <SelectItem key="ERWIN">Erwin Del Rosario</SelectItem>
                      <SelectItem key="ENCHONG">Lawrence Ducut</SelectItem>
                      <SelectItem key="AARON">Aaron Opinaldo</SelectItem>
                      <SelectItem key="ASH">Ashly Alvaro</SelectItem>
                    </SelectSection>
                    <SelectSection title="Davao Team">
                      <SelectItem key="JOEMAR">Joemar Banichina</SelectItem>
                      <SelectItem key="RAM">Ramielyn Malaya</SelectItem>
                      <SelectItem key="RITZ">Ritzgerald Lopez</SelectItem>
                      <SelectItem key="EARL JAN">
                        Earl Jan E. Acierda
                      </SelectItem>
                    </SelectSection>
                    <SelectItem
                      key="OTHER"
                      className="text-primary font-medium"
                    >
                      ➕ Others (Type manually)
                    </SelectItem>
                  </Select>
                ) : (
                  <Input
                    isRequired
                    label="Custom Sales Personnel"
                    placeholder="Type name manually"
                    value={salesPersonnel}
                    onChange={(e) => setSalesPersonnel(e.target.value)}
                    onBlur={() => {
                      if (!salesPersonnel.trim()) setIsCustom(false);
                    }}
                  />
                )}
                <DatePicker
                  label="Date Received"
                  variant="bordered"
                  value={dateReceived}
                  onChange={setDateReceived}
                  isRequired
                />
                <Input
                  isReadOnly
                  label="Status"
                  variant="bordered"
                  value="Pending"
                />
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Files (PDF, Image, Word, Excel, or RAR)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.rar"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    multiple
                  />
                  {files.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                      {files.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
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
                  onClick={() => handleAddTask(onClose)}
                  isLoading={loading}
                  isDisabled={loading}
                >
                  {loading ? "Adding..." : "Add Project"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
