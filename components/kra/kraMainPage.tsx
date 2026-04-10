"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Select, SelectItem, Button, SelectSection } from "@heroui/react";
import { getDepartmentUsers, SelectUser } from "@/helpers/kra";
import { useUserContext } from "@/components/layout/UserContext";
import { KRATemplateModal } from "./action/selectTemplate";
import { KRAModal } from "./action/createScoreTable";
import { KRATable } from "./table/kraTable";
import { KRACreateTemplateModal } from "./action/createTemplate";
import { ExportKRAModal } from "./action/exportData";

export const KeyResultAreaPage = () => {
  const { user } = useUserContext();

  const [selectUsers, setSelectUsers] = useState<SelectUser[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
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
  const isITDT = user?.department === "IT/DT";

  const isManagerOrSupervisor =
    user?.position === "MANAGER" || user?.position === "SUPERVISOR";

  const canSelectEmployees = useMemo(() => {
    return isHR || isITDT || isManagerOrSupervisor;
  }, [isHR, isITDT, isManagerOrSupervisor]);

  const canManageKRA = useMemo(() => {
    return isManagerOrSupervisor;
  }, [isManagerOrSupervisor]);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const users = await getDepartmentUsers();
        setSelectUsers(users);

        if (canSelectEmployees) {
          setSelectedEmployeeId(user.user_id ? String(user.user_id) : null);
        } else {
          setSelectedEmployeeId(user.user_id ? String(user.user_id) : null);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user, canSelectEmployees]);

  const filteredUsers = useMemo(() => {
    if (!selectUsers.length || !user?.department) return [];

    // HR & IT/DT can see everyone
    if (isHR || isITDT) {
      return selectUsers;
    }

    // Manager / Supervisor → only same department
    if (isManagerOrSupervisor) {
      return selectUsers.filter((u) => u.department === user.department);
    }

    // fallback → only self
    return selectUsers.filter((u) => u.key === String(user.user_id));
  }, [selectUsers, user, isHR, isITDT, isManagerOrSupervisor]);

  const groupedUsers = useMemo(() => {
    if (!filteredUsers.length) return {};

    return filteredUsers.reduce((acc: Record<string, SelectUser[]>, user) => {
      if (!acc[user.department]) {
        acc[user.department] = [];
      }

      acc[user.department].push(user);

      return acc;
    }, {});
  }, [filteredUsers]);

  useEffect(() => {
    if (!user?.department) return;

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
        <div className="mb-6 max-w-sm">
          <Select
            label="Select Employee"
            selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setSelectedEmployeeId(selected);
            }}
          >
            {Object.entries(groupedUsers)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([department, users]) => (
                <SelectSection key={department} title={department}>
                  {users
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((u) => (
                      <SelectItem key={u.key}>{u.label}</SelectItem>
                    ))}
                </SelectSection>
              ))}
          </Select>
        </div>
      )}

      <KRATable
        employeeId={selectedEmployeeId}
        onTableIdsChange={setCurrentTableIds}
      />

      <KRATemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        employeeId={selectedEmployeeId}
        userDepartment={user?.department ?? null}
      />

      <KRACreateTemplateModal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        tableIds={currentTableIds}
        onSaved={() => console.log("Template saved")}
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
