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
import { SalesManagementColumns } from "@/helpers/db";
import { RenderCell } from "./render-cell";
import { EditTask } from "../operation/update";
import { useUserContext } from "@/components/layout/UserContext";
import { SalesManagement } from "@/helpers/db";

interface TableWrapperProps {
  tasks: SalesManagement[];
  loading: boolean;
  fullScreen: boolean;
}

export const SalesTableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SalesManagement | null>(
    null
  );
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
      ? SalesManagementColumns.filter((col) => col.uid !== "actions")
      : SalesManagementColumns;
  }, [fullScreen]);

  const handleOpenEdit = (task: SalesManagement) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: SalesManagement) => {
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

    const statusSorted = [...tasks].sort((a, b) => {
      const aPriority =
        statusPriority[a.status as keyof typeof statusPriority] ?? 99;
      const bPriority =
        statusPriority[b.status as keyof typeof statusPriority] ?? 99;
      return aPriority - bPriority;
    });

    const finishedSorted = statusSorted
      .filter((task) => task.status === "Finished")
      .sort((a, b) => {
        const aDate = a.sirMJH ? new Date(a.sirMJH).getTime() : 0;
        const bDate = b.sirMJH ? new Date(b.sirMJH).getTime() : 0;
        return bDate - aDate;
      });

    const result = [
      ...statusSorted.filter((task) => task.status !== "Finished"),
      ...finishedSorted,
    ];

    return result;
  }, [tasks]);

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
                      dtTasks={item}
                      columnKey={col.uid as keyof SalesManagement | "actions"}
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
    </div>
  );
};
