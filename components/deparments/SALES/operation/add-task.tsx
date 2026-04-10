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
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import { SALES_PERSONNEL_MAP } from "@/helpers/restriction";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);

  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  // ✅ UPDATED: clientName → clientId
  const [clientId, setClientId] = useState("");

  const [projectDesc, setProjectDesc] = useState("");
  const [salesPersonnel, setSalesPersonnel] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [requestDepartment, setRequestDepartment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const status = "Pending";

  const username = user?.email;
  const password = user?.acu_password;

  // -----------------------------
  // Sales Personnel Selection
  // -----------------------------
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

  useEffect(() => {
    if (!user?.name || !isOpen) return;

    const mappedKey = SALES_PERSONNEL_MAP[user.name];

    if (mappedKey) {
      setIsCustom(false);
      setSalesPersonnel(mappedKey);
    } else {
      setIsCustom(true);
      setSalesPersonnel(user.name);
    }
  }, [user?.name, isOpen]);

  // -----------------------------
  // File Validation
  // -----------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-rar-compressed",
      "application/octet-stream",
    ];

    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type),
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files were skipped. Invalid file types detected.");
    }

    setFiles(validFiles);
  };

  // -----------------------------
  // Department routing
  // -----------------------------
  const departmentMap: Record<string, string> = {
    DT: "/api/department/ITDT/DT/tasks/create",
    PROG: "/api/department/ITDT/IT/tasks/create",
    MMC: "/api/department/ITDT/IT/tasks/create",
    TECHNICAL: "/api/department/ITDT/IT/tasks/create",
  };

  const getSecondEndpoint = (department: string) =>
    departmentMap[department] || null;

  const isFormValid =
    clientId.trim() !== "" &&
    projectDesc.trim() !== "" &&
    salesPersonnel.trim() !== "" &&
    dateReceived !== null &&
    requestDepartment.trim() !== "";

  // -----------------------------
  // Submit handler
  // -----------------------------
  const handleAddTask = async (onClose: () => void) => {
    setLoading(true);

    try {
      if (!requestDepartment) {
        alert("Request Department is required");
        return;
      }

      const isEmpty =
        !clientId.trim() &&
        !projectDesc.trim() &&
        !salesPersonnel.trim() &&
        !dateReceived;

      if (isEmpty) {
        alert("Cannot submit: required fields are empty.");
        return;
      }

      const formData = new FormData();

      // ✅ UPDATED FIELD
      formData.append("clientId", clientId);

      formData.append("projectDesc", projectDesc);
      formData.append("salesPersonnel", salesPersonnel);
      formData.append("dateReceived", formatDatetoStr(dateReceived) || "null");
      formData.append("requestDepartment", requestDepartment);
      formData.append("status", status);
      formData.append("username", username || "");
      formData.append("password", password || "");
      formData.append("name", user?.name || "Unknown User");

      files.forEach((file) => {
        formData.append("files", file);
      });

      // 1️⃣ SALES INSERT
      const salesRes = await fetch(
        "/api/department/SALES/sales_management/create",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!salesRes.ok) {
        throw new Error("Failed to create sales task");
      }

      const { salesId } = await salesRes.json();

      // 2️⃣ Department sync
      const secondEndpoint = getSecondEndpoint(requestDepartment);

      if (secondEndpoint) {
        formData.append("salesId", salesId.toString());

        const deptRes = await fetch(secondEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!deptRes.ok) {
          throw new Error("Failed to send to department");
        }
      }

      await mutate("/api/department/SALES/sales_management");

      // Reset
      setClientId("");
      setProjectDesc("");
      setSalesPersonnel("");
      setRequestDepartment("");
      setDateReceived(null);
      setFiles([]);

      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
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
              <ModalHeader {...moveProps}>Add Task</ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                {/* ✅ CLIENT ID */}
                <Input
                  isRequired
                  label="Customer ID"
                  variant="bordered"
                  value={clientId}
                  onValueChange={setClientId}
                  placeholder="ID from creating a Customer in Acumatica"
                />

                <Input
                  isRequired
                  label="Project Description"
                  variant="bordered"
                  value={projectDesc}
                  onValueChange={setProjectDesc}
                />

                {/* Sales Personnel */}
                {!isCustom ? (
                  <Select
                    isRequired
                    label="Sales Personnel"
                    variant="bordered"
                    selectedKeys={salesPersonnel ? [salesPersonnel] : []}
                    onSelectionChange={handleSelectionChange}
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
                    </SelectSection>

                    <SelectItem key="OTHER">
                      ➕ Others (Type manually)
                    </SelectItem>
                  </Select>
                ) : (
                  <Input
                    isRequired
                    label="Custom Sales Personnel"
                    value={salesPersonnel}
                    onChange={(e) => setSalesPersonnel(e.target.value)}
                    onBlur={() => {
                      if (!salesPersonnel.trim()) setIsCustom(false);
                    }}
                  />
                )}

                <DatePicker
                  label="Date Filed"
                  variant="bordered"
                  value={dateReceived}
                  onChange={setDateReceived}
                  isRequired
                />

                <Select
                  isRequired
                  label="Request Department"
                  variant="bordered"
                  selectedKeys={[requestDepartment]}
                  onSelectionChange={(keys) =>
                    setRequestDepartment(Array.from(keys)[0] as string)
                  }
                >
                  <SelectItem key="DT">LED - Design Team</SelectItem>
                  <SelectItem key="PROG">Programmer / MMC</SelectItem>
                  <SelectItem key="TECHNICAL">Digital Signage - IT</SelectItem>
                </Select>

                <Input
                  isReadOnly
                  label="Status"
                  variant="bordered"
                  value="Pending"
                />

                {/* FILES */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Files
                  </label>

                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.rar"
                    onChange={handleFileChange}
                    className="w-full border rounded-md p-2"
                  />

                  {files.length > 0 && (
                    <ul className="mt-2 text-sm list-disc pl-5">
                      {files.map((file, i) => (
                        <li key={i}>{file.name}</li>
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
                  isDisabled={loading || !isFormValid}
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
