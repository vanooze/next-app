"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card0 } from "./card";
import { Card1 } from "./card1";
import { Card2 } from "./card2";
import { Card3 } from "./card3";
import { Link } from "@heroui/react";
import NextLink from "next/link";
import { useUserContext } from "../layout/UserContext";
import { useTasksByDepartment } from "@/components/hooks/useTasksByDepartment";
import { usePMOTasks } from "@/components/hooks/usePmoTasks";
import { useSalesManagement } from "@/components/hooks/useSalesManagement";

import { TableWrapper as DesignTable } from "../deparments/DT/tasks/table/table";
import { PMOTableWrapper } from "../deparments/PMO/tasks/table/table";
import { SalesTableWrapper } from "../deparments/SALES/table/table";

import { PMOTasks, dtTask, SalesManagement } from "@/helpers/db";

// Dynamic chart imports
const ColumnChart = dynamic(
  () => import("../charts/column").then((mod) => mod.Column),
  { ssr: false }
);
const PMOColumnChart = dynamic(
  () => import("../charts/pmocolumn").then((mod) => mod.PMOColumn),
  { ssr: false }
);
const SalesColumnChart = dynamic(
  () => import("../charts/salescolumn").then((mod) => mod.SalesColumn),
  { ssr: false }
);

export const Content = () => {
  const { user } = useUserContext();
  const department = user?.department;

  const isPMO = department === "PMO";
  const isSales = department === "SALES";

  const { tasks: designTasks, loading: designLoading } = useTasksByDepartment(
    department || ""
  );
  const { tasks: pmoTasks, loading: pmoLoading } = usePMOTasks();
  const { tasks: salesTasks, loading: salesLoading } = useSalesManagement();

  const tasks = isPMO ? pmoTasks : isSales ? salesTasks : designTasks;
  const loading = isPMO ? pmoLoading : isSales ? salesLoading : designLoading;

  const now = new Date();

  const onPendingTasks = tasks.filter((task) => {
    if (isSales) return task.status === "On Going";
    return task.status === "Pending";
  }).length;

  const onRushTasks = tasks.filter((task) => {
    if (isSales) return task.status === "On Hold";
    return task.status === "Priority";
  }).length;

  const overdueTasks = tasks.filter((task) => {
    if (isSales) return task.status === "Lost Account";
    return task.status === "Overdue";
  }).length;

  const finishedTasks = tasks.filter((task) => {
    let finishedDate: string | null;

    if (isPMO) {
      finishedDate = (task as PMOTasks).dateFinished;
    } else if (isSales) {
      finishedDate = (task as SalesManagement).sirMJH;
    } else {
      finishedDate = (task as dtTask).sirMJH;
    }

    if (!finishedDate) return false;

    const diffDays =
      (now.getTime() - new Date(finishedDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  const renderChart = () => {
    if (isPMO) return <PMOColumnChart tasks={pmoTasks} />;
    if (isSales) return <SalesColumnChart tasks={salesTasks} />;
    return <ColumnChart tasks={designTasks} />;
  };

  const renderTable = () => {
    if (isPMO)
      return (
        <PMOTableWrapper
          tasks={pmoTasks}
          loading={pmoLoading}
          fullScreen={false}
        />
      );
    if (isSales)
      return (
        <SalesTableWrapper
          tasks={salesTasks}
          loading={salesLoading}
          fullScreen={false}
        />
      );
    return (
      <DesignTable
        tasks={designTasks}
        loading={designLoading}
        fullScreen={false}
      />
    );
  };

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0 flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Cards */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-4 gap-5 w-full">
              <Card0 Rush={onRushTasks} />
              <Card1 Pending={onPendingTasks} />
              <Card2 Overdue={overdueTasks} />
              <Card3 Finished={finishedTasks} />
            </div>
          </div>

          {/* Chart */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Statistics</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6">
              {renderChart()}
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
        {renderTable()}
      </div>
    </div>
  );
};
