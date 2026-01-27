"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
  Pagination,
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";
import type { SortDescriptor } from "@react-types/shared";
import React, { useMemo, useState, useEffect } from "react";
import { projectColumns } from "@/helpers/acumatica";
import { RenderCell } from "./render-cell";
import { useUserContext } from "@/components/layout/UserContext";
import { Projects } from "@/helpers/acumatica";
import { EditProject } from "../action/editProject";

interface TableWrapperProps {
  tasks: Projects[];
  loading: boolean;
  fullScreen: boolean;
  searchValue?: string; // ✅ disables default filter when used
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
  searchValue = "",
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projects | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "startDate",
    direction: "descending",
  });

  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [showOnlyPlanning, setShowOnlyPlanning] = useState(true);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  const rowsPerPage = 15;

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const hasInPlanning = tasks.some((t) => t.status === "In Planning");
    const hasActive = tasks.some((t) => t.status === "Active");

    if (hasInPlanning) {
      setShowOnlyPlanning(true);
      setFilterStatuses([]);
    } else if (hasActive) {
      setShowOnlyPlanning(false);
      setFilterStatuses(["Active"]);
    } else {
      setShowOnlyPlanning(false);
      setShowAllStatuses(true);
    }
  }, [tasks]);

  // ✅ Step 1: Filter by user access
  const accessFiltered = useMemo(() => {
    if (!user?.name) return [];

    return tasks.filter((task) => {
      const accessList = task.access?.split(",").map((n) => n.trim()) || [];

      const hasAccessByName = accessList.includes(user.name);
      const hasAccessByRole =
        user.designation?.includes("PMO TL") ||
        user.designation?.includes("DOCUMENT CONTROLLER") ||
        user.designation?.includes("TECHNICAL ASSISTANT MANAGER") ||
        user.designation?.includes("IT SUPERVISOR") ||
        user.designation?.includes("TMIG SUPERVISOR") ||
        user.designation?.includes("TECHNICAL SUPERVISOR") ||
        user.designation?.includes("TECHNICAL ADMIN CONSULTANT") ||
        user.designation?.includes("DESIGN SUPERVISOR") ||
        user.designation?.includes("TECHNICAL MANAGER") ||
        user.department?.includes("TMIG") ||
        user.department?.includes("DESIGN") ||
        user.department?.includes("PMO") ||
        user?.name === "DESIREE SALIVIO" ||
        user.restriction === "9";

      return hasAccessByName || hasAccessByRole;
    });
  }, [tasks, user]);

  // ✅ Step 2: Apply filter + search logic
  const statusFiltered = useMemo(() => {
    // 🧠 Search bypasses filters
    if (searchValue.trim()) {
      return accessFiltered.filter((t) =>
        Object.values(t).some(
          (val) =>
            typeof val === "string" &&
            val.toLowerCase().includes(searchValue.toLowerCase()),
        ),
      );
    }

    let result = [...accessFiltered];

    if (showAllStatuses) return result;

    if (filterStatuses.length > 0) {
      result = result.filter((t) => filterStatuses.includes(t.status ?? ""));
    } else if (showOnlyPlanning) {
      result = result.filter((t) => t.status === "In Planning");
    }

    return result;
  }, [
    accessFiltered,
    filterStatuses,
    showAllStatuses,
    showOnlyPlanning,
    searchValue,
  ]);

  // ✅ Step 3: Sorting
  const statusPriority = useMemo(
    () => ({
      "In Planning": 0,
      Active: 1,
      "For Payment": 2,
      Completed: 3,
      "On Hold": 4,
      "Pending Approval": 5,
      "Pending Upgrade": 6,
      "Is Empty": 7,
      Canceled: 8,
      Suspended: 9,
    }),
    [],
  );

  const sortedTasks = useMemo(() => {
    const sorted = [...statusFiltered].sort((a, b) => {
      const aPriority =
        statusPriority[a.status as keyof typeof statusPriority] ?? 99;
      const bPriority =
        statusPriority[b.status as keyof typeof statusPriority] ?? 99;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bDate - aDate;
    });
    return sorted;
  }, [statusFiltered, statusPriority]);

  // ✅ Step 4: Pagination
  const pages = Math.ceil(sortedTasks.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedTasks.slice(start, end);
  }, [page, sortedTasks]);

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? projectColumns.filter((col) => col.uid !== "actions")
      : projectColumns;
  }, [fullScreen]);

  const handleEditProject = (project: Projects) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedProject(null);
  };

  return (
    <div
      className={`w-full ${
        fullScreen ? "overflow-auto h-full" : "w-full flex flex-col gap-4"
      }`}
    >
      {/* ✅ Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-2">
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
            setShowOnlyPlanning(newValues.length === 0);
          }}
        >
          <Checkbox value="Active">Active</Checkbox>
          <Checkbox value="For Payment">For Payment</Checkbox>
          <Checkbox value="Completed">Completed</Checkbox>
        </CheckboxGroup>

        <Checkbox
          isSelected={showAllStatuses}
          onChange={(e) => {
            const checked = e.target.checked;
            setShowAllStatuses(checked);
            if (checked) {
              setFilterStatuses([]);
              setShowOnlyPlanning(false);
            } else {
              setShowOnlyPlanning(true);
            }
          }}
        >
          Show All Statuses
        </Checkbox>
      </div>

      {/* ✅ Table */}
      {loading ? (
        <div className="w-full flex justify-center items-center min-h-[200px]">
          <Spinner
            classNames={{ label: "text-foreground mt-4" }}
            size="lg"
            variant="wave"
            label="Loading projects..."
          />
        </div>
      ) : (
        <Table
          isStriped
          aria-label="project table"
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

          <TableBody emptyContent="No rows to display." items={items}>
            {(item: Projects) => (
              <TableRow key={item.id}>
                {visibleColumns.map((col) => (
                  <TableCell key={col.uid}>
                    <RenderCell
                      Tasks={item}
                      columnKey={col.uid as keyof Projects | "actions"}
                      handleEditProject={handleEditProject}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <EditProject
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        project={selectedProject}
      />
    </div>
  );
};
