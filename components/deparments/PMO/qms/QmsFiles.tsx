"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { UploadQmsFile } from "./UploadQmsFile";
import useSWR from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { mutate } from "swr";

interface QmsFile {
  id: number;
  file_title: string;
  file_description: string | null;
  file_date: string;
  file_name: string;
}

export const QmsFiles = () => {
  const { user } = useUserContext();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canUpload = user?.designation?.includes("DOCUMENT CONTROLLER");
  const canDelete = user?.designation?.includes("DOCUMENT CONTROLLER");

  const { data, error, isLoading } = useSWR<{ success: boolean; files: QmsFile[] }>(
    "/api/department/PMO/qms",
    fetcher
  );

  const handleDelete = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/department/PMO/qms/delete?id=${fileId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        await mutate("/api/department/PMO/qms");
        alert("File deleted successfully");
      } else {
        alert(result.error || "Failed to delete file");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (fileName: string, fileTitle: string) => {
    const url = `/api/download?folder=qms&file=${encodeURIComponent(fileName)}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileTitle || fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Loading QMS files..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Failed to load QMS files</p>
      </div>
    );
  }

  const files = data?.files || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">QMS Files</h1>
        {canUpload && (
          <Button
            color="primary"
            endContent={<PlusIcon />}
            onPress={() => setIsUploadModalOpen(true)}
          >
            Upload File
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No QMS files available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-start pb-2">
                <h3 className="text-lg font-semibold line-clamp-2">
                  {file.file_title}
                </h3>
                {file.file_description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {file.file_description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {file.file_date
                    ? new Date(file.file_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "No date"}
                </p>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="flex-1"
                    onPress={() => handleDownload(file.file_name, file.file_title)}
                  >
                    Download
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isIconOnly
                      isLoading={deletingId === file.id}
                      onPress={() => handleDelete(file.id)}
                    >
                      <DeleteIcon size={20} fill="#FF0080" />
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <UploadQmsFile
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

