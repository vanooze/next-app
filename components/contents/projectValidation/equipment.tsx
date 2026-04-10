"use client";

import { useEffect, useState } from "react";
import { Projects } from "@/helpers/acumatica";
import { BoqItem } from "@/helpers/db";

interface ContractorsProp {
  project: Projects | null;
}

export default function BoqTable({ project }: ContractorsProp) {
  const [items, setItems] = useState<BoqItem[]>([]);
  const [fetching, setFetching] = useState(false);

  const projectId = project?.projectId || "";

  useEffect(() => {
    const fetchItems = async () => {
      if (!projectId) return;

      setFetching(true);

      try {
        const res = await fetch(
          `/api/department/PMO/project_tasks/projectkickoff/procurement?projectId=${projectId}`,
        );

        const data = await res.json();

        if (data.success) {
          setItems(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [projectId]);

  if (fetching) {
    return <p className="text-gray-500">Loading BOQ items...</p>;
  }

  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border px-2 py-1">Task ID</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Unit</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">Date</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  No BOQ items found
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{item.taskId || "-"}</td>

                <td className="border px-2 py-1">{item.description || "-"}</td>

                <td className="border px-2 py-1">{item.unit || "-"}</td>

                <td className="border px-2 py-1">{item.qty ?? "-"}</td>

                <td className="border px-2 py-1">{item.date || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <a
          href="https://avolutioninc.net/eformrnf/drf_form.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 max-w-lg"
        >
          DRIF Filing
        </a>
      </div>
    </div>
  );
}
