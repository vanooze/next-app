"use client";
import Documentation from "@/components/contents/documentation/documentation";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function DocumentationPage() {
  const { project } = useProjectContext();
  return <Documentation project={project} />;
}
