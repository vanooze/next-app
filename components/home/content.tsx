"use client";

import React from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../deparments/DT/tasks/table/table";
import { Card0 } from "./card";
import { Card1 } from "./card1";
import { Card2 } from "./card2";
import { Card3 } from "./card3";
import { Link } from "@heroui/react";
import NextLink from "next/link";
import { useUserContext } from "../layout/UserContext";
import { useTasksByDepartment } from "@/components/hooks/useTasksByDepartment";
import { usePMOTasks } from "@/components/hooks/usePmoTasks";
import { PMOTableWrapper } from "@/components/deparments/PMO/tasks/table/table";
import { PMOTasks, dtTask } from "@/helpers/db";

// Dynamic chart imports
const ColumnChart = dynamic(
  () => import("../charts/column").then((mod) => mod.Column),
  { ssr: false }
);

const PMOColumnChart = dynamic(
  () => import("../charts/pmocolumn").then((mod) => mod.PMOColumn),
  { ssr: false }
);

export const Content = () => {
  const { user } = useUserContext();
  const isPMO = user?.department === "PMO";

  const { tasks: designTasks, loading: designLoading } = useTasksByDepartment(
    user?.department || ""
  );
  const { tasks: pmoTasks, loading: pmoLoading } = usePMOTasks();

  const tasks = isPMO ? pmoTasks : designTasks;
  const loading = isPMO ? pmoLoading : designLoading;

  const now = new Date();

  // Type-safe filtering
  const OnPendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;
  const onRushTasks = tasks.filter((task) => task.status === "Priority").length;
  const OverdueTasks = tasks.filter((task) => task.status === "Overdue").length;

  const FinishedTasks = tasks.filter((task) => {
    const finishedDate = isPMO
      ? (task as PMOTasks).dateFinished
      : (task as dtTask).sirMJH;

    if (!finishedDate) return false;

    const diffDays =
      (now.getTime() - new Date(finishedDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0 flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Cards */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-4 gap-5 w-full">
              <Card0 Rush={onRushTasks} />
              <Card1 Pending={OnPendingTasks} />
              <Card2 Overdue={OverdueTasks} />
              <Card3 Finished={FinishedTasks} />
            </div>
          </div>

          {/* Chart */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Statistics</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6">
              {isPMO ? (
                <PMOColumnChart tasks={pmoTasks} />
              ) : (
                <ColumnChart tasks={designTasks} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-3">
        <div className="flex flex-wrap justify-between">
          <h3 className="text-xl font-semibold">Tasks Designation</h3>
          <Link href="/tasks" as={NextLink} color="primary">
            View All
          </Link>
        </div>
        {isPMO ? (
          <PMOTableWrapper
            tasks={pmoTasks}
            loading={pmoLoading}
            fullScreen={false}
          />
        ) : (
          <TableWrapper
            tasks={designTasks}
            loading={designLoading}
            fullScreen={false}
          />
        )}
      </div>
    </div>
  );
};
