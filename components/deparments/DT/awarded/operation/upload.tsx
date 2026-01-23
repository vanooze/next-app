"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDraggable,
} from "@heroui/react";
import { mutate } from "swr";
import React, { useRef, useState } from "react";
import { AwardedManagement } from "@/helpers/db";

interface UploadBOQProps {
  isOpen: boolean;
  onClose: () => void;
  task: AwardedManagement | null;
}

export const UploadBOQ = ({
  isOpen,
  onClose,
  task,
}: UploadBOQProps) => {
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, image, or Excel files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUploadFile = async () => {
    if (!file || !task) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", String(task.id));

      // TODO: Update this endpoint when BOQ upload API is implemented
      const res = await fetch("/api/department/ITDT/DT/awarded/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await mutate("/api/department/ITDT/DT/awarded");
      onClose();
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
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
              <ModalHeader {...moveProps}>Upload BOQ File</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  {task && (
                    <p className="text-sm text-foreground-500">
                      Upload BOQ for: {task.clientName}
                    </p>
                  )}
                  <p className="text-sm text-foreground-500">
                    Upload a PDF, image, or Excel file.
                  </p>

                  <Input
                    type="file"
                    accept=".pdf,image/*,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="text-sm"
                  />

                  {error && <p className="text-danger text-xs mt-1">{error}</p>}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleUploadFile}
                  isDisabled={!file || uploading || !task}
                >
                  {uploading ? <Spinner size="sm" color="white" /> : "Upload"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

