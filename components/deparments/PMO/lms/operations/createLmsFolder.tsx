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
import { useUserContext } from "@/components/layout/UserContext";
import {
  SelectExecutive,
  selectHeads,
  selectSupervisors,
} from "@/helpers/data";
import { mutate } from "swr";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId: number | null;
}

export const CreateLmsFolder = ({ isOpen, onClose, parentFolderId }: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessUsers, setAccessUsers] = useState<Set<string>>(new Set());
  const { user } = useUserContext();

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

  const normalize = (list: { key: string; label: string }[]) =>
    list.map((i) => ({ key: String(i.key), label: i.label }));

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
                const allKeys = [
                  ...SelectExecutive,
                  ...selectHeads,
                  ...selectSupervisors,
                ].map((i) => String(i.key));

                setAccessUsers(new Set(allKeys));
              }
            }}
          >
            {[
              { title: "Executive", data: normalize(SelectExecutive) },
              { title: "Heads", data: normalize(selectHeads) },
              { title: "Supervisors", data: normalize(selectSupervisors) },
            ].map(({ title, data }) => (
              <SelectSection
                key={title}
                title={title}
                classNames={{
                  heading:
                    "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small",
                }}
              >
                {data.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
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
