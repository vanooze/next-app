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
  actual_start_date?: string | null;
  actual_end_date?: string | null;
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

  function formatPlanned(task: Task, isSubtask = false) {
    const start = new Date(task.start_date).getTime();
    const end = new Date(task.end_date).getTime();
    if (isNaN(start) || isNaN(end)) return null;

    return {
      x: `${isSubtask ? "↳ " : ""}${task.title || "Untitled Task"}`,
      y: [start, end],
      fillColor: "#42a5f5", // blue
    };
  }
  function formatActual(task: Task, isSubtask = false) {
    const start = task.actual_start_date
      ? new Date(task.actual_start_date).getTime()
      : null;
    const end = task.actual_end_date
      ? new Date(task.actual_end_date).getTime()
      : null;

    const plannedEnd = task.end_date ? new Date(task.end_date).getTime() : null;

    if (!start || !end || isNaN(start) || isNaN(end)) return null;

    let fillColor = "#4caf50";
    if (plannedEnd && end > plannedEnd) {
      fillColor = "#ef5350";
    }

    return {
      x: `${isSubtask ? "↳ " : ""}${task.title || "Untitled Task"} (Actual)`,
      y: [start, end],
      fillColor,
    };
  }

  const plannedData = parents.flatMap((parent) => {
    const items = [];
    const planned = formatPlanned(parent);
    if (planned) items.push(planned);

    const actual = formatActual(parent);
    if (actual) items.push(actual);

    const childItems = children
      .filter((child) => child.parent_id === parent.id)
      .flatMap((child) => {
        const subItems = [];
        const planned = formatPlanned(child, true);
        if (planned) subItems.push(planned);

        const actual = formatActual(child, true);
        if (actual) subItems.push(actual);

        return subItems;
      });

    return [...items, ...childItems];
  });

  const series: ApexAxisChartSeries = [
    {
      name: "Tasks",
      data: plannedData,
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
