"use client";

import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React from "react";
import useSWR from "swr";
import BOQ from "./boq";
import SOW from "./sow";
import PreProjectAgreement from "./pre_project_agreement";
import Conceptual from "./conceptual";

interface DocumentationProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
};

function Documentation({ project }: DocumentationProps) {
  const projectId = project?.projectId;

  // 🔥 Fetch all documentation file statuses immediately
  const { data: boqFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/documentation/boq?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: sowFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/documentation/sow?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: conceptualFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/documentation/conceptual?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: agreementFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/documentation/pre_project_agreement?id=${projectId}`
      : null,
    fetcher,
  );

  const TabTitle = ({
    label,
    hasFiles,
  }: {
    label: string;
    hasFiles: boolean;
  }) => (
    <span className="flex items-center gap-2">
      {label}
      {hasFiles && <span className="w-2 h-2 rounded-full bg-green-500" />}
    </span>
  );

  return (
    <div>
      <Divider className="mb-4" />

      <Tabs placement="top" variant="solid" size="md">
        <Tab
          key="BOQ"
          title={<TabTitle label="BOQ" hasFiles={boqFiles.length > 0} />}
        >
          <BOQ project={project} />
        </Tab>

        <Tab
          key="SOW"
          title={<TabTitle label="SOW" hasFiles={sowFiles.length > 0} />}
        >
          <SOW project={project} />
        </Tab>

        <Tab
          key="Conceptual"
          title={
            <TabTitle
              label="Conceptual"
              hasFiles={conceptualFiles.length > 0}
            />
          }
        >
          <Conceptual project={project} />
        </Tab>

        <Tab
          key="Pre Project Agreement"
          title={
            <TabTitle
              label="Pre Project Agreement"
              hasFiles={agreementFiles.length > 0}
            />
          }
        >
          <PreProjectAgreement project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Documentation;
