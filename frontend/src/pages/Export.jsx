import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { VersionSwitcher } from "@/components/resume/VersionSwitcher";
import { ResumeDocument } from "@/components/export/ResumeDocument";
import { TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/components/export/templates";
import { generateLatexCode } from "@/components/export/templates/latexGenerator";
import { useResume, useFullVersion } from "@/hooks/useResumes";
import { useAuth } from "@/context/AuthContext";

const TEMPLATE_STORAGE_KEY = "resumeExportTemplateId";

export default function Export() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, error } = useResume(id);
  const resume = data?.resume;
  const versions = data?.versions || [];

  const [activeVersionId, setActiveVersionId] = useState(null);
  useEffect(() => {
    if (!activeVersionId && versions.length) {
      setActiveVersionId(resume?.currentVersionId || versions[versions.length - 1]._id);
    }
  }, [versions, resume, activeVersionId]);

  const fullVersion = useFullVersion(id, activeVersionId);
  const version = fullVersion.data;

  const [templateId, setTemplateId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TEMPLATE_ID;
    return window.localStorage.getItem(TEMPLATE_STORAGE_KEY) || DEFAULT_TEMPLATE_ID;
  });

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, id);
    }
  };

  const handleDownloadTex = () => {
    const latexStr = generateLatexCode(user, version);
    const blob = new Blob([latexStr], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base = (resume?.title || "resume").replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_");
    a.download = `${base}_${version?.label || "V1"}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const docProps = useMemo(
    () => ({ user, version, title: resume?.title, templateId }),
    [user, version, resume?.title, templateId]
  );

  const fileName = useMemo(() => {
    const base = (resume?.title || "resume").replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_");
    return `${base}_${version?.label || "V1"}.pdf`;
  }, [resume?.title, version?.label]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3 rounded-2xl" />
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Couldn't load resume"
        description={error.message}
        action={
          <Button variant="outline" onClick={() => nav("/resumes")}>
            Back to resumes
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Export — ${resume?.title || "Resume"}`}
        description="Preview a clean ATS-friendly PDF and download when it looks right."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => nav(`/resumes/${id}`)}>
              <ArrowLeft size={14} /> Back to resume
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle className="text-base">Version</CardTitle>
            <CardDescription className="mt-1">
              Choose which version to export
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <VersionSwitcher
              versions={versions}
              activeId={activeVersionId}
              onChange={setActiveVersionId}
            />
            {version && (
              <>
                {templateId === "latex" && (
                  <Button variant="outline" size="md" onClick={handleDownloadTex}>
                    <FileText size={14} /> Download .tex
                  </Button>
                )}
                <PDFDownloadLink
                  document={<ResumeDocument {...docProps} />}
                  fileName={fileName}
                >
                  {({ loading }) => (
                    <Button variant="accent" size="md" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Preparing…
                        </>
                      ) : (
                        <>
                          <Download size={14} /> Download PDF
                        </>
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>
              </>
            )}
          </div>
        </CardHeader>

        {version?.sourceType === "rewrite" && (
          <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            <Badge tone="accent">AI-improved</Badge>
            This version was generated by applying AI rewrites.
          </div>
        )}
      </Card>

      <Card>
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle className="text-base">Template</CardTitle>
            <CardDescription className="mt-1">
              Pick the layout closest to your original resume's style
            </CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTemplateChange(t.id)}
              className={`flex-1 min-w-[180px] rounded-2xl border px-4 py-3 text-left transition ${
                templateId === t.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] hover:border-[var(--accent)]/50"
              }`}
            >
              <div className="text-sm font-medium">{t.label}</div>
              <div className="mt-1 text-xs text-[var(--ink-muted)]">{t.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {fullVersion.isLoading && (
        <Skeleton className="h-[800px] rounded-3xl" />
      )}

      {fullVersion.error && (
        <EmptyState
          icon={FileText}
          title="Couldn't load this version"
          description={fullVersion.error.message}
        />
      )}

      {version && (
        <Card padding="none" className="overflow-hidden">
          <PDFViewer
            style={{
              width: "100%",
              height: "min(85vh, 1000px)",
              border: "none",
              borderRadius: 20,
            }}
            showToolbar={false}
          >
            <ResumeDocument {...docProps} />
          </PDFViewer>
        </Card>
      )}
    </div>
  );
}
