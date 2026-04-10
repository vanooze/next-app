"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import { BoqItem } from "@/helpers/db";
import { useUserContext } from "@/components/layout/UserContext";
import { PROCUREMENT_CAN_UPLOAD_DESIGNATION } from "@/helpers/restriction";

interface ContractorsProp {
  project: Projects | null;
}

export default function Procurement({ project }: ContractorsProp) {
  const { user } = useUserContext();

  const [items, setItems] = useState<BoqItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const projectId = project?.projectId || "";

  const canAccess = Boolean(
    user?.designation &&
    PROCUREMENT_CAN_UPLOAD_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    ),
  );

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

  const handleChange = (
    itemId: number,
    field: "taskId" | "description" | "unit" | "qty" | "date",
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const payload = items.map((item) => ({
        ...item,
        projectId,
      }));

      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/procurement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("Items saved successfully!");
      } else {
        alert("Error saving items: " + data.message);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-gray-500">Loading procurement items...</p>;
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
                  No procurement items found
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">
                  <input
                    className="w-full border rounded px-1"
                    value={item.taskId || ""}
                    onChange={(e) =>
                      handleChange(item.id, "taskId", e.target.value)
                    }
                    disabled
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    className="w-full border rounded px-1"
                    value={item.description || ""}
                    onChange={(e) =>
                      handleChange(item.id, "description", e.target.value)
                    }
                    disabled={!canAccess}
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    className="w-full border rounded px-1"
                    value={item.unit || ""}
                    onChange={(e) =>
                      handleChange(item.id, "unit", e.target.value)
                    }
                    disabled={!canAccess}
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-1"
                    value={item.qty ?? ""}
                    onChange={(e) =>
                      handleChange(item.id, "qty", Number(e.target.value) || 0)
                    }
                    disabled={!canAccess}
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    type="date"
                    className="w-full border rounded px-1"
                    value={item.date || ""}
                    onChange={(e) =>
                      handleChange(item.id, "date", e.target.value)
                    }
                    disabled={!canAccess}
                  />
                </td>
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

      {canAccess && (
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      )}
    </div>
  );
}
