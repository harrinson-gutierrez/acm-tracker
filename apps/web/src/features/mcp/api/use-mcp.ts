import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";

export interface McpReport {
  id: string;
  time: string;
  agent: string | null;
  person: string;
  task: string;
  minutes: number;
  cost: number;
  aiSummary: string;
}

export function useMcpReports() {
  return useQuery({
    queryKey: ["mcp-reports"],
    queryFn: () => apiClient.get<McpReport[]>("/mcp/reports"),
    refetchInterval: 5000,
  });
}
