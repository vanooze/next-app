import { Tooltip, Chip } from "@heroui/react";
import React, { useState } from "react";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { SalesManagement } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";
import { useUserContext } from "@/components/layout/UserContext";
import { FilesModal } from "./showFile";

interface Props {
  dtTasks: SalesManagement;
  columnKey: keyof SalesManagement | "actions";
  handleEditTask: (task: SalesManagement) => void;
  handleDeleteTask: (task: SalesManagement) => void;
}

export const RenderCell: React.FC<Props> = ({
  dtTasks,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}) => {
  const { user } = useUserContext();
  const cellValue = dtTasks[columnKey as keyof SalesManagement];
  const canDelete =
    user?.department === "SALES" || user?.designation.includes("IT SUPERVISOR");

  // Modal state for viewing files
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);

  switch (columnKey) {
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            typeof cellValue === "string" &&
            ["Awarded", "Overdue", "Priority", "On Hold"].includes(cellValue)
              ? "default"
              : "warning"
          }
          className={
            cellValue === "Awarded"
              ? "bg-success-100 text-success-700"
              : cellValue === "Lost Account"
              ? "bg-danger-100 text-danger-700"
              : cellValue === "Declined"
              ? "bg-danger-100 text-danger-700"
              : cellValue === "On Hold"
              ? "bg-cyan-100 text-cyan-700"
              : cellValue === "Submitted"
              ? "bg-success-100 text-success-700"
              : cellValue === "Accepted"
              ? "bg-success-100 text-success-700"
              : "bg-yellow-100 text-yellow-700"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );

    case "clientName":
    case "projectDesc":
      return <span>{displayValue(cellValue)}</span>;

    case "dateReceived":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "sirMJH":
      // Only show modal button if there are files (profitingFile exists)
      if (dtTasks.profitingFile && dtTasks.profitingFile.length > 0) {
        return (
          <>
            <button
              onClick={() => setIsFilesModalOpen(true)}
              className="text-blue-500 hover:underline font-medium"
            >
              {normalizeToYYYYMMDD(cellValue)}
            </button>

            <FilesModal
              isOpen={isFilesModalOpen}
              onClose={() => setIsFilesModalOpen(false)}
              taskId={dtTasks.id}
            />
          </>
        );
      }
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "salesPersonnel":
      return <span>{displayValue(cellValue)}</span>;

    case "updates":
      const updatesArray =
        typeof cellValue === "string"
          ? cellValue
              .split("\n")
              .map((u) => u.trim())
              .filter((u) => u.length > 0)
          : [];
      if (updatesArray.length === 0) return <span>-</span>;
      const latestUpdate = updatesArray[updatesArray.length - 1];
      return <span>{latestUpdate}</span>;

    case "notes":
      return <span>{displayValue(cellValue)}</span>;

    case "dateAwarded":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "actions":
      return (
        <div className="flex items-center gap-4">
          <Tooltip content="Edit table" color="secondary">
            <button onClick={() => handleEditTask(dtTasks)}>
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
          {canDelete && (
            <Tooltip content="Delete" color="danger">
              <button onClick={() => handleDeleteTask(dtTasks)}>
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
