import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";

export function useInsights() {
  return useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: () => analyticsApi.insights(),
  });
}

export function useAllVersions() {
  return useQuery({
    queryKey: ["analytics", "versions"],
    queryFn: () => analyticsApi.versions(),
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["analytics", "history"],
    queryFn: () => analyticsApi.history(),
  });
}
