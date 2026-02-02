"use client";

import React, { useEffect, useRef, useState } from "react";
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
  revision?: number;
}

interface RevisionGroup {
  revision: number;
  files: FileObj[];
  label: string;
}

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  folder?: string;
}

export const FilesModal: React.FC<FilesModalProps> = ({
  isOpen,
  onClose,
  taskId,
  folder = "profitting",
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const [files, setFiles] = useState<FileObj[]>([]);
  const [revisions, setRevisions] = useState<RevisionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen || !taskId) return;

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/department/SALES/sales_management/files?taskId=${taskId}`,
        );
        const data = await res.json();

        if (data.success) {
          if (Array.isArray(data.files)) {
            setFiles(data.files);
            setRevisions(buildRevisions(data.files));
          } else {
            setFiles([]);
            setRevisions([]);
          }
        } else {
          setFiles([]);
          setRevisions([]);
        }
      } catch (err) {
        console.error("Failed to fetch files:", err);
        setFiles([]);
        setRevisions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isOpen, taskId]);

  const buildRevisions = (files: FileObj[]): RevisionGroup[] => {
    const map = new Map<number, FileObj[]>();

    files.forEach((file) => {
      const rev = file.revision ?? 0;
      if (!map.has(rev)) map.set(rev, []);
      map.get(rev)!.push(file);
    });

    return Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([revision, files]) => ({
        revision,
        files,
        label: revision === 0 ? "Initial Submission" : `Revision ${revision}`,
      }));
  };

  const handleDownload = (file: FileObj) => {
    const a = document.createElement("a");
    a.href = `/api/download?folder=${encodeURIComponent(
      folder,
    )}&file=${encodeURIComponent(file.name)}`;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleAction = async (action: "decline" | "accept") => {
    if (!taskId) return;

    setProcessing(true);
    try {
      const res = await fetch(
        `/api/department/SALES/sales_management/files/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, action }),
        },
      );

      const data = await res.json();

      if (data.success) {
        // Refresh files after action
        const filesRes = await fetch(
          `/api/department/ITDT/DT/tasks/files?taskId=${taskId}`,
        );
        const filesData = await filesRes.json();

        if (filesData.success) {
          if (Array.isArray(filesData.revisions)) {
            setRevisions(filesData.revisions);
          }
          if (Array.isArray(filesData.files)) {
            setFiles(filesData.files);
          }
        }

        // Close modal after successful action
        onClose();
      } else {
        alert(`Failed to ${action} task: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(`Failed to ${action} task:`, err);
      alert(`Failed to ${action} task. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  // Get the latest revision number
  const latestRevision =
    revisions.length > 0 ? Math.max(...revisions.map((r) => r.revision)) : -1;

  return (
    <Modal ref={targetRef} isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader {...moveProps}>Files</ModalHeader>
            <ModalBody>
              {loading ? (
                <p className="text-sm text-foreground-500">Loading files...</p>
              ) : revisions.length === 0 ? (
                <p className="text-sm text-foreground-500">
                  No files available.
                </p>
              ) : (
                <div className="space-y-4">
                  {revisions.map((revisionGroup) => {
                    const isLatest = revisionGroup.revision === latestRevision;
                    const isOld = !isLatest;

                    return (
                      <div
                        key={revisionGroup.revision}
                        className={`border rounded-lg p-3 ${
                          isOld ? "opacity-60 scale-95" : "border-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className={`font-semibold ${
                              isLatest ? "text-primary" : "text-foreground-500"
                            }`}
                          >
                            {revisionGroup.label}
                          </h4>
                        </div>
                        <ul
                          className={`list-disc pl-5 space-y-1 ${
                            isOld ? "text-sm" : ""
                          }`}
                        >
                          {revisionGroup.files.map((file, idx) => (
                            <li key={idx}>
                              <button
                                onClick={() => handleDownload(file)}
                                className="text-blue-500 hover:underline"
                              >
                                {file.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  color="danger"
                  variant="flat"
                  onClick={() => handleAction("decline")}
                  isLoading={processing}
                  isDisabled={processing || files.length === 0}
                >
                  Decline
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  onClick={() => handleAction("accept")}
                  isLoading={processing}
                  isDisabled={processing || files.length === 0}
                >
                  Accept
                </Button>
              </div>
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
