import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { AwardedManagement } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";

interface Props {
  AwardedProj: AwardedManagement;
  columnKey: keyof AwardedManagement | "actions";
  handleEditTask: (task: AwardedManagement) => void;
  handleDeleteTask: (task: AwardedManagement) => void;
}

export const RenderCell = ({
  AwardedProj,
  columnKey,
  handleEditTask,
  handleDeleteTask,
}: Props) => {
  const cellValue = AwardedProj[columnKey as keyof AwardedManagement];
  switch (columnKey) {
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            typeof cellValue === "string" &&
            ["Finished", "On Going", "On Hold"].includes(cellValue)
              ? "default"
              : "warning"
          }
          className={
            cellValue === "Finished"
              ? "bg-success-100 text-success-700"
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
    case "dateAwarded":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;
    case "notes":
      return <span>{displayValue(cellValue)}</span>;
    case "actions":
      return (
        <>
          <div className="flex items-center gap-4 ">
            <div>
              <Tooltip content="Edit table" color="secondary">
                <button onClick={() => handleEditTask(AwardedProj)}>
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
