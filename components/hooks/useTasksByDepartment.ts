import { useEffect, useState } from "react";
import { dtTask } from "../../helpers/task";

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
};

function getDepartmentPaths(department: string): string[] {
  return departmentApiMap[department] ?? [];
}

export function useTasksByDepartment(department: string, apiSubPath = "tasks") {
  const [tasks, setTasks] = useState<dtTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!department) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      const paths = getDepartmentPaths(department);

      if (paths.length === 0) {
        setError(`Unknown department: ${department}`);
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        const responses = await Promise.all(
          paths.map(async (path) => {
            const res = await fetch(`/api/department/${path}/${apiSubPath}`);
            if (!res.ok) throw new Error(`Failed to fetch: ${path}`);
            return res.json();
          })
        );

        setTasks(responses.flat());
      } catch (err: any) {
        setError(err.message || "Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [department, apiSubPath]);

  return { tasks, loading, error };
}
