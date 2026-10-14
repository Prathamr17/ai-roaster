import { useNavigate } from "react-router-dom";
import { FileText, ChevronRight, Trash2, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/utils";
import { useDeleteResume } from "@/hooks/useResumes";

export function ResumeRow({ resume }) {
  const nav = useNavigate();
  const del = useDeleteResume();

  async function remove(e) {
    e.stopPropagation();
    if (!confirm("Delete this resume and all its versions?")) return;
    await del.mutateAsync(resume._id);
  }

  return (
    <Card
      onClick={() => nav(`/resumes/${resume._id}`)}
      className="cursor-pointer flex items-center gap-4"
    >
      <div className="h-12 w-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center shrink-0">
        <FileText size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-display text-base font-semibold truncate">
          {resume.title}
        </div>
        <div className="text-xs text-[var(--ink-muted)] mt-0.5">
          Updated {relativeTime(resume.updatedAt)}
        </div>
      </div>

      <Badge tone="neutral" className="gap-1">
        <Layers size={11} />
        {resume.latestVersionNumber || 1} version{(resume.latestVersionNumber || 1) > 1 ? "s" : ""}
      </Badge>

      <button
        onClick={remove}
        disabled={del.isPending}
        className="h-9 w-9 rounded-full hover:bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>

      <ChevronRight size={16} className="text-[var(--ink-muted)]" />
    </Card>
  );
}
