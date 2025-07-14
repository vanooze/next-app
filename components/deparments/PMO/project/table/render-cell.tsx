import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { ProjectMonitoring } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { formatDateMMDDYYYY } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";

interface Props {
  Tasks: ProjectMonitoring;
  columnKey: keyof ProjectMonitoring | "actions";
  handleAddTask: (task: ProjectMonitoring) => void;
}

export const RenderCell = ({ Tasks, columnKey, handleAddTask }: Props) => {
  const cellValue = Tasks[columnKey as keyof ProjectMonitoring];
  const router = useRouter();

  switch (columnKey) {
    case "soNumber":
      return <span>{displayValue(cellValue)}</span>;
    case "customer":
      return <span>{displayValue(cellValue)}</span>;
    case "contactPerson":
      return <span>{displayValue(cellValue)}</span>;
    case "sales":
      return <span>{displayValue(cellValue)}</span>;
    case "date":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            cellValue === "Approved"
              ? "success"
              : cellValue === "Pending"
              ? "warning"
              : "danger"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );
    case "actions":
      return (
        <>
          <div className="flex items-center gap-4 ">
            <div>
              <Tooltip content="Edit table" color="secondary">
                <button onClick={() => router.push(`/project/${Tasks.idkey}`)}>
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
