#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { apiClient } from "./api-client.js";

const OWNER_EMAIL = process.env.ACM_OWNER_EMAIL ?? "owner@acm.local";

const server = new McpServer({
  name: "acm-tracker",
  version: "0.1.0",
});

server.registerTool(
  "list_projects",
  {
    title: "List projects",
    description:
      "List ACM-TRACKER projects (id, name, client, contract amount). Use this to find the project a task belongs to before reporting work.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const projects = await apiClient.listProjects();
    return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] };
  },
);

server.registerTool(
  "list_tasks",
  {
    title: "List tasks of a project",
    description:
      "List the tasks of a project (id, code, title, phase, status). Use the task id with report_work. Call list_projects first to get the projectId.",
    inputSchema: {
      projectId: z.string().describe("The project id (from list_projects)."),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ projectId }) => {
    const tasks = await apiClient.listTasks(projectId);
    return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
  },
);

server.registerTool(
  "report_work",
  {
    title: "Report work on a task",
    description:
      "Report time and AI usage spent on a task to ACM-TRACKER. The server computes the real AI cost (tokens × model price) and records a time entry under the task. Call list_tasks to get the taskId. Report minutes of human time and, if an AI model did work, one aiRuns entry per model with its token counts.",
    inputSchema: {
      taskId: z.string().describe("The task id (from list_tasks)."),
      minutes: z.number().int().min(0).describe("Minutes of work to record on the task."),
      output: z
        .string()
        .optional()
        .describe("Short note on what was produced (e.g. 'PR #318 · preToken lambda')."),
      aiRuns: z
        .array(
          z.object({
            model: z.string().describe("Model id, e.g. 'claude-opus-4-8'."),
            agent: z.string().optional().describe("Agent name that ran the model, optional."),
            tokensIn: z.number().int().min(0).describe("Input tokens consumed."),
            tokensOut: z.number().int().min(0).describe("Output tokens produced."),
          }),
        )
        .optional()
        .describe("One entry per model used. Omit if no AI was involved."),
    },
  },
  async ({ taskId, minutes, output, aiRuns }) => {
    const result = await apiClient.reportWork({
      taskId,
      memberEmail: OWNER_EMAIL,
      minutes,
      output,
      aiRuns,
    });
    return {
      content: [
        {
          type: "text",
          text: `Recorded ${minutes} min on task ${taskId}. AI cost: $${result.aiCost.toFixed(2)}.`,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`acm-tracker MCP server connected (API: ${apiClient.baseUrl})\n`);
}

main().catch((error) => {
  process.stderr.write(`acm-tracker MCP server failed: ${error}\n`);
  process.exit(1);
});
