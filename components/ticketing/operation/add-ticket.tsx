"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
  useDraggable,
} from "@heroui/react";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import { mutate } from "swr";
import {
  getDepartments,
  getUsersByDepartment,
  getAllUsers,
  SelectUser,
} from "@/helpers/kra";

export const CreateTicketModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = useRef(null);

  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  const [description, setDescription] = useState("");
  const [selectUsers, setSelectUsers] = useState<SelectUser[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [assignedPersonnel, setAssignedPersonnel] = useState<string | null>(
    null,
  );
  const [requestedNote, setRequestedNote] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    description: "",
    department: "",
    requestedNote: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setSelectUsers(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const departments = useMemo(() => {
    return getDepartments(selectUsers);
  }, [selectUsers]);

  const usersByDepartment = useMemo(() => {
    return getUsersByDepartment(selectUsers, selectedDepartment);
  }, [selectUsers, selectedDepartment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleCreateTicket = async (onClose: () => void) => {
    const newErrors = {
      description: "",
      department: "",
      requestedNote: "",
    };

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!requestedNote) {
      newErrors.requestedNote = "Note is required";
    }

    if (!selectedDepartment) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);

    if (
      newErrors.description ||
      newErrors.department ||
      newErrors.requestedNote
    ) {
      return;
    }
    setLoading(true);

    try {
      const requestedDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const formData = new FormData();

      formData.append("description", description);
      formData.append("department", selectedDepartment || "");
      formData.append("assignedPersonnel", assignedPersonnel || "");
      formData.append("requestedBy", user?.name || "Unknown");
      formData.append("requestedDate", requestedDate);
      formData.append("requestedNote", requestedNote || "");
      formData.append("status", "Pending");
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/ticketing/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create ticket");

      await mutate("/api/ticketing");

      setDescription("");
      setSelectedDepartment(null);
      setAssignedPersonnel(null);
      setAssignedPersonnel(null);
      setFiles([]);

      onClose();
    } catch (err) {
      console.error("Error creating ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
        Create Ticket
      </Button>

      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="lg"
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps}>Create Ticket</ModalHeader>

              <ModalBody className="gap-4">
                {/* Description */}
                <Input
                  isRequired
                  label="Description"
                  variant="bordered"
                  value={description}
                  onValueChange={(val) => {
                    setDescription(val);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }
                  }}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description}
                />

                <Input
                  isRequired
                  label="Note"
                  variant="bordered"
                  value={requestedNote}
                  onValueChange={(val) => {
                    setRequestedNote(val);
                    if (errors.requestedNote) {
                      setErrors((prev) => ({ ...prev, requestedNote: "" }));
                    }
                  }}
                  isInvalid={!!errors.requestedNote}
                  errorMessage={errors.requestedNote}
                />

                {/* Department */}
                <Select
                  isRequired
                  label="Department"
                  selectedKeys={
                    selectedDepartment
                      ? new Set([selectedDepartment])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const dept = Array.from(keys)[0] as string;
                    setSelectedDepartment(dept);
                    setAssignedPersonnel(null);

                    if (errors.department) {
                      setErrors((prev) => ({ ...prev, department: "" }));
                    }
                  }}
                  isInvalid={!!errors.department}
                  errorMessage={errors.department}
                >
                  {departments.map((dept) => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>

                {/* Personnel */}
                <Select
                  label="Assign Personnel"
                  selectedKeys={
                    assignedPersonnel ? new Set([assignedPersonnel]) : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const userId = Array.from(keys)[0] as string;
                    setAssignedPersonnel(userId);
                  }}
                >
                  {usersByDepartment.map((u) => (
                    <SelectItem key={u.key}>{u.label}</SelectItem>
                  ))}
                </Select>
                <div className="col-span-2">
                  <Input
                    type="file"
                    label="Attachments"
                    multiple
                    onChange={handleFileChange}
                  />

                  {files.length > 0 && (
                    <div className="text-sm text-gray-500 mt-2">
                      {files.length} file(s) selected
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={onClose}
                  isDisabled={loading}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  onPress={() => handleCreateTicket(onClose)}
                  isLoading={loading}
                  isDisabled={
                    loading || !description.trim() || !selectedDepartment
                  }
                >
                  Create Ticket
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
