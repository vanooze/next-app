import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { Projects } from "@/helpers/acumatica";
import { displayValue } from "@/helpers/displayValue";
import { formatDateMMDDYYYY } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/layout/UserContext";
import { DotsIcon } from "@/components/icons/accounts/dots-icon";
import { PlusIcon } from "@/components/icons/table/add-icon";

interface Props {
  Tasks: Projects;
  columnKey: keyof Projects | "actions";
  handleEditProject: (project: Projects) => void;
}

export const RenderCell = ({ Tasks, columnKey, handleEditProject }: Props) => {
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
      user?.designation?.includes("PMO") ||
      user?.name === "DESIREE SALIVIO" ||
      user.restriction === "9";

    const accessList = Tasks.access
      ? Tasks.access.split(",").map((name) => name.trim())
      : [];

    return isManager || accessList.includes(user.name);
  })();

  const canToggleStatus =
    user?.designation?.includes("DOCUMENT CONTROLLER") ||
    user?.designation?.includes("PMO");

  const userDocumentController = user?.designation?.includes(
    "DOCUMENT CONTROLLER",
  );

  // ✅ Centralized color map for statuses
  const statusColorMap: Record<
    string,
    "success" | "danger" | "warning" | "secondary" | "default" | "primary"
  > = {
    Completed: "success",
    Active: "secondary",
    "For Payment": "primary",
    "In Planning": "warning",
    "On Hold": "default",
    Cancelled: "danger",
    Pending: "primary",
  };

  switch (columnKey) {
    case "projectId":
      return <span>{displayValue(cellValue)}</span>;

    case "status": {
      const isToggleable =
        canToggleStatus &&
        (cellValue === "Active" || cellValue === "For Payment");

      const [localStatus, setLocalStatus] = React.useState(cellValue as string);

      const nextStatus = localStatus === "Active" ? "For Payment" : "Active";

      const handleToggleStatus = async () => {
        if (!isToggleable) return;
        setLocalStatus(nextStatus);

        try {
          const res = await fetch("/api/department/PMO/project/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: Tasks.projectId,
              status: nextStatus,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to update");
          }
        } catch (err) {
          console.error("Failed to toggle status", err);
          setLocalStatus(cellValue as string);
        }
      };

      return (
        <Chip
          size="sm"
          variant="flat"
          color={statusColorMap[localStatus] || "default"}
          className={`capitalize text-xs font-medium ${
            isToggleable ? "cursor-pointer hover:opacity-80" : ""
          }`}
          onClick={handleToggleStatus}
        >
          {localStatus}
        </Chip>
      );
    }
    case "customerName":
      return <span>{displayValue(cellValue)}</span>;

    case "startDate":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;

    case "description":
      return <span>{displayValue(cellValue)}</span>;

    case "createdOn":
      return <span>{formatDateMMDDYYYY(cellValue)}</span>;

    case "projectManager":
      return <span>{displayValue(cellValue)}</span>;

    case "actions":
      return userHasAccess ? (
        <div className="flex items-center gap-4">
          {/* <Tooltip content="Edit Project" color="secondary">
            <button onClick={() => handleEditProject(Tasks)}>
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip> */}

          <Tooltip
            content={userDocumentController ? "Add Message" : "See Message"}
            color="secondary"
          >
            <button
              onClick={() =>
                router.push(`/project/message_board/${Tasks.projectId}`)
              }
            >
              <PlusIcon size={20} fill="#979797" />
            </button>
          </Tooltip>

          <Tooltip content="See Details" color="secondary">
            <button onClick={() => router.push(`/project/${Tasks.projectId}`)}>
              {/* <DotsIcon /> */}
              <EditIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
        </div>
      ) : null;

    default:
      return <span>{cellValue}</span>;
  }
};
