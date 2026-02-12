import { Tooltip, Chip } from "@heroui/react";
import React, { useState } from "react";
import { DeleteIcon } from "../../../../icons/table/delete-icon";
import { EditIcon } from "../../../../icons/table/edit-icon";
import { ItTasks } from "../../../../../helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { useUserContext } from "@/components/layout/UserContext";
import { UploadIcon } from "@/components/icons/upload-icon";
import { FilesModal } from "./ShowFile";

interface Props {
  ItTasks: ItTasks;
  columnKey: keyof ItTasks | "actions";
  handleUploadTask: (task: ItTasks) => void;
  handleEditTask: (task: ItTasks) => void;
  handleDeleteTask: (task: ItTasks) => void;
}

export const RenderCell = ({
  ItTasks,
  columnKey,
  handleUploadTask,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const { user } = useUserContext();
  const cellValue = ItTasks[columnKey as keyof ItTasks];
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);

  // Use attachmentName directly as an array
  const attachments =
    typeof ItTasks.attachmentName === "string"
      ? ItTasks.attachmentName
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0)
      : [];

  const canUpload =
    user?.designation.includes("PROGRAMMER") ||
    user?.designation.includes("MMC") ||
    user?.designation.includes("IT TECHNICAL");

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
    case "salesPersonnel":
      return attachments.length > 0 ? (
        <>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsFilesModalOpen(true);
            }}
            className="text-blue-500 hover:underline font-medium"
          >
            {displayValue(cellValue)}
          </a>

          <FilesModal
            isOpen={isFilesModalOpen}
            onClose={() => setIsFilesModalOpen(false)}
            attachments={attachments}
            folder="it report"
          />
        </>
      ) : (
        <span>{displayValue(cellValue)}</span>
      );
    case "personnel":
    case "date":
      return <span>{displayValue(cellValue)}</span>;
    case "actions":
      return (
        <div className="flex items-center gap-4">
          {canUpload && (
            <Tooltip content="Upload file" color="secondary">
              <button onClick={() => handleUploadTask(ItTasks)}>
                <UploadIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          )}
          <Tooltip content="Edit table" color="secondary">
            <button onClick={() => handleEditTask(ItTasks)}>
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
          <Tooltip content="Delete" color="danger">
            <button onClick={() => handleDeleteTask(ItTasks)}>
              <DeleteIcon size={20} fill="#FF0080" />
            </button>
          </Tooltip>
        </div>
      );

    default:
      return <span>{cellValue}</span>;
  }
};
