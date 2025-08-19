import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { DeleteIcon } from "../../../../icons/table/delete-icon";
import { EditIcon } from "../../../../icons/table/edit-icon";
import { POMonitoring } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";

interface Props {
  POMonitoring: POMonitoring;
  columnKey: keyof POMonitoring | "actions";
  handleEditTask: (task: POMonitoring) => void;
  handleDeleteTask: (task: POMonitoring) => void;
}

export const RenderCell = ({
  POMonitoring,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const cellValue = POMonitoring[columnKey as keyof POMonitoring];
  switch (columnKey) {
    case "poStatus":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            typeof cellValue === "string" &&
            [
              "APPROVED",
              "DISSAPROVED",
              "CANCELLED",
              "PENDING",
              "ONHOLD",
            ].includes(cellValue)
              ? "default"
              : "warning"
          }
          className={
            cellValue === "APPROVED"
              ? "bg-success-100 text-success-700"
              : cellValue === "CANCELLED"
              ? "bg-danger-100 text-danger-700"
              : cellValue === "DISSAPROVED"
              ? "bg-orange-100 text-orange-700"
              : cellValue === "ONHOLD"
              ? "bg-pink-100 text-pink-700"
              : "bg-yellow-100 text-yellow-700"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );
    case "poDate":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;
    case "poNumber":
      return <span>{displayValue(cellValue)}</span>;
    case "supplier":
      return <span>{displayValue(cellValue)}</span>;
    case "items":
      return <span>{displayValue(cellValue)}</span>;
    case "qty":
      return <span>{displayValue(cellValue)}</span>;
    case "uom":
      return <span>{displayValue(cellValue)}</span>;
    case "price":
      return <span>{displayValue(cellValue)}</span>;
    case "total":
      return <span>{displayValue(cellValue)}</span>;
    case "terms":
      return <span>{displayValue(cellValue)}</span>;
    case "remarks":
      return <span>{displayValue(cellValue)}</span>;
    case "purpose":
      return <span>{displayValue(cellValue)}</span>;
    case "requester":
      return <span>{displayValue(cellValue)}</span>;
    case "actions":
      return (
        <>
          <div className="flex items-center gap-4 ">
            <div>
              <Tooltip content="Edit table" color="secondary">
                <button onClick={() => handleEditTask(POMonitoring)}>
                  <EditIcon size={20} fill="#979797" />
                </button>
              </Tooltip>
            </div>
            <div>
              <Tooltip content="Delete" color="danger">
                <button onClick={() => handleDeleteTask(POMonitoring)}>
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
