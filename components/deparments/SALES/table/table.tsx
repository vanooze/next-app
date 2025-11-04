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
import { SalesManagementColumns, SalesManagement } from "@/helpers/db";
import { RenderCell } from "./render-cell";
import { EditTask } from "../operation/update";
import { useUserContext } from "@/components/layout/UserContext";

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
    column: "status",
    direction: "ascending",
  });
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

  const rowsPerPage = 15;

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? SalesManagementColumns.filter((col) => col.uid !== "actions")
      : SalesManagementColumns;
  }, [fullScreen]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

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

  // ✅ Define priority for sorting statuses
  const statusPriority: Record<string, number> = {
    "On Going": 0,
    "On Hold": 1,
    Awarded: 2,
    "Lost Account": 3,
  };

  // ✅ Filter by user and status
  const filteredTasks = useMemo(() => {
    if (!user?.name) return [];

    const seeAllUsers = [
      "HAROLD DAVID",
      "LANI KIMBER CAMPOS",
      "MARIA LEA BERMUDEZ",
      "MARVIN JIMENEZ",
      "DESIREE SALIVIO",
    ];

    const nameMappings: Record<string, string> = {
      "Jhoannah Rose-Mil L. Sicat ": "JHOAN",
      "Genevel Garcia": "GEN",
      "KENNETH BAUTISTA": "KENNETH",
      "Ida Ma. Catherine C. Madamba": "IDA",
    };

    const userName = user.name.toLowerCase().trim();
    const mappedName = nameMappings[userName] || userName;

    const userFiltered = seeAllUsers.some((u) => u.toLowerCase() === userName)
      ? tasks
      : tasks.filter((task) => {
          const sales = task.salesPersonnel?.toLowerCase().trim() || "";
          return sales.includes(mappedName) || mappedName.includes(sales);
        });

    if (filterStatuses.length > 0) {
      return userFiltered.filter((t) => filterStatuses.includes(t.status));
    }

    return userFiltered;
  }, [tasks, user, filterStatuses]);

  // ✅ Sort tasks by priority and date
  const sortedTasks = useMemo(() => {
    if (!filteredTasks.length) return [];

    const sorted = [...filteredTasks].sort((a, b) => {
      const aPriority = statusPriority[a.status] ?? 999;
      const bPriority = statusPriority[b.status] ?? 999;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aDate = a.sirMJH ? new Date(a.sirMJH).getTime() : 0;
      const bDate = b.sirMJH ? new Date(b.sirMJH).getTime() : 0;
      return bDate - aDate;
    });

    return sorted;
  }, [filteredTasks]);

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
      {/* ✅ Status Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-foreground-500">
          Filter by Status:
        </span>
        <CheckboxGroup
          orientation="horizontal"
          color="secondary"
          value={filterStatuses}
          onChange={(value) => setFilterStatuses(value as string[])}
        >
          <Checkbox value="On Going">On Going</Checkbox>
          <Checkbox value="On Hold">On Hold</Checkbox>
          <Checkbox value="Awarded">Awarded</Checkbox>
          <Checkbox value="Lost Account">Lost Account</Checkbox>
        </CheckboxGroup>
      </div>

      {/* ✅ Table Section */}
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
          aria-label="sales management table"
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
