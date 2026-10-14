
import { apiClient } from "./client";

export const analyticsApi = {
  insights: () => apiClient.get("/insights").then((r) => r.data),


  versions: () => apiClient.get("/versions").then((r) => r.data),


  history: () => apiClient.get("/history").then((r) => r.data),

};
