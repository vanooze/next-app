"use client";

import { useEffect, useState } from "react";
import GanttChart from "@/components/charts/gantt";
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
import { PlusIcon } from "@/components/icons/table/add-icon";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { useUserContext } from "@/components/layout/UserContext";

interface ChartProps {
  project: Projects | null;
}

type TaskField = "title" | "start_date" | "end_date";

interface Subtask {
  title: string;
  start_date: string;
  end_date: string;
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
  progress: number;
};

export default function Chart({ project }: ChartProps) {
  const [projects, setProjects] = useState<GanttItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useUserContext();

  const canModifyChart = user?.department.includes("PMO");

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
          })),
        };
      });
      setGroups(grouped);
    } else {
      setGroups([
        {
          mainTitle: "",
          tasks: [{ title: "", start_date: "", end_date: "" }],
        },
      ]);
    }

    onOpen();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!project?.projectId) return;
      const res = await fetch(
        `/api/department/PMO/project_tasks/projectkickoff/chart?projectId=${project.projectId}`
      );
      const data = await res.json();
      setProjects(data);
    };

    fetchData();
  }, [project]);

  const handleGroupTitleChange = (index: number, value: string) => {
    const updated = [...groups];
    updated[index].mainTitle = value;
    setGroups(updated);
  };

  const handleTaskChange = (
    groupIndex: number,
    taskIndex: number,
    field: TaskField,
    value: string
  ) => {
    const updated = [...groups];
    const task = updated[groupIndex].tasks[taskIndex];
    const newTask = { ...task, [field]: value };

    const start = new Date(
      field === "start_date" ? value : newTask.start_date
    ).getTime();
    const end = new Date(
      field === "end_date" ? value : newTask.end_date
    ).getTime();

    if (start && end && start >= end) {
      alert("Start date must be before end date.");
      return;
    }

    const isOverlapping = updated[groupIndex].tasks.some((t, idx) => {
      if (idx === taskIndex) return false;
      const otherStart = new Date(t.start_date).getTime();
      const otherEnd = new Date(t.end_date).getTime();
      return (
        (start >= otherStart && start < otherEnd) ||
        (end > otherStart && end <= otherEnd)
      );
    });

    if (isOverlapping) {
      alert("Date range overlaps with another subtask.");
      return;
    }

    updated[groupIndex].tasks[taskIndex] = newTask;
    setGroups(updated);
  };

  const addSubtask = (groupIndex: number) => {
    const updated = [...groups];
    updated[groupIndex].tasks.push({ title: "", start_date: "", end_date: "" });
    setGroups(updated);
  };

  const addMainGroup = () => {
    setGroups([
      ...groups,
      { mainTitle: "", tasks: [{ title: "", start_date: "", end_date: "" }] },
    ]);
  };

  const deleteSubtask = (groupIndex: number, taskIndex: number) => {
    const updated = [...groups];
    updated[groupIndex].tasks.splice(taskIndex, 1);
    setGroups(updated);
  };

  const deleteGroup = (groupIndex: number) => {
    const updated = [...groups];
    updated.splice(groupIndex, 1);
    setGroups(updated);
  };

  const getGroupDateRange = (tasks: Subtask[]) => {
    const validTasks = tasks.filter((t) => t.start_date && t.end_date);

    if (validTasks.length === 0) return { start: null, end: null };

    const start = validTasks.reduce(
      (min, t) => (new Date(t.start_date) < new Date(min) ? t.start_date : min),
      validTasks[0].start_date
    );

    const end = validTasks.reduce(
      (max, t) => (new Date(t.end_date) > new Date(max) ? t.end_date : max),
      validTasks[0].end_date
    );

    return { start, end };
  };

  const handleSubmit = async () => {
    if (!project?.projectId) return;

    const payload: any[] = [];

    groups.forEach((group, index) => {
      const tempId = group.id || `temp-${Date.now()}-${index}`;
      const { start, end } = getGroupDateRange(group.tasks);

      payload.push({
        id: tempId,
        parent_id: null,
        project_id: project.projectId,
        title: group.mainTitle,
        start_date: start,
        end_date: end,
      });

      group.tasks.forEach((task) => {
        payload.push({
          parent_id: tempId,
          project_id: project.projectId,
          title: task.title,
          start_date: task.start_date,
          end_date: task.end_date,
        });
      });
    });

    await fetch(
      "/api/department/PMO/project_tasks/projectkickoff/chart/create",
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
      `/api/department/PMO/project_tasks/projectkickoff/chart?projectId=${project.projectId}`
    );
    const data = await res.json();
    setProjects(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Project Gantt Chart</h1>

      {canModifyChart && (
        <Button onClick={openModal} className="mb-4">
          {projects.length === 0 ? "Create Gantt Chart" : "Update Gantt Chart"}
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalContent>
          <ModalHeader>
            {projects.length === 0
              ? "Create Gantt Chart"
              : "Update Gantt Chart"}
          </ModalHeader>
          <ModalBody className="space-y-6 max-h-[70vh] overflow-y-auto">
            {groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="border border-gray-300 p-4 rounded-lg space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Input
                    label={`Main Title ${groupIndex + 1}`}
                    value={group.mainTitle}
                    onChange={(e) =>
                      handleGroupTitleChange(groupIndex, e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    color="danger"
                    onClick={() => deleteGroup(groupIndex)}
                  >
                    <DeleteIcon size={20} fill="#FF0080" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {group.tasks.map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <Input
                        placeholder="Subtask Title"
                        value={task.title}
                        onChange={(e) =>
                          handleTaskChange(
                            groupIndex,
                            taskIndex,
                            "title",
                            e.target.value
                          )
                        }
                        className="col-span-4"
                      />
                      <Input
                        type="date"
                        value={task.start_date}
                        onChange={(e) =>
                          handleTaskChange(
                            groupIndex,
                            taskIndex,
                            "start_date",
                            e.target.value
                          )
                        }
                        className="col-span-3"
                      />
                      <Input
                        type="date"
                        value={task.end_date}
                        onChange={(e) =>
                          handleTaskChange(
                            groupIndex,
                            taskIndex,
                            "end_date",
                            e.target.value
                          )
                        }
                        className="col-span-3"
                      />
                      <Button
                        variant="ghost"
                        color="danger"
                        onClick={() => deleteSubtask(groupIndex, taskIndex)}
                        className="col-span-2"
                      >
                        <DeleteIcon size={20} fill="#FF0080" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => addSubtask(groupIndex)}
                  className="mt-2"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Subtask
                </Button>
              </div>
            ))}

            <Button variant="ghost" onClick={addMainGroup}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Main Title
            </Button>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {projects.length > 0 && <GanttChart project={projects} />}
    </div>
  );
}
