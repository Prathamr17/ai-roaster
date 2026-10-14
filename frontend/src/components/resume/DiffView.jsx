import { useState } from "react";
import { GitCompare, ArrowRight, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useDiff } from "@/hooks/useResumes";

function GradientNumber({ value, size = 32, palette = "sage" }) {
  const gradient =
    palette === "danger"
      ? "linear-gradient(135deg, #F2B7B1 0%, var(--danger) 50%, #7A3A36 100%)"
      : "linear-gradient(135deg, #B6CFC0 0%, var(--accent) 45%, var(--accent-strong) 100%)";
  return (
    <span
      className="font-display tabular-nums font-semibold leading-none tracking-tight"
      style={{
        fontSize: size,
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
    >
      {value}
    </span>
  );
}

function VersionPicker({ versions, value, onChange, exclude }) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] p-0.5 rounded-full shadow-card">
      {versions.map((v) => {
        const active = value === v._id;
        const disabled = v._id === exclude;
        return (
          <button
            key={v._id}
            onClick={() => onChange(v._id)}
            disabled={disabled}
            className={cn(
              "h-7 px-3 text-[11px] font-semibold rounded-full transition-all tabular-nums",
              active
                ? "text-white shadow-card"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
              disabled && "opacity-30 cursor-not-allowed"
            )}
            style={
              active
                ? {
                    background:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                  }
                : undefined
            }
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-[var(--surface-2)] border border-[var(--border)] p-0.5 rounded-full">
      {["words", "lines"].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "h-7 px-3 text-[11px] font-semibold capitalize rounded-full transition-colors",
            mode === m
              ? "bg-[var(--ink)] text-[var(--bg)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function DiffView({ resumeId, versions }) {
  const [mode, setMode] = useState("words");
  const initial =
    versions.length >= 2
      ? {
          from: versions[versions.length - 2]._id,
          to: versions[versions.length - 1]._id,
        }
      : { from: versions[0]?._id, to: versions[0]?._id };

  const [fromId, setFromId] = useState(initial.from);
  const [toId, setToId] = useState(initial.to);

  const { data, isLoading, error } = useDiff(resumeId, fromId, toId, mode);

  if (versions.length < 2) {
    return (
      <EmptyState
        icon={GitCompare}
        title="Need two versions to compare"
        description="Apply rewrites or upload a new version to see diffs here."
      />
    );
  }

  const fromLabel = versions.find((v) => v._id === fromId)?.label || "—";
  const toLabel = versions.find((v) => v._id === toId)?.label || "—";
  const net = data ? data.stats.added - data.stats.removed : 0;

  return (
    <Card>
      <CardHeader className="!mb-3">
        <div>
          <CardTitle className="text-base">Version Diff</CardTitle>
          <CardDescription className="mt-1">
            Compare what changed between any two versions
          </CardDescription>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </CardHeader>

      {/* Compare bar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3 mb-5 flex items-center justify-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
          From
        </span>
        <VersionPicker
          versions={versions}
          value={fromId}
          onChange={setFromId}
          exclude={toId}
        />
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white shadow-card"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
          }}
        >
          <ArrowRight size={13} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
          To
        </span>
        <VersionPicker
          versions={versions}
          value={toId}
          onChange={setToId}
          exclude={fromId}
        />
      </div>

      {isLoading && <Skeleton className="h-[300px] rounded-2xl" />}

      {error && (
        <div className="text-xs text-[var(--danger)] bg-[#F8E3E0] rounded-xl px-3 py-2">
          {error.message}
        </div>
      )}

      {data && (
        <>
          {/* Hero stats */}
          <div
            className="relative rounded-2xl border border-[var(--border)] p-5 mb-5 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-2) 70%, var(--surface) 100%)",
            }}
          >
            <svg
              className="absolute -top-6 -right-6 pointer-events-none opacity-50"
              width="140"
              height="140"
              viewBox="0 0 140 140"
              aria-hidden
            >
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="var(--accent)"
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="3 6"
              />
            </svg>

            <div className="relative flex items-end gap-8 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                  Added
                </div>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <GradientNumber value={`+${data.stats.added}`} size={40} />
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    chars
                  </span>
                </div>
              </div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                  Removed
                </div>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <GradientNumber
                    value={`−${data.stats.removed}`}
                    size={40}
                    palette="danger"
                  />
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    chars
                  </span>
                </div>
              </div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                  Net change
                </div>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span
                    className={cn(
                      "font-display tabular-nums text-[26px] font-semibold leading-none tracking-tight",
                      net > 0
                        ? "text-[var(--accent-strong)]"
                        : net < 0
                        ? "text-[var(--danger)]"
                        : "text-[var(--ink-muted)]"
                    )}
                  >
                    {net > 0 ? "+" : net < 0 ? "" : "±"}
                    {net}
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    chars
                  </span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                  Comparing
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink)] tabular-nums">
                  {fromLabel}
                  <ArrowRight
                    size={11}
                    className="text-[var(--accent-strong)]"
                  />
                  {toLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Diff display */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)]/60">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                <FileText size={11} />
                Inline diff · {mode}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[var(--ink-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--accent-soft)] border border-[var(--accent)]/30" />
                  Added
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#F8E3E0] border border-[var(--danger)]/30" />
                  Removed
                </span>
              </div>
            </div>
            <div className="p-5 max-h-[600px] overflow-auto font-mono text-[13px] leading-[1.75] whitespace-pre-wrap text-[var(--ink-muted)]">
              {data.parts.map((p, i) => (
                <span
                  key={i}
                  className={cn(
                    !p.added && !p.removed && "text-[var(--ink)]",
                    p.added &&
                      "bg-[var(--accent-soft)] text-[var(--accent-strong)] font-medium rounded px-0.5 py-0.5",
                    p.removed &&
                      "bg-[#F8E3E0] text-[var(--danger)] line-through decoration-[var(--danger)]/50 rounded px-0.5 py-0.5"
                  )}
                >
                  {p.value}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
