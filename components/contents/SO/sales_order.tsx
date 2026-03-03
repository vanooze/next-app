"use client";

import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React from "react";
import useSWR from "swr";

import SOProjectOrder from "./so_project_order";
import SOTor from "./so_tor";
import SOProposal from "./so_proposal";
import SOProjectTurnOver from "./so_project_turn_over";

interface SalesOrderProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
};

function SalesOrder({ project }: SalesOrderProps) {
  const projectId = project?.projectId;

  // 🔥 Fetch ALL tab file data immediately
  const { data: poFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/so/po?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: torFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/so/tor?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: proposalFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/so/proposal?id=${projectId}`
      : null,
    fetcher,
  );

  const { data: turnoverFiles = [] } = useSWR(
    projectId
      ? `/api/department/PMO/project_tasks/so/project_turn_over?id=${projectId}`
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
          key="PO"
          title={
            <TabTitle label="Project Order" hasFiles={poFiles.length > 0} />
          }
        >
          <SOProjectOrder project={project} />
        </Tab>

        <Tab
          key="TOR"
          title={<TabTitle label="TOR" hasFiles={torFiles.length > 0} />}
        >
          <SOTor project={project} />
        </Tab>

        <Tab
          key="Proposal"
          title={
            <TabTitle label="Proposal" hasFiles={proposalFiles.length > 0} />
          }
        >
          <SOProposal project={project} />
        </Tab>

        <Tab
          key="Project Turn Over"
          title={
            <TabTitle
              label="Project Turn Over"
              hasFiles={turnoverFiles.length > 0}
            />
          }
        >
          <SOProjectTurnOver project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default SalesOrder;
