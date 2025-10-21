"use client";
import PostProject from "@/components/contents/postProject/post_project";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function PostProjectPage() {
  const { project } = useProjectContext();
  return <PostProject project={project} />;
}
