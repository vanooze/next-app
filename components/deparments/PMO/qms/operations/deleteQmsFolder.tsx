"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: number | null;
  isDeleting?: boolean;
  onDelete: (id: number) => Promise<void>;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  itemName,
  itemId,
  isDeleting = false,
  onDelete,
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Delete {itemName}</ModalHeader>
        <ModalBody>
          Are you sure you want to delete "<strong>{itemName}</strong>"? This
          action cannot be undone.
        </ModalBody>
        <ModalFooter className="flex gap-2 justify-end">
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            isLoading={isDeleting}
            onPress={async () => {
              if (itemId !== null) await onDelete(itemId);
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
