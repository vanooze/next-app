"use client";

import {
  CheckboxGroup,
  Checkbox,
  Spinner,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import type { SortDescriptor } from "@react-types/shared";
import React, { useState, useMemo } from "react";
import { RenderTicketCell } from "./render-cell";
import { Ticketing } from "@/helpers/db";
import { GetTicketModal } from "../operation/get-ticket";
import { FinishTicketModal } from "../operation/finish-ticket";
import { ApproveTicketModal } from "../operation/approve-ticket";

interface TableWrapperProps {
  tickets: Ticketing[];
  loading: boolean;
  columns: { name: string; uid: string }[];
  fullScreen: boolean;
  searchValue?: string;
  viewType?: "personal" | "pending";
}

export const TicketTableWrapper: React.FC<TableWrapperProps> = ({
  tickets,
  loading,
  columns,
  fullScreen,
  searchValue = "",
  viewType,
}) => {
  const [page, setPage] = useState(1);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticketing | null>(null);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [isGetOpen, setIsGetOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "requestedDate",
    direction: "descending",
  });

  const rowsPerPage = 10;

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? columns.filter((col) => col.uid !== "actions")
      : columns;
  }, [columns, fullScreen]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  // ✅ Handlers (replace later with modals).

  const handleGet = (ticket: Ticketing) => {
    setSelectedTicket(ticket);
    setIsGetOpen(true);
  };

  const handleApprove = (ticket: Ticketing) => {
    setSelectedTicket(ticket);
    setIsApproveOpen(true);
  };

  const handleFinish = async (ticket: Ticketing) => {
    setSelectedTicket(ticket);
    setIsFinishOpen(true);
  };

  const handleOpenDecline = (ticket: Ticketing) => {
    setSelectedTicket(ticket);
    setIsDeclineOpen(true);
  };

  const statusOrder: Record<string, number> = {
    Pending: 0,
    "In Progress": 1,
    Finished: 2,
    Approved: 3,
  };

  // ---- Filters ----
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // 🔍 Search
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.requestedBy?.toLowerCase().includes(query) ||
          t.assignedPersonnel?.toLowerCase().includes(query),
      );
    }

    // 🚦 Status filter
    if (!showAllStatuses) {
      if (filterStatuses.length > 0) {
        result = result.filter((t) => filterStatuses.includes(t.status));
      } else {
        result = result.filter((t) =>
          ["Pending", "In Progress", "Finished"].includes(t.status),
        );
      }
    }

    result.sort((a, b) => {
      return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    });

    return result;
  }, [tickets, searchValue, filterStatuses, showAllStatuses]);

  // ---- Sorting ----
  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      const aDate = a.requestedDate ? new Date(a.requestedDate).getTime() : 0;
      const bDate = b.requestedDate ? new Date(b.requestedDate).getTime() : 0;

      return bDate - aDate;
    });
  }, [filteredTickets]);

  // ---- Pagination ----
  const pages = Math.ceil(sortedTickets.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedTickets.slice(start, start + rowsPerPage);
  }, [page, sortedTickets]);

  return (
    <div
      className={`w-full ${
        fullScreen ? "overflow-auto h-full" : "flex flex-col gap-4"
      }`}
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-foreground-500">Filter by Status:</span>

        <CheckboxGroup
          orientation="horizontal"
          color="secondary"
          value={filterStatuses}
          onChange={(val) => {
            setFilterStatuses(val as string[]);
            setShowAllStatuses(false);
          }}
        >
          <Checkbox value="Pending">Pending</Checkbox>
          <Checkbox value="In Progress">In Progress</Checkbox>
          <Checkbox value="Finished">Finished</Checkbox>
          <Checkbox value="Approved">Approved</Checkbox>
        </CheckboxGroup>

        <Checkbox
          isSelected={showAllStatuses}
          onChange={(e) => {
            const checked = e.target.checked;
            setShowAllStatuses(checked);
            if (checked) setFilterStatuses([]);
          }}
        >
          Show All
        </Checkbox>
      </div>

      {/* Table */}
      {loading ? (
        <div className="w-full flex justify-center items-center min-h-[200px]">
          <Spinner size="lg" label="Loading tickets..." />
        </div>
      ) : (
        <Table
          isStriped
          aria-label="ticket table"
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          classNames={{
            base: "min-w-[900px] w-full",
            table: fullScreen ? "h-[calc(100vh-10rem)]" : "",
          }}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(p) => setPage(p)}
              />
            </div>
          }
        >
          <TableHeader columns={visibleColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                hideHeader={column.uid === "actions"}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody emptyContent={"No tickets found."} items={items}>
            {(item) => (
              <TableRow key={item.id}>
                {visibleColumns.map((col) => (
                  <TableCell key={col.uid}>
                    <RenderTicketCell
                      ticket={item}
                      columnKey={col.uid as any}
                      handleGet={handleGet}
                      handleApprove={handleApprove}
                      handleFinish={handleFinish}
                      viewType={viewType}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <FinishTicketModal
        ticket={selectedTicket}
        isOpen={isFinishOpen}
        onClose={() => setIsFinishOpen(false)}
      />

      <GetTicketModal
        ticket={selectedTicket}
        isOpen={isGetOpen}
        onClose={() => setIsGetOpen(false)}
      />

      <ApproveTicketModal
        ticket={selectedTicket}
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onOpenDecline={handleOpenDecline}
      />
    </div>
  );
};
