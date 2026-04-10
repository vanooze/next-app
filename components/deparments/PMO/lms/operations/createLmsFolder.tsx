"use client";

import { useState } from "react";
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
  SelectSection,
} from "@heroui/react";
import { mutate } from "swr";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId: number | null;
  users: Record<string, { key: string; label: string }[]>;
}

export const CreateLmsFolder = ({
  isOpen,
  onClose,
  parentFolderId,
  users,
}: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessUsers, setAccessUsers] = useState<Set<string>>(new Set());

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);

    const res = await fetch("/api/files/lms/folder/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        parent_id: parentFolderId,
        access_users: accessUsers.size === 0 ? null : Array.from(accessUsers),
      }),
    });

    setLoading(false);

    if (res.ok) {
      setName("");
      setAccessUsers(new Set());
      await mutate("/api/files/lms");
      onClose();
    } else {
      alert("Failed to create folder");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Create Folder</ModalHeader>
        <ModalBody>
          <Input
            label="Folder name"
            value={name}
            onValueChange={setName}
            autoFocus
          />

          <Select
            selectionMode="multiple"
            label="Give access to:"
            placeholder="Public (no restrictions)"
            variant="bordered"
            selectedKeys={accessUsers}
            onSelectionChange={(keys) => {
              if (keys !== "all") {
                setAccessUsers(keys as Set<string>);
              } else {
                // Select all users across all departments
                const allUserKeys = Object.values(users)
                  .flat()
                  .map((u) => String(u.key));
                setAccessUsers(new Set(allUserKeys));
              }
            }}
          >
            {Object.entries(users)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([department, deptUsers]) => (
                <SelectSection key={department} title={department}>
                  {deptUsers
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((user) => (
                      <SelectItem key={String(user.key)}>
                        {user.label}
                      </SelectItem>
                    ))}
                </SelectSection>
              ))}
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleCreate}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
