"use client";
import {
  Tabs,
  Tab,
  Select,
  SelectItem,
  CalendarDate,
  SelectSection,
  Button,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import React, { useState, useEffect, useRef } from "react";
import { ProjectMonitoring } from "@/helpers/db";
import { formatDatetoStr } from "@/helpers/formatDate";
import { useUserContext } from "@/components/layout/UserContext";
import { useRouter } from "next/navigation";
import SalesOrder from "@/components/contents/SO/sales_order";
import Documentation from "@/components/contents/documentation/documentation";
import PreProjectKickOff from "@/components/contents/projectKickOff/pre_project_kickoff";
import ProjectValidation from "@/components/contents/projectValidation/project_validation";
import ProjectExecution from "@/components/contents/projectExecution/project_execution";
import ProjectCompletion from "@/components/contents/projectCompletion/project_completion";
import PostProject from "@/components/contents/postProject/post_project";
import {
  selectDesign,
  selectPmo,
  selectPurchasing,
  selectSales,
} from "@/helpers/data";

interface ManageProjectProps {
  project: ProjectMonitoring | null;
}

export const ManageProject = ({ project }: ManageProjectProps) => {
  const { user, loading } = useUserContext();
  const router = useRouter();
  const [projectCustomer, setProjectCustomer] = useState("");
  const [projectDate, setProjectDate] = useState<CalendarDate | null>(null);
  const [accessUsers, setAccessUsers] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const handleAddAccess = async () => {
    if (!project?.idkey || accessUsers.size === 0) {
      alert("Please select at least one user to grant access.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/department/PMO/project/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.idkey,
          accessList: Array.from(accessUsers),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update access");
      }

      alert("Access updated successfully.");
    } catch (error) {
      console.error("Error updating access:", error);
      alert("Failed to update access.");
    } finally {
      setIsSaving(false);
    }
  };

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

  const headingClasses =
    "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small";

  const canAssign =
    user?.designation.includes("PMO TL") ||
    user?.designation.includes("DOCUMENT CONTROLLER");

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
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded"
          >
            ← Back
          </button>
        </div>
        <h3 className="text-2xl font-semibold">{projectCustomer}</h3>

        <h1 className="text-lg font-semibold">
          {projectDate ? formatDatetoStr(projectDate) : ""}
        </h1>

        {canAssign && (
          <div className="max-w-md p-1">
            <h2 className="text-md font-semibold p-1">
              Assign project access to:
            </h2>
            <Select
              selectionMode="multiple"
              items={selectPmo}
              label="give access to this project to: "
              placeholder="Select users who can access this project"
              variant="bordered"
              selectedKeys={accessUsers}
              onSelectionChange={(keys) => {
                if (keys !== "all") {
                  setAccessUsers(keys as Set<string>);
                } else {
                  setAccessUsers(new Set(selectPmo.map((item) => item.key)));
                }
              }}
            >
              <SelectSection
                classNames={{ heading: headingClasses }}
                title="PMO"
              >
                {selectPmo.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </SelectSection>
              <SelectSection
                classNames={{ heading: headingClasses }}
                title="Sales"
              >
                {selectSales.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </SelectSection>
              <SelectSection
                classNames={{ heading: headingClasses }}
                title="Design"
              >
                {selectDesign.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </SelectSection>
              <SelectSection
                classNames={{ heading: headingClasses }}
                title="Purchasing"
              >
                {selectPurchasing.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </SelectSection>
            </Select>
            <p className="text-small text-default-500 p-1">
              Selected people: {Array.from(accessUsers).join(" | ")}
            </p>
            <Button
              color="primary"
              className="max-w-lg mt-2"
              isDisabled={accessUsers.size === 0 || !project?.idkey}
              isLoading={isSaving}
              onPress={handleAddAccess}
            >
              {isSaving ? "Saving..." : "Submit"}
            </Button>
          </div>
        )}

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
                <PreProjectKickOff project={project} />
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
