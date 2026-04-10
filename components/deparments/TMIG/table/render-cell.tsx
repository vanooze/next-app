import { Tooltip, Chip, Progress } from "@heroui/react";
import React, { useState } from "react";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { RepairTasks } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";
import { FilesModal } from "../operation/showFile";

interface Props {
  RepairTasks: RepairTasks;
  columnKey: keyof RepairTasks | "actions";
  handleEditTask: (task: RepairTasks) => void;
  handleDeleteTask: (task: RepairTasks) => void;
}

export const RenderCell = ({
  RepairTasks,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);

  let attachments: string[] = [];

  if (typeof RepairTasks.files === "string") {
    const raw = RepairTasks.files.trim();

    try {
      if (raw.startsWith("[")) {
        attachments = JSON.parse(raw);
      } else {
        attachments = raw
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0);
      }
    } catch (err) {
      console.error("File parse error:", err);
      attachments = [];
    }
  }

  const cellValue = RepairTasks[columnKey as keyof RepairTasks];

  switch (columnKey) {
    case "clientName":
      return <span>{displayValue(cellValue)}</span>;
    case "description":
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
            folder="Repair Reports"
          />
        </>
      ) : (
        <span>{displayValue(cellValue)}</span>
      );

    case "date":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "personnel":
      return <span>{displayValue(cellValue)}</span>;

    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          className={
            cellValue === "Finished"
              ? "bg-success-100 text-success-700"
              : cellValue === "OnHold"
                ? "bg-purple-100 text-purple-700"
                : cellValue === "Pending"
                  ? "bg-cyan-100 text-cyan-700"
                  : "bg-yellow-100 text-yellow-700"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );

    case "unit":
      return <span>{displayValue(cellValue)}</span>;

    case "severity":
      return (
        <Chip
          size="sm"
          variant="flat"
          className={
            cellValue === "LOW"
              ? "bg-green-100 text-green-700"
              : cellValue === "MEDIUM"
                ? "bg-yellow-100 text-yellow-700"
                : cellValue === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );

    case "completion":
      return (
        <div className="flex flex-col gap-1">
          <Progress
            value={cellValue as number}
            size="sm"
            className="w-full"
            showValueLabel
            color={cellValue === 100 ? "success" : "primary"}
          />
        </div>
      );

    case "actions":
      return (
        <div className="flex items-center gap-4">
          <Tooltip content="Edit" color="secondary">
            <button onClick={() => handleEditTask(RepairTasks)}>
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
          <Tooltip content="Delete" color="danger">
            <button onClick={() => handleDeleteTask(RepairTasks)}>
              <DeleteIcon size={20} fill="#FF0080" />
            </button>
          </Tooltip>
        </div>
      );

    default:
      return <span>{cellValue}</span>;
  }
};
