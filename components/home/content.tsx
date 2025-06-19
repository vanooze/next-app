"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../deparments/DT/tasks/table/table";
import { CardBalance1 } from "./card-balance1";
import { CardBalance2 } from "./card-balance2";
import { CardBalance3 } from "./card-balance3";
import { CardAgents } from "./card-agents";
import { CardAnnouncement } from "./card-announcement";
import { Link } from "@heroui/react";
import NextLink from "next/link";
import { useUserContext } from "../layout/UserContext";
import { useTasksByDepartment } from "@/components/hooks/useTasksByDepartment";

const Chart = dynamic(
  () => import("../charts/steam").then((mod) => mod.Steam),
  {
    ssr: false,
  }
);

export const Content = () => {
  const { user } = useUserContext();
  const { tasks, loading, error } = useTasksByDepartment(
    user?.department || ""
  );

  const OnPendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;
  const OverdueTasks = tasks.filter((task) => task.status === "Overdue").length;
  const FinishedTasks = tasks.filter(
    (task) => task.status === "Finished"
  ).length;
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Card Section Top */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
              <CardBalance1 Pending={OnPendingTasks} />
              <CardBalance2 Overdue={OverdueTasks} />
              <CardBalance3 Finished={FinishedTasks} />
            </div>
          </div>

          {/* Chart */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Statistics</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6 ">
              <Chart />
            </div>
          </div>
        </div>

        {/* Left Section */}
        <div className="mt-4 gap-2 flex flex-col xl:max-w-md w-full">
          <h3 className="text-xl font-semibold">Section</h3>
          <div className="flex flex-col justify-center gap-4 flex-wrap md:flex-nowrap md:flex-col">
            <CardAgents />
            <CardAnnouncement />
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
