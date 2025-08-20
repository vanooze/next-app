import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/* =========================
   Constants & Mappings
========================= */
const SIR_ME = "Sir ME";

const SBOQ_MAP = {
  "M.GIGANTE": "Marcial",
  "J.CAMERO": "Jan",
  "B.TOPACIO": "Billy",
} as const;

const EBOQ_MAP = {
  "J.COLA": "JER",
  "J.ARDINEL": "Jil",
} as const;

const FRIENDLY_CANON = {
  marcial: "Marcial",
  jan: "Jan",
  billy: "Billy",
  jer: "JER",
  jil: "Jil",
  "sir me": SIR_ME,
  sirme: SIR_ME,
} as const;

const STATUSES = [
  "Priority",
  "Overdue",
  "Pending",
  "OnHold",
  "Finished",
] as const;

/* =========================
   Normalization Helpers
========================= */
const normNoSpace = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();
const normCode = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();
const splitCodes = (field: unknown): string[] =>
  String(field ?? "")
    .split(/[,/&|;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normCode);

const SBOQ_MAP_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(SBOQ_MAP).map(([k, v]) => [normCode(k), v])
);

const EBOQ_MAP_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(EBOQ_MAP).map(([k, v]) => [normCode(k), v])
);

const statusMatches = (a: unknown, b: unknown) =>
  normNoSpace(a) === normNoSpace(b);

/* =========================
   Task Resolution
========================= */
function resolveTaskPeople(task: any): string[] {
  const people: string[] = [];
  const hasEboq = !!String(task?.systemDiagram ?? "").trim();
  const hasEboqDate = !!task?.eBoqDate;
  const hasSboq = !!String(task?.structuralBoq ?? "").trim();
  const hasSboqDate = !!task?.sBoqDate;
  const hasSirME = !!task?.sirME;

  if (hasEboq && hasEboqDate) {
    people.push(
      ...splitCodes(task.systemDiagram)
        .map(
          (code) =>
            EBOQ_MAP_NORM[normCode(code)] ?? SBOQ_MAP_NORM[normCode(code)]
        )
        .filter(Boolean)
    );
  }

  if (hasEboq && hasEboqDate && hasSboq && hasSboqDate) {
    people.push(
      ...splitCodes(task.structuralBoq)
        .map(
          (code) =>
            SBOQ_MAP_NORM[normCode(code)] ?? EBOQ_MAP_NORM[normCode(code)]
        )
        .filter(Boolean)
    );
  }

  if (hasEboq && hasEboqDate && hasSboq && hasSboqDate && hasSirME) {
    people.push(SIR_ME);
  }

  return people;
}

function personMatches(resolved: string[], target: string): boolean {
  if (!target) return true;
  return resolved.some((p) => normNoSpace(p) === normNoSpace(target));
}

/* =========================
   Natural Language Parser
========================= */
function parseQuery(query: string) {
  const statusRegex = new RegExp(STATUSES.join("|"), "i");
  const statusMatch = query.match(statusRegex);

  const personRegex = new RegExp(Object.values(FRIENDLY_CANON).join("|"), "i");
  const personMatch = query.match(personRegex);

  return {
    status: statusMatch ? statusMatch[0] : undefined, // optional
    person: personMatch ? personMatch[0] : undefined, // optional
    details: /detail/i.test(query),
  };
}

/* =========================
   MCP Server & Tool
========================= */
const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
  capabilities: { resources: {}, tools: {}, prompts: {} },
});

import { z } from "zod";

const queryDesignTaskSchema = {
  input: z.string(),
};

server.tool(
  "get-design-task",
  queryDesignTaskSchema,
  async ({ input }: { input: string }) => {
    const parsed = parseQuery(input);
    if (!parsed) {
      return {
        content: [{ type: "text", text: "Could not understand your query." }],
      };
    }

    const person = parsed.person
      ? FRIENDLY_CANON[
          parsed.person.toLowerCase() as keyof typeof FRIENDLY_CANON
        ]
      : undefined;
    const status = parsed.status;
    const details = parsed.details;

    const res = await fetch(
      "http://localhost:3000/api/department/ITDT/DT/tasks"
    );
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();

    // Normalize the task array
    const tasks: any[] = Array.isArray(json)
      ? json
      : json?.tasks ?? json?.data ?? [];

    // First filter by status if provided
    const statusFiltered = status
      ? tasks.filter((t) => {
          const match = statusMatches(t.status, status);
          return match;
        })
      : tasks;

    // Then filter by person if provided
    const matched = statusFiltered.filter((t) => {
      const resolvedPeople = resolveTaskPeople(t);
      const personMatch = person ? personMatches(resolvedPeople, person) : true;
      return personMatch;
    });

    const header = person
      ? `${status || "Tasks"} under "${person}": ${matched.length}`
      : `${status || "Tasks"}: ${matched.length}`;

    const listLines = matched.map(
      (t) =>
        `- [${t.id ?? "?"}] ${t.projectDesc ?? "(no description)"} (${
          t.systemDiagram ?? "?"
        } → ${resolveTaskPeople(t).join(", ")})`
    );

    return {
      content: [
        {
          type: "text",
          text: [header, ...(details ? listLines : listLines)].join("\n"),
        },
      ],
      structuredContent: {
        person,
        status,
        count: matched.length,
        tasks: matched,
      },
    };
  }
);

/* =========================
   Entrypoint
========================= */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
