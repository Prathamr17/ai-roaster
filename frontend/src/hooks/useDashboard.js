import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";

export const dashboardKey = ["dashboard"];

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: () => dashboardApi.get(),
  });
}
