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
import { dtColumns, dtTask } from "../../../../../helpers/db";
import { RenderCell } from "./render-cell";
import { EditTask } from "../operation/edit-task";
import { DeleteTask } from "../operation/delete-task";
import { useUserContext } from "@/components/layout/UserContext";
import { UploadProfitingModal } from "../operation/upload-file";
import { GenerateReport } from "../generateReport";

interface TableWrapperProps {
  tasks: dtTask[];
  loading: boolean;
  fullScreen: boolean;
  searchValue?: string; // ✅ Add this prop
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
  searchValue = "", // ✅ default empty string
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<dtTask | null>(null);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });

  const rowsPerPage = 15;

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? dtColumns.filter((col) => col.uid !== "actions")
      : dtColumns;
  }, [fullScreen]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  const handleOpenUpload = (task: dtTask) => {
    setSelectedTask(task);
    setIsUploadOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setSelectedTask(null);
  };

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

  const statusPriority: Record<string, number> = {
    Priority: 0,
    OnHold: 1,
    Overdue: 2,
    Pending: 3,
    Finished: 4,
  };

  // ✅ Filter tasks by user and status (skip filtering when search is active)
  const filteredTasks = useMemo(() => {
    if (!user?.name) return [];

    const seeAllUsers = [
      "HAROLD DAVID",
      "LANI KIMBER CAMPOS",
      "MARIA LEA BERMUDEZ",
      "MARVIN JIMENEZ",
      "DESIREE SALIVIO",
      "Jan Ronnell V. Camero",
      "Marcial A. Gigante III",
      "Jilian Mark H. Ardinel",
      "John Eden Ross V. Cola",
      "BILLY JOEL TOPACIO",
      "MARVINNE ESTACIO",
    ];

    const nameMappings: Record<string, string> = {
      "Jhoannah Rose-Mil L. Sicat ": "JHOAN",
      "Genevel Garcia": "GEN",
      "KENNETH BAUTISTA": "KENNETH",
      "Ida Ma. Catherine C. Madamba": "IDA",
    };

    const userName = user.name.toLowerCase().trim();
    const mappedName = nameMappings[user.name] || user.name;

    const userFiltered = seeAllUsers.some((u) => u.toLowerCase() === userName)
      ? tasks
      : tasks.filter((task) => {
          const personnel = task.salesPersonnel?.toLowerCase().trim() || "";
          return (
            personnel.includes(mappedName.toLowerCase()) ||
            mappedName.toLowerCase().includes(personnel)
          );
        });

    let result = userFiltered;

    // ✅ If searching → show everything (ignore status filters)
    if (searchValue?.trim()) {
      return result;
    }

    // ✅ Apply filters only when not searching
    if (showAllStatuses) {
      result = result;
    } else if (filterStatuses.length > 0) {
      result = result.filter((t) => filterStatuses.includes(t.status));
    } else {
      result = result.filter(
        (t) => t.status === "Pending" || t.status === "Overdue"
      );
    }

    return result;
  }, [tasks, user, showAllStatuses, filterStatuses, searchValue]);

  const sortedTasks = useMemo(() => {
    if (!filteredTasks.length) return [];
    return [...filteredTasks].sort((a, b) => {
      const aPriority = statusPriority[a.status] ?? 999;
      const bPriority = statusPriority[b.status] ?? 999;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aDate = a.sirMJH ? new Date(a.sirMJH).getTime() : 0;
      const bDate = b.sirMJH ? new Date(b.sirMJH).getTime() : 0;
      return bDate - aDate;
    });
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
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* Left side: filter checkboxes */}
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
            }}
          >
            <Checkbox value="Priority">Priority</Checkbox>
            <Checkbox value="OnHold">On Hold</Checkbox>
            <Checkbox value="Finished">Finished</Checkbox>
          </CheckboxGroup>

          {/* Show All toggle */}
          <Checkbox
            isSelected={showAllStatuses}
            onChange={(e) => {
              const checked = e.target.checked;
              setShowAllStatuses(checked);
              if (checked) setFilterStatuses([]); // clear filters
            }}
          >
            Show All Statuses
          </Checkbox>
        </div>

        {/* Right side: Generate Report button */}
        <div>
          <GenerateReport />
        </div>
      </div>

      {/* ✅ Table */}
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
          aria-label="task table with user/status filters"
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
                      columnKey={col.uid as keyof dtTask | "actions"}
                      handleUploadTask={handleOpenUpload}
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

      {/* ✅ Operation Modals */}

      <UploadProfitingModal
        isOpen={isUploadOpen}
        onClose={handleCloseUpload}
        taskId={selectedTask?.id ?? 0}
      />

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
