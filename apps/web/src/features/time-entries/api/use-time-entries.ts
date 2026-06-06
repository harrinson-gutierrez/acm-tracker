import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CostSummary, TimeEntry } from "@acm/shared";
import { apiClient } from "../../../lib/api-client";

export function useTaskCost(taskId: string) {
  return useQuery({
    queryKey: ["task-cost", taskId],
    queryFn: () => apiClient.get<CostSummary>(`/time-entries/task/${taskId}/cost`),
    enabled: Boolean(taskId),
  });
}

export function useCreateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { taskId: string; minutes: number; billable?: boolean; note?: string }) =>
      apiClient.post<TimeEntry>("/time-entries", dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["task-cost", variables.taskId] });
    },
  });
}
