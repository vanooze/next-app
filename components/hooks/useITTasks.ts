import useSWR from "swr";
import { dtTask } from "@/helpers/db";

const fetcher = async (url: string): Promise<dtTask[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch IT tasks");
  return res.json();
};

export function useITTasks() {
  const { data, error, isLoading, mutate } = useSWR<dtTask[]>(
    "/api/department/ITDT/IT/tasks",
    fetcher,
  );

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
