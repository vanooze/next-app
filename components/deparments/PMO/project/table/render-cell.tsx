import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { Projects } from "@/helpers/acumatica";
import { displayValue } from "@/helpers/displayValue";
import { formatDateMMDDYYYY } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/layout/UserContext";
import { DotsIcon } from "@/components/icons/accounts/dots-icon";

interface Props {
  Tasks: Projects;
  columnKey: keyof Projects | "actions";
}

export const RenderCell = ({ Tasks, columnKey }: Props) => {
  const cellValue = Tasks[columnKey as keyof Projects];
  const { user } = useUserContext();
  const router = useRouter();

  const userHasAccess = (() => {
    if (!user) return false;

    const isManager =
      user.designation?.includes("PMO TL") ||
      user.designation?.includes("DOCUMENT CONTROLLER") ||
      user.designation?.includes("TECHNICAL ASSISTANT MANAGER") ||
      user.designation?.includes("IT SUPERVISOR") ||
      user.designation?.includes("TMIG SUPERVISOR") ||
      user.designation?.includes("TECHNICAL SUPERVISOR") ||
      user.designation?.includes("DESIGN SUPERVISOR") ||
      user.designation?.includes("TECHNICAL ADMIN CONSULTANT") ||
      user.designation?.includes("TECHNICAL MANAGER") ||
      user?.name === "Kaye Kimberly L. Manuel" ||
      user.restriction === "9";

    const accessList = Tasks.access
      ? Tasks.access.split(",").map((name) => name.trim())
      : [];

    return isManager || accessList.includes(user.name);
  })();

  const userDocumentController = user?.designation?.includes(
    "DOCUMENT CONTROLLER"
  );

  switch (columnKey) {
    case "projectId":
      return <span>{displayValue(cellValue)}</span>;
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            cellValue === "Completed"
              ? "success"
              : cellValue === "Active"
              ? "warning"
              : "danger"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );
    case "template":
      return <span>{displayValue(cellValue)}</span>;
    case "customerId":
      return <span>{displayValue(cellValue)}</span>;
    case "startDate":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "description":
      return <span>{displayValue(cellValue)}</span>;
    case "createdOn":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;
    case "currency":
      return <span>{displayValue(cellValue)}</span>;
    case "projectManager":
      return <span>{displayValue(cellValue)}</span>;
    case "actions":
      return userHasAccess ? (
        <div className="flex items-center gap-4">
          <Tooltip content="See Details" color="secondary">
            <button onClick={() => router.push(`/project/${Tasks.projectId}`)}>
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
          <Tooltip
            content={userDocumentController ? "Add Message" : "See Message"}
            color="secondary"
          >
            <button
              onClick={() =>
                router.push(`/project/message_board/${Tasks.projectId}`)
              }
            >
              <DotsIcon />
            </button>
          </Tooltip>
        </div>
      ) : null;
    default:
      return <span>{cellValue}</span>;
  }
};
