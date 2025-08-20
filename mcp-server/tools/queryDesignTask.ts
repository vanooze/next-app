import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseQuery } from "../utils/parseQuery";
import { resolveTaskPeople, personMatches } from "../utils/taskResolver";
import { statusMatches } from "../utils/normalize";

// Define Zod schema for tool input
const queryDesignTaskSchema = {
  input: {
    type: "string",
    description: "Your query string, e.g., 'pending tasks for Jan'",
  },
};

export function registerQueryDesignTaskTool(server: McpServer) {
  server.tool("query-design-task", queryDesignTaskSchema, async (args) => {
    const { input } = args as { input: string }; // cast here

    const parsed = parseQuery(input);
    if (!parsed) {
      return {
        content: [{ type: "text", text: "Could not understand your query." }],
      };
    }

    // Fetch tasks
    const res = await fetch(
      "http://localhost:3000/api/department/ITDT/DT/tasks"
    );
    const json = await res.json();
    const tasks: any[] = Array.isArray(json) ? json : [];

    // Filter
    const { status, person, details } = parsed;
    const statusFiltered = status
      ? tasks.filter((t) => statusMatches(t?.status, status))
      : tasks;
    const matched = statusFiltered.filter((t) =>
      personMatches(resolveTaskPeople(t), person || "")
    );

    const header = `${person || "Someone"} has ${matched.length} ${
      status || "tasks"
    } task(s).`;

    const listLines = matched.map(
      (t, i) =>
        `- [${t?.id ?? "?"}] ${
          t?.projectDesc ?? t?.proj_desc ?? "(no description)"
        } (${t?.client_name ?? "Unknown client"})`
    );

    return {
      content: [
        {
          type: "text",
          text: [header, ...(details ? listLines : listLines)].join("\n"),
        },
      ],
    };
  });
}
