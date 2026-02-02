"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDraggable,
  Spinner,
} from "@heroui/react";

interface FileObj {
  name: string;
  path: string;
}

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  folder?: string;
}

export const FilesModal = ({
  isOpen,
  onClose,
  taskId,
  folder = "ocular report",
}: FilesModalProps) => {
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [files, setFiles] = useState<FileObj[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !taskId) return;

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/department/ITDT/DT/tasks/files?taskId=${taskId}`,
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.files)) {
          setFiles(data.files);
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error("Failed to fetch files:", err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isOpen, taskId]);

  const downloadFile = (file: FileObj) => {
    let folderName = folder;
    let fileName = file.name;

    // Case 1: Path already points to API or external URL
    if (file.path.startsWith("/api/download") || file.path.startsWith("http")) {
      const link = document.createElement("a");
      link.href = file.path;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    // Case 2: Path like /uploads/ocular report/some file.pdf
    if (file.path.startsWith("/uploads/")) {
      const cleanPath = decodeURIComponent(file.path.replace("/uploads/", ""));
      const parts = cleanPath.split("/");

      folderName = parts[0]; // first folder
      fileName = parts.slice(1).join("/"); // the rest = filename

      // Build API URL
      const url = `/api/download?folder=${encodeURIComponent(
        folderName,
      )}&file=${encodeURIComponent(fileName)}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // Case 3: fallback (no path info)
    const url = `/api/download?folder=${encodeURIComponent(
      folder,
    )}&file=${encodeURIComponent(file.name)}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
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
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <Spinner size="sm" />
                  <span className="ml-2 text-sm text-foreground-500">
                    Loading files...
                  </span>
                </div>
              ) : files.length === 0 ? (
                <p className="text-sm text-foreground-500">
                  No files available.
                </p>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {files.map((file, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => downloadFile(file)}
                        className="text-blue-600 hover:underline"
                      >
                        {file.name}
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
