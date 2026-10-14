import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumesApi } from "@/api/resumes";
import { dashboardKey } from "@/hooks/useDashboard";
import { useToast } from "@/context/UIContext";

export const resumeKeys = {
  all: ["resumes"],
  list: () => [...resumeKeys.all, "list"],
  detail: (id) => [...resumeKeys.all, "detail", id],
  analyses: (id) => [...resumeKeys.all, "analyses", id],
  versionAnalysis: (id, versionId) => [...resumeKeys.all, "analysis", id, versionId],
};

export function useResumesList() {
  return useQuery({
    queryKey: resumeKeys.list(),
    queryFn: () => resumesApi.list().then((d) => d.resumes),
  });
}

export function useResume(id) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => resumesApi.get(id),
    enabled: !!id,
  });
}

export function useFullVersion(id, versionId) {
  return useQuery({
    queryKey: ["resumes", "fullVersion", id, versionId],
    queryFn: () => resumesApi.getVersion(id, versionId).then((d) => d.version),
    enabled: !!id && !!versionId,
  });
}

export function useAnalysisForVersion(id, versionId) {
  return useQuery({
    queryKey: resumeKeys.versionAnalysis(id, versionId),
    queryFn: () => resumesApi.analysisForVersion(id, versionId).then((d) => d.analysis),
    enabled: !!id && !!versionId,
    retry: false,
  });
}

export function useAnalyses(id) {
  return useQuery({
    queryKey: resumeKeys.analyses(id),
    queryFn: () => resumesApi.analyses(id).then((d) => d.analyses),
    enabled: !!id,
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ file, title }) => resumesApi.upload(file, title),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
      qc.invalidateQueries({ queryKey: dashboardKey });
      toast.success(
        "Resume uploaded",
        `${data?.resume?.title || "Resume"} · parsed and ready as V1`
      );
    },
    onError: (e) => toast.error("Upload failed", e?.message),
  });
}

export function useAnalyzeResume(id) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => resumesApi.analyze(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.analyses(id) });
      qc.invalidateQueries({ queryKey: dashboardKey });
      if (data?.analysis?.versionId) {
        qc.invalidateQueries({
          queryKey: resumeKeys.versionAnalysis(id, data.analysis.versionId),
        });
      }
      toast.success(
        "Analysis complete",
        `ATS score ${data?.analysis?.atsScore ?? "—"} / 100`
      );
    },
    onError: (e) => toast.error("Analysis failed", e?.message),
  });
}

export function useApplyRewrites(id) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => resumesApi.rewrite(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
      qc.invalidateQueries({ queryKey: dashboardKey });
      toast.success(
        `${data?.appliedCount || ""} bullet${
          data?.appliedCount === 1 ? "" : "s"
        } applied`.trim(),
        `${data?.version?.label || "New version"} created`
      );
    },
    onError: (e) => toast.error("Couldn't apply rewrites", e?.message),
  });
}

export function useDiff(id, from, to, mode = "words") {
  return useQuery({
    queryKey: ["resumes", "diff", id, from, to, mode],
    queryFn: () => resumesApi.diff(id, from, to, mode),
    enabled: !!id && !!from && !!to && from !== to,
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => resumesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
      qc.invalidateQueries({ queryKey: dashboardKey });
      toast.info("Resume deleted");
    },
    onError: (e) => toast.error("Couldn't delete resume", e?.message),
  });
}
