import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React from "react";
import Budget from "./budget";
import ManPower from "./manpower";
import Plans from "./plans";
import Equipment from "./equipment";
import Contractors from "./contractors";
import RiskAssessmentTable from "./risk_assessment";

interface ProjectValidationProps {
  project: Projects | null;
}
function ProjectValidation({ project }: ProjectValidationProps) {
  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="plans" title="Plans">
          <Plans project={project} />
        </Tab>
        <Tab key="equipment" title="Equipment">
          <Equipment project={project} />
        </Tab>
        <Tab key="contractors" title="Contractors">
          <Contractors project={project} />
        </Tab>
        <Tab key="riskAssessment" title="Risk Assessment">
          <RiskAssessmentTable projectId={project?.projectId} />
        </Tab>
        <Tab key="manPower" title="Man Power">
          <ManPower project={project} />
        </Tab>
        <Tab key="budget" title="Budget">
          <Budget project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default ProjectValidation;
