"use client";

import React, { useEffect, useState } from "react";
import { Divider, Tab, Tabs, Checkbox, Link, Spinner } from "@heroui/react";
import WAR from "./war";
import COC from "./coc";
import COA from "./coa";
import Warranty from "./warranty";
import CSAT from "./csat";
import COP from "./cop";
import DR from "./dr";
import SI from "./si";
import Trainee from "./trainee_acceptance";
import BuiltPlans from "./built_plans";
import { Projects } from "@/helpers/acumatica";

const summaryConfig = [
  { label: "WAR", key: "war" },
  { label: "PIB SUMMARY", key: "pib" },
  { label: "COC", key: "coc" },
  { label: "COA", key: "coa" },
  {
    label: "Training Acceptance",
    children: [
      { label: "TRAINING ACCEPTANCE", key: "trainingAcceptance" },
      { label: "TRAINING ATTENDANCE", key: "trainingAttendance" },
    ],
  },
  { label: "DR", key: "dr" },
  { label: "SI", key: "is" },
  { label: "WARRANTY CERTIFICATE", key: "Warranty" },
  { label: "CSAT", key: "csat" },
  { label: "COP", key: "cop" },
  { label: "AS BUILT PLANS", key: "builtPlans" },
];

// Custom hook for fetching files
function useProjectFiles(projectId?: string | null) {
  const [files, setFiles] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/department/PMO/project_tasks/projectCompletion?id=${projectId}`,
        );
        if (!res.ok) throw new Error("Failed to load project completion data");

        const data = await res.json();
        const filtered = Object.fromEntries(
          Object.entries(data).map(([key, rows]) => [
            key,
            Array.isArray(rows) ? rows.filter((r) => r.attachmentName) : [],
          ]),
        );
        setFiles(filtered);
      } catch (err) {
        console.error("Error loading project completion data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  return { files, loading };
}

// Summary tab component
function SummaryTab({
  projectId,
  files,
  loading,
}: {
  projectId: string | null;
  files: Record<string, any[]>;
  loading: boolean;
}) {
  return (
    <div className="p-4">
      {loading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" /> Loading file statuses...
        </div>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">List</th>
              <th className="py-2 px-4 text-left">File</th>
            </tr>
          </thead>
          <tbody>
            {summaryConfig.map((item) =>
              item.children ? (
                item.children.map((child) => (
                  <CheckboxRow
                    key={child.key}
                    label={child.label}
                    files={files[child.key]}
                    projectId={projectId}
                  />
                ))
              ) : (
                <CheckboxRow
                  key={item.key}
                  label={item.label}
                  files={files[item.key]}
                  projectId={projectId}
                />
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Checkbox row for summary
function CheckboxRow({
  label,
  files,
  projectId,
}: {
  label: string;
  files?: any[];
  projectId: string | null;
}) {
  const hasFile = Array.isArray(files) && files.length > 0;

  return (
    <tr className="border-b">
      <td className="py-2 px-4 font-medium">{label}</td>

      <td className="py-2 px-4">
        {hasFile
          ? files!.map((f, i) => (
              <Link
                key={i}
                href={`/uploads/${projectId}/completion/${encodeURIComponent(
                  f.attachmentName,
                )}`}
                target="_blank"
                color="primary"
                underline="hover"
                className="block"
              >
                {f.attachmentName}
              </Link>
            ))
          : "-"}
      </td>
    </tr>
  );
}

interface ProjectCompletionProps {
  project: Projects | null;
}
// Main component
export default function ProjectCompletion({ project }: ProjectCompletionProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const { files, loading } = useProjectFiles(projectId);

  useEffect(() => {
    if (project) {
      setProjectId(project.projectId);
    }
  }, [project]);

  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="Summary" title="SUMARRY">
          <SummaryTab projectId={projectId} files={files} loading={loading} />
        </Tab>
        <Tab key="W.A.R." title="WAR">
          <WAR project={project} />
        </Tab>
        <Tab key="COC" title="COC">
          <COC project={project} />
        </Tab>
        <Tab key="COA" title="COA">
          <COA project={project} />
        </Tab>
        <Tab key="Training Acceptance" title="Training Acceptance">
          <Trainee project={project} />
        </Tab>
        <Tab key="DR" title="DR">
          <DR project={project} />
        </Tab>
        <Tab key="SI" title="SI">
          <SI project={project} />
        </Tab>
        <Tab key="Warranty Certificate" title="Warranty Certificate">
          <Warranty project={project} />
        </Tab>
        <Tab key="CSAT" title="CSAT">
          <CSAT project={project} />
        </Tab>
        <Tab key="COP" title="COP">
          <COP project={project} />
        </Tab>
        <Tab key="As Built Plans" title="As Built Plans">
          <BuiltPlans project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}
