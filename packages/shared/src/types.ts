export type EntryOrigin = "manual" | "mcp"; // mcp reserved for phase 2

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  ratePerHour: number; // USD/hour
  authProviderUserId: string | null; // null until a real auth provider links it
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string | null;
  contractAmount: number | null; // USD, nullable for internal projects
  status: "active" | "paused" | "done";
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  code: string; // e.g. "T-142"
  title: string;
  phase: string | null; // optional lifecycle label
  status: "todo" | "in_progress" | "review" | "done";
  estimateMinutes: number | null;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  memberId: string;
  origin: EntryOrigin;
  minutes: number;
  billable: boolean;
  ratePerHourSnapshot: number; // rate captured at entry time
  note: string | null;
  startedAt: string;
  createdAt: string;
}

export interface ModelPrice {
  id: string;
  provider: string;
  model: string;
  inputPer1M: number;
  outputPer1M: number;
  createdAt: string;
}

export interface AiUsage {
  model: string;
  tokensIn: number;
  tokensOut: number;
}

export interface CostBreakdown {
  human: number;
  ai: number;
  total: number;
}

export interface PersonCost {
  memberId: string;
  name: string;
  minutes: number;
  human: number;
  ai: number;
  total: number;
}

export interface WeeklyCost {
  week: string;
  human: number;
  ai: number;
}
