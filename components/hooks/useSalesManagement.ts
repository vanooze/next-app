import useSWR from "swr";
import { SalesManagement } from "@/helpers/db";

const fetcher = async (url: string): Promise<SalesManagement[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sales management data");
  const data = await res.json();
  return data;
};

export function useSalesManagement() {
  const { data, error, isLoading, mutate } = useSWR<SalesManagement[]>(
    "/api/department/SALES/sales_management",
    fetcher
  );

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
