"use client";
import ProjectValidation from "@/components/contents/projectValidation/project_validation";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function ProjectValidationPage() {
  const { project } = useProjectContext();
  return <ProjectValidation project={project} />;
}
