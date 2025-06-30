import {
  Button,
  Checkbox,
  Divider,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { GridList, GridListItem, Text } from "react-aria-components";
import {
  CalendarDate,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import { DatePicker } from "@heroui/date-picker";
import { Select, SelectSection, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useEffect, useState, useRef } from "react";
import {
  selectTMIG,
  selectDesign,
  selectPmo,
  selectSales,
} from "@/helpers/data";
import { ProjectMonitoring } from "@/helpers/db";
import { useListData } from "react-stately";

interface AddTasksProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProjectMonitoring | null;
}

export const AddTask = ({ isOpen, onClose, task }: AddTasksProps) => {
  const [project, setProject] = useState<any[]>([]);
  const [taskId, setTasksId] = useState<number>();
  const [soId, setSoId] = useState<number>();
  const [clientName, setClientName] = useState<string>("");
  const [projectDate, setProjectDate] = useState<CalendarDate | null>(null);
  const [taskTodo, setTaskTodo] = useState<string>("");
  const [dateFilled, setDatefilled] = useState<CalendarDate | null>(null);
  const [dateStart, setDateStart] = useState<CalendarDate | null>(null);
  const [dateEnd, setDateEnd] = useState<CalendarDate | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState<number>();
  const [pmoOffcer, setPmoOfficer] = useState<string>("");
  const [donePending, setDonePending] = useState<string>("");
  const [doneDate, setDoneDate] = useState<CalendarDate | null>(null);
  const [positionOrder, setPositionOrder] = useState<number>();
  const projectDateStr = formatDatetoStr(projectDate);
  const headingClasses =
    "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small";
  let defaultDate = today(getLocalTimeZone());
  const targetRef = useRef(null);

  const safeParseDate = (input: string): CalendarDate => {
    const isoString = normalizeToISO(input);
    return parseDate(isoString);
  };

  const normalizeToISO = (input: string): string => {
    if (!input) return "";

    const parts = input.split("T")[0].split(/[-\/]/);
    if (parts.length !== 3) return input;

    if (Number(parts[0]) <= 12 && Number(parts[1]) <= 31) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    if (Number(parts[1]) <= 12 && Number(parts[0]) <= 31) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return input;
  };

  useEffect(() => {
    if (task) {
      setSoId(task.idkey);
      setClientName(task.customer ?? "");
      setProjectDate(
        typeof task.date === "string"
          ? safeParseDate(task.date)
          : task.date ?? null
      );
      setPmoOfficer(task.contactPerson);
    }
  }, [task]);

  const handleAddTask = async (onClose: () => void) => {
    const dateFilledStr = formatDatetoStr(defaultDate);
    const dateStartStr = formatDatetoStr(dateStart);
    const dateEndStr = formatDatetoStr(dateEnd);
    const doneDateStr = formatDatetoStr(doneDate);
    const list = useListData({
      initialItems: project.sort(
        (a, b) => (a.positionOrder ?? 0) - (b.positionOrder ?? 0)
      ),
      getKey: (item) => item.id,
    });

    const payload = {
      soId,
      taskTodo,
      dateFilled: dateFilledStr,
      dateStart: dateStartStr,
      dateEnd: dateEndStr,
      notes,
      type,
      status,
      pmoOffcer,
      donePending,
      doneDate: doneDateStr,
      positionOrder,
    };

    try {
      const res = await fetch("/api/department/PMO/project_tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create a task");
      }

      const data = await res.json();

      await mutate("/api/department/PMO/project_tasks");

      onClose();
    } catch (err) {
      console.error("Create Task Error:", err);
    }
  };

  useEffect(() => {
    if (!soId) return;

    const fetchProjectTasks = async () => {
      const res = await fetch(`/api/department/PMO/project_tasks?soId=${soId}`);
      const data = await res.json();
      setProject(data);
    };

    fetchProjectTasks();
  }, [soId]);

  console.log(project);

  return (
    <div>
      <>
        <Modal
          ref={targetRef}
          isOpen={isOpen}
          size="5xl"
          onOpenChange={onClose}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="w-full flex flex-col gap-1">
                  <span>{clientName}</span>
                  <span>{projectDateStr}</span>
                </ModalHeader>
                <ModalBody className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      className=""
                      label="Title"
                      variant="bordered"
                      value={taskTodo}
                      onValueChange={setTaskTodo}
                    />
                    <DatePicker
                      label="Date Start"
                      variant="bordered"
                      value={dateStart}
                      onChange={setDateStart}
                    />
                    <Input
                      className=""
                      label="Notes"
                      variant="bordered"
                      value={notes}
                      onValueChange={setNotes}
                    />
                    <DatePicker
                      label="Date End"
                      variant="bordered"
                      value={dateEnd}
                      onChange={setDateEnd}
                    />
                    <Select
                      className="col-span-2"
                      label="Designate task into:"
                      placeholder="Designate task into:"
                      variant="bordered"
                      scrollShadowProps={{ isEnabled: false }}
                    >
                      <SelectSection
                        classNames={{ heading: headingClasses }}
                        title="TMIG"
                      >
                        {selectTMIG.map((item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                      </SelectSection>
                      <SelectSection
                        classNames={{ heading: headingClasses }}
                        title="Sales"
                      >
                        {selectSales.map((item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                      </SelectSection>
                      <SelectSection
                        classNames={{ heading: headingClasses }}
                        title="PMO"
                      >
                        {selectPmo.map((item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                      </SelectSection>
                      <SelectSection
                        classNames={{ heading: headingClasses }}
                        title="Design"
                      >
                        {selectDesign.map((item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                      </SelectSection>
                    </Select>
                    <Button
                      className="col-end-3 mt-4"
                      color="primary"
                      onPress={() => handleAddTask(onClose)}
                    >
                      Add Task
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <Divider orientation="vertical" />
                    <Listbox aria-label="Tasks for this project">
                      {project.length === 0 ? (
                        <ListboxItem key="none">No tasks yet</ListboxItem>
                      ) : (
                        project.map((task) => (
                          <ListboxItem key={task.taskKey}>
                            <Checkbox
                              isSelected={task.donePending === "1"}
                              onValueChange={async (val) => {
                                const newValue = val ? "1" : "0";

                                try {
                                  const res = await fetch(
                                    `/api/department/PMO/project_tasks/update_status`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        donePending: newValue,
                                        id: task.taskKey,
                                      }),
                                    }
                                  );

                                  if (!res.ok) {
                                    throw new Error(
                                      "Failed to update task status"
                                    );
                                  }

                                  const updated = project.map((proj) =>
                                    proj.taskKey === task.taskKey
                                      ? { ...proj, donePending: newValue }
                                      : proj
                                  );

                                  setProject(updated);
                                  mutate(
                                    `/api/department/PMO/project_tasks?soId=${soId}`
                                  );
                                } catch (err) {
                                  console.error(
                                    "Failed to update donePending",
                                    err
                                  );
                                }
                              }}
                            >
                              {task.taskTodo} : {task.pmoOfficer}
                            </Checkbox>
                          </ListboxItem>
                        ))
                      )}
                    </Listbox>
                  </div>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    </div>
  );
};
