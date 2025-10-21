import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { AwardedManagement } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { normalizeToYYYYMMDD } from "@/helpers/formatDate";
import { UploadIcon } from "@/components/icons/upload-icon";

interface Props {
  AwardedProj: AwardedManagement;
  columnKey: keyof AwardedManagement | "actions";
  handleEditTask: (task: AwardedManagement) => void;
}

export const RenderCell = ({
  AwardedProj,
  columnKey,
  handleEditTask,
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
            ["Finished", "On Going"].includes(cellValue)
              ? "default"
              : "warning"
          }
          className={
            cellValue === "Finished"
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
    case "sirMJH":
    case "dateAwarded":
      return <span>{normalizeToYYYYMMDD(cellValue)}</span>;

    case "salesPersonnel":
    case "notes":
      return <span>{displayValue(cellValue)}</span>;

    case "actions":
      return (
        <div className="flex items-center gap-4">
          {AwardedProj.status !== "Finished" && (
            <Tooltip content="Upload BOQ (Excel File)" color="secondary">
              <button onClick={() => handleEditTask(AwardedProj)}>
                <UploadIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          )}
        </div>
      );

    default:
      return <span>{cellValue}</span>;
  }
};
