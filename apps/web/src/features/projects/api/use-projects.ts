import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project, Task } from "@acm/shared";
import { apiClient } from "../../../lib/api-client";

type ProjectWithTasks = Project & { tasks: Task[] };

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.get<Project[]>("/projects"),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => apiClient.get<ProjectWithTasks>(`/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; client?: string; contractAmount?: number }) =>
      apiClient.post<Project>("/projects", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
