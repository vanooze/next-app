"use client";

import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React from "react";
import useSWR from "swr";

import BOQ from "./boq";
import Conceptual from "./conceptual";
import AttendeesMom from "./attendeesMom";
import Procurement from "./procurement";
import Contractors from "./contractors";
import ManPower from "./manPower";
import Budget from "./budget";
import Chart from "./chart";
import RiskManagement from "./riskManagement";

interface PreProjectKickOffProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

function PreProjectKickOff({ project }: PreProjectKickOffProps) {
  const projectId = project?.projectId;

  // 🔹 FILE-BASED TABS
  const { data: attendeesFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/attendees_mom?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: boqFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/boq?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: conceptualFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/conceptual/personnel/get?projectId=${projectId}`
      : null,
    fetcher,
  );

  // 🔹 VALUE/DATA-BASED TABS
  const { data: procurementData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/boq_items?projectId=${projectId}`
      : null,
    fetcher,
  );

  const { data: contractorsData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/bidding?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: riskData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/risk_management?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: manpowerData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/manPower?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: budgetData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/budget?projectId=${project.projectId}`
      : null,
    fetcher,
  );

  const { data: ganttData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/chart?projectId=${project.projectId}`
      : null,
    fetcher,
  );

  // 🔥 Smart value checker
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
          key="Attendees"
          title={
            <TabTitle
              label="List Of Attendees & MOM"
              active={attendeesFiles?.length > 0}
            />
          }
        >
          <AttendeesMom project={project} />
        </Tab>

        <Tab
          key="BOQ"
          title={<TabTitle label="Signed BOQ" active={boqFiles?.length > 0} />}
        >
          <BOQ project={project} />
        </Tab>

        <Tab
          key="Conceptual"
          title={
            <TabTitle
              label="Signed Conceptual"
              active={conceptualFiles?.length > 0}
            />
          }
        >
          <Conceptual project={project} />
        </Tab>

        <Tab
          key="Procurement"
          title={
            <TabTitle label="Procurement" active={hasValue(procurementData)} />
          }
        >
          <Procurement project={project} />
        </Tab>

        <Tab
          key="Contractors"
          title={
            <TabTitle
              label="Contractors (Bidding)"
              active={hasValue(contractorsData)}
            />
          }
        >
          <Contractors project={project} />
        </Tab>

        <Tab
          key="Risk"
          title={
            <TabTitle label="Risk Management" active={hasValue(riskData)} />
          }
        >
          <RiskManagement projectId={projectId} />
        </Tab>

        <Tab
          key="ManPower"
          title={
            <TabTitle
              label="Man Power Allocation"
              active={hasValue(manpowerData)}
            />
          }
        >
          <ManPower project={project} />
        </Tab>

        <Tab
          key="Budget"
          title={<TabTitle label="Budget" active={hasValue(budgetData)} />}
        >
          <Budget project={project} />
        </Tab>

        <Tab
          key="Gantt"
          title={<TabTitle label="Gantt Chart" active={hasValue(ganttData)} />}
        >
          <Chart project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default PreProjectKickOff;
