import { Divider, Tab, Tabs } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import React from "react";
import SOProjectOrder from "./so_project_order";
import SOTor from "./so_tor";
import SOProposal from "./so_proposal";
import SOProjectTurnOver from "./so_project_turn_over";

interface SalesOrderProps {
  project: Projects | null;
}

function SalesOrder({ project }: SalesOrderProps) {
  return (
    <div>
      <Divider className="mb-4" />
      <Tabs placement="top" variant="solid" size="md">
        <Tab key="PO" title="Project Order">
          <SOProjectOrder project={project} />
        </Tab>
        <Tab key="TOR" title="TOR">
          <SOTor project={project} />
        </Tab>
        <Tab key="Proposal" title="Proposal">
          <SOProposal project={project} />
        </Tab>
        <Tab key="Project Turn Over" title="Project Turn Over">
          <SOProjectTurnOver project={project} />
        </Tab>
        {/* <Tab key="See All" title="See All">
          <SOSeeAll />
        </Tab> */}
      </Tabs>
    </div>
  );
}

export default SalesOrder;
