"use client";

import { Input, Select, SelectItem, Button } from "@heroui/react";
import useSWR from "swr";
import { useState, useMemo } from "react";
import {
  RiskRow,
  Likelihood,
  Status,
  Severity,
  Owner,
  likelihoodOptions,
  severityOptions,
  ownerOptions,
  riskLevelScores,
  initialData,
} from "@/helpers/db";
import { useUserContext } from "@/components/layout/UserContext";
import { RISK_MANAGMENT_CAN_UPLOAD_DESIGNATION } from "@/helpers/restriction";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RiskTable({
  projectId,
}: {
  projectId: string | null | undefined;
}) {
  const { user } = useUserContext();
  const canAssign =
    user?.designation &&
    RISK_MANAGMENT_CAN_UPLOAD_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    );

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
    { revalidateOnFocus: false },
  );

  const [saving, setSaving] = useState(false);

  const risks = useMemo(() => {
    if (!dbRisks) return initialData;
    return initialData.map((templateRow) => {
      const match = dbRisks.find((r) => r.riskId === templateRow.riskId);
      return match
        ? { ...templateRow, ...match, status: "Open" as Status }
        : { ...templateRow, status: "Open" as Status };
    });
  }, [dbRisks]);

  const updateField = <K extends keyof RiskRow>(
    id: number,
    field: K,
    value: RiskRow[K],
  ) => {
    if (!canAssign) return;

    const updated: RiskRow[] = risks.map((row) =>
      row.id === id
        ? { ...row, [field]: value, status: "Open" as Status }
        : row,
    );

    mutateRisks(updated, false);
  };

  const handleSave = async () => {
    if (!risks || !projectId || !canAssign) return;
    setSaving(true);
    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/risk_management/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            risks: risks.map((r) => ({ ...r, status: "Open" })), // always Open
          }),
        },
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
    0,
  );

  const totalSScore = risks.reduce(
    (sum, row) =>
      sum +
      (riskLevelScores[row.severity as keyof typeof riskLevelScores] || 0),
    0,
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
              <td className="px-4 py-2">
                <Input
                  isDisabled={!canAssign}
                  className="w-full"
                  value={row.potentialImpact}
                  onChange={(e) =>
                    updateField(row.id, "potentialImpact", e.target.value)
                  }
                />
              </td>
              <td className="px-4 py-2">
                <Select
                  isDisabled={!canAssign}
                  className="w-full"
                  selectedKeys={new Set([row.likelihood])}
                  onSelectionChange={(val) => {
                    const value = Array.from(val)[0] as Likelihood;
                    updateField(row.id, "likelihood", value);
                  }}
                >
                  {likelihoodOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </td>
              <td className="px-4 py-2 text-center">
                {
                  riskLevelScores[
                    row.likelihood as keyof typeof riskLevelScores
                  ]
                }
              </td>
              <td className="px-4 py-2">
                <Select
                  isDisabled={!canAssign}
                  className="w-full"
                  selectedKeys={new Set([row.severity])}
                  onSelectionChange={(val) => {
                    const value = Array.from(val)[0] as Severity;
                    updateField(row.id, "severity", value);
                  }}
                >
                  {severityOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </td>
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
              <td className="px-4 py-2">
                <Input
                  isDisabled={!canAssign}
                  className="w-full"
                  value={row.mitigation}
                  onChange={(e) =>
                    updateField(row.id, "mitigation", e.target.value)
                  }
                />
              </td>
              <td className="px-4 py-2">
                <Select
                  isDisabled={!canAssign}
                  className="w-full"
                  selectedKeys={new Set([row.owner])}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0];
                    if (typeof key === "string")
                      updateField(row.id, "owner", key as Owner);
                  }}
                >
                  {ownerOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </td>
              <td className="px-4 py-2">
                <span>Open</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {canAssign && (
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={saving}
          className="mt-4"
        >
          Save Changes
        </Button>
      )}
    </div>
  );
}
