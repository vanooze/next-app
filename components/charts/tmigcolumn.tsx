import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { RepairTasks } from "@/helpers/db";

const colorMap: Record<string, string> = {
  Working: "#09AACD",
  Pending: "#f59e0b",
};

const statusList = ["Working", "Pending"];

interface ColumnProps {
  tasks: RepairTasks[];
}

export const TMIGColumn: React.FC<ColumnProps> = ({ tasks }) => {
  const { series } = useMemo(() => {
    const counts: Record<string, number> = {
      Working: 0,
      Pending: 0,
    };

    for (const task of tasks) {
      if (statusList.includes(task.status)) {
        counts[task.status] += 1;
      }
    }

    const series = [
      {
        name: "Tasks",
        data: statusList.map((status) => counts[status] || 0),
      },
    ];

    return { series };
  }, [tasks]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
    },
    xaxis: {
      categories: statusList,
    },
    title: {
      text: "Repair Status Summary",
      align: "left",
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
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
