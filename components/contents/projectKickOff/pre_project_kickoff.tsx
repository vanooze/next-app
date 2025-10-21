import {
  Divider,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
  Button,
} from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React, { useState } from "react";
import BOQ from "./boq";
import Conceptual from "./conceptual";
import AttendeesMom from "./attendeesMom";
import Procurement from "./procurement";
import Contractors from "./contractors";
import ManPower from "./manPower";
import Budget from "./budget";
import Chart from "./chart";
import RiskManagement from "./riskManagement";
interface PreProjectKickOffProps {
  project: Projects | null;
}

function PreProjectKickOff({ project }: PreProjectKickOffProps) {
  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="List Of Attendees & MOM" title="List Of Attendees & MOM">
          <AttendeesMom project={project} />
        </Tab>
        <Tab key="BOQ" title="Signed BOQ">
          <BOQ project={project} />
        </Tab>
        <Tab key="Conceptual" title="Signed Conceptual">
          <Conceptual project={project} />
        </Tab>
        <Tab key="Procurement" title="Procurement">
          <Procurement project={project} />
        </Tab>
        <Tab key="Contractors (Bidding)" title="Contractors (Bidding)">
          <Contractors project={project} />
        </Tab>
        <Tab key="RiskManagement" title="Risk Management">
          <RiskManagement projectId={project?.projectId} />
        </Tab>
        <Tab key="ManPowerAllocation" title="Man Power Allocation">
          <ManPower project={project} />
        </Tab>
        <Tab key="Budget" title="Budget">
          <Budget project={project} />
        </Tab>
        <Tab key="GanntChart" title="Gannt Chart">
          <Chart project={project} />
        </Tab>
        {/* <Tab key="See All" title="See All">
          <SOSeeAll />
        </Tab> */}
      </Tabs>
    </div>
  );
}

export default PreProjectKickOff;
