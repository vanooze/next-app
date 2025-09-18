"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { Textarea, Checkbox } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";

// 🔹 Map section titles to DB fields
const sectionMap: Record<string, { noteField: string; checkField: string }> = {
  "Down Payment": { noteField: "down_payment", checkField: "dpchecked" },
  PB1: { noteField: "pb1", checkField: "pb1checked" },
  PB2: { noteField: "pb2", checkField: "pb2checked" },
  PB3: { noteField: "pb3", checkField: "pb3checked" },
  Retention: { noteField: "retention", checkField: "retentionchecked" },
};

const sections = Object.keys(sectionMap);

interface AccountingProps {
  project: Projects | null;
}

interface SectionData {
  title: string;
  checked: boolean;
  note: string;
}

export default function Accounting({ project }: AccountingProps) {
  const { user } = useUserContext();

  //
  const canEdit =
    user?.designation?.includes("PMO TL") ||
    user?.designation?.includes("Accounting");

  const [data, setData] = useState<SectionData[]>(
    sections.map((title) => ({ title, checked: false, note: "" }))
  );
  const [loading, setLoading] = useState(true);

  //
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        if (!project?.projectId) return;

        const res = await fetch(
          `/api/department/PMO/project_tasks/projectexecution/accounting/?projectId=${project.projectId}`
        );

        if (!res.ok) throw new Error("Failed to fetch project accounting data");

        const existing = await res.json();

        //
        const mapped = sections.map((title) => {
          const found = existing.find((item: any) => item.section === title);
          return {
            title,
            checked: found ? Boolean(found.checked) : false,
            note: found ? found.note || "" : "",
          };
        });

        setData(mapped);
      } catch (err) {
        console.error("Error loading previous data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExisting();
  }, [project?.projectId]);

  //
  const updateBackend = async (
    title: string,
    field: "checked" | "note",
    value: any
  ) => {
    if (!project?.projectId || !canEdit) return;

    const { noteField, checkField } = sectionMap[title];
    const payload: Record<string, any> = { projectId: project.projectId };

    if (field === "checked") {
      payload[checkField] = value ? 1 : 0;
    } else {
      payload[noteField] = value;
    }

    try {
      await fetch(
        "/api/department/PMO/project_tasks/projectexecution/accounting",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } catch (err) {
      console.error("Error updating backend:", err);
    }
  };

  // 🔹 Handlers
  const handleCheck = (index: number, checked: boolean) => {
    if (!canEdit) return;

    const updated = [...data];
    updated[index].checked = checked;
    setData(updated);

    updateBackend(updated[index].title, "checked", checked);
  };

  const handleNoteChange = (index: number, value: string) => {
    if (!canEdit) return;

    const updated = [...data];
    updated[index].note = value;
    setData(updated);
  };

  const handleSaveNote = (index: number) => {
    if (!canEdit) return;
    updateBackend(data[index].title, "note", data[index].note);
  };

  // 🔹 UI
  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      {data.map((item, index) => (
        <Card key={item.title} className="shadow-md rounded-2xl">
          <CardHeader>
            <Checkbox
              isSelected={item.checked}
              onValueChange={(val) => handleCheck(index, val)}
              isDisabled={!canEdit}
            >
              <span className="font-semibold">{item.title}</span>
            </Checkbox>
          </CardHeader>
          <CardBody>
            <Textarea
              label="Comments"
              placeholder={`Add comments for ${item.title}...`}
              value={item.note}
              onValueChange={(val) => handleNoteChange(index, val)}
              isDisabled={!canEdit}
              className="w-full"
            />
          </CardBody>
          <CardFooter className="flex justify-end">
            {canEdit && (
              <Button
                size="sm"
                color="primary"
                onPress={() => handleSaveNote(index)}
              >
                Save Comment
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
