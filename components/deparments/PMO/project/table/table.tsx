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
import { projectColumns } from "@/helpers/acumatica";
import { RenderCell } from "./render-cell";
import { useUserContext } from "@/components/layout/UserContext";
import { Projects } from "@/helpers/acumatica";

interface TableWrapperProps {
  tasks: Projects[];
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
  const [selectedTask, setSelectedTask] = useState<Projects | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "date", // default sort column
    direction: "descending",
  });
  const [isUserSorted, setIsUserSorted] = useState(false);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setIsUserSorted(true);
  };

  const rowsPerPage = 15;

  const filteredTasks = useMemo(() => {
    if (!user?.name) return [];

    return tasks.filter((task) => {
      const accessList =
        task.access?.split(",").map((name) => name.trim()) || [];

      const hasAccessByName = accessList.includes(user.name);
      const hasAccessByRole =
        user.designation?.includes("PMO TL") ||
        user.designation?.includes("DOCUMENT CONTROLLER");

      return hasAccessByName || hasAccessByRole;
    });
  }, [tasks, user]);

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? projectColumns.filter((col) => col.uid !== "actions")
      : projectColumns;
  }, [fullScreen]);

  const handleOpenEdit = (task: Projects) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(filteredTasks)) return [];

    const { column, direction } = sortDescriptor;
    if (!column) return filteredTasks;

    return [...filteredTasks].sort((a, b) => {
      const aValue = a[column as keyof Projects];
      const bValue = b[column as keyof Projects];

      if (column === "date") {
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
  }, [filteredTasks, sortDescriptor]);

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
                      Tasks={item}
                      columnKey={col.uid as keyof Projects | "actions"}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
