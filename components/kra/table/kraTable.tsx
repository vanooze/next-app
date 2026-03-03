"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
} from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";
import { CreateScore } from "../action/createScore";
import { ApproveScore } from "../action/approvedScore";

interface KRARecord {
  id: number;
  dept: string;
  created_by: string;
  date: string;
  kra: string;
  kpi: string;
  achievement: string;
  weight: string;
  excellent: string;
  very_good: string;
  good: string;
  need_improvements: string;
  poor: string;
  rating?: string;
  points?: number;
  total?: number;
  approved_by?: string | null;
  approved_at?: string | null;
}

interface KRATableProps {
  employeeId?: string | null;
  onTableIdsChange?: (ids: number[]) => void; // new prop
}

export const KRATable: React.FC<KRATableProps> = ({
  employeeId,
  onTableIdsChange,
}) => {
  const { user } = useUserContext();
  const currentDate = new Date();
  const [data, setData] = useState<KRARecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [openScore, setOpenScore] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [openApprove, setOpenApprove] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const fetchData = useCallback(
    async (empId?: string | null) => {
      if (!empId) {
        setData([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/kra?employeeId=${empId}&month=${selectedMonth}&year=${selectedYear}`,
        );
        if (!res.ok) throw new Error("Failed to fetch KRA");

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedMonth, selectedYear],
  );

  useEffect(() => {
    fetchData(employeeId);
  }, [employeeId, selectedMonth, selectedYear, fetchData]);

  useEffect(() => {
    if (onTableIdsChange) {
      const ids = data.map((row) => row.id);
      onTableIdsChange(ids);
    }
  }, [data, onTableIdsChange]);

  // useEffect(() => {
  //   fetchData();
  //   const interval = setInterval(fetchData, 12000);
  //   return () => clearInterval(interval);
  // }, [employeeId]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this KRA?")) return;

    try {
      const res = await fetch(`/api/kra/${id}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Delete failed");

      setData((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete row");
    }
  };

  const displayValue = (value: string | undefined | null) =>
    value && value.trim() !== "" ? value : " - ";

  const ratingLabelMap: Record<string, string> = {
    excellent: "Excellent",
    very_good: "Very Good",
    good: "Good",
    needs_improvement: "Needs Improvement",
    poor: "Poor",
  };

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (!years.includes(selectedYear)) {
    years.push(selectedYear);
    years.sort();
  }

  const isManagerOrSupervisor =
    user?.position === "MANAGER" || user?.position === "SUPERVISOR";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">KRA Records</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-col gap-1.5 max-w-[12rem]">
          <label className="text-sm font-medium text-slate-600">
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const monthNumber = i + 1;
              const monthLabel = new Date(0, i).toLocaleString("default", {
                month: "long",
              });
              return (
                <option key={monthNumber} value={monthNumber}>
                  {monthLabel}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 max-w-[8rem]">
          <label className="text-sm font-medium text-slate-600">
            Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <Table aria-label="KRA table">
          <TableHeader>
            <TableColumn>KRA</TableColumn>
            <TableColumn>KPI</TableColumn>
            <TableColumn>Achievement</TableColumn>
            <TableColumn>Weight</TableColumn>
            <TableColumn>Excellent</TableColumn>
            <TableColumn>Very Good</TableColumn>
            <TableColumn>Good</TableColumn>
            <TableColumn>Need Improvement</TableColumn>
            <TableColumn>Poor</TableColumn>
            <TableColumn>Rating</TableColumn>
            <TableColumn>Points</TableColumn>
            <TableColumn>Total</TableColumn>
            <TableColumn>Add Score</TableColumn>
            <TableColumn>{isManagerOrSupervisor ? "Delete" : null}</TableColumn>
          </TableHeader>

          <TableBody emptyContent="No KRA records found">
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{displayValue(row.kra)}</TableCell>
                <TableCell>{displayValue(row.kpi)}</TableCell>
                <TableCell>{displayValue(row.achievement)}</TableCell>
                <TableCell>{displayValue(row.weight)}</TableCell>
                <TableCell>{displayValue(row.excellent)}</TableCell>
                <TableCell>{displayValue(row.very_good)}</TableCell>
                <TableCell>{displayValue(row.good)}</TableCell>
                <TableCell>{displayValue(row.need_improvements)}</TableCell>
                <TableCell>{displayValue(row.poor)}</TableCell>
                <TableCell>
                  {row.rating ? ratingLabelMap[row.rating] : "-"}
                </TableCell>

                <TableCell>{row.points ?? "-"}</TableCell>
                <TableCell>{row.total ?? "-"}</TableCell>
                <TableCell>
                  {row.approved_by || row.approved_at ? (
                    <Button size="sm" color="success" isDisabled>
                      Approved
                    </Button>
                  ) : row.rating ? (
                    isManagerOrSupervisor ? (
                      <Button
                        size="sm"
                        color="success"
                        onPress={() => {
                          setSelectedId(row.id);
                          setOpenApprove(true);
                        }}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button size="sm" color="default" isDisabled>
                        Pending
                      </Button>
                    )
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => {
                        setSelectedId(row.id);
                        setOpenScore(true);
                        setSelectedWeight(row.weight);
                      }}
                    >
                      Add Score
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {isManagerOrSupervisor && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isDisabled={!!row.approved_by || !!row.approved_at}
                      onPress={() => handleDelete(row.id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <CreateScore
        isOpen={openScore}
        onClose={() => setOpenScore(false)}
        tableId={selectedId}
        userId={user?.user_id ?? null}
        weight={selectedWeight}
        month={selectedMonth}
        year={selectedYear}
        onSaved={() => fetchData(employeeId)}
      />

      <ApproveScore
        isOpen={openApprove}
        onClose={() => setOpenApprove(false)}
        tableId={selectedId}
        month={selectedMonth}
        year={selectedYear}
        onApproved={() => fetchData(employeeId)}
      />
    </div>
  );
};
