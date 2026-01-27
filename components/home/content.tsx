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
import { TableWrapper as DesignTable } from "../deparments/DT/tasks/table/table";
import { PMOTableWrapper } from "../deparments/PMO/tasks/table/table";
import { SalesTableWrapper } from "../deparments/SALES/table/table";
import { useITTasks } from "../hooks/useITTasks";

import { PMOTasks, dtTask, SalesManagement } from "@/helpers/db";

const ColumnChart = dynamic(
  () => import("../charts/column").then((mod) => mod.Column),
  { ssr: false },
);
const PMOColumnChart = dynamic(
  () => import("../charts/pmocolumn").then((mod) => mod.PMOColumn),
  { ssr: false },
);
const SalesColumnChart = dynamic(
  () => import("../charts/salescolumn").then((mod) => mod.SalesColumn),
  { ssr: false },
);

const ITColumnChart = dynamic(
  () => import("../charts/itcolumn").then((mod) => mod.ITColumn),
  { ssr: false },
);

export const Content = () => {
  const { user } = useUserContext();
  const department = user?.designation;
  const restriction = user?.restriction;

  const { tasks: designTasks, loading: designLoading } = useDesignTasks();
  const { tasks: pmoTasks, loading: pmoLoading } = usePMOTasks();
  const { tasks: salesTasks, loading: salesLoading } = useSalesManagement();
  const { tasks: ITTasks, loading: ITLoading } = useITTasks();

  const chartRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState<number>(0);

  const now = new Date();

  useEffect(() => {
    if (chartRef.current) setChartHeight(chartRef.current.offsetHeight);

    const handleResize = () => {
      if (chartRef.current) {
        setChartHeight(chartRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStats = (tasks: any[], type: "PMO" | "SALES" | "DESIGN" | "IT") => {
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

      if (type === "PMO") finishedDate = (task as PMOTasks).dateFinished;
      else if (type === "SALES")
        finishedDate = (task as SalesManagement).sirMJH;
      else finishedDate = (task as dtTask).sirMJH;

      if (!finishedDate) return false;

      const diffDays =
        (now.getTime() - new Date(finishedDate).getTime()) /
        (1000 * 60 * 60 * 24);

      return diffDays <= 30;
    }).length;

    return { onPendingTasks, onRushTasks, overdueTasks, finishedTasks };
  };

  const renderDepartment = (
    type: "PMO" | "SALES" | "DESIGN" | "IT",
    tasks: any[],
    loading: boolean,
  ) => {
    const { onPendingTasks, onRushTasks, overdueTasks, finishedTasks } =
      getStats(tasks, type);

    const renderChart = () => {
      if (type === "PMO") return <PMOColumnChart tasks={tasks} />;
      if (type === "SALES") return <SalesColumnChart tasks={tasks} />;
      if (type === "IT") return <ITColumnChart tasks={tasks} />;
      return <ColumnChart tasks={tasks} />;
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
      return <DesignTable tasks={tasks} loading={loading} fullScreen={false} />;
    };

    return (
      <div className="h-full lg:px-6">
        <div className="grid grid-cols-1 2xl:grid-cols-5 gap-6 pt-3 px-4 sm:pt-10 max-w-[90rem] mx-auto w-full">
          <div className="col-span-5 flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{type} Tasks</h3>
            <div className="grid md:grid-cols-2 2xl:grid-cols-4 gap-5">
              <Card0 Rush={onRushTasks} />
              <Card1 Pending={onPendingTasks} />
              <Card2 Overdue={overdueTasks} />
              <Card3 Finished={finishedTasks} />
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Statistics</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6">
              {renderChart()}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full py-5 px-4 max-w-[90rem] mx-auto gap-3">
          <div className="flex justify-between">
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

  // ===================================================================================
  // ⭐ EXECUTIVE VIEW — HeroUI Tabs
  // ===================================================================================
  if (restriction === "9") {
    return (
      <div className="w-full px-4 pt-6">
        <Tabs
          variant="underlined"
          aria-label="Executive Tabs"
          defaultSelectedKey="DESIGN"
        >
          <Tab key="DESIGN" title="DESIGN">
            {renderDepartment("DESIGN", designTasks, designLoading)}
          </Tab>
          <Tab key="PMO" title="PMO">
            {renderDepartment("PMO", pmoTasks, pmoLoading)}
          </Tab>
          <Tab key="SALES" title="SALES">
            {renderDepartment("SALES", salesTasks, salesLoading)}
          </Tab>
          <Tab key="IT" title="IT">
            {renderDepartment("IT", ITTasks, ITLoading)}
          </Tab>
        </Tabs>
      </div>
    );
  }

  // ===================================================================================
  // NORMAL (NON-EXECUTIVE) USERS
  // ===================================================================================
  if (
    department?.includes("PMO") ||
    department?.includes("DOCUMENT CONTROLLER")
  )
    return renderDepartment("PMO", pmoTasks, pmoLoading);

  if (department?.includes("SALES"))
    return renderDepartment("SALES", salesTasks, salesLoading);

  if (department?.includes("DESIGN"))
    return renderDepartment("DESIGN", designTasks, designLoading);

  if (
    department?.includes("PROGRAMMER") ||
    department?.includes("MMC") ||
    department === "TECHNICAL"
  ) {
    return renderDepartment("IT", ITTasks, ITLoading);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <h2 className="text-2xl font-semibold mb-2">🚧 Dashboard in Progress</h2>
      <p className="text-gray-500">
        The dashboard for your department is still being set up. Please check
        back later.
      </p>
    </div>
  );
};
