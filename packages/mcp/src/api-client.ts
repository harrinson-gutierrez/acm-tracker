const BASE_URL = (process.env.ACM_API_URL ?? "http://localhost:5188").replace(/\/$/, "");

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${method} /api${path} -> ${res.status} ${detail}`.trim());
  }
  return res.json() as Promise<T>;
}

export interface Project {
  id: string;
  name: string;
  client: string | null;
  contractAmount: number | null;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  phase: string | null;
  status: string;
}

export interface AiRunInput {
  model: string;
  agent?: string;
  tokensIn: number;
  tokensOut: number;
}

export interface ReportWorkInput {
  taskId: string;
  memberEmail: string;
  minutes: number;
  output?: string;
  aiRuns?: AiRunInput[];
}

export interface ReportWorkResult {
  recorded: true;
  aiCost: number;
}

export const apiClient = {
  baseUrl: BASE_URL,
  listProjects: () => request<Project[]>("GET", "/projects"),
  listTasks: (projectId: string) => request<Task[]>("GET", `/tasks?projectId=${encodeURIComponent(projectId)}`),
  reportWork: (input: ReportWorkInput) => request<ReportWorkResult>("POST", "/mcp/report-work", input),
};
