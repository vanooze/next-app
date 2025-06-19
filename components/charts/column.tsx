import React, { useMemo } from "react";
import useSWR from "swr";
import Chart from "react-apexcharts";
import { dtTask } from "@/helpers/task";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ColumnProps {
  tasks: dtTask[];
}

export const Column: React.FC<ColumnProps> = ({ tasks }) => {
  const sboqMap: Record<string, string> = {
    "J.COLA": "JER",
    "J.ARDINEL": "Jil",
  };

  const eboqMap: Record<string, string> = {
    "M.GIGANTE": "Marcial",
    "J.CAMERO": "Jan",
    "B.TOPACIO": "Billy",
  };

  const statusList = ["Priority", "Overdue", "Pending"];
  const colorMap: Record<string, string> = {
    Priority: "#7828c8",
    Overdue: "#dc2626",
    Pending: "#f59e0b",
  };

  const { categories, series } = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    const nameSet = new Set<string>([
      ...Object.values(sboqMap),
      ...Object.values(eboqMap),
      "Sir ME",
    ]);

    for (const status of statusList) {
      counts[status] = {};
      for (const name of nameSet) {
        counts[status][name] = 0;
      }
    }

    for (const task of tasks) {
      const status = task.status;
      if (!statusList.includes(status)) continue;

      const hasSboq = !!task.structuralBoq?.trim();
      const hasSirME = !!task.sirME;

      const sboqPeople =
        !hasSirME && task.structuralBoq
          ? task.structuralBoq
              .split(",")
              .map((p) => sboqMap[p.trim()])
              .filter(Boolean)
          : [];

      const eboqPeople =
        !hasSboq && task.systemDiagram && !hasSirME
          ? task.systemDiagram
              .split(",")
              .map((p) => eboqMap[p.trim()])
              .filter(Boolean)
          : [];

      const allPeople = [...sboqPeople, ...eboqPeople];

      for (const person of allPeople) {
        nameSet.add(person);
        counts[status][person] = (counts[status][person] || 0) + 1;
      }

      if ((!task.sirME && sboqPeople.length > 0) || eboqPeople.length > 0) {
        counts[status]["Sir ME"] = (counts[status]["Sir ME"] || 0) + 1;
      }
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
      text: "Task Status by Personnel",
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
