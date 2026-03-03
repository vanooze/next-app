"use client";

import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React from "react";
import useSWR from "swr";

import Budget from "./budget";
import ManPower from "./manpower";
import Plans from "./plans";
import Equipment from "./equipment";
import Contractors from "./contractors";
import RiskAssessmentTable from "./risk_assessment";

interface ProjectValidationProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

function ProjectValidation({ project }: ProjectValidationProps) {
  const projectId = project?.projectId;

  /* =========================
     FILE-BASED TABS
  ========================== */

  const { data: plansFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectValidation/plans?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: contractorFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectValidation/contractors?id=${projectId}`
      : null,
    fetcher,
  );

  /* =========================
     VALUE-BASED TABS
  ========================== */

  const { data: equipmentData } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/boq_items?projectId=${projectId}`
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
      ? `/api/department/PMO/project_validation/budget?id=${projectId}`
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
          key="plans"
          title={<TabTitle label="Plans" active={plansFiles?.length > 0} />}
        >
          <Plans project={project} />
        </Tab>

        <Tab
          key="equipment"
          title={
            <TabTitle label="Equipment" active={hasValue(equipmentData)} />
          }
        >
          <Equipment project={project} />
        </Tab>

        <Tab
          key="contractors"
          title={
            <TabTitle
              label="Contractors (NOA/NTP)"
              active={contractorFiles?.length > 0}
            />
          }
        >
          <Contractors project={project} />
        </Tab>

        <Tab
          key="riskAssessment"
          title={
            <TabTitle label="Risk Assessment" active={hasValue(riskData)} />
          }
        >
          <RiskAssessmentTable projectId={projectId} />
        </Tab>

        <Tab
          key="manPower"
          title={<TabTitle label="Man Power" active={hasValue(manpowerData)} />}
        >
          <ManPower project={project} />
        </Tab>

        <Tab
          key="budget"
          title={<TabTitle label="Budget" active={hasValue(budgetData)} />}
        >
          <Budget project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default ProjectValidation;
