import {
  Divider,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
  Button,
} from "@heroui/react";
import { DropZone, DropItem, FileTrigger } from "react-aria-components";
import { selectSales } from "@/helpers/data";
import { ProjectMonitoring } from "@/helpers/db";
import React, { useState } from "react";
import BOQ from "./boq";
import SOW from "./sow";
import PreProjectAgreement from "./pre_project_agreement";
import Conceptual from "./conceptual";

interface DocumentationProps {
  project: ProjectMonitoring | null;
}

function Documentation({ project }: DocumentationProps) {
  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="BOQ" title="BOQ">
          <BOQ project={project} />
        </Tab>
        <Tab key="SOW" title="SOW">
          <SOW project={project} />
        </Tab>
        <Tab key="Conceptual" title="Conceptual">
          <Conceptual project={project} />
        </Tab>
        <Tab key="Pre Project Agreement" title="Pre Project Agreement">
          <PreProjectAgreement project={project} />
        </Tab>
        {/* <Tab key="See All" title="See All">
          <SOSeeAll />
        </Tab> */}
      </Tabs>
    </div>
  );
}

export default Documentation;
