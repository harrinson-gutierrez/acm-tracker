import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";

export interface ActiveTimer {
  taskId: string;
  taskCode: string;
  taskTitle: string;
  projectName: string;
  ratePerHour: number;
  startedAt: string;
}

function invalidateTimerQueries(qc: QueryClient) {
  for (const key of ["active-timer", "today-summary", "team-today", "today-entries", "cost-by-person", "weekly-cost", "project-cost", "project-entries", "project-team", "task-cost"]) {
    qc.invalidateQueries({ queryKey: [key] });
  }
}

export function useActiveTimer() {
  return useQuery({
    queryKey: ["active-timer"],
    queryFn: () => apiClient.get<ActiveTimer | null>("/timer/active"),
    refetchInterval: 30_000,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.post<ActiveTimer>("/timer/start", { taskId }),
    onSuccess: () => invalidateTimerQueries(qc),
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<unknown>("/timer/stop", {}),
    onSuccess: () => invalidateTimerQueries(qc),
  });
}
