import { useQuery } from "@tanstack/react-query";
import type { Member } from "@acm/shared";
import { apiClient } from "../../../lib/api-client";

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: () => apiClient.get<Member[]>("/members"),
  });
}
