import { useEffect, useState } from "react";
import { dtTask } from "../table/task";

function normalizedDepartment(deparment:string): string {
  const map: Record<string,string> = {
    "IT/DT Programmer": "DT",
    "IT/DT Technical" : "DT",
    "IT/DT Manager": "DT",
    "HR": "HR",
    "CREATIVES": "CREATIVES",
    "ADMIN": "ADMIN",
    "ACCOUNTING&INVENTORY": "ACCOUNTING&INVENTORY",
    "TSD" : "TSD",
    "TMG SUPERVISOR" : "TMG",
    "SALES" : "SALES",
  }

  return map[deparment];
}

export function useTasksByDepartment(department: string) {
  const [tasks, setTasks] = useState<dtTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const normalizedDept = normalizedDepartment(department)
        const res = await fetch(`/api/${normalizedDept}/tasks`);
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await res.json();
        setTasks(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (department) fetchTasks();
  }, [department]);

  return { tasks, loading, error };
}
