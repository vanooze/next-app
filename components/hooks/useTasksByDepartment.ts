import { useEffect, useState } from "react";
import { dtTask } from "../../helpers/task";

function getDepartmentApiPaths(department: string): string[] {
  const map: Record<string, string[]> = {
    "IT/DT Design Supervisor": ["ITDT/DT"],
    "IT/DT Design": ["ITDT/DT"],
    "IT/DT Programmer": ["ITDT/IT"],
    "IT/DT Technical": ["ITDT/IT"],
    "IT/DT Manager": ["ITDT/DT", "ITDT/IT"],
    "HR": ["HR"],
    "CREATIVES": ["CREATIVES"],
    "ADMIN": ["ADMIN"],
    "ACCOUNTING&INVENTORY": ["ACCOUNTING&INVENTORY"],
    "TSD": ["TSD"],
    "TMG SUPERVISOR": ["TMG"],
    "SALES": ["SALES"],
  };

  return map[department] ?? [];
}

export function useTasksByDepartment(department: string, apiSubPath = "tasks") {
  const [tasks, setTasks] = useState<dtTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const deptPaths = getDepartmentApiPaths(department);

        if (deptPaths.length === 0) {
          throw new Error(`Unknown department: ${department}`);
        }

        // Fetch all dept paths in parallel
        const responses = await Promise.all(
          deptPaths.map((path) =>
            fetch(`/api/department/${path}/${apiSubPath}`).then((res) => {
              if (!res.ok) throw new Error(`Failed on ${path}`);
              return res.json();
            })
          )
        );

        // Combine all results into one array
        const combined = responses.flat();
        setTasks(combined);

      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (department) fetchTasks();
  }, [department, apiSubPath]);

  return { tasks, loading, error };
}
