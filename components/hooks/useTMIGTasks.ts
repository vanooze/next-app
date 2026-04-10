import useSWR from "swr";
import { PMOTasks } from "@/helpers/db";

const fetcher = async (url: string): Promise<PMOTasks[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch PMO tasks");
  return res.json();
};

export function useTMIGTasks() {
  const { data, error, isLoading, mutate } = useSWR<PMOTasks[]>(
    "/api/department/TMIG/tasks",
    fetcher,
  );

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
