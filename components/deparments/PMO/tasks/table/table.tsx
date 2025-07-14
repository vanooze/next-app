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
import { PMOTasksColumn } from "../../../../../helpers/db";
import { RenderCell } from "@/components/deparments/PMO/tasks/table/render-cell";
import { EditTask } from "@/components/deparments/PMO/tasks/action/edit-task";
import { useUserContext } from "@/components/layout/UserContext";
import { PMOTasks } from "../../../../../helpers/db";
import { DeleteTask } from "@/components/deparments/PMO/tasks/action/delete-task";

interface TableWrapperProps {
  tasks: PMOTasks[];
  loading: boolean;
  fullScreen: boolean;
}

export const PMOTableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PMOTasks | null>(null);
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
      ? PMOTasksColumn.filter((col) => col.uid !== "actions")
      : PMOTasksColumn;
  }, [fullScreen]);

  const handleOpenEdit = (task: PMOTasks) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: PMOTasks) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const statusPriority = {
    Priority: 0,
    OnHold: 1,
    Overdue: 2,
    Pending: 3,
    Finished: 4,
  };

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    const { column, direction } = sortDescriptor;
    if (!column) return tasks;

    return [...tasks].sort((a, b) => {
      const aValue = a[column as keyof PMOTasks];
      const bValue = b[column as keyof PMOTasks];

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
  }, [tasks, sortDescriptor]);

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
                      PMOTasks={item}
                      columnKey={col.uid as keyof PMOTasks | "actions"}
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
