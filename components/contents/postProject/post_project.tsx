import React from "react";
import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import ContractorEvaluation from "./contractors_evaluation";
import ManPowerCount from "./manpower_count";
import ValueEng from "./value_eng";
import PostProjectReview from "./post_project_review";
import NcCapa from "./nccapa";
import AwardingDocuments from "./awarding_docu";
import OverallReport from "./overall_report";
import { useUserContext } from "@/components/layout/UserContext";

interface PostProjectProprs {
  project: Projects | null;
}

function PostProject({ project }: PostProjectProprs) {
  const { user } = useUserContext();

  const ValueEngineeringAccess =
    user?.designation.includes("TECHNICAL MANAGER") ||
    user?.designation.includes("ACCOUNTING SUPERVISOR") ||
    user?.designation.includes("IT SUPERVISOR") ||
    user?.designation.includes("VICE PRESIDENT") ||
    user?.designation.includes("PRESIDENT") ||
    user?.designation?.includes("DOCUMENT CONTROLLER") ||
    user?.designation.includes("TECHNICAL ASSISTANT MANAGER");

  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        {ValueEngineeringAccess && (
          <Tab key="Value Engineering" title="Value Engineering">
            <ValueEng project={project} />
          </Tab>
        )}
        <Tab key="Contractor Evaluation" title="Contractor Evaluation">
          <ContractorEvaluation project={project} />
        </Tab>
        <Tab key="Overall Report" title="Overall Report">
          <OverallReport project={project} />
        </Tab>
        {/* <Tab key="Awarding Documents" title="Awarding Documents">
          <AwardingDocuments project={project} />
        </Tab>
        <Tab key="Final Manpower Count" title="Final Manpower Count">
          <ManPowerCount project={project} />
        </Tab> */}
        <Tab key="Post Project Review" title="Post Project Review">
          <PostProjectReview project={project} />
        </Tab>
        <Tab key="NC/CAPA" title="NC/CAPA">
          <NcCapa project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default PostProject;
