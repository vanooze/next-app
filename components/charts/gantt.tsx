"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Task {
  id: number | string;
  parent_id: number | string | null;
  title: string;
  start_date: string;
  end_date: string;
}

interface GanttChartProps {
  project: Task[];
}

export default function GanttChart({ project }: GanttChartProps) {
  const normalizedTasks = project.map((task) => ({
    ...task,
    id: typeof task.id === "string" ? parseInt(task.id) : task.id,
    parent_id:
      typeof task.parent_id === "string"
        ? parseInt(task.parent_id)
        : task.parent_id,
  }));

  const sortedTasks = [...normalizedTasks].sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const parents = sortedTasks.filter((task) => task.parent_id === null);
  const children = sortedTasks.filter((task) => task.parent_id !== null);

  const groupedData = parents.flatMap((parent) => {
    const parentStart = new Date(parent.start_date).getTime();
    const parentEnd = new Date(parent.end_date).getTime();

    if (isNaN(parentStart) || isNaN(parentEnd)) return [];

    const parentItem = {
      x: parent.title || "Untitled Task",
      y: [parentStart, parentEnd],
      fillColor: "#42a5f5",
    };

    const childItems = children
      .filter((child) => child.parent_id === parent.id)
      .map((child) => {
        const childStart = new Date(child.start_date).getTime();
        const childEnd = new Date(child.end_date).getTime();

        if (isNaN(childStart) || isNaN(childEnd)) return null;

        return {
          x: `↳ ${child.title || "Untitled Subtask"}`,
          y: [childStart, childEnd],
          fillColor: "#66bb6a",
        };
      })
      .filter(
        (item): item is { x: string; y: [number, number]; fillColor: string } =>
          item !== null
      ); // Type guard

    return [parentItem, ...childItems];
  });

  const series: ApexAxisChartSeries = [
    {
      name: "Tasks",
      data: groupedData,
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 600,
      type: "rangeBar",
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
      },
    },
    tooltip: {
      x: {
        format: "yyyy-MM-dd",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number[]) {
        const start = new Date(val[0]).toLocaleDateString();
        const end = new Date(val[1]).toLocaleDateString();
        return `${start} – ${end}`;
      },
      style: {
        colors: ["#000"],
      },
    },
    legend: {
      show: false,
    },
  };

  return (
    <Chart options={options} series={series} type="rangeBar" height={600} />
  );
}
