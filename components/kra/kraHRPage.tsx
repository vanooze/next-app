"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Select, SelectItem, Button } from "@heroui/react";
import { getDepartmentUsers, SelectUser } from "@/helpers/kra";
import { useUserContext } from "@/components/layout/UserContext";
import { KRATemplateModal } from "./action/selectTemplate";
import { KRAModal } from "./action/createScoreTable";
import { KRATable } from "./table/kraTable";
import { KRACreateTemplateModal } from "./action/createTemplate";
import { ExportKRAModal } from "./action/exportData";

export const KeyResultAreaHRPage = () => {
  const { user } = useUserContext();

  const [selectUsers, setSelectUsers] = useState<SelectUser[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [savedTables, setSavedTables] = useState<
    { id: number; name: string }[]
  >([]);
  const [currentTableIds, setCurrentTableIds] = useState<number[]>([]);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const isHR = user?.department === "HR";
  const canSelectEmployees = useMemo(() => isHR, [isHR]);
  const canManageKRA = useMemo(() => isHR, [isHR]);

  // ✅ Fetch Users
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const users = await getDepartmentUsers();
        setSelectUsers(users);

        // default to self
        setSelectedEmployeeId(user.user_id ? String(user.user_id) : null);

        // set default department (HR only)
        if (isHR && users.length > 0) {
          setSelectedDepartment(users[0].department);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user, isHR]);

  // ✅ Departments List
  const departments = useMemo(() => {
    if (!selectUsers.length) return [];

    return Array.from(new Set(selectUsers.map((u) => u.department))).sort();
  }, [selectUsers]);

  // ✅ Users by Selected Department
  const usersByDepartment = useMemo(() => {
    if (!selectedDepartment) return [];

    return selectUsers
      .filter((u) => u.department === selectedDepartment)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [selectUsers, selectedDepartment]);

  // ✅ Fetch Templates
  useEffect(() => {
    if (!user?.department) return;

    const fetchTemplates = async () => {
      try {
        const res = await fetch(`/api/kra/hr/template`);
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        setSavedTables(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplates();
  }, [user?.department]);

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

        {/* Actions */}
        <div className="flex space-x-2">
          {canManageKRA && (
            <>
              <KRAModal employeeId={selectedEmployeeId} triggerText="Add KRA" />

              <Button color="primary" onPress={() => setIsTemplateOpen(true)}>
                Apply Template
              </Button>

              <Button
                color="secondary"
                onPress={() => setIsCreateTemplateOpen(true)}
                isDisabled={!selectedEmployeeId || currentTableIds.length === 0}
              >
                Create Template
              </Button>
            </>
          )}

          <Button
            color="success"
            onPress={() => setIsExportOpen(true)}
            isDisabled={!selectedEmployeeId}
          >
            Export Excel File
          </Button>
        </div>
      </div>

      {canSelectEmployees && (
        <div className="mb-6 flex gap-4 max-w-xl">
          {/* Department */}
          <Select
            label="Select Department"
            selectedKeys={selectedDepartment ? [selectedDepartment] : []}
            onSelectionChange={(keys) => {
              const dept = Array.from(keys)[0] as string;
              setSelectedDepartment(dept);
              setSelectedEmployeeId(null); // reset user
            }}
          >
            {departments.map((dept) => (
              <SelectItem key={dept}>{dept}</SelectItem>
            ))}
          </Select>

          {/* Employee */}
          <Select
            label="Select Employee"
            selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setSelectedEmployeeId(selected);
            }}
            isDisabled={!selectedDepartment}
          >
            {usersByDepartment.map((u) => (
              <SelectItem key={u.key}>{u.label}</SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Table */}
      <KRATable
        employeeId={selectedEmployeeId}
        kraType="hr"
        onTableIdsChange={setCurrentTableIds}
      />

      {/* Modals */}
      <KRATemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        employeeId={selectedEmployeeId}
        kraType="hr"
        userDepartment={user?.department ?? null}
      />

      <KRACreateTemplateModal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        tableIds={currentTableIds}
        kraType="hr"
        onSaved={() => console.log("Template saved")}
      />

      <ExportKRAModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        employeeId={selectedEmployeeId}
        kraType="hr"
        department={user?.department ?? null}
      />
    </div>
  );
};
