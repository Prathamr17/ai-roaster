import { useState, useMemo } from "react";
import { ArrowRight, Loader2, Sparkles, Wand2, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";

function GradientNumber({ value, size = 32 }) {
  return (
    <span
      className="font-display tabular-nums font-semibold leading-none tracking-tight"
      style={{
        fontSize: size,
        backgroundImage:
          "linear-gradient(135deg, #B6CFC0 0%, var(--accent) 45%, var(--accent-strong) 100%)",
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

export function BulletRewrites({ rewrites, onApply, isApplying, error }) {
  const ids = useMemo(() => rewrites.map((r) => r._id).filter(Boolean), [rewrites]);
  const [selected, setSelected] = useState(() => new Set(ids));

  const allSelected = selected.size === ids.length && ids.length > 0;
  const someSelected = selected.size > 0;

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(ids));
  }

  function applySelected() {
    onApply?.(Array.from(selected));
  }

  function applyAll() {
    onApply?.([]);
  }

  if (!rewrites?.length) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Suggested Rewrites</CardTitle>
            <CardDescription className="mt-1">No rewrites suggested.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="!mb-3">
        <div>
          <CardTitle className="text-base">Suggested Rewrites</CardTitle>
          <CardDescription className="mt-1">
            Pick the ones you want — applying creates a new version.
          </CardDescription>
        </div>
      </CardHeader>

      {/* Hero summary */}
      <div
        className="relative rounded-2xl border border-[var(--border)] p-5 mb-5 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-2) 70%, var(--surface) 100%)",
        }}
      >
        {/* Decorative sage rings */}
        <svg
          className="absolute -top-8 -right-8 pointer-events-none opacity-50"
          width="160"
          height="160"
          viewBox="0 0 160 160"
          aria-hidden
        >
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
          <circle
            cx="80"
            cy="80"
            r="48"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        </svg>

        <div className="relative flex items-end justify-between gap-6 flex-wrap">
          <div className="flex items-end gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                AI rewrites
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <GradientNumber value={rewrites.length} size={44} />
                <span className="text-[11px] text-[var(--ink-muted)] ml-1">
                  ready
                </span>
              </div>
            </div>
            <div className="h-10 w-px bg-[var(--border)]" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                Selected
              </div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="font-display tabular-nums text-[26px] font-semibold leading-none tracking-tight text-[var(--ink)]">
                  {selected.size}
                </span>
                <span className="text-[var(--ink-muted)] text-sm tabular-nums">
                  / {rewrites.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={toggleAll}>
              {allSelected ? "Clear all" : "Select all"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={applySelected}
              disabled={!someSelected || isApplying}
            >
              {isApplying ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              Apply selected
            </Button>
            <div
              className="rounded-full p-[1.5px]"
              style={{
                background:
                  "linear-gradient(135deg, #B6CFC0 0%, var(--accent) 45%, var(--accent-strong) 100%)",
              }}
            >
              <Button
                variant="accent"
                size="sm"
                onClick={applyAll}
                disabled={isApplying}
                className="!rounded-full"
              >
                <Wand2 size={13} />
                Apply all → new version
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rewrites.map((r, i) => {
          const id = r._id || `idx-${i}`;
          const isSelected = selected.has(id);
          return (
            <div
              key={id}
              className={cn(
                "group relative rounded-2xl border p-5 transition-all",
                isSelected
                  ? "border-[var(--accent)]/45 bg-[var(--accent-soft)]/35 shadow-card"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/60"
              )}
            >
              {/* Header row: number + section + selection state */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 flex items-center justify-center">
                    <GradientNumber
                      value={String(i + 1).padStart(2, "0")}
                      size={22}
                    />
                  </div>
                  {r.section && (
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] text-[11px] font-semibold capitalize">
                      {r.section}
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-colors",
                      isSelected
                        ? "text-[var(--accent-strong)]"
                        : "text-[var(--ink-muted)]"
                    )}
                  >
                    {isSelected ? "Will apply" : "Skip"}
                  </span>
                  <Checkbox checked={isSelected} onChange={() => toggle(id)} />
                </label>
              </div>

              {/* Before / arrow / After */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_36px_1fr] gap-3 items-stretch">
                <div className="relative rounded-xl bg-[var(--surface-2)]/70 p-4 border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-muted)]/50" />
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
                      Original
                    </div>
                  </div>
                  <div className="text-[13.5px] text-[var(--ink-muted)] leading-relaxed line-through decoration-[var(--ink-muted)]/30">
                    {r.original}
                  </div>
                </div>

                <div className="flex items-center justify-center py-2 md:py-0">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white shadow-card"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                    }}
                  >
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                </div>

                <div
                  className="relative rounded-xl p-4 border"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 100%)",
                    borderColor:
                      "color-mix(in srgb, var(--accent) 30%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles
                      size={10}
                      strokeWidth={2.5}
                      className="text-[var(--accent-strong)]"
                    />
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--accent-strong)]">
                      Rewritten
                    </div>
                  </div>
                  <div className="text-[13.5px] text-[var(--ink)] leading-relaxed font-medium">
                    {r.rewritten}
                  </div>
                </div>
              </div>

              {/* Rationale */}
              {r.rationale && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] px-3 py-2.5">
                  <span className="h-5 w-5 rounded-md bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center shrink-0 mt-0.5">
                    <Info size={10} strokeWidth={2.5} />
                  </span>
                  <div className="text-[12px] text-[var(--ink-muted)] leading-relaxed">
                    <span className="font-semibold text-[var(--ink)]">
                      Why this works ·{" "}
                    </span>
                    {r.rationale}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 text-xs text-[var(--danger)] bg-[#F8E3E0] rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </Card>
  );
}
