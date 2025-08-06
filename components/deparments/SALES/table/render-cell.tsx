import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { SalesManagement } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";

interface Props {
  dtTasks: SalesManagement;
  columnKey: keyof SalesManagement | "actions";
  handleEditTask: (task: SalesManagement) => void;
  handleDeleteTask: (task: SalesManagement) => void;
}

export const RenderCell = ({
  dtTasks,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const cellValue = dtTasks[columnKey as keyof SalesManagement];
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
              : cellValue === "Lost Account"
              ? "bg-danger-100 text-danger-700"
              : cellValue === "On Hold"
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
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;
    case "sirMJH":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;
    case "salesPersonnel":
      return <span>{displayValue(cellValue)}</span>;
    case "notes":
      return <span>{displayValue(cellValue)}</span>;
    case "actions":
      return (
        <>
          <div className="flex items-center gap-4 ">
            <div>
              <Tooltip content="Edit table" color="secondary">
                <button onClick={() => handleEditTask(dtTasks)}>
                  <EditIcon size={20} fill="#979797" />
                </button>
              </Tooltip>
            </div>
          </div>
        </>
      );
    default:
      return <span>{cellValue}</span>;
  }
};
