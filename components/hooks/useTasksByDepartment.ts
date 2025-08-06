import { useEffect, useState } from "react";
import useSWR from "swr";
import { dtTask } from "../../helpers/db";

const departmentApiMap: Record<string, string[]> = {
  "IT/DT Design Supervisor": ["ITDT/DT"],
  "IT/DT Design": ["ITDT/DT"],
  "IT/DT Programmer": ["ITDT/IT"],
  "IT/DT Technical": ["ITDT/IT"],
  "IT/DT Manager": ["ITDT/DT", "ITDT/IT"],
  HR: ["HR"],
  CREATIVES: ["CREATIVES"],
  ADMIN: ["ADMIN"],
  "ACCOUNTING&INVENTORY": ["ACCOUNTING&INVENTORY"],
  TSD: ["TSD"],
  "TMG SUPERVISOR": ["TMG"],
  SALES: ["SALES"],
  PMO: ["PMO"],
};

function getDepartmentPaths(department: string): string[] {
  return departmentApiMap[department] ?? [];
}

const fetchTasks = async (
  paths: string[],
  apiSubPath: string
): Promise<dtTask[]> => {
  const results = await Promise.all(
    paths.map(async (path) => {
      const res = await fetch(`/api/department/${path}/${apiSubPath}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${path}`);
      return res.json();
    })
  );
  return results.flat();
};

export function useTasksByDepartment(department: string, apiSubPath = "tasks") {
  const paths = getDepartmentPaths(department);
  const shouldFetch = !!department && paths.length > 0;

  const { data, error, isLoading, mutate } = useSWR<dtTask[]>(
    shouldFetch ? [`tasks`, department, apiSubPath] : null,
    () => fetchTasks(paths, apiSubPath),
    {
      refreshInterval: 1200000, // optional: auto-refresh every 2 mins
      revalidateOnFocus: true, // revalidate on tab focus
    }
  );

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
