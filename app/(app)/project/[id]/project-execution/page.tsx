"use client";
import ProjectExecution from "@/components/contents/projectExecution/project_execution";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function ProjectExecutionPage() {
  const { project } = useProjectContext();
  return <ProjectExecution project={project} />;
}
