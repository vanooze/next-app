"use client";
import PreProjectKickOff from "@/components/contents/projectKickOff/pre_project_kickoff";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function PreProjectKickOffPage() {
  const { project } = useProjectContext();
  return <PreProjectKickOff project={project} />;
}
