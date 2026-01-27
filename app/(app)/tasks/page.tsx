"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { Tasks as DTTasks } from "@/components/deparments/DT/tasks/task";
import { Tasks as PMOTasks } from "@/components/deparments/PMO/tasks/tasks";
import { Spinner } from "@heroui/react";
import { ITTasks } from "@/components/deparments/IT/tasks/task";

const TaskPage = () => {
  const { user } = useUserContext();

  if (!user) return <Spinner />;

  if (
    user.designation?.includes("DESIGN") ||
    user.designation_status?.includes("TECHNICAL MANAGER") ||
    user.designation_status?.includes("PRESIDENT") ||
    user.designation_status?.includes("VICE PRESIDENT") ||
    user?.designation_status?.includes("IT SUPERVISOR") ||
    user?.position?.includes("SALES") ||
    user?.name === "DESIREE SALIVIO"
  ) {
    return <DTTasks />;
  }

  if (user.department?.includes("PMO")) {
    return <PMOTasks />;
  }
  if (
    user?.designation.includes("PROGRAMMER") ||
    user?.designation.includes("MMC") ||
    user?.designation === "TECHNICAL"
  ) {
    return <ITTasks />;
  }
};

export default TaskPage;
