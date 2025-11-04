import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";
import {
  Button,
  Divider,
  Select,
  SelectItem,
  SelectSection,
  Textarea,
  Spinner,
} from "@heroui/react";
import {
  selectDesign,
  selectPmo,
  selectProgrammer,
  selectTechnical,
  selectTMIG,
} from "@/helpers/data";

interface ManPowerProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
};

export default function ManPower({ project }: ManPowerProps) {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>("");
  const [personInCharge, setPersonInCharge] = useState<Set<string>>(new Set());
  const [technicals, setTechnicals] = useState<Set<string>>(new Set());
  const [pmoOfficers, setPmoOfficers] = useState("");
  const [freelances, setFreelances] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) setProjectId(project.projectId);
  }, [project]);

  const canAssign =
    user?.designation?.includes("PMO TL") ||
    user?.restriction === "9" ||
    user?.designation?.includes("DOCUMENT CONTROLLER") ||
    user?.designation?.includes("TMIG SUPERVISOR");

  const headingClasses =
    "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small";

  const key = projectId
    ? `/api/department/PMO/project_tasks/projectkickoff/manPower?id=${projectId}`
    : null;

  const {
    data: manPower = [],
    error,
    isLoading,
    mutate,
  } = useSWR(key, fetcher);

  useEffect(() => {
    if (manPower.length > 0) {
      const firstEntry = manPower[0];
      setPersonInCharge(
        new Set((firstEntry.pic || "").split(", ").filter(Boolean))
      );
      setPmoOfficers(firstEntry.pmo || "");
      setTechnicals(
        new Set((firstEntry.technical || "").split(", ").filter(Boolean))
      );
      setFreelances(firstEntry.freelance || "");
    }
  }, [manPower]);

  const handleAddManPower = async () => {
    if (!projectId) return;
    setSaving(true);

    const payload = {
      projectId,
      personInCharge: Array.from(personInCharge).join(", "),
      pmoOfficers,
      technicals: Array.from(technicals).join(", "),
      freelances,
    };

    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/manPower/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to Allocate Man Power");

      const data = await res.json();
      console.log("Man Power Allocated:", data);

      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {canAssign && (
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Select
              label="Person In Charge"
              selectionMode="multiple"
              placeholder="Select a PIC for this project"
              variant="bordered"
              items={selectPmo}
              scrollShadowProps={{ isEnabled: false }}
              selectedKeys={personInCharge}
              onSelectionChange={(keys) => {
                setPersonInCharge(
                  keys === "all"
                    ? new Set(selectPmo.map((item) => item.key))
                    : (keys as Set<string>)
                );
              }}
            >
              {[
                { title: "PMO", data: selectPmo },
                { title: "Technical", data: selectTMIG },
              ].map(({ title, data }) => (
                <SelectSection
                  key={title}
                  classNames={{ heading: headingClasses }}
                  title={title}
                >
                  {data.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </SelectSection>
              ))}
            </Select>
            <p className="text-small text-default-500 p-1">
              Selected: {Array.from(personInCharge).join(" | ")}
            </p>
          </div>

          <div>
            <Select
              label="Add PMO Officer"
              placeholder="Select PMO"
              variant="bordered"
              items={selectPmo}
              scrollShadowProps={{ isEnabled: false }}
              selectedKeys={new Set([pmoOfficers])}
              onSelectionChange={(keys) =>
                setPmoOfficers(Array.from(keys)[0] as string)
              }
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>

          <div>
            <Select
              selectionMode="multiple"
              items={selectTMIG}
              label="Add Technicals"
              placeholder="Select Technical"
              variant="bordered"
              selectedKeys={technicals}
              onSelectionChange={(keys) => {
                setTechnicals(
                  keys === "all"
                    ? new Set(selectTMIG.map((item) => item.key))
                    : (keys as Set<string>)
                );
              }}
            >
              {[
                { title: "Design", data: selectDesign },
                { title: "Technical", data: selectTechnical },
                { title: "Programmer", data: selectProgrammer },
                { title: "TMIG", data: selectTMIG },
              ].map(({ title, data }) => (
                <SelectSection
                  key={title}
                  classNames={{ heading: headingClasses }}
                  title={title}
                >
                  {data.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </SelectSection>
              ))}
            </Select>
            <p className="text-small text-default-500 p-1">
              Selected: {Array.from(technicals).join(" | ")}
            </p>
          </div>

          <div>
            <Textarea
              label="Freelances"
              labelPlacement="inside"
              placeholder="Enter names"
              value={freelances}
              maxRows={3}
              variant="bordered"
              isClearable
              onValueChange={setFreelances}
            />
            <p className="text-default-500 text-small">
              Freelances: {freelances}
            </p>
          </div>
        </div>
      )}

      {canAssign && (
        <Button
          color="primary"
          className="max-w-lg mt-2"
          isDisabled={!project?.projectId}
          isLoading={saving}
          onPress={handleAddManPower}
        >
          {saving ? "Saving..." : "Submit"}
        </Button>
      )}

      <Divider className="m-4" />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Allocated Man Power</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner label="Loading manpower data..." color="primary" />
          </div>
        ) : manPower.length === 0 ? (
          <p className="text-default-500">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-default-200 text-sm text-left">
              <thead className="bg-default-100 text-default-800">
                <tr>
                  <th className="px-4 py-2 border-b">Person In Charge</th>
                  <th className="px-4 py-2 border-b">PMO Officer</th>
                  <th className="px-4 py-2 border-b">Technicals</th>
                  <th className="px-4 py-2 border-b">Freelances</th>
                </tr>
              </thead>
              <tbody>
                {manPower.map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-default-50">
                    <td className="px-4 py-2 border-b">{row.pic || "-"}</td>
                    <td className="px-4 py-2 border-b">{row.pmo || "-"}</td>
                    <td className="px-4 py-2 border-b">
                      {row.technical || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {row.freelance || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
