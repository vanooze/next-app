"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { Spinner } from "@heroui/react";
import { NotesPage } from "@/components/deparments/PMO/project/action/addMessage";
import { Projects } from "@/helpers/acumatica";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectNotesPage() {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR<Projects>(
    id ? `/api/department/PMO/project?id=${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Spinner label="Loading project message..." />
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

  return <NotesPage project={data} />;
}
