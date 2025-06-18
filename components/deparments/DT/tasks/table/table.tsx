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
import { dtColumns } from "../../../../../helpers/task";
import { RenderCell } from "./render-cell";
import { EditTask } from "../edit-task";
import { useUserContext } from "@/components/layout/UserContext";
import { dtTask } from "../../../../../helpers/task";
import { DeleteTask } from "../delete-task";

interface TableWrapperProps {
  tasks: dtTask[];
  loading: boolean;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<dtTask | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status", // default sort column
    direction: "ascending",
  });

  const rowsPerPage = 10;

  const handleOpenEdit = (task: dtTask) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: dtTask) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const statusPriority = {
    Rush: 0,
    Overdue: 1,
    Pending: 2,
    Finished: 3,
  };

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    const { column, direction } = sortDescriptor;

    return [...tasks].sort((a, b) => {
      // 1. Custom sort by status always first
      const aStatus =
        statusPriority[a.status as keyof typeof statusPriority] ?? 99;
      const bStatus =
        statusPriority[b.status as keyof typeof statusPriority] ?? 99;

      if (aStatus !== bStatus) {
        return direction === "ascending"
          ? aStatus - bStatus
          : bStatus - aStatus;
      }

      // 2. Then sort by dateReceived (or any other fallback column)
      const aDate = a.dateReceived ? new Date(a.dateReceived).getTime() : 0;
      const bDate = b.dateReceived ? new Date(b.dateReceived).getTime() : 0;

      return direction === "descending" ? aDate - bDate : bDate - aDate;
    });
  }, [tasks, sortDescriptor]);

  const pages = Math.ceil(sortedTasks.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedTasks.slice(start, end);
  }, [page, sortedTasks]);
  return (
    <div className="w-full flex flex-col gap-4">
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
          onSortChange={setSortDescriptor}
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
          <TableHeader columns={dtColumns}>
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
                {(columnKey) => (
                  <TableCell>
                    <RenderCell
                      dtTasks={item}
                      columnKey={columnKey as keyof dtTask | "actions"}
                      handleEditTask={handleOpenEdit}
                      handleDeleteTask={handleOpenDelete}
                    />
                  </TableCell>
                )}
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
