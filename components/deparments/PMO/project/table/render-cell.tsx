import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { ProjectMonitoring } from "@/helpers/db";
import { displayValue } from "@/helpers/displayValue";
import { formatDateMMDDYYYY } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/layout/UserContext";

interface Props {
  Tasks: ProjectMonitoring;
  columnKey: keyof ProjectMonitoring | "actions";
  handleAddTask: (task: ProjectMonitoring) => void;
}

export const RenderCell = ({ Tasks, columnKey, handleAddTask }: Props) => {
  const cellValue = Tasks[columnKey as keyof ProjectMonitoring];
  const { user } = useUserContext();
  const router = useRouter();

  const userHasAccess = (() => {
    if (!user) return false;

    const isManager =
      user.designation.includes("PMO TL") ||
      user.designation.includes("DOCUMENT CONTROLLER");

    const accessList = Tasks.access
      ? Tasks.access.split(",").map((name) => name.trim())
      : [];

    return isManager || accessList.includes(user.name);
  })();

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
      return userHasAccess ? (
        <div className="flex items-center gap-4">
          <Tooltip content="See Details" color="secondary">
            <button onClick={() => router.push(`/project/${Tasks.idkey}`)}>
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
        </div>
      ) : null;
    default:
      return <span>{cellValue}</span>;
  }
};
