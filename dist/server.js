"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const getDesignTask_1 = require("./tools/getDesignTask");
const server = new mcp_js_1.McpServer({
    name: "mcp-server",
    version: "1.0.0",
    capabilities: { resources: {}, tools: {}, prompts: {} },
});
(0, getDesignTask_1.registerGetDesignTaskTool)(server);
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main();
