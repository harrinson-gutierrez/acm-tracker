import { useQuery } from "@tanstack/react-query";
import type { PersonCost, WeeklyCost } from "@acm/shared";
import { apiClient } from "../../../lib/api-client";

interface ProjectCost {
  human: number;
  ai: number;
  total: number;
  minutes: number;
  estimateHours: number | null;
  projectRate: number | null;
  estimatedCost: number | null;
  revenue: number | null;
  margin: number | null;
  marginPerHour: number | null;
}

export function useProjectCost(projectId: string) {
  return useQuery({
    queryKey: ["project-cost", projectId],
    queryFn: () => apiClient.get<ProjectCost>(`/projects/${projectId}/cost`),
    enabled: Boolean(projectId),
  });
}

export function useCostByPerson() {
  return useQuery({
    queryKey: ["cost-by-person"],
    queryFn: () => apiClient.get<PersonCost[]>("/reports/by-person"),
  });
}

export function useProjectTeam(projectId: string) {
  return useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => apiClient.get<PersonCost[]>(`/reports/by-person?projectId=${projectId}`),
    enabled: Boolean(projectId),
  });
}

export function useWeeklyCost() {
  return useQuery({
    queryKey: ["weekly-cost"],
    queryFn: () => apiClient.get<WeeklyCost[]>("/reports/weekly"),
  });
}
