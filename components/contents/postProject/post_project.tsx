import React from "react";
import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import ContractorEvaluation from "./contractors_evaluation";
import ManPowerCount from "./manpower_count";
import ValueEng from "./value_eng";
import PostProjectReview from "./post_project_review";

interface PostProjectProprs {
  project: Projects | null;
}

function PostProject({ project }: PostProjectProprs) {
  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="Value Engineer" title="Value Engineer">
          <ValueEng project={project} />
        </Tab>
        <Tab key="Contractor Evaluation" title="Contractor Evaluation">
          <ContractorEvaluation project={project} />
        </Tab>
        <Tab key="Final Manpower Count" title="Final Manpower Count">
          <ManPowerCount project={project} />
        </Tab>
        <Tab key="Post Project Review" title="Post Project Review">
          <PostProjectReview project={project} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default PostProject;
