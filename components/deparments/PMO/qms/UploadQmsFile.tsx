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
  useDisclosure,
  useDraggable,
  Textarea,
  Spinner,
} from "@heroui/react";
import { mutate } from "swr";

interface UploadQmsFileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadQmsFile = ({ isOpen, onClose }: UploadQmsFileProps) => {
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
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

      const res = await fetch("/api/department/PMO/qms", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        await mutate("/api/department/PMO/qms");
        // Reset form
        setFileTitle("");
        setFileDescription("");
        setFile(null);
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
    <Modal
      ref={targetRef}
      isOpen={isOpen}
      onOpenChange={onClose}
      size="xl"
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader {...moveProps} className="w-full flex flex-col gap-4">
              Upload QMS File
            </ModalHeader>

            <ModalBody className="flex flex-col gap-4">
              <Input
                isRequired
                label="File Title"
                variant="bordered"
                value={fileTitle}
                onValueChange={setFileTitle}
                placeholder="Enter file title"
              />

              <Textarea
                label="File Description"
                variant="bordered"
                value={fileDescription}
                onValueChange={setFileDescription}
                placeholder="Enter file description (optional)"
                minRows={3}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
                {file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onClick={onClose}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleUpload}
                isLoading={loading}
                isDisabled={loading || !fileTitle.trim() || !file}
              >
                {loading ? "Uploading..." : "Upload File"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

