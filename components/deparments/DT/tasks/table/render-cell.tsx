import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { DeleteIcon } from "../../../../icons/table/delete-icon";
import { EditIcon } from "../../../../icons/table/edit-icon";
import { dtTask } from "../../../../../helpers/task";
import { displayValue } from "@/helpers/displayValue";
import { formatDateMMDDYYYY } from "@/helpers/formatDate";

interface Props {
  dtTasks: dtTask;
  columnKey: keyof dtTask | "actions";
  handleEditTask: (task: dtTask) => void;
  handleDeleteTask: (task: dtTask) => void;
}

export const RenderCell = ({
  dtTasks,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const cellValue = dtTasks[columnKey as keyof dtTask];
  switch (columnKey) {
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            cellValue === "Finished"
              ? "success"
              : cellValue === "Overdue"
              ? "danger"
              : cellValue === "Rush"
              ? "secondary"
              : "warning"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );
    case "clientName":
    case "projectDesc":
      return <span>{displayValue(cellValue)}</span>;
    case "dateReceived":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "salesPersonnel":
      return <span>{displayValue(cellValue)}</span>;
    case "systemDiagram":
      return <span>{displayValue(cellValue)}</span>;
    case "eBoqDate":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "structuralBoq":
      return <span>{displayValue(cellValue)}</span>;
    case "sBoqDate":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "sirME":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "sirMJH":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;

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
            <div>
              <Tooltip content="Delete" color="danger">
                <button onClick={() => handleDeleteTask(dtTasks)}>
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
