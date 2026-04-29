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

export const KeyResultAreaDeptPage = () => {
  const { user } = useUserContext();

  const [selectUsers, setSelectUsers] = useState<SelectUser[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [kraType, setKraType] = useState<"employee" | "department" | "hr">(
    "employee",
  );
  const [savedTables, setSavedTables] = useState<
    { id: number; name: string }[]
  >([]);
  const [currentTableIds, setCurrentTableIds] = useState<number[]>([]);

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // ✅ Roles (NO HR)
  const isITDT = user?.department === "IT/DT";

  const isManagerOrSupervisor =
    user?.position === "MANAGER" || user?.position === "SUPERVISOR";

  const canSelectEmployees = useMemo(() => {
    return isITDT || isManagerOrSupervisor;
  }, [isITDT, isManagerOrSupervisor]);

  const canManageKRA = useMemo(() => {
    return isManagerOrSupervisor;
  }, [isManagerOrSupervisor]);

  // ✅ Fetch Users
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const users = await getDepartmentUsers();
        setSelectUsers(users);

        setSelectedEmployeeId(user.user_id ? String(user.user_id) : null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user]);

  // ✅ Filter Users
  const filteredUsers = useMemo(() => {
    if (!selectUsers.length || !user?.department) return [];

    // IT/DT → all users
    if (isITDT) {
      return selectUsers;
    }

    // Manager / Supervisor → same department
    if (isManagerOrSupervisor) {
      return selectUsers.filter((u) => u.department === user.department);
    }

    // Others → self only
    return selectUsers.filter((u) => u.key === String(user.user_id));
  }, [selectUsers, user, isITDT, isManagerOrSupervisor]);

  // ✅ Fetch Templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        let endpoint = "/api/kra/template";

        if (kraType === "department") {
          endpoint = "/api/kra/dept/template";
        }

        if (kraType === "hr") {
          endpoint = "/api/kra/hr/template";
        }

        const res = await fetch(endpoint);

        if (!res.ok) throw new Error("Failed to fetch templates");

        const data = await res.json();
        setSavedTables(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplates();
  }, [kraType]);

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
              <KRAModal
                employeeId={selectedEmployeeId}
                kraType={kraType}
                triggerText="Add KRA"
              />

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

      {/* ✅ Employee + KRA Type */}
      <div className="mb-6 flex gap-4 max-w-md">
        {/* Employee Select */}
        <Select
          label="Select Employee"
          selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setSelectedEmployeeId(selected);
          }}
          isDisabled={!canSelectEmployees}
        >
          {filteredUsers.map((u) => (
            <SelectItem key={u.key}>{u.label}</SelectItem>
          ))}
        </Select>

        {/* KRA Type */}
        <Select
          label="KRA Type"
          selectedKeys={[kraType]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as "employee" | "department";
            setKraType(value);
          }}
        >
          <SelectItem key="employee">Employee KRA</SelectItem>
          <SelectItem key="department">Department KRA</SelectItem>
        </Select>
      </div>

      {/* Table */}
      <KRATable
        employeeId={selectedEmployeeId}
        kraType={kraType}
        onTableIdsChange={setCurrentTableIds}
      />

      {/* Modals */}
      <KRATemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        employeeId={selectedEmployeeId}
        kraType={kraType}
        userDepartment={user?.department ?? null}
      />

      <KRACreateTemplateModal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        tableIds={currentTableIds}
        kraType={kraType}
        onSaved={() => console.log("Template saved")}
      />

      <ExportKRAModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        employeeId={selectedEmployeeId}
        kraType={kraType}
        department={user?.department ?? null}
      />
    </div>
  );
};
