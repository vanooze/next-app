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
import { POMonitoringColumns } from "../../../../../helpers/db";
import { RenderCell } from "./render-cell";
import { EditTask } from "../operation/edit-task";
import { useUserContext } from "@/components/layout/UserContext";
import { POMonitoring } from "../../../../../helpers/db";
import { DeleteTask } from "../operation/delete-task";

interface TableWrapperProps {
  tasks: POMonitoring[];
  loading: boolean;
  fullScreen: boolean;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<POMonitoring | null>(null);
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
      ? POMonitoringColumns.filter((col) => col.uid !== "actions")
      : POMonitoringColumns;
  }, [fullScreen]);

  const handleOpenEdit = (task: POMonitoring) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: POMonitoring) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    return [...tasks].sort((a, b) => {
      const aDate = a.poDate ? new Date(a.poDate).getTime() : 0;
      const bDate = b.poDate ? new Date(b.poDate).getTime() : 0;
      return bDate - aDate;
    });
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
                      POMonitoring={item}
                      columnKey={col.uid as keyof POMonitoring | "actions"}
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
