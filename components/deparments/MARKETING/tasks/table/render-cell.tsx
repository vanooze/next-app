import { Tooltip, Chip } from "@heroui/react";
import React, { useState } from "react";
import { DeleteIcon } from "../../../../icons/table/delete-icon";
import { EditIcon } from "../../../../icons/table/edit-icon";
import { MarketingTasks } from "../../../../../helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { useUserContext } from "@/components/layout/UserContext";
import { UploadIcon } from "@/components/icons/upload-icon";
import { FilesModal } from "./showFile";

interface Props {
  MarketingTasks: MarketingTasks;
  columnKey: keyof MarketingTasks | "actions";
  handleUploadTask: (task: MarketingTasks) => void;
  handleEditTask: (task: MarketingTasks) => void;
  handleDeleteTask: (task: MarketingTasks) => void;
}

export const RenderCell = ({
  MarketingTasks,
  columnKey,
  handleUploadTask,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const { user } = useUserContext();
  const cellValue = MarketingTasks[columnKey as keyof MarketingTasks];
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [isPersonnelFilesModalOpen, setIsPersonnelFilesModalOpen] =
    useState(false);

  // Use attachmentName directly as an array
  let attachments: string[] = [];

  try {
    attachments =
      typeof MarketingTasks.file === "string"
        ? JSON.parse(MarketingTasks.file)
        : [];
  } catch {
    attachments = [];
  }

  const canUpload = user?.designation.includes("MARKETING");

  switch (columnKey) {
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            ["Finished", "Overdue", "Priority", "OnHold"].includes(
              cellValue as string,
            )
              ? "default"
              : "warning"
          }
          className={
            cellValue === "Finished"
              ? "bg-success-100 text-success-700"
              : cellValue === "Overdue"
                ? "bg-danger-100 text-danger-700"
                : cellValue === "Priority"
                  ? "bg-purple-100 text-purple-700"
                  : cellValue === "OnHold"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-yellow-100 text-yellow-700"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );

    case "clientName":
    case "projectDesc":
    case "dateReceived":
      return <span>{displayValue(cellValue)}</span>;
    case "personnel":
      return attachments.length > 0 ? (
        <>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsPersonnelFilesModalOpen(true);
            }}
            className="text-blue-500 hover:underline font-medium"
          >
            {displayValue(cellValue)}
          </a>

          <FilesModal
            isOpen={isPersonnelFilesModalOpen}
            onClose={() => setIsPersonnelFilesModalOpen(false)}
            attachments={attachments}
            folder="marketing"
          />
        </>
      ) : (
        <span>{displayValue(cellValue)}</span>
      );
    case "date":
      return <span>{displayValue(cellValue)}</span>;
    case "actions":
      return (
        <div className="flex items-center gap-4">
          {canUpload && (
            <Tooltip content="Upload file" color="secondary">
              <button onClick={() => handleUploadTask(MarketingTasks)}>
                <UploadIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          )}
          {canUpload && (
            <Tooltip content="Edit table" color="secondary">
              <button onClick={() => handleEditTask(MarketingTasks)}>
                <EditIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          )}
          {canUpload && (
            <Tooltip content="Delete" color="danger">
              <button onClick={() => handleDeleteTask(MarketingTasks)}>
                <DeleteIcon size={20} fill="#FF0080" />
              </button>
            </Tooltip>
          )}
        </div>
      );

    default:
      return <span>{cellValue}</span>;
  }
};
