"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Projects } from "@/helpers/acumatica";
import { Spinner, Checkbox, Button, Input, Divider } from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";

interface ManPowerProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
};

export default function ManPower({ project }: ManPowerProps) {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [dateAssigned, setDateAssigned] = useState<string>("");
  const [assignedLists, setAssignedLists] = useState<
    { date: string; people: Record<string, string[]> }[]
  >([]);

  useEffect(() => {
    if (project) setProjectId(project.projectId);
  }, [project]);

  const canAssign =
    user?.designation?.includes("PMO TL") ||
    user?.designation?.includes("TECHNICAL ASSISTANT MANAGER") ||
    user?.designation?.includes("IT SUPERVISOR") ||
    user?.designation?.includes("TMIG SUPERVISOR") ||
    user?.designation?.includes("TECHNICAL SUPERVISOR") ||
    user?.designation?.includes("DOCUMENT CONTROLLER") ||
    user?.designation?.includes("DESIGN SUPERVISOR");

  const key =
    projectId && dateAssigned
      ? `/api/department/PMO/project_tasks/projectkickoff/manPower?id=${projectId}`
      : null;

  const { data: manPower = [], isLoading } = useSWR(key, fetcher);

  const splitAndNormalize = (str: string) =>
    (str || "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

  const formatted = manPower.length
    ? {
        pic: splitAndNormalize(manPower[0]?.pic),
        pmo: splitAndNormalize(manPower[0]?.pmo),
        technical: splitAndNormalize(manPower[0]?.technical),
        freelance: splitAndNormalize(manPower[0]?.freelance),
      }
    : { pic: [], pmo: [], technical: [], freelance: [] };

  const maxRows = Math.max(
    formatted.pic.length,
    formatted.pmo.length,
    formatted.technical.length,
    formatted.freelance.length
  );

  const handleCheckChange = (key: string, checked: boolean) => {
    setCheckedMap((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSubmit = async () => {
    if (!dateAssigned) {
      alert("Please select a date before submitting.");
      return;
    }

    const selectedNames: Record<string, string[]> = {
      pic: [],
      pmo: [],
      technical: [],
      freelance: [],
    };

    Object.entries(checkedMap).forEach(([key, isChecked]) => {
      if (isChecked) {
        const [rowIndex, col] = key.split("_");
        const name = formatted[col as keyof typeof formatted][Number(rowIndex)];
        if (name) selectedNames[col as keyof typeof selectedNames].push(name);
      }
    });

    const hasSelections = Object.values(selectedNames).some(
      (arr) => arr.length > 0
    );
    if (!hasSelections) {
      alert("Please select at least one person.");
      return;
    }

    const payload = {
      projectId,
      assignedDate: dateAssigned,
      pic: selectedNames.pic.join(", "),
      pmo: selectedNames.pmo.join(", "),
      technical: selectedNames.technical.join(", "),
      freelance: selectedNames.freelance.join(", "),
    };

    const res = await fetch(
      "/api/department/PMO/project_tasks/projectValidation/manpower/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      alert("Manpower assigned successfully!");
      setCheckedMap({});
      refreshAssigned();
    } else {
      alert("Failed to assign manpower.");
    }
  };

  const assignedKey = projectId
    ? `/api/department/PMO/project_tasks/projectValidation/manpower?id=${projectId}`
    : null;

  const { data: assignedData = [], mutate: refreshAssigned } = useSWR(
    assignedKey,
    async (url) => {
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : [];
    }
  );

  useEffect(() => {
    setAssignedLists(assignedData);
  }, [assignedData]);

  return (
    <div className="mt-6">
      {canAssign && (
        <h3 className="text-lg font-semibold mb-2">Allocated Man Power</h3>
      )}
      {canAssign && (
        <div className="mb-4 flex items-center gap-4">
          <Input
            className="max-w-sm"
            type="date"
            label="Assignment Date"
            value={dateAssigned}
            onChange={(e) => setDateAssigned(e.target.value)}
          />
          <Button
            color="primary"
            onClick={handleSubmit}
            isDisabled={!dateAssigned}
          >
            Assign Selected
          </Button>
        </div>
      )}
      {/* Show table only if date is selected */}
      {dateAssigned && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner label="Loading manpower data..." color="primary" />
            </div>
          ) : manPower.length === 0 ? (
            <p className="text-default-500">
              No available personnel to assign.
            </p>
          ) : (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-default-200 text-sm text-left">
                <thead className="bg-default-100 text-default-800">
                  <tr>
                    <th className="px-4 py-2 border-b">Person In Charge</th>
                    <th className="px-4 py-2 border-b">PMO Officer</th>
                    <th className="px-4 py-2 border-b">Technicals</th>
                    <th className="px-4 py-2 border-b">Freelances</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxRows }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-default-50">
                      {["pic", "pmo", "technical", "freelance"].map((col) => {
                        const name =
                          formatted[col as keyof typeof formatted][idx];
                        const key = `${idx}_${col}`;
                        return (
                          <td key={col} className="px-4 py-2 border-b">
                            {name ? (
                              <label className="inline-flex items-center gap-2">
                                <Checkbox
                                  size="sm"
                                  isSelected={checkedMap[key] || false}
                                  onValueChange={(checked) =>
                                    handleCheckChange(key, checked)
                                  }
                                />
                                <span>{name}</span>
                              </label>
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Divider className="my-6" />

      {/* Assigned lists display */}
      {assignedLists.length > 0 && (
        <div className="space-y-4">
          {assignedLists.map((list, idx) => (
            <div
              key={`${list.date}-${idx}`}
              className="border rounded-lg p-4 bg-default-50"
            >
              <h4 className="font-semibold mb-2">Assigned on {list.date}</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>PIC:</strong>
                  <ul>
                    {list.people.pic.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>PMO:</strong>
                  <ul>
                    {list.people.pmo.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Technical:</strong>
                  <ul>
                    {list.people.technical.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Freelance:</strong>
                  <ul>
                    {list.people.freelance.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
