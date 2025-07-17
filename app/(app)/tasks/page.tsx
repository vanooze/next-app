"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { Tasks as DTTasks } from "@/components/deparments/DT/tasks/task";
import { Tasks as PMOTasks } from "@/components/deparments/PMO/tasks/tasks";
import { Spinner } from "@heroui/react";

const TaskPage = () => {
  const { user } = useUserContext();

  if (!user) return <Spinner />;

  if (user.department?.includes("DT")) {
    return <DTTasks />;
  }

  if (user.department?.includes("PMO")) {
    return <PMOTasks />;
  }

  return (
    <div className="text-center py-10 text-red-600 font-medium">
      Unauthorized or Unknown Department
    </div>
  );
};

export default TaskPage;
