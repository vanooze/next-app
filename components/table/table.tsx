import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { dtColumns } from "./data";
import { RenderCell } from "./render-cell";
import { EditTask } from "../tasks/edit-task";
import { dtTask } from "./task";
import { DeleteTask } from "../tasks/delete-task";

export const TableWrapper = () => {
  const [tasks, setTasks] = useState<dtTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<dtTask | null>(null);

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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/DT/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.log("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
        <Table aria-label="task table with custom cells">
          <TableHeader columns={dtColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                hideHeader={column.uid === "actions"}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={tasks}>
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
