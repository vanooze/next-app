"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { mutate } from "swr";

interface UploadLmsFileProps {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId: number | null;
}

export const UploadLmsFile = ({
  isOpen,
  onClose,
  parentFolderId,
}: UploadLmsFileProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!fileTitle.trim() || !file) {
      alert("Please provide a file title and select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fileTitle", fileTitle);
      formData.append("fileDescription", fileDescription);
      formData.append("file", file);

      if (parentFolderId !== null) {
        formData.append("folderId", String(parentFolderId));
      }

      const res = await fetch("/api/files/lms", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        await mutate("/api/files/lms");

        setFileTitle("");
        setFileDescription("");
        setFile(null);
        fileInputRef.current && (fileInputRef.current.value = "");

        onClose();
        alert("File uploaded successfully!");
      } else {
        alert(result.error || "Failed to upload file");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="xl">
      <ModalContent>
        <ModalHeader>Upload LMS File</ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <Input
            isRequired
            label="File Title"
            value={fileTitle}
            onValueChange={setFileTitle}
          />

          <Textarea
            label="File Description"
            value={fileDescription}
            onValueChange={setFileDescription}
          />

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleUpload}>
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
