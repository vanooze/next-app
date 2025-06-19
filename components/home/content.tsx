"use client";
import React, { useState, useEffect } from "react";
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

const ColumnChart = dynamic(
  () => import("../charts/column").then((mod) => mod.Column),
  {
    ssr: false,
  }
);

export const Content = () => {
  const { user } = useUserContext();
  const { tasks, loading, error } = useTasksByDepartment(
    user?.department || ""
  );
  const now = new Date();

  const OnPendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const onRushTasks = tasks.filter((task) => task.status === "Rush").length;

  const OverdueTasks = tasks.filter((task) => task.status === "Overdue").length;

  const FinishedTasks = tasks.filter((task) => {
    if (task.status !== "Finished") return false;

    const sirMJHDate = task.sirMJH ? new Date(task.sirMJH) : null;

    if (!sirMJHDate) return false;

    const diffDays =
      (now.getTime() - sirMJHDate.getTime()) / (1000 * 60 * 60 * 24);

    return diffDays <= 30;
  }).length;

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Card Section Top */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-4 gap-5  justify-center w-full">
              <Card0 Rush={onRushTasks} />
              <Card1 Pending={OnPendingTasks} />
              <Card2 Overdue={OverdueTasks} />
              <Card3 Finished={FinishedTasks} />
            </div>
          </div>

          {/* Chart */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Statistics</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6 ">
              <ColumnChart tasks={tasks} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Task Designation */}
      <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
        <div className="flex  flex-wrap justify-between">
          <h3 className="text-center text-xl font-semibold">
            Tasks Designation
          </h3>
          <Link
            href="/tasks"
            as={NextLink}
            color="primary"
            className="cursor-pointer"
          >
            View All
          </Link>
        </div>
        <TableWrapper tasks={tasks} loading={loading} fullScreen={false} />
      </div>
    </div>
  );
};
