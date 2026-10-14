
import { apiClient } from "./client";


export const resumesApi = {
  list: () => apiClient.get("/resumes").then((r) => r.data),


  get: (id) => apiClient.get(`/resumes/${id}`).then((r) => r.data),

  getVersion: (id, versionId) =>
    apiClient.get(`/resumes/${id}/versions/${versionId}`).then((r) => r.data),

  upload: (file, title) => {
    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);
    return apiClient
      .post("/resumes", fd, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  remove: (id) => apiClient.delete(`/resumes/${id}`).then((r) => r.data),

  analyze: (id, body = {}) =>
    apiClient.post(`/resumes/${id}/analyze`, body).then((r) => r.data),


  analyses: (id) => apiClient.get(`/resumes/${id}/analyses`).then((r) => r.data),


  analysisForVersion: (id, versionId) =>
    apiClient.get(`/resumes/${id}/versions/${versionId}/analysis`).then((r) => r.data),


  rewrite: (id, body) =>
    apiClient.post(`/resumes/${id}/rewrite`, body).then((r) => r.data),

  diff: (id, from, to, mode = "words") =>
    apiClient.get(`/resumes/${id}/diff`, { params: { from, to, mode } }).then((r) => r.data),

};
