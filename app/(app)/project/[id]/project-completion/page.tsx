"use client";
import ProjectCompletion from "@/components/contents/projectCompletion/project_completion";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function ProjectCompletionPage() {
  const { project } = useProjectContext();
  return <ProjectCompletion project={project} />;
}
