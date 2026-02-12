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
import { DeleteTask } from "../operation/delete-task";
import {
  SALE_SEE_ALL_USERS_DESIGNATION,
  SALE_NAME_MAPPINGS,
  SALE_DAVAO_SEE_USERS_DESIGNATION,
} from "@/helpers/restriction";

interface TableWrapperProps {
  tasks: SalesManagement[];
  loading: boolean;
  fullScreen: boolean;
  searchValue?: string;
}

export const SalesTableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
  searchValue = "",
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SalesManagement | null>(
    null,
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });

  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [showOnlyOngoing, setShowOnlyOngoing] = useState(true);

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

  const statusPriority: Record<string, number> = useMemo(
    () => ({
      Declined: 0,
      "On Going": 1,
      "On Hold": 2,
      Awarded: 2,
      Accepted: 3,
      Submitted: 4,
      "Lost Account": 5,
    }),
    [],
  );

  const normalize = (v?: string) => v?.toLowerCase().trim() || "";

  const getMappedName = (name?: string, designation?: string) => {
    if (!name) return "";

    const branch = designation?.toUpperCase().includes("DAVAO")
      ? "DAVAO"
      : "MAIN";

    const branchMap =
      typeof SALE_NAME_MAPPINGS[branch] === "object"
        ? SALE_NAME_MAPPINGS[branch]
        : {};

    return normalize(branchMap[name] || name);
  };

  const isDavaoTask = (salesPersonnel?: string) => {
    const normalizedSales = normalize(salesPersonnel);

    const davaoMap =
      typeof SALE_NAME_MAPPINGS.DAVAO === "object"
        ? SALE_NAME_MAPPINGS.DAVAO
        : {};

    return Object.values(davaoMap).some((alias) =>
      normalizedSales.includes(alias.toLowerCase()),
    );
  };

  // ✅ Filter by user + status
  const filteredTasks = useMemo(() => {
    if (!user?.name) return [];

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const designation = user.designation?.toUpperCase() || "";

    const mappedName = getMappedName(user.name, user.designation);

    /** 🌍 Global see-all */
    const canSeeAll = SALE_SEE_ALL_USERS_DESIGNATION.some((role) =>
      designation.includes(role),
    );

    /** 🏝 Davao manager see-all (branch-only) */
    const davaoCanSeeAll =
      !canSeeAll &&
      SALE_DAVAO_SEE_USERS_DESIGNATION.some((role) =>
        designation.includes(role),
      );

    /**
     * 1️⃣ Visibility filtering
     */
    let result = safeTasks.filter((task) => {
      const sales = normalize(task.salesPersonnel);

      // Global manager → everything
      if (canSeeAll) return true;

      // Davao manager → only davao tasks
      if (davaoCanSeeAll) return isDavaoTask(task.salesPersonnel);

      // Normal user → only own tasks
      return sales.includes(mappedName) || mappedName.includes(sales);
    });

    /**
     * 2️⃣ Search override (skip status filtering)
     */
    if (searchValue?.trim()) {
      return result;
    }

    /**
     * 3️⃣ Status filtering
     */
    if (!showAllStatuses) {
      if (filterStatuses.length > 0) {
        result = result.filter((t) => filterStatuses.includes(t.status));
      } else if (showOnlyOngoing) {
        result = result.filter((t) =>
          ["On Going", "Accepted", "Declined"].includes(t.status),
        );
      }
    }

    return result;
  }, [
    tasks,
    user,
    filterStatuses,
    showAllStatuses,
    showOnlyOngoing,
    searchValue,
  ]);

  // ✅ Sort
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
  }, [filteredTasks, statusPriority]);

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
      <div className="flex flex-wrap gap-3 items-center justify-between"></div>
      {/* ✅ Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-foreground-500">
          Filter by Status:
        </span>

        <CheckboxGroup
          orientation="horizontal"
          color="secondary"
          value={filterStatuses}
          onChange={(value) => {
            const newValues = value as string[];
            setFilterStatuses(newValues);
            setShowAllStatuses(false);
            setShowOnlyOngoing(newValues.length === 0);
          }}
        >
          <Checkbox value="Awarded">Awarded</Checkbox>
          <Checkbox value="Accepted">Accepted</Checkbox>
          <Checkbox value="Submitted">Submitted</Checkbox>
          <Checkbox value="On Hold">On Hold</Checkbox>
          <Checkbox value="Lost Account">Lost Account</Checkbox>
        </CheckboxGroup>

        <Checkbox
          isSelected={showAllStatuses}
          onChange={(e) => {
            const checked = e.target.checked;
            setShowAllStatuses(checked);
            if (checked) {
              setFilterStatuses([]); // clear filters
              setShowOnlyOngoing(false);
            } else {
              setShowOnlyOngoing(true);
            }
          }}
        >
          Show All Statuses
        </Checkbox>
      </div>

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
      <DeleteTask
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        taskId={selectedTask?.id ?? 0}
      />
    </div>
  );
};
