
import { apiClient } from "./client";

export const dashboardApi = {
  get: () => apiClient.get("/dashboard").then((r) => r.data),
};
