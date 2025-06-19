import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDraggable,
} from "@heroui/react";
import { mutate } from "swr";
import React, { useRef } from "react";

interface DeleteTaskProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
}

export const DeleteTask = ({ isOpen, onClose, taskId }: DeleteTaskProps) => {
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const handleDeleteTask = async () => {
    try {
      const res = await fetch("/api/department/ITDT/DT/tasks/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      const data = await res.json();
      console.log("Task deleted:", data);

      // 🔁 Refresh SWR cache
      await mutate("/api/department/ITDT/DT/tasks");

      onClose();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div>
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="md"
        onOpenChange={onClose}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps}>Delete Task</ModalHeader>
              <ModalBody>
                <div>Are you sure you want to delete this task?</div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteTask}>
                  Confirm Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
