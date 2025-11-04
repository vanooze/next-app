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
import React, { useMemo, useState } from "react";
import { projectColumns } from "@/helpers/acumatica";
import { RenderCell } from "./render-cell";
import { useUserContext } from "@/components/layout/UserContext";
import { Projects } from "@/helpers/acumatica";
import { EditProject } from "../action/editProject";

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
  const [selectedProject, setSelectedProject] = useState<Projects | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "startDate",
    direction: "descending",
  });

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  const rowsPerPage = 15;

  // ✅ Filter tasks by access (same as your original)
  const filteredTasks = useMemo(() => {
    if (!user?.name) return [];
    return tasks.filter((task) => {
      const accessList =
        task.access?.split(",").map((name) => name.trim()) || [];

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
        user?.name === "Kaye Kimberly L. Manuel" ||
        user?.name === "DESIREE SALIVIO" ||
        user.restriction === "9";

      return hasAccessByName || hasAccessByRole;
    });
  }, [tasks, user]);

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? projectColumns.filter((col) => col.uid !== "actions")
      : projectColumns;
  }, [fullScreen]);

  // ✅ Custom Sorting Logic
  const statusPriority = {
    "In Planning": 0,
    Active: 1,
    "On Hold": 2,
    "Pending Approval": 3,
    "Pending Upgrade": 4,
    "Is Empty": 5,
    Canceled: 6,
    Suspended: 7,
    Completed: 8,
  };

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(filteredTasks)) return [];

    // Step 1: Sort by startDate (primary)
    const dateSorted = [...filteredTasks].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bDate - aDate; // descending
    });

    // Step 2: Sort by custom status order within same date group
    const fullySorted = dateSorted.sort((a, b) => {
      const aPriority =
        statusPriority[a.status as keyof typeof statusPriority] ?? 99;
      const bPriority =
        statusPriority[b.status as keyof typeof statusPriority] ?? 99;
      return aPriority - bPriority;
    });

    return fullySorted;
  }, [filteredTasks]);

  const pages = Math.ceil(sortedTasks.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedTasks.slice(start, end);
  }, [page, sortedTasks]);

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
            {(item) => (
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
