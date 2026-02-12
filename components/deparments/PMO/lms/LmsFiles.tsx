"use client";

import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { CreateLmsFolder } from "./operations/createLmsFolder";
import { DeleteConfirmModal } from "./operations/deleteLmsFolder";
import { UpdateLmsFolder } from "./operations/updateLmsFolder";
import { UploadLmsFile } from "./UploadLmsFile";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { EditIcon } from "@/components/icons/table/edit-icon";
import {
  selectHeads,
  selectSupervisors,
  SelectExecutive,
} from "@/helpers/data";

// ----------------- TYPES -----------------
interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_by: string;
  access: string | null;
}

interface LmsFile {
  id: number;
  file_title: string;
  file_description: string | null;
  file_date: string;
  file_name: string;
  folder_id: number | null;
  access: string | null;
}

// ----------------- COMPONENT -----------------
export const LmsFiles = () => {
  const { user } = useUserContext();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderStack, setFolderStack] = useState<Folder[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const allUsers = [...SelectExecutive, ...selectHeads, ...selectSupervisors];

  const canUpload = user?.designation?.includes("DOCUMENT CONTROLLER");
  const canUpdate = user?.designation?.includes("DOCUMENT CONTROLLER");
  const canDelete = user?.designation?.includes("DOCUMENT CONTROLLER");

  const { data, error, isLoading } = useSWR<{
    folders: Folder[];
    files: LmsFile[];
  }>("/api/files/lms", fetcher);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Loading LMS files..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Failed to load LMS files</p>
      </div>
    );
  }

  const { folders = [], files = [] } = data || {};

  const hasAccess = (access: string | null, userId?: string | number) => {
    if (user?.designation?.includes("DOCUMENT CONTROLLER")) return true;
    // 🌍 Public folder
    if (!access) return true;

    // 🔒 Restricted but user not logged in
    if (!userId) return false;

    try {
      const allowedUsers: string[] = JSON.parse(access);
      return allowedUsers.includes(String(userId));
    } catch {
      return false;
    }
  };
  // ----------------- FILTER VISIBLE -----------------
  const visibleFolders = folders.filter((f) => {
    const correctParent =
      currentFolderId === null
        ? f.parent_id === null
        : f.parent_id === currentFolderId;

    return correctParent && hasAccess(f.access, user?.user_id);
  });

  const visibleFiles = files.filter(
    (f) =>
      f.folder_id === currentFolderId && hasAccess(f.access, user?.user_id),
  );
  // ----------------- HANDLERS -----------------
  const enterFolder = (folder: Folder) => {
    setFolderStack((prev) => [...prev, folder]);
    setCurrentFolderId(folder.id);
  };

  const goBack = () => {
    const updatedStack = [...folderStack];
    updatedStack.pop();
    setFolderStack(updatedStack);
    setCurrentFolderId(updatedStack.at(-1)?.id ?? null);
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/files/lms/delete?id=${fileId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        await mutate("/api/files/lms");
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

  const handleDownload = (fileName: string, folderId?: number) => {
    const url = `/files/lms/download?file=${encodeURIComponent(fileName)}${
      folderId ? `&folderId=${folderId}` : ""
    }`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ----------------- BREADCRUMB TITLE -----------------
  const currentFolderName = folderStack.at(-1)?.name ?? "LMS Files";

  return (
    <div className="p-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {folderStack.length > 0 && (
            <Button size="sm" variant="flat" onPress={goBack}>
              ← Back
            </Button>
          )}
          <h1 className="text-2xl font-bold">{currentFolderName}</h1>
        </div>

        <div className="flex gap-2">
          {/* Upload file is only enabled inside folders */}
          {canUpload && currentFolderId !== null && (
            <Button
              color="primary"
              endContent={<PlusIcon />}
              onPress={() => setIsUploadModalOpen(true)}
            >
              Upload File
            </Button>
          )}

          {/* New folder is only enabled at top-level (currentFolderId === null) */}
          {canUpload && (
            <Button
              variant="flat"
              color="secondary"
              startContent={<PlusIcon />}
              onPress={() => setIsCreateFolderOpen(true)}
            >
              New Folder
            </Button>
          )}
        </div>
      </div>

      {/* ---------- FOLDERS ---------- */}
      {visibleFolders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {visibleFolders.map((folder) => (
            <Card
              key={folder.id}
              isPressable
              onPress={() => enterFolder(folder)}
              className="hover:shadow-md transition-shadow"
            >
              <CardBody>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="font-semibold">📁 {folder.name}</p>
                  </div>
                  <div className="col-start-3 flex justify-end gap-2">
                    {canUpdate && (
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={(e) => {
                          setFolderToEdit(folder);
                        }}
                      >
                        <EditIcon size={20} fill="#979797" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isIconOnly
                        isLoading={deletingId === folder.id}
                        onPress={(e) => {
                          setFolderToDelete(folder);
                        }}
                      >
                        <DeleteIcon size={20} fill="#FF0080" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- FILES ---------- */}
      {visibleFiles.length === 0 ? (
        currentFolderId !== null && (
          <p className="text-gray-500">No files in this folder</p>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleFiles.map((file) => (
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
                    onPress={() =>
                      handleDownload(
                        file.file_name,
                        file.folder_id ?? undefined,
                      )
                    }
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

      {/* ---------- MODALS ---------- */}
      <UploadLmsFile
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        parentFolderId={currentFolderId}
      />
      <CreateLmsFolder
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        parentFolderId={currentFolderId} // only top-level
      />

      <DeleteConfirmModal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        itemName={folderToDelete?.name || ""}
        itemId={folderToDelete?.id || null}
        isDeleting={deletingId === folderToDelete?.id}
        onDelete={async (id: number) => {
          setDeletingId(id);
          try {
            const res = await fetch(`/api/files/lms/folder/delete?id=${id}`, {
              method: "DELETE",
            });
            const result = await res.json();
            if (result.success) {
              await mutate("/api/department/PMO/lms");
              alert("Folder deleted successfully");
            } else {
              alert(result.error || "Failed to delete folder");
            }
          } catch (err) {
            console.error("Error deleting folder:", err);
            alert("Failed to delete folder");
          } finally {
            setDeletingId(null);
            setFolderToDelete(null);
          }
        }}
      />

      <UpdateLmsFolder
        isOpen={!!folderToEdit}
        onClose={() => setFolderToEdit(null)}
        folder={folderToEdit}
        users={allUsers}
      />
    </div>
  );
};
