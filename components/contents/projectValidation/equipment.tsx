"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import { BoqItem } from "@/helpers/db";
import { useUserContext } from "@/components/layout/UserContext";

interface GroupedItems {
  [category: string]: {
    [subcategory: string]: BoqItem[];
  };
}

interface ContractorsProp {
  project: Projects | null;
}

export default function BoqTable({ project }: ContractorsProp) {
  const { user } = useUserContext();
  const [items, setItems] = useState<BoqItem[]>([]);
  const [projectId] = useState(project?.projectId || "");
  const [grouped, setGrouped] = useState<GroupedItems>({});
  const [loading, setLoading] = useState(false); // for saving
  const [fetching, setFetching] = useState(false); // for initial fetch

  const canAccess =
    user?.department.includes("DESIGN") ||
    user?.designation.includes("TECHNICAL ADMIN CONSULTANT") ||
    user?.designation.includes("TECHNICAL MANAGER") ||
    user?.designation.includes("TMIG SUPERVISOR") ||
    user?.designation.includes("DOCUMENT CONTROLLER");

  // Fetch data
  useEffect(() => {
    const fetchItems = async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `/api/department/PMO/project_tasks/projectkickoff/boq_items?projectId=${projectId}`
        );
        const data = await res.json();
        if (data.success) setItems(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchItems();
  }, [projectId]);

  // Group items by category/subcategory
  useEffect(() => {
    const group: GroupedItems = {};
    items.forEach((item) => {
      const cat = item.category;
      const sub = item.subcategory || "—";
      if (!group[cat]) group[cat] = {};
      if (!group[cat][sub]) group[cat][sub] = [];
      group[cat][sub].push(item);
    });
    setGrouped(group);
  }, [items]);

  const handleChange = (
    itemId: number,
    field: keyof Omit<
      BoqItem,
      "id" | "category" | "subcategory" | "project_id"
    >,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = items.map((item) => ({ ...item, projectId }));
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/boq_items",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) alert("Items saved successfully!");
      else alert("Error saving items: " + data.message);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-gray-500">Loading BOQ items...</p>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, subgroups]) => (
        <div key={category} className="border rounded shadow-sm p-4">
          <h3 className="font-bold text-lg mb-2">{category}</h3>
          {Object.entries(subgroups).map(([subcategory, items]) => (
            <div key={subcategory} className="mb-6">
              <h4 className="font-semibold text-md mb-1">{subcategory}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Brand/Material</th>
                      <th className="border px-2 py-1">Description</th>
                      <th className="border px-2 py-1">Unit</th>
                      <th className="border px-2 py-1">Qty</th>
                      <th className="border px-2 py-1">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="border px-2 py-1">
                          <input
                            className="w-full border rounded px-1 py-0.5"
                            value={item.brand || ""}
                            onChange={(e) =>
                              handleChange(item.id, "brand", e.target.value)
                            }
                            disabled={!canAccess}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input
                            className="w-full border rounded px-1 py-0.5"
                            value={item.description || ""}
                            onChange={(e) =>
                              handleChange(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            disabled={!canAccess}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input
                            className="w-full border rounded px-1 py-0.5"
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
                            className="w-full border rounded px-1 py-0.5"
                            value={item.qty ?? ""}
                            onChange={(e) =>
                              handleChange(
                                item.id,
                                "qty",
                                Number(e.target.value)
                              )
                            }
                            disabled={!canAccess}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input
                            className="w-full border rounded px-1 py-0.5"
                            value={item.remarks || ""}
                            onChange={(e) =>
                              handleChange(item.id, "remarks", e.target.value)
                            }
                            disabled={!canAccess}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div>
        <a
          href="https://avolutioninc.net/eformrnf/drf_form.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm hover:underline mt-2 max-w-lg"
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
