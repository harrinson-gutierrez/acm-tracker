import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";

export interface TodayEntryView {
  id: string;
  time: string;
  origin: string;
  taskCode: string;
  taskTitle: string;
  minutes: number;
  cost: number;
}

export function useTodayEntries() {
  return useQuery({
    queryKey: ["today-entries"],
    queryFn: () => apiClient.get<TodayEntryView[]>("/time-entries/today"),
  });
}
