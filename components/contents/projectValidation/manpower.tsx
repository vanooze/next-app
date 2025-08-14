"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Projects } from "@/helpers/acumatica";
import { Spinner, Checkbox } from "@heroui/react";

interface ManPowerProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
};

export default function ManPower({ project }: ManPowerProps) {
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (project) setProjectId(project.projectId);
  }, [project]);

  const key = projectId
    ? `/api/department/PMO/project_tasks/projectkickoff/manPower?id=${projectId}`
    : null;

  const { data: manPower = [], isLoading } = useSWR(key, fetcher);

  const splitAndNormalize = (str: string) =>
    str
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

  const formatted = manPower.length
    ? {
        pic: splitAndNormalize(manPower[0]?.pic || ""),
        pmo: manPower[0]?.pmo ? [manPower[0].pmo] : [],
        technical: splitAndNormalize(manPower[0]?.technical || ""),
        freelance: splitAndNormalize(manPower[0]?.freelance || ""),
      }
    : { pic: [], pmo: [], technical: [], freelance: [] };

  const maxRows = Math.max(
    formatted.pic.length,
    formatted.pmo.length,
    formatted.technical.length,
    formatted.freelance.length
  );

  // Track checked state per cell: { rowIndex_columnName: true }
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const handleCheckChange = (key: string, checked: boolean) => {
    setCheckedMap((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Allocated Man Power</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner label="Loading manpower data..." color="primary" />
        </div>
      ) : manPower.length === 0 ? (
        <p className="text-default-500">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
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
                    const name = formatted[col as keyof typeof formatted][idx];
                    const key = `${idx}_${col}`;
                    return (
                      <td key={col} className="px-4 py-2 border-b">
                        {name ? (
                          <label className="inline-flex items-center gap-2">
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
    </div>
  );
}
