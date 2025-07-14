import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { PMOTasks } from "@/helpers/db";

const pmoMap: Record<string, string> = {
  "Joshua A. Calimutan": "Joshua",
  "Ryan Joseph DL. Raymundo": "Ryan",
};

const colorMap: Record<string, string> = {
  Priority: "#7828c8",
  Overdue: "#dc2626",
  OnHold: "#09AACD",
  Pending: "#f59e0b",
};

const statusList = ["Priority", "Overdue", "OnHold", "Pending"];

interface ColumnProps {
  tasks: PMOTasks[];
}

export const PMOColumn: React.FC<ColumnProps> = ({ tasks }) => {
  const { categories, series } = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    const nameSet = new Set<string>(Object.values(pmoMap));

    // Initialize counts
    for (const status of statusList) {
      counts[status] = {};
      for (const name of nameSet) {
        counts[status][name] = 0;
      }
    }

    // Process tasks
    for (const task of tasks) {
      const personnel = pmoMap[task.personnel];
      if (!personnel || !statusList.includes(task.status)) continue;

      counts[task.status][personnel] += 1;
    }

    const categories = Array.from(nameSet);
    const series = statusList.map((status) => ({
      name: status,
      data: categories.map((name) => counts[status][name] || 0),
    }));

    return { categories, series };
  }, [tasks]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
    },
    xaxis: {
      categories,
    },
    title: {
      text: "Task Status by PMO Personnel",
      align: "left",
    },
    legend: {
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
      },
    },
    colors: statusList.map((status) => colorMap[status]),
    dataLabels: {
      enabled: true,
    },
  };

  return (
    <div className="w-full z-20">
      <Chart options={options} series={series} type="bar" height={425} />
    </div>
  );
};
