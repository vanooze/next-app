"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@heroui/react";
import { SelectUser } from "@/helpers/kra";
import { useUserContext } from "@/components/layout/UserContext";
import { KRATable } from "./table/kraTable";
import { ExportKRAModal } from "./action/exportData";

export const KeyResultAreaPage = () => {
  const { user } = useUserContext();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [savedTables, setSavedTables] = useState<
    { id: number; name: string }[]
  >([]);
  const [currentTableIds, setCurrentTableIds] = useState<number[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    if (!user?.department) return;

    setSelectedEmployeeId(user.user_id ? String(user.user_id) : null);
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`/api/kra/template`);
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        setSavedTables(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplates();
  }, [user?.department, user?.user_id]);

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Key Result Area
          </h1>
          <div className="text-gray-600">
            {user ? (
              <>
                <span className="font-medium">{user.name}</span> |{" "}
                <span>{user.designation || "Unknown Position"}</span> |{" "}
                <span>{user.department || "Unknown Department"}</span>
              </>
            ) : (
              <span>Loading user info...</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button color="success" onPress={() => setIsExportOpen(true)}>
            Export Excel File
          </Button>
        </div>
      </div>

      <KRATable
        employeeId={selectedEmployeeId}
        onTableIdsChange={setCurrentTableIds}
      />

      <ExportKRAModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        employeeId={selectedEmployeeId}
        department={user?.department ?? null}
      />
    </div>
  );
};
