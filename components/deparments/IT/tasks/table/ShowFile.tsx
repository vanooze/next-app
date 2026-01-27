"use client";

import React, { useRef } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDraggable,
} from "@heroui/react";

interface FileObj {
  name: string;
  path: string;
}

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: string[]; // pass filenames directly
  folder?: string;
}

export const FilesModal = ({
  isOpen,
  onClose,
  attachments,
  folder = "IT Reporting",
}: FilesModalProps) => {
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const downloadFile = (fileName: string) => {
    const path = `/uploads/${encodeURIComponent(folder)}/${encodeURIComponent(
      fileName,
    )}`;
    const a = document.createElement("a");
    a.href = path;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Modal
      ref={targetRef}
      isOpen={isOpen}
      onOpenChange={onClose}
      size="sm"
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader {...moveProps}>Attached Files</ModalHeader>
            <ModalBody>
              {attachments.length === 0 ? (
                <p className="text-sm text-foreground-500">
                  No files available.
                </p>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {attachments.map((fileName) => (
                    <li key={fileName}>
                      <button
                        type="button"
                        onClick={() => downloadFile(fileName)}
                        className="text-blue-600 hover:underline"
                      >
                        {fileName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
