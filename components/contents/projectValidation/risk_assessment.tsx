"use client";

import { Input, Select, SelectItem, Button } from "@heroui/react";
import useSWR from "swr";
import { useState, useMemo } from "react";
import {
  RiskRow,
  Likelihood,
  Severity,
  Status,
  Owner,
  likelihoodOptions,
  severityOptions,
  statusOptions,
  ownerOptions,
  riskLevelScores,
  initialData, // import your template rows
} from "@/helpers/db";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RiskAssessmentTable({
  projectId,
}: {
  projectId: string | null | undefined;
}) {
  const {
    data: dbRisks,
    isLoading,
    error,
    mutate: mutateRisks,
  } = useSWR<RiskRow[]>(
    projectId
      ? `/api/department/PMO/project_tasks/projectkickoff/risk_management?id=${projectId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [saving, setSaving] = useState(false);

  const risks = useMemo(() => {
    if (!dbRisks) return initialData;
    return initialData.map((templateRow) => {
      const match = dbRisks.find((r) => r.riskId === templateRow.riskId);
      return match ? { ...templateRow, ...match } : templateRow;
    });
  }, [dbRisks]);

  const updateField = <K extends keyof RiskRow>(
    id: number,
    field: K,
    value: RiskRow[K]
  ) => {
    const updated = risks.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    mutateRisks(updated, false);
  };

  const handleSave = async () => {
    if (!risks || !projectId) return;
    setSaving(true);
    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/risk_management/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            risks,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save risks");
      mutateRisks();
    } catch (err) {
      console.error(err);
      alert("Error saving risks");
    } finally {
      setSaving(false);
    }
  };

  const totalLScore = risks.reduce(
    (sum, row) =>
      sum +
      (riskLevelScores[row.likelihood as keyof typeof riskLevelScores] || 0),
    0
  );

  const totalSScore = risks.reduce(
    (sum, row) =>
      sum +
      (riskLevelScores[row.severity as keyof typeof riskLevelScores] || 0),
    0
  );

  if (isLoading) return <p>Loading risks...</p>;
  if (error) return <p>Error loading risks</p>;

  return (
    <div className="overflow-x-auto space-y-4">
      <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th className="w-[100px] px-4 py-2">Risk ID</th>
            <th className="w-[180px] px-4 py-2">Description</th>
            <th className="w-[200px] px-4 py-2">Potential Impact</th>
            <th className="w-[150px] px-4 py-2">Likelihood</th>
            <th className="w-[80px] px-4 py-2">L Score ({totalLScore})</th>
            <th className="w-[150px] px-4 py-2">Severity</th>
            <th className="w-[80px] px-4 py-2">S Score ({totalSScore})</th>
            <th className="w-[80px] px-4 py-2">Total</th>
            <th className="w-[140px] px-4 py-2">ISO Clause</th>
            <th className="w-[200px] px-4 py-2">Mitigation</th>
            <th className="w-[160px] px-4 py-2">Owner</th>
            <th className="w-[160px] px-4 py-2">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {risks.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-2">{row.riskId}</td>
              <td className="px-4 py-2">{row.description}</td>
              <td className="px-4 py-2">{row.potentialImpact}</td>
              <td className="px-4 py-2">{row.likelihood}</td>
              <td className="px-4 py-2 text-center">
                {
                  riskLevelScores[
                    row.likelihood as keyof typeof riskLevelScores
                  ]
                }
              </td>
              <td className="px-4 py-2">{row.severity}</td>
              <td className="px-4 py-2 text-center">
                {riskLevelScores[row.severity as keyof typeof riskLevelScores]}
              </td>
              <td className="px-4 py-2 text-center">
                {riskLevelScores[
                  row.likelihood as keyof typeof riskLevelScores
                ] +
                  riskLevelScores[row.severity as keyof typeof riskLevelScores]}
              </td>
              <td className="px-4 py-2">{row.isoClause}</td>
              <td className="px-4 py-2">{row.mitigation}</td>
              <td className="px-4 py-2">{row.owner}</td>
              <td className="px-4 py-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        color="primary"
        onPress={handleSave}
        isLoading={saving}
        className="mt-4"
      >
        Save Changes
      </Button>
    </div>
  );
}
