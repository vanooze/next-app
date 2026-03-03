"use client";

import React from "react";
import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import useSWR from "swr";

import Reports from "./reports";
import Chart from "./project_chart";
import ManPower from "./manpower_delegation";
import Accounting from "./accounting";

interface ProjectExecutionProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

function ProjectExecution({ project }: ProjectExecutionProps) {
  const projectId = project?.projectId;

  /* =========================
     VALUE-BASED TABS ONLY
  ========================== */

  const { data: manpowerData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/manPower?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: reportingData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectexecution/reports?project_id=${project.projectId}`
      : null,
    fetcher,
  );

  const { data: ganttData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectexecution/gannt?projectId=${project.projectId}`
      : null,
    fetcher,
  );

  const { data: accountingData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectexecution/accounting/?projectId=${project.projectId}`
      : null,
    fetcher,
  );

  /* =========================
     SMART VALUE CHECKER
  ========================== */

  const hasValue = (data: any) => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object") return Object.keys(data).length > 0;
    if (typeof data === "string") return data.trim() !== "";
    return false;
  };

  const TabTitle = ({ label, active }: { label: string; active: boolean }) => (
    <span className="flex items-center gap-2">
      {label}
      {active && <span className="w-2 h-2 rounded-full bg-green-500" />}
    </span>
  );

  return (
    <div>
      <Divider className="mb-4" />

      <Tabs placement="top" variant="solid" size="md">
        <Tab
          key="manpower"
          title={
            <TabTitle
              label="Manpower Delegation"
              active={hasValue(manpowerData)}
            />
          }
        >
          <ManPower project={project} />
        </Tab>

        <Tab
          key="reporting"
          title={
            <TabTitle label="Reporting" active={hasValue(reportingData)} />
          }
        >
          <Reports project={project} />
        </Tab>

        <Tab
          key="gantt"
          title={<TabTitle label="Gantt Chart" active={hasValue(ganttData)} />}
        >
          <Chart project={project} />
        </Tab>

        <Tab
          key="accounting"
          title={
            <TabTitle
              label="Contractors Billing"
              active={hasValue(accountingData)}
            />
          }
        >
          <Accounting project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default ProjectExecution;
