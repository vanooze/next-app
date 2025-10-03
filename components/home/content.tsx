"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Card0 } from "./card";
import { Card1 } from "./card1";
import { Card2 } from "./card2";
import { Card3 } from "./card3";
import { Link, Tabs, Tab } from "@heroui/react";
import NextLink from "next/link";
import { useUserContext } from "../layout/UserContext";
import { usePMOTasks } from "@/components/hooks/usePmoTasks";
import { useSalesManagement } from "@/components/hooks/useSalesManagement";
import { useDesignTasks } from "../hooks/useDesignTasks";
import { AllMessages } from "../home/message-board";
import { TableWrapper as DesignTable } from "../deparments/DT/tasks/table/table";
import { PMOTableWrapper } from "../deparments/PMO/tasks/table/table";
import { SalesTableWrapper } from "../deparments/SALES/table/table";

import { PMOTasks, dtTask, SalesManagement } from "@/helpers/db";

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
  const restriction = user?.restriction;

  const { tasks: designTasks, loading: designLoading } = useDesignTasks();
  const { tasks: pmoTasks, loading: pmoLoading } = usePMOTasks();
  const { tasks: salesTasks, loading: salesLoading } = useSalesManagement();

  const chartRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState<number>(0);

  const now = new Date();

  // 🔹 Helper to calculate task stats
  const getStats = (tasks: any[], type: "PMO" | "SALES" | "DESIGN") => {
    const onPendingTasks = tasks.filter((task) => {
      if (type === "SALES") return task.status === "On Going";
      return task.status === "Pending";
    }).length;

    const onRushTasks = tasks.filter((task) => {
      if (type === "SALES") return task.status === "On Hold";
      return task.status === "Priority";
    }).length;

    const overdueTasks = tasks.filter((task) => {
      if (type === "SALES") return task.status === "Lost Account";
      return task.status === "Overdue";
    }).length;

    const finishedTasks = tasks.filter((task) => {
      let finishedDate: string | null;

      if (type === "PMO") {
        finishedDate = (task as PMOTasks).dateFinished;
      } else if (type === "SALES") {
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

    return { onPendingTasks, onRushTasks, overdueTasks, finishedTasks };
  };

  const renderDepartment = (
    type: "PMO" | "SALES" | "DESIGN",
    tasks: any[],
    loading: boolean
  ) => {
    const { onPendingTasks, onRushTasks, overdueTasks, finishedTasks } =
      getStats(tasks, type);

    const renderChart = () => {
      if (type === "PMO") return <PMOColumnChart tasks={tasks} />;
      if (type === "SALES") return <SalesColumnChart tasks={tasks} />;
      if (type === "DESIGN") return <ColumnChart tasks={tasks} />;
      return null;
    };

    const renderTable = () => {
      if (type === "PMO")
        return (
          <PMOTableWrapper tasks={tasks} loading={loading} fullScreen={false} />
        );
      if (type === "SALES")
        return (
          <SalesTableWrapper
            tasks={tasks}
            loading={loading}
            fullScreen={false}
          />
        );
      if (type === "DESIGN")
        return (
          <DesignTable tasks={tasks} loading={loading} fullScreen={false} />
        );
      return null;
    };

    useEffect(() => {
      if (chartRef.current) {
        setChartHeight(chartRef.current.offsetHeight);
      }

      const handleResize = () => {
        if (chartRef.current) {
          setChartHeight(chartRef.current.offsetHeight);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <div className="h-full lg:px-6">
        <div className="grid grid-cols-1 2xl:grid-cols-5 gap-6 pt-3 px-4 lg:px-0 sm:pt-10 max-w-[90rem] mx-auto w-full">
          <div className="col-span-5 flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{type} Tasks</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-4 gap-5 w-full">
              <Card0 Rush={onRushTasks} />
              <Card1 Pending={onPendingTasks} />
              <Card2 Overdue={overdueTasks} />
              <Card3 Finished={finishedTasks} />
            </div>
          </div>

          <div className="col-span-4 h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Statistics</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6">
              {renderChart()}
            </div>
          </div>

          {/* Message Board */}
          <div className="col-span-1 h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Message Board</h3>
            <AllMessages maxHeight={425 + 48} />
          </div>
        </div>

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

  // if (restriction === "9") {
  //   return (
  //     <Tabs aria-label="Departments" variant="underlined">
  //       <Tab key="PMO" title="PMO">
  //         {renderDepartment("PMO", pmoTasks, pmoLoading)}
  //       </Tab>
  //       <Tab key="SALES" title="Sales">
  //         {renderDepartment("SALES", salesTasks, salesLoading)}
  //       </Tab>
  //       <Tab key="DESIGN" title="Design">
  //         {renderDepartment("DESIGN", designTasks, designLoading)}
  //       </Tab>
  //     </Tabs>
  //   );
  // }

  // 🔹 Else → Just show based on user's department
  if (department === "PMO")
    return renderDepartment("PMO", pmoTasks, pmoLoading);
  if (department === "SALES")
    return renderDepartment("SALES", salesTasks, salesLoading);
  return renderDepartment("DESIGN", designTasks, designLoading);
};
