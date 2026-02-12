"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { Tasks as DTTasks } from "@/components/deparments/DT/tasks/task";
import { Tasks as PMOTasks } from "@/components/deparments/PMO/tasks/tasks";
import { Spinner } from "@heroui/react";
import { ITTasks } from "@/components/deparments/IT/tasks/task";
import {
  DESIGN_TASKS_ACCESS_DESIGNATION,
  ITDT_TASKS_ACCESS_DESIGNATION,
  PMO_TASKS_ACCESS_DESIGNATION,
} from "@/helpers/restriction";

const TaskPage = () => {
  const { user } = useUserContext();

  if (!user) return <Spinner />;

  if (
    user.designation &&
    DESIGN_TASKS_ACCESS_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    )
  ) {
    return <DTTasks />;
  }

  if (
    user.designation &&
    PMO_TASKS_ACCESS_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    )
  ) {
    return <PMOTasks />;
  }
  if (
    user.designation &&
    ITDT_TASKS_ACCESS_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    )
  ) {
    return <ITTasks />;
  }
};

export default TaskPage;
