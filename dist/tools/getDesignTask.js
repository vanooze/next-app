"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGetDesignTaskTool = void 0;
const getDesignTaskSchema_1 = require("../schemas/getDesignTaskSchema");
const taskResolver_1 = require("../utils/taskResolver");
const normalize_1 = require("../utils/normalize");
function registerGetDesignTaskTool(server) {
    server.tool("get-design-task", getDesignTaskSchema_1.getDesignTaskSchema, async ({ status, person, details, debug, trace }) => {
        const res = await fetch("http://localhost:3000/api/department/ITDT/DT/tasks");
        if (!res.ok) {
            return {
                content: [{ type: "text", text: `API error ${res.status}` }],
                isError: true,
            };
        }
        const json = await res.json();
        const tasks = Array.isArray(json)
            ? json
            : json?.tasks ?? json?.data ?? [];
        if (!Array.isArray(tasks)) {
            return {
                content: [{ type: "text", text: "Tasks response not an array" }],
                isError: true,
            };
        }
        const statusFiltered = status
            ? tasks.filter((t) => (0, normalize_1.statusMatches)(t?.status, status))
            : tasks;
        const matched = statusFiltered.filter((t) => (0, taskResolver_1.personMatches)((0, taskResolver_1.resolveTaskPeople)(t), person));
        const traced = trace
            ? statusFiltered.map((t) => ({
                id: t?.id ?? null,
                projectDesc: t?.projectDesc ?? t?.proj_desc ?? null,
                clientName: t?.client_name ?? null,
                rawStatus: t?.status ?? null,
                resolvedPeople: (0, taskResolver_1.resolveTaskPeople)(t),
                includesPerson: (0, taskResolver_1.personMatches)((0, taskResolver_1.resolveTaskPeople)(t), person),
            }))
            : [];
        const header = `${person} has ${matched.length} ${status} task(s).`;
        const listLines = matched.map((t, i) => {
            const id = t?.id ?? "?";
            const title = t?.projectDesc ?? t?.proj_desc ?? "(no description)";
            const client = t?.clientName ?? t?.client_name ?? "Unknown client";
            if (details) {
                return `#${i + 1} [${id}] ${title}
   • Client: ${client}
   • Status: ${t?.status}
   • SBOQ: ${t?.sboq ?? "N/A"}
   • EBOQ: ${t?.eboq ?? "N/A"}
   • SirME: ${t?.sir_me ? "Yes" : "No"}
   • Dates: SBOQ=${t?.sboq_date || "N/A"}, EBOQ=${t?.eboq_date || "N/A"}`;
            }
            return `- [${id}] ${title} (${client})`;
        });
        const debugBlock = debug
            ? `\n\n— DEBUG —\nWanted status=${status}\nAfter status filter=${statusFiltered.length}\nMatched after person filter=${matched.length}`
            : "";
        const traceBlock = trace
            ? `\n\n— TRACE —\n${traced
                .map((r, i) => `#${i + 1} [${r.id ?? "?"}] ${r.projectDesc}
   • client=${r.clientName}
   • rawStatus=${r.rawStatus}
   • resolvedPeople=${JSON.stringify(r.resolvedPeople)}
   • includesPerson(${person})=${r.includesPerson}`)
                .join("\n")}`
            : "";
        return {
            content: [
                {
                    type: "text",
                    text: [
                        header,
                        ...(listLines.length ? ["", ...listLines] : []),
                        debugBlock,
                        traceBlock,
                    ].join("\n"),
                },
            ],
            structuredContent: {
                person,
                status,
                count: matched.length,
                tasks: matched,
                ...(trace ? { trace: traced } : {}),
            },
        };
    });
}
exports.registerGetDesignTaskTool = registerGetDesignTaskTool;
