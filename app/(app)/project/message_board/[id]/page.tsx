"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { Spinner } from "@heroui/react";
import { NotesPage } from "@/components/deparments/PMO/project/action/addMessage";
import { Projects } from "@/helpers/acumatica";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch project");
  }
  return res.json();
};

export default function ProjectNotesPage() {
  const params = useParams();

  // ✅ normalize id (Next.js can return string | string[])
  const projectId =
    typeof params?.id === "string" ? params.id : params?.id?.[0];

  const {
    data: project,
    error,
    isLoading,
  } = useSWR<Projects>(
    projectId
      ? `/api/department/PMO/project?id=${encodeURIComponent(projectId)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Spinner label="Loading project messages..." />
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error || !project) {
    return (
      <div className="w-full text-center mt-10">
        <p className="text-red-500 font-medium">
          Failed to load project details.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please refresh the page or contact PMO.
        </p>
      </div>
    );
  }

  /* ---------------- SUCCESS ---------------- */
  return <NotesPage project={project} />;
}
