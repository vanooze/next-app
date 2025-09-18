"use client";

import { useEffect, useState } from "react";
import GanttChart from "@/components/charts/project_gantt";
import { Projects } from "@/helpers/acumatica";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useUserContext } from "@/components/layout/UserContext";

interface ChartProps {
  project: Projects | null;
}

interface Subtask {
  title: string;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
}

interface Group {
  id?: string | number;
  mainTitle: string;
  tasks: Subtask[];
}

type GanttItem = {
  id: number | string;
  parent_id: number | string | null;
  title: string;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  progress: number;
};

export default function Chart({ project }: ChartProps) {
  const [projects, setProjects] = useState<GanttItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useUserContext();

  const openModal = () => {
    if (projects.length > 0) {
      const parents = projects.filter((p) => p.parent_id === null);
      const grouped = parents.map((parent) => {
        const children = projects.filter((p) => p.parent_id === parent.id);
        return {
          id: parent.id,
          mainTitle: parent.title,
          tasks: children.map((child) => ({
            title: child.title,
            start_date: child.start_date,
            end_date: child.end_date,
            actual_start_date: child.actual_start_date || "",
            actual_end_date: child.actual_end_date || "",
          })),
        };
      });
      setGroups(grouped);
    }

    onOpen();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!project?.projectId) return;
      const res = await fetch(
        `/api/department/PMO/project_tasks/projectexecution/gannt?projectId=${project.projectId}`
      );
      const data = await res.json();
      setProjects(data);
    };

    fetchData();
  }, [project]);

  const handleTaskChange = (
    groupIndex: number,
    taskIndex: number,
    field: "actual_start_date" | "actual_end_date",
    value: string
  ) => {
    const updated = [...groups];
    const task = updated[groupIndex].tasks[taskIndex];
    updated[groupIndex].tasks[taskIndex] = { ...task, [field]: value };
    setGroups(updated);
  };

  const handleSubmit = async () => {
    if (!project?.projectId) return;

    const payload: any[] = [];

    groups.forEach((group, index) => {
      const tempId = group.id || `temp-${Date.now()}-${index}`;
      payload.push({
        id: tempId,
        parent_id: null,
        project_id: project.projectId,
        title: group.mainTitle,
        start_date: group.tasks[0]?.start_date || null,
        end_date: group.tasks[group.tasks.length - 1]?.end_date || null,
      });

      group.tasks.forEach((task) => {
        payload.push({
          parent_id: tempId,
          project_id: project.projectId,
          title: task.title,
          start_date: task.start_date,
          end_date: task.end_date,
          actual_start_date: task.actual_start_date || null,
          actual_end_date: task.actual_end_date || null,
        });
      });
    });

    await fetch(
      "/api/department/PMO/project_tasks/projectexecution/gannt/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.projectId,
          data: payload,
        }),
      }
    );

    onClose();
    const res = await fetch(
      `/api/department/PMO/project_tasks/projectexecution/gannt?projectId=${project.projectId}`
    );
    const data = await res.json();
    setProjects(data);
  };

  const canModifyChart = user?.department.includes("PMO");

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Project Gantt Chart (ACTUAL)</h1>

      {canModifyChart && (
        <Button onClick={openModal} className="mb-4">
          Update Actual Dates
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalContent>
          <ModalHeader>Update Actual Dates</ModalHeader>
          <ModalBody className="space-y-6 max-h-[70vh] overflow-y-auto">
            {groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="border border-gray-300 p-4 rounded-lg space-y-4"
              >
                <div className="text-lg font-semibold">{group.mainTitle}</div>

                <div className="space-y-2">
                  {group.tasks.map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <Input
                        placeholder="Subtask Title"
                        value={task.title}
                        isReadOnly
                        className="col-span-3"
                      />
                      <Input
                        type="date"
                        label="Planned Start"
                        value={task.start_date}
                        isDisabled
                        className="col-span-2"
                      />
                      <Input
                        type="date"
                        label="Planned End"
                        value={task.end_date}
                        isDisabled
                        className="col-span-2"
                      />
                      <Input
                        type="date"
                        label="Actual Start"
                        value={task.actual_start_date}
                        onChange={(e) =>
                          handleTaskChange(
                            groupIndex,
                            taskIndex,
                            "actual_start_date",
                            e.target.value
                          )
                        }
                        className="col-span-2"
                      />
                      <Input
                        type="date"
                        label="Actual End"
                        value={task.actual_end_date}
                        onChange={(e) =>
                          handleTaskChange(
                            groupIndex,
                            taskIndex,
                            "actual_end_date",
                            e.target.value
                          )
                        }
                        className="col-span-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Actual Dates</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {projects.length > 0 && <GanttChart project={projects} />}
    </div>
  );
}
