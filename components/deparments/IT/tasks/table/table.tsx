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
import { ItColumns, ItTasks } from "../../../../../helpers/db";
import { RenderCell } from "./render-cell";
import { EditTask } from "../operation/edit-task";
import { DeleteTask } from "../operation/delete-task";
import { useUserContext } from "@/components/layout/UserContext";
import { GenerateReport } from "../generateReport";
import { UploadItReporting } from "../operation/upload-file";
import {
  IT_SEE_ALL_USERS_DESIGNATION,
  IT_NAME_MAPPINGS,
} from "@/helpers/restriction";

interface TableWrapperProps {
  tasks: ItTasks[];
  loading: boolean;
  fullScreen: boolean;
  searchValue?: string;
  startDate?: string;
  endDate?: string;
}

export const ITTableWrapper: React.FC<TableWrapperProps> = ({
  tasks,
  loading,
  fullScreen,
  searchValue = "",
  startDate,
  endDate,
}) => {
  const [page, setPage] = useState(1);
  const { user } = useUserContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ItTasks | null>(null);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });

  const rowsPerPage = 15;

  const visibleColumns = useMemo(() => {
    return fullScreen
      ? ItColumns.filter((col) => col.uid !== "actions")
      : ItColumns;
  }, [fullScreen]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  const handleOpenUpload = (task: ItTasks) => {
    setSelectedTask(task);
    setIsUploadOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setSelectedTask(null);
  };

  const handleOpenEdit = (task: ItTasks) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: ItTasks) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const statusPriority: Record<string, number> = useMemo(
    () => ({
      Priority: 1,
      OnHold: 2,
      Overdue: 3,
      Pending: 4,
      Finished: 5,
    }),
    [],
  );

  const filteredTasks = useMemo(() => {
    if (!user?.name) return [];

    const seeAllUsers =
      user?.designation &&
      IT_SEE_ALL_USERS_DESIGNATION.some((role) =>
        user.designation.toUpperCase().includes(role),
      );
    /*
  const userPersonnelFilter: Record<string, string[]> = {
    "RAMON CHRISTOPHER CO": ["ivan", "hassan", "rhon", "charles joseph"],
    "ERWIN DEL ROSARIO": ["aaron", "ashley", "eliezer"],
  };
  */

    const selfPersonnelMap = IT_NAME_MAPPINGS[user.name] || user.name;

    const userNameLower = user.name.toLowerCase();
    const userNameUpper = user.name.toUpperCase();

    let result = tasks;

    // 🔐 Apply visibility rules
    if (!seeAllUsers) {
      /*
    const allowedPersonnel = userPersonnelFilter[user.name];

    if (allowedPersonnel) {
      result = tasks.filter((t) =>
        allowedPersonnel.some((p) =>
          t.personnel?.toLowerCase().includes(p),
        ),
      );
    } else {
      const selfKey = selfPersonnelMap[userNameUpper] || userNameLower;
      result = tasks.filter((t) =>
        t.personnel?.toLowerCase().includes(selfKey),
      );
    }
    */
      // 👤 Default: user only sees their own tasks
      const selfKey = selfPersonnelMap || userNameLower;

      result = tasks.filter((t) =>
        t.personnel?.toLowerCase().includes(selfKey),
      );
    }

    // 📅 Date filter
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      result = result.filter((t) => {
        const taskDate = t.dateReceived
          ? new Date(t.dateReceived).getTime()
          : 0;
        return taskDate >= start && taskDate <= end;
      });
    }

    // 🔍 Search filter
    if (searchValue?.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (t) =>
          t.clientName?.toLowerCase().includes(query) ||
          t.projectDesc?.toLowerCase().includes(query),
      );
    }

    // 🚦 Status filter
    if (!showAllStatuses && filterStatuses.length > 0) {
      result = result.filter((t) => filterStatuses.includes(t.status));
    } else if (!showAllStatuses && filterStatuses.length === 0) {
      result = result.filter((t) =>
        ["Pending", "Overdue", "Declined"].includes(t.status),
      );
    }

    return result;
  }, [
    tasks,
    user,
    searchValue,
    filterStatuses,
    showAllStatuses,
    startDate,
    endDate,
  ]);

  const canGenerate =
    user?.designation.includes("PROGRAMMER") ||
    user?.designation.includes("MMC") ||
    user?.designation.includes("IT TECHNICAL");

  const sortedTasks = useMemo(() => {
    if (!filteredTasks.length) return [];
    return [...filteredTasks].sort((a, b) => {
      const aPriority = statusPriority[a.status] ?? 999;
      const bPriority = statusPriority[b.status] ?? 999;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aDate = a.dateReceived ? new Date(a.dateReceived).getTime() : 0;
      const bDate = b.dateReceived ? new Date(b.dateReceived).getTime() : 0;
      return bDate - aDate;
    });
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
        {/* <div>{canGenerate && <GenerateReport />}</div> */}
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
                allowsSorting={false}
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
                      ItTasks={item}
                      columnKey={col.uid as keyof ItTasks | "actions"}
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

      <UploadItReporting
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
