"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Projects } from "@/helpers/acumatica";
import { Spinner, Divider } from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";

interface ManPowerProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
};

export default function ManPower({ project }: ManPowerProps) {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [assignedLists, setAssignedLists] = useState<
    { date: string; people: Record<string, string[]> }[]
  >([]);

  useEffect(() => {
    if (project) setProjectId(project.projectId);
  }, [project]);

  const assignedKey = projectId
    ? `/api/department/PMO/project_tasks/projectValidation/manpower?id=${projectId}`
    : null;

  const { data: assignedData = [], isLoading } = useSWR(assignedKey, fetcher);

  useEffect(() => {
    setAssignedLists(assignedData);
  }, [assignedData]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Allocated Man Power</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner label="Loading manpower data..." color="primary" />
        </div>
      ) : assignedLists.length === 0 ? (
        <p className="text-default-500">No manpower has been assigned yet.</p>
      ) : (
        <div className="space-y-6">
          {assignedLists.map((list, idx) => (
            <div
              key={`${list.date}-${idx}`}
              className="border rounded-lg p-4 bg-default-50"
            >
              <h4 className="font-semibold mb-3">Assigned on {list.date}</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>PIC:</strong>
                  <ul>
                    {list.people.pic?.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>PMO:</strong>
                  <ul>
                    {list.people.pmo?.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Technical:</strong>
                  <ul>
                    {list.people.technical?.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Freelance:</strong>
                  <ul>
                    {list.people.freelance?.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Divider className="my-6" />
    </div>
  );
}
