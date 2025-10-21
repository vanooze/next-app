"use client";

import {
  Tabs,
  Tab,
  Select,
  SelectItem,
  SelectSection,
  Button,
  Spinner,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useUserContext } from "@/components/layout/UserContext";
import { ProjectProvider } from "@/components/layout/ProjectContext";
import { formatDatetoStr } from "@/helpers/formatDate";
import {
  selectFiliteredDesign,
  selectFiltiredPmo,
  selectPurchasing,
  selectSales,
} from "@/helpers/data";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Projects } from "@/helpers/acumatica";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const allowedDesignations = new Set([
  "PMO TL",
  "IT SUPERVISOR",
  "TMIG SUPERVISOR",
  "DESIGN SUPERVISOR",
  "TECHNICAL SUPERVISOR",
  "DOCUMENT CONTROLLER",
  "TECHNICAL ASSISTANT MANAGER",
  "TECHNICAL ADMIN CONSULTANT",
  "TECHNICAL MANAGER",
]);

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams();
  const projectId = id as string;

  const {
    data: project,
    error,
    isLoading,
  } = useSWR<Projects>(
    projectId ? `/api/department/PMO/project?id=${projectId}` : null,
    fetcher
  );

  const [accessUsers, setAccessUsers] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const originalAccessUsers = useRef<Set<string>>(new Set());

  const canAssign =
    user?.name === "Kaye Kimberly L. Manuel" ||
    allowedDesignations.has(user?.designation ?? "") ||
    user?.restriction === "9";

  useEffect(() => {
    if (!project?.access) return;
    const list = new Set(
      project.access
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
    );
    setAccessUsers(list);
    originalAccessUsers.current = new Set(list);
  }, [project]);

  const handleAddAccess = async () => {
    if (!project?.projectId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/department/PMO/project/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.projectId,
          accessList: [...accessUsers],
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update access");
      alert("Access updated successfully!");
    } catch (e) {
      alert("Failed to update access.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const normalizeToISO = (input: string): string => {
    const parts = input.split(/[-\/]/);
    if (parts.length !== 3) return input;
    const [a, b, c] = parts.map((p) => p.padStart(2, "0"));
    return a.length === 4 ? `${a}-${b}-${c}` : `${c}-${a}-${b}`;
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Loading project..." />
      </div>
    );

  if (error || !project)
    return (
      <div className="w-full text-center mt-10 text-red-500">
        Failed to load project details.
      </div>
    );

  const startDate =
    typeof project.startDate === "string"
      ? parseDate(normalizeToISO(project.startDate))
      : null;
  const endDate =
    typeof project.endDate === "string"
      ? parseDate(normalizeToISO(project.endDate))
      : null;

  const tabs = [
    { key: "sales-order", title: "Sales Order" },
    { key: "documentation", title: "Documentation" },
    { key: "project-kick-off", title: "Project Kick Off" },
    { key: "project-validation", title: "Project Validation" },
    { key: "project-execution", title: "Project Execution" },
    { key: "project-completion", title: "Project Completion" },
    { key: "post-project", title: "Post Project" },
  ];

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/project")}
          className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded"
        >
          ← Back
        </button>
      </div>

      <h3 className="text-2xl font-semibold">{project.description}</h3>
      <h1 className="text-lg font-semibold">
        {startDate ? formatDatetoStr(startDate) : ""} -{" "}
        {endDate ? formatDatetoStr(endDate) : ""}
      </h1>

      {canAssign && (
        <div className="max-w-md p-1">
          <h2 className="text-md font-semibold p-1">
            Assign project access to:
          </h2>
          <Select
            selectionMode="multiple"
            items={selectFiltiredPmo}
            label="Give access to:"
            placeholder="Select users"
            variant="bordered"
            selectedKeys={accessUsers}
            onSelectionChange={(keys) => {
              if (keys !== "all") {
                setAccessUsers(keys as Set<string>);
              } else {
                setAccessUsers(
                  new Set(selectFiltiredPmo.map((item) => item.key))
                );
              }
            }}
          >
            {[
              { title: "PMO", data: selectFiltiredPmo },
              { title: "Sales", data: selectSales },
              { title: "Design", data: selectFiliteredDesign },
              { title: "Purchasing", data: selectPurchasing },
            ].map(({ title, data }) => (
              <SelectSection
                key={title}
                title={title}
                classNames={{
                  heading:
                    "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small",
                }}
              >
                {data.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </SelectSection>
            ))}
          </Select>
          <p className="text-small text-default-500 p-1">
            Selected people: {Array.from(accessUsers).join(" | ")}
          </p>
          {accessUsers.size > 0 && (
            <Button
              color="primary"
              className="max-w-lg mt-2"
              isDisabled={!project?.projectId}
              isLoading={isSaving}
              onPress={handleAddAccess}
            >
              {isSaving ? "Saving..." : "Submit"}
            </Button>
          )}
        </div>
      )}

      <Tabs
        size="lg"
        aria-label="Project Sections"
        placement="top"
        variant="underlined"
        selectedKey={pathname.split("/").pop()}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            title={tab.title}
            href={`/project/${projectId}/${tab.key}`}
          />
        ))}
      </Tabs>

      <div className="pt-4">
        <ProjectProvider project={project} isLoading={isLoading} error={error}>
          {children}
        </ProjectProvider>
      </div>
    </div>
  );
}
