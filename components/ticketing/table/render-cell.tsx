import { Tooltip, Chip, Button } from "@heroui/react";
import React, { useState } from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { displayValue } from "@/helpers/displayValue";
import { Ticketing } from "@/helpers/db";
import { FilesModal } from "./showFile"; // create if not yet
import { PersonnelFilesModal } from "./showPersonnelFile"; // create if not yet

interface Props {
  ticket: Ticketing;
  columnKey: keyof Ticketing | "actions";
  handleGet: (ticket: Ticketing) => void;
  handleApprove: (ticket: Ticketing) => void;
  handleFinish: (ticket: Ticketing) => void;
  viewType?: "personal" | "pending";
}

export const RenderTicketCell = ({
  ticket,
  columnKey,
  handleGet,
  handleFinish,
  handleApprove,
  viewType,
}: Props) => {
  const { user } = useUserContext();
  const cellValue = ticket[columnKey as keyof Ticketing];

  const [isRequestedOpen, setIsRequestedOpen] = useState(false);
  const [isPersonnelOpen, setIsPersonnelOpen] = useState(false);

  const parseFiles = (raw?: string | null) => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return raw
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }
  };

  const requestedFiles = parseFiles(ticket.requestedFile);
  const personnelFiles = parseFiles(ticket.personnelFile);

  const renderStatus = (status: string) => (
    <Chip
      size="sm"
      variant="flat"
      className={
        status === "Finished"
          ? "bg-success-100 text-success-700"
          : status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : status === "Overdue"
              ? "bg-danger-100 text-danger-700"
              : status === "In Progress"
                ? "bg-primary-100 text-primary-700"
                : "bg-secondary-100 text-secondary-700"
      }
    >
      <span className="text-xs">{status}</span>
    </Chip>
  );

  switch (columnKey) {
    case "status":
      return renderStatus(cellValue as string);

    case "description":
    case "requestedNote":
      return <span>{displayValue(cellValue)}</span>;

    // ✅ CLICK REQUESTED BY → OPEN REQUESTED FILES
    case "requestedBy":
      return requestedFiles.length > 0 ? (
        <>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsRequestedOpen(true);
            }}
            className="text-blue-500 hover:underline font-medium"
          >
            {displayValue(cellValue)}
          </a>

          <FilesModal
            isOpen={isRequestedOpen}
            onClose={() => setIsRequestedOpen(false)}
            attachments={requestedFiles}
            folder="tickets"
          />
        </>
      ) : (
        <span>{displayValue(cellValue)}</span>
      );

    // ✅ CLICK ASSIGNED → OPEN PERSONNEL FILES
    case "assignedPersonnel":
      return personnelFiles.length > 0 ? (
        <>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsPersonnelOpen(true);
            }}
            className="text-blue-500 hover:underline font-medium"
          >
            {displayValue(cellValue)}
          </a>

          <PersonnelFilesModal
            isOpen={isPersonnelOpen}
            onClose={() => setIsPersonnelOpen(false)}
            attachments={personnelFiles}
            folder="tickets"
          />
        </>
      ) : (
        <span>{displayValue(cellValue)}</span>
      );

    case "requestedDate":
    case "acceptedDate":
    case "acceptedTime":
    case "finishedDate":
    case "finishedTime":
      return <span>{displayValue(cellValue)}</span>;

    // 👇 OPTIONAL: keep file count display
    case "requestedFile":
      return requestedFiles.length > 0 ? (
        <span className="text-blue-500 text-sm">
          {requestedFiles.length} file(s)
        </span>
      ) : (
        <span>-</span>
      );

    case "personnelFile":
      return personnelFiles.length > 0 ? (
        <span className="text-blue-500 text-sm">
          {personnelFiles.length} file(s)
        </span>
      ) : (
        <span>-</span>
      );

    case "actions":
      return (
        <div className="flex items-center gap-3">
          {viewType === "pending" && !ticket.acceptedDate && (
            <Tooltip content="Get Ticket" color="success">
              <Button
                size="sm"
                color="success"
                variant="flat"
                onPress={() => handleGet(ticket)}
              >
                Get
              </Button>
            </Tooltip>
          )}

          {viewType === "pending" &&
            ticket.status?.toLowerCase() === "in progress" &&
            ticket.assignedPersonnel?.toLowerCase() ===
              user?.name?.toLowerCase() &&
            ticket.acceptedDate &&
            ticket.acceptedTime && (
              <Tooltip content="Finish Ticket" color="success">
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={() => handleFinish(ticket)}
                >
                  Finish
                </Button>
              </Tooltip>
            )}

          {viewType === "personal" &&
            ticket.status === "Finished" &&
            ticket.finishedDate && (
              <Tooltip content="Approve Ticket" color="success">
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={() => handleApprove(ticket)}
                >
                  Approve
                </Button>
              </Tooltip>
            )}
        </div>
      );

    default:
      return <span>{cellValue as any}</span>;
  }
};
