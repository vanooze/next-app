import useSWR from "swr";
import { dtTask } from "@/helpers/db";

const fetcher = async (url: string): Promise<dtTask[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch IT tasks");
  return res.json();
};

export function useMarketingTasks() {
  const { data, error, isLoading, mutate } = useSWR<dtTask[]>(
    "/api/department/MARKETING/tasks",
    fetcher,
  );

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
