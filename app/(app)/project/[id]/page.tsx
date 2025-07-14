"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { Spinner } from "@heroui/react";
import { ManageProject } from "@/components/deparments/PMO/project/action/manage_project";
import { ProjectMonitoring } from "@/helpers/db";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectPage() {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR<ProjectMonitoring>(
    id ? `/api/department/PMO/project?id=${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Spinner label="Loading project details..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full text-center mt-10 text-red-500">
        Failed to load project details.
      </div>
    );
  }

  return <ManageProject project={data} />;
}
