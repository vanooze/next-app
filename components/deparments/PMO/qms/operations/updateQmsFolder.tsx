"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { mutate } from "swr";

interface Folder {
  id: number;
  name: string;
  access: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  users: { key: string; label: string }[];
}

export const UpdateQmsFolder = ({ isOpen, onClose, folder, users }: Props) => {
  const [name, setName] = useState("");
  const [accessUsers, setAccessUsers] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // 🔁 Load folder data
  useEffect(() => {
    if (!folder) return;

    setName(folder.name);

    if (folder.access) {
      try {
        setAccessUsers(new Set(JSON.parse(folder.access)));
      } catch {
        setAccessUsers(new Set());
      }
    } else {
      setAccessUsers(new Set());
    }
  }, [folder]);

  const handleSave = async () => {
    if (!folder) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/files/folder/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: folder.id,
          name: name.trim(),
          access: accessUsers.size > 0 ? [...accessUsers] : null,
        }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      await mutate("/api/files");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update folder");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Edit Folder</ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isRequired
          />

          <Select
            selectionMode="multiple"
            label="Give access to"
            placeholder="Select users"
            selectedKeys={accessUsers}
            onSelectionChange={(keys) => {
              if (keys !== "all") {
                setAccessUsers(keys as Set<string>);
              } else {
                setAccessUsers(new Set(users.map((u) => u.key)));
              }
            }}
          >
            {users.map((u) => (
              <SelectItem key={u.key}>{u.label}</SelectItem>
            ))}
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={isSaving}>
            Save changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
