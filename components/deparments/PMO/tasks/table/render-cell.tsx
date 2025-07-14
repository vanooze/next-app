import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { DeleteIcon } from "../../../../icons/table/delete-icon";
import { EditIcon } from "../../../../icons/table/edit-icon";
import { PMOTasks } from "../../../../../helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";

interface Props {
  PMOTasks: PMOTasks;
  columnKey: keyof PMOTasks | "actions";
  handleEditTask: (task: PMOTasks) => void;
  handleDeleteTask: (task: PMOTasks) => void;
}

export const RenderCell = ({
  PMOTasks,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const cellValue = PMOTasks[columnKey as keyof PMOTasks];
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
    case "taskDesc":
      return <span>{displayValue(cellValue)}</span>;
    case "dateStart":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;
    case "dateEnd":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;
    case "personnel":
      return <span>{displayValue(cellValue)}</span>;
    case "dateFinished":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "actions":
      return (
        <>
          <div className="flex items-center gap-4 ">
            <div>
              <Tooltip content="Edit table" color="secondary">
                <button onClick={() => handleEditTask(PMOTasks)}>
                  <EditIcon size={20} fill="#979797" />
                </button>
              </Tooltip>
            </div>
            <div>
              <Tooltip content="Delete" color="danger">
                <button onClick={() => handleDeleteTask(PMOTasks)}>
                  <DeleteIcon size={20} fill="#FF0080" />
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
