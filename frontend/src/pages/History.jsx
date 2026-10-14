import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Upload,
  Sparkles,
  PenLine,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, relativeTime } from "@/lib/utils";
import { useHistory } from "@/hooks/useAnalytics";

const FILTERS = [
  { key: "all", label: "All", icon: HistoryIcon },
  { key: "upload", label: "Uploads", icon: Upload },
  { key: "analyze", label: "Analyses", icon: Sparkles },
  { key: "rewrite", label: "Rewrites", icon: PenLine },
];

const ICONS = {
  upload: Upload,
  analyze: Sparkles,
  rewrite: PenLine,
};

const TONES = {
  upload: "neutral",
  analyze: "accent",
  rewrite: "warning",
};

function dayKey(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.toDateString() === b.toDateString();

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function History() {
  const nav = useNavigate();
  const { data, isLoading, error } = useHistory();
  const [filter, setFilter] = useState("all");

  const events = data?.events || [];
  const totals = data?.totals || { all: 0 };

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const e of filtered) {
      const key = dayKey(e.at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  if (isLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="Couldn't load history"
        description={error.message}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Everything you've done across your resumes, in time order."
      />

      <div className="inline-flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-full shadow-card">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count = totals[f.key] ?? events.length;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-9 px-3.5 text-xs font-medium rounded-full transition-colors inline-flex items-center gap-1.5",
                isActive
                  ? "bg-[var(--ink)] text-[var(--bg)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              )}
            >
              <Icon size={13} />
              {f.label}
              <span
                className={cn(
                  "tabular text-[10px] px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-white/15 text-[var(--bg)]"
                    : "bg-[var(--surface-2)] text-[var(--ink-muted)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No activity yet"
          description={
            filter === "all"
              ? "Once you upload, analyze, or rewrite a resume, events show up here."
              : "No events match this filter — try a different one."
          }
        />
      ) : (
        <div className="space-y-7">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-[var(--ink-muted)]">
                  {day}
                </h3>
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-[10px] text-[var(--ink-muted)] tabular">
                  {items.length}
                </span>
              </div>
              <Card className="!p-0 overflow-hidden">
                {items.map((e, idx) => {
                  const Icon = ICONS[e.type] || HistoryIcon;
                  return (
                    <button
                      key={e.id}
                      onClick={() =>
                        e.resumeId && nav(`/resumes/${e.resumeId}`)
                      }
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--surface-2)] transition-colors",
                        idx > 0 && "border-t border-[var(--border)]"
                      )}
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-muted)]">
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {e.title}
                        </div>
                        <div className="text-xs text-[var(--ink-muted)] mt-0.5">
                          {e.subtitle}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge tone={TONES[e.type] || "neutral"}>{e.label}</Badge>
                        <div className="text-[10px] text-[var(--ink-muted)] mt-1">
                          {relativeTime(e.at)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3 rounded-2xl" />
      <Skeleton className="h-11 w-[420px] rounded-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-[240px] rounded-3xl" />
        </div>
      ))}
    </div>
  );
}
