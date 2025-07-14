"use client";
import { Tabs, Tab, Select, SelectItem, CalendarDate } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import React, { useState, useEffect, useRef } from "react";
import { ProjectMonitoring } from "@/helpers/db";
import { formatDatetoStr } from "@/helpers/formatDate";
import { useUserContext } from "@/components/layout/UserContext";
import { BackIcon } from "@/components/icons/backicon";
import { useRouter } from "next/navigation";
import SalesOrder from "@/components/contents/SO/sales_order";
import Documentation from "@/components/contents/documentation/documentation";
import PreProjectKickOff from "@/components/contents/projectKickOff/pre_project_kickoff";
import ProjectValidation from "@/components/contents/projectValidation/project_validation";
import ProjectExecution from "@/components/contents/projectExecution/project_execution";
import ProjectCompletion from "@/components/contents/projectCompletion/project_completion";
import PostProject from "@/components/contents/postProject/post_project";

interface ManageProjectProps {
  project: ProjectMonitoring | null;
}

export const ManageProject = ({ project }: ManageProjectProps) => {
  const { user, loading } = useUserContext();
  const router = useRouter();
  const [projectCustomer, setProjectCustomer] = useState("");
  const [projectDate, setProjectDate] = useState<CalendarDate | null>(null);

  const normalizeToISO = (input: string): string => {
    if (!input) return "";

    const parts = input.split(/[-\/]/);
    if (parts.length !== 3) return input;

    let [part1, part2, part3] = parts;

    if (part1.length === 4)
      return `${part1}-${part2.padStart(2, "0")}-${part3.padStart(2, "0")}`;

    const mm = Number(part1);
    const dd = Number(part2);
    const yyyy = Number(part3);
    if (yyyy > 1000 && mm <= 12 && dd <= 31) {
      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
        2,
        "0"
      )}`;
    }
    if (yyyy > 1000 && dd <= 31 && mm <= 12) {
      return `${yyyy}-${String(dd).padStart(2, "0")}-${String(mm).padStart(
        2,
        "0"
      )}`;
    }
    return input;
  };

  const safeParseDate = (input: string): CalendarDate => {
    const iso = normalizeToISO(input);
    return parseDate(iso);
  };

  useEffect(() => {
    if (project) {
      setProjectCustomer(project.customer);
      setProjectDate(
        typeof project.date === "string"
          ? safeParseDate(project.date)
          : projectDate ?? null
      );
    }
  }, [project]);

  return (
    <>
      <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ← Back
          </button>
        </div>
        <h3 className="text-2xl font-semibold">{projectCustomer}</h3>

        <h1 className="text-lg font-semibold">
          {projectDate ? formatDatetoStr(projectDate) : ""}
        </h1>

        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            <Tabs
              size="lg"
              aria-label="Options"
              placement="top"
              variant="underlined"
            >
              <Tab key="Sales Order" title="Sales Order">
                <SalesOrder project={project} />
              </Tab>
              <Tab key="Documentation" title="Documentation">
                <Documentation project={project} />
              </Tab>
              <Tab key="Project Kick Off" title="Project Kick Off">
                <PreProjectKickOff />
              </Tab>
              <Tab key="Project Validation" title="Project Validation">
                <ProjectValidation />
              </Tab>
              <Tab key="Project Execution" title="Project Execution">
                <ProjectExecution />
              </Tab>
              <Tab key="Project Completion" title="Project Completion">
                <ProjectCompletion />
              </Tab>
              <Tab key="Post Project" title="Post Project">
                <PostProject />
              </Tab>
            </Tabs>
          </div>
          <div className="flex flex-row gap-3.5 flex-wrap"></div>
        </div>
      </div>
    </>
  );
};
