"use client";

import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
  Pagination,
} from "@heroui/react";
import type { SortDescriptor } from "@react-types/shared";
import React, { useEffect, useState, useMemo } from "react";
import { RepairColumns } from "@/helpers/db";
import { RenderCell } from "./render-cell";
import { EditTask } from "../operation/edit-tasks";
import { useUserContext } from "@/components/layout/UserContext";
import { RepairTasks } from "@/helpers/db";
import { DeleteTask } from "../operation/delete-tasks";

interface TableWrapperProps {
  tasks: RepairTasks[];
  loading: boolean;
  fullScreen: boolean;
}

export const RepairTableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RepairTasks | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status", // default sort column
    direction: "ascending",
  });
  const [isUserSorted, setIsUserSorted] = useState(false);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setIsUserSorted(true);
  };

  const rowsPerPage = 15;

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? RepairColumns.filter((col) => col.uid !== "actions")
      : RepairColumns;
  }, [fullScreen]);

  const handleOpenEdit = (task: RepairTasks) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: RepairTasks) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const statusPriority = useMemo(
    () => ({
      Priority: 0,
      OnHold: 1,
      Overdue: 2,
      Pending: 3,
      Finished: 4,
    }),
    [],
  );

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    const { column, direction } = sortDescriptor;
    if (!column) return tasks;

    return [...tasks].sort((a, b) => {
      const aValue = a[column as keyof RepairTasks];
      const bValue = b[column as keyof RepairTasks];

      // Sort by status using custom priority
      if (column === "status") {
        const aPriority =
          statusPriority[aValue as keyof typeof statusPriority] ?? 99;
        const bPriority =
          statusPriority[bValue as keyof typeof statusPriority] ?? 99;

        return direction === "ascending"
          ? aPriority - bPriority
          : bPriority - aPriority;
      }

      if (column === "dateReceived") {
        const aDate = aValue ? new Date(aValue as string).getTime() : null;
        const bDate = bValue ? new Date(bValue as string).getTime() : null;

        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return direction === "ascending" ? -1 : 1;
        if (bDate === null) return direction === "ascending" ? 1 : -1;

        return direction === "ascending" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [tasks, sortDescriptor, statusPriority]);

  const pages = Math.ceil(sortedTasks.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedTasks.slice(start, end);
  }, [page, sortedTasks]);

  return (
    <div
      className={`w-full ${
        fullScreen ? "overflow-auto h-full" : "w-full flex flex-col gap-4"
      }`}
    >
      {loading ? (
        <div className="w-full flex justify-center items-center min-h-[200px]">
          <Spinner
            classNames={{ label: "text-foreground mt-4" }}
            size="lg"
            variant="wave"
            label="Loading tasks..."
          />
        </div>
      ) : (
        <Table
          isStriped
          aria-label="task table with custom cells"
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          classNames={{
            base: "min-w-[800px] w-full",
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
                onChange={(page) => setPage(page)}
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
                allowsSorting
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"No rows to display."} items={items}>
            {(item) => (
              <TableRow key={item.id}>
                {visibleColumns.map((col) => (
                  <TableCell key={col.uid}>
                    <RenderCell
                      RepairTasks={item}
                      columnKey={col.uid as keyof RepairTasks | "actions"}
                      handleEditTask={handleOpenEdit}
                      handleDeleteTask={handleOpenDelete}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <EditTask
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        task={selectedTask}
      />
      <DeleteTask
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        taskId={selectedTask?.id ?? 0}
      />
    </div>
  );
};
