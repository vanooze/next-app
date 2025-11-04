import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { DeleteIcon } from "../../../../icons/table/delete-icon";
import { EditIcon } from "../../../../icons/table/edit-icon";
import { dtTask } from "../../../../../helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";
import { useUserContext } from "@/components/layout/UserContext";
import { UploadIcon } from "@/components/icons/upload-icon";

interface Props {
  dtTasks: dtTask;
  columnKey: keyof dtTask | "actions";
  handleUploadTask: (task: dtTask) => void;
  handleEditTask: (task: dtTask) => void;
  handleDeleteTask: (task: dtTask) => void;
}

export const RenderCell = ({
  dtTasks,
  columnKey,
  handleUploadTask,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const { user } = useUserContext();
  const cellValue = dtTasks[columnKey as keyof dtTask];

  const canUpload =
    user?.name === "HAROLD DAVID" || user?.name === "MARVIN JIMENEZ";
  const canEdit =
    user?.designation === "DESIGN SUPERVISOR" || user?.designation === "DESIGN";
  const canDelete =
    user?.designation === "DESIGN SUPERVISOR" ||
    user?.name === "BILLY JOEL TOPACIO";

  const attachmentField = dtTasks.attachmentName;

  const attachments =
    typeof attachmentField === "string"
      ? attachmentField
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0)
      : [];

  switch (columnKey) {
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            typeof cellValue === "string" &&
            ["Finished", "Overdue", "Priority", "OnHold"].includes(cellValue)
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
      return <span>{displayValue(cellValue)}</span>;

    case "dateReceived":
    case "eBoqDate":
    case "sBoqDate":
    case "sirME":
    case "sirMJH":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "salesPersonnel": {
      if (attachments.length > 0) {
        const tooltipContent = (
          <div className="flex flex-col">
            {attachments.map((file, index) => (
              <span key={index} className="text-xs text-white-600">
                {file}
              </span>
            ))}
          </div>
        );

        return (
          <Tooltip content={tooltipContent} color="primary">
            <a
              href={`/uploads/ocular report/${attachments[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-medium"
            >
              {displayValue(cellValue)}
            </a>
          </Tooltip>
        );
      }
      return <span>{displayValue(cellValue)}</span>;
    }

    case "systemDiagram":
    case "structuralBoq":
      return <span>{displayValue(cellValue)}</span>;

    case "actions":
      return (
        <div className="flex items-center gap-4">
          {canUpload && (
            <Tooltip content="Upload file" color="secondary">
              <button onClick={() => handleUploadTask(dtTasks)}>
                <UploadIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip content="Edit table" color="secondary">
              <button onClick={() => handleEditTask(dtTasks)}>
                <EditIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          )}
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
