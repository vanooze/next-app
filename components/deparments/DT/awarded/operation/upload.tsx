import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDraggable,
} from "@heroui/react";
import useSWR from "swr";
import { mutate } from "swr";
import { fetcher } from "@/app/lib/fetcher";
import React, { useRef, useState } from "react";
import { AwardedManagement } from "@/helpers/db";

interface UploadBOQProps {
  isOpen: boolean;
  onClose: () => void;
  task: AwardedManagement | null;
}

export const UploadBOQ = ({ isOpen, onClose, task }: UploadBOQProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const handleFileUpload = async (file: File) => {
    if (!task?.id) return;

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", task.id.toString());

      const res = await fetch(
        "http://localhost:5678/webhook-test/75d91fd6-cbca-432e-b115-935e48ce8461",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      console.log("File uploaded successfully:", data);

      await updateTaskStatus(task.id, "Finished");

      await mutate("/api/department/ITDT/DT/awarded");

      onClose();
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      const res = await fetch("/api/department/ITDT/DT/awarded/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task status");
      }

      return await res.json();
    } catch (err) {
      console.error("Error updating task status:", err);
      throw err;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
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
            <ModalHeader {...moveProps} className="w-full flex flex-col gap-4">
              Upload Excel File
            </ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <div className="text-center">
                <p className="text-sm text-default-500 mb-4">
                  Upload an Excel file (.xlsx or .xls) to complete this task.
                  The status will be automatically set to "Finished" after
                  successful upload.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  color="primary"
                  variant="flat"
                  isLoading={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!task?.id}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Choose Excel File"}
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
