"use client";

import React, { useRef, useState } from "react";
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

interface UploadProfitingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesId: number;
  folder?: string; // optional folder name, default "profitting"
}

export const UploadProfitingModal: React.FC<UploadProfitingModalProps> = ({
  isOpen,
  onClose,
  salesId,
  folder = "profitting",
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-rar-compressed",
      "application/octet-stream",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    const validFiles = selectedFiles.filter((f) =>
      allowedTypes.includes(f.type),
    );
    if (validFiles.length !== selectedFiles.length) {
      setError(
        "Some files were skipped. Only PDF, DOCX, XLSX, Images, and WinRAR allowed.",
      );
    } else {
      setError("");
    }
    setFiles(validFiles);
  };

  const handleUploadFile = async () => {
    if (!files.length || !salesId) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("salesId", String(salesId));
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/department/ITDT/DT/tasks/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Upload failed");
      }

      // Refresh task files
      await mutate(`/api/department/ITDT/DT/tasks/`);

      // Clear selected files
      setFiles([]);
      // Close modal automatically
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file(s). Please try again.");
    } finally {
      setUploading(false);
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
            <ModalHeader {...moveProps}>Upload Files</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-foreground-500">
                  Upload one or multiple files. (Accept pdf, docx, xlsx, rar,
                  and images)
                </p>

                <Input
                  type="file"
                  accept=".pdf, .doc, .docx, .xls, .xlsx, .rar, image/*"
                  onChange={handleFileChange}
                  className="text-sm"
                  multiple
                />
                {error && <p className="text-danger text-xs mt-1">{error}</p>}
              </div>
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button color="default" variant="flat" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUploadFile}
                isDisabled={!files.length || uploading}
              >
                {uploading ? <Spinner size="sm" color="white" /> : "Upload"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
