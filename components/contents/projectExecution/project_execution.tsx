import React from "react";
import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import Reports from "./reports";
import Chart from "./project_chart";
import ManPower from "./manpower_delegation";
import Accounting from "./accounting";

interface ProjectExecutionProps {
  project: Projects | null;
}
function ProjectExecution({ project }: ProjectExecutionProps) {
  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="ManPower Delegation" title="Manpower Delegation">
          <ManPower project={project} />
        </Tab>
        <Tab key="Reporting" title="Reporting">
          <Reports project={project} />
        </Tab>
        <Tab key="Gannt Chart" title="Gannt Chart">
          <Chart project={project} />
        </Tab>
        <Tab key="Contractors Billing" title="Contractors Billing">
          <Accounting project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default ProjectExecution;
