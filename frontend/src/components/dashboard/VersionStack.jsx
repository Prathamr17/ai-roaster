import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  PenLine,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function deltaIcon(delta) {
  if (delta > 0) return TrendingUp;
  if (delta < 0) return TrendingDown;
  return Minus;
}

function tierFor(score) {
  if (score >= 85) return { label: "Excellent", next: null };
  if (score >= 70) return { label: "Strong", next: { label: "Excellent", at: 85 } };
  if (score >= 55) return { label: "Fair", next: { label: "Strong", at: 70 } };
  return { label: "Needs work", next: { label: "Fair", at: 55 } };
}

function VersionPill({ version, delta, isLatest }) {
  const isUpload = (version.title || "").toLowerCase().includes("upload");
  const Icon = isUpload ? FileText : PenLine;
  const DeltaIcon = deltaIcon(delta);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex-1 min-w-[120px] rounded-2xl p-4 border transition-shadow",
        isLatest
          ? "bg-[var(--accent-soft)] border-[var(--accent)]/30 shadow-card"
          : "bg-[var(--surface-2)] border-[var(--border)]"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "h-7 w-7 rounded-xl flex items-center justify-center",
            isUpload
              ? "bg-[var(--surface)] text-[var(--ink-muted)]"
              : "bg-[var(--accent)] text-white"
          )}
        >
          <Icon size={13} />
        </div>
        <Badge tone={isLatest ? "ink" : "neutral"}>{version.label}</Badge>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-display tabular text-[34px] font-semibold leading-none tracking-tight">
          {version.score}
        </span>
        <span className="text-[11px] text-[var(--ink-muted)]">/100</span>
      </div>

      <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] mt-1 font-semibold">
        {isUpload ? "Upload" : "Rewrite pass"}
      </div>

      {delta != null && (
        <div
          className={cn(
            "inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[10px] font-semibold tabular",
            delta > 0 && "bg-[var(--accent-soft)] text-[var(--success)]",
            delta < 0 && "bg-[#F8E3E0] text-[var(--danger)]",
            delta === 0 && "bg-[var(--surface)] text-[var(--ink-muted)]",
            isLatest && delta > 0 && "bg-white text-[var(--success)]"
          )}
        >
          <DeltaIcon size={10} strokeWidth={2.5} />
          {delta > 0 ? "+" : ""}
          {delta} pts
        </div>
      )}
    </motion.div>
  );
}

function TierBar({ score }) {
  const tier = tierFor(score);
  const ticks = [
    { at: 55, label: "Fair" },
    { at: 70, label: "Strong" },
    { at: 85, label: "Excellent" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
          Tier progress
        </div>
        <div className="text-[10px] text-[var(--ink-muted)] tabular">
          {tier.next
            ? `${tier.next.at - score} pts to ${tier.next.label}`
            : "Max tier reached"}
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)]"
        />
        {ticks.map((t) => (
          <div
            key={t.at}
            className="absolute top-0 bottom-0 w-px bg-white/60"
            style={{ left: `${t.at}%` }}
          />
        ))}
      </div>
      <div className="relative h-4 mt-1.5 text-[9px] text-[var(--ink-muted)] tabular">
        <span className="absolute left-0">0</span>
        {ticks.map((t) => (
          <span
            key={t.at}
            className="absolute"
            style={{ left: `${t.at}%`, transform: "translateX(-50%)" }}
          >
            {t.at}
          </span>
        ))}
        <span className="absolute right-0">100</span>
      </div>
    </div>
  );
}

function TrajectoryChart({ versions }) {
  const data = versions.map((v) => ({ label: v.label, score: v.score }));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
          Score trajectory
        </div>
        <div className="text-[10px] text-[var(--ink-muted)]">
          {versions[0].label} → {versions[versions.length - 1].label}
        </div>
      </div>
      <div className="h-[110px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="vsTrajGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--ink-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--accent)"
              strokeWidth={2.5}
              fill="url(#vsTrajGrad)"
              dot={{ r: 4, stroke: "var(--accent)", fill: "var(--surface)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function VersionStack({ versions, resumeId, resumeTitle }) {
  const nav = useNavigate();
  if (!versions?.length) return null;

  const visible = versions.slice(-3);
  const latest = visible[visible.length - 1];
  const first = visible[0];
  const totalDelta = (latest?.score || 0) - (first?.score || 0);
  const TotalDeltaIcon = deltaIcon(totalDelta);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="text-base">Resume Versions</CardTitle>
          <CardDescription className="mt-1">
            Your iteration journey, scored
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => nav("/versions")}
          className="-mr-2"
        >
          View all <ArrowUpRight size={14} />
        </Button>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-stretch">
        {/* Version progression */}
        <div className="flex items-center gap-2 sm:gap-3">
          {visible.map((v, i) => {
            const prev = visible[i - 1];
            const delta = prev ? v.score - prev.score : null;
            const isLatest = v.id === latest.id;
            return (
              <Fragment key={v.id}>
                {i > 0 && (
                  <ArrowRight
                    size={14}
                    className="text-[var(--ink-muted)] shrink-0"
                  />
                )}
                <VersionPill version={v} delta={delta} isLatest={isLatest} />
              </Fragment>
            );
          })}
        </div>

        {/* Latest summary */}
        <div className="flex flex-col justify-between gap-4 lg:border-l lg:border-[var(--border)] lg:pl-5">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
              Latest
            </div>
            <div className="font-display text-lg font-semibold tracking-tight mt-1 truncate">
              {resumeTitle || latest.title || latest.label}
            </div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">
              {latest.label} · {visible.length} version
              {visible.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
              Since {first.label}
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular",
                totalDelta > 0 && "bg-[var(--accent-soft)] text-[var(--success)]",
                totalDelta < 0 && "bg-[#F8E3E0] text-[var(--danger)]",
                totalDelta === 0 && "bg-[var(--surface-2)] text-[var(--ink-muted)]"
              )}
            >
              <TotalDeltaIcon size={12} strokeWidth={2.5} />
              {totalDelta > 0 ? "+" : ""}
              {totalDelta} pts overall
            </div>
          </div>

          <Button
            variant="accent"
            size="sm"
            disabled={!resumeId}
            onClick={() => resumeId && nav(`/resumes/${resumeId}`)}
            className="w-full"
          >
            Open Resume <ArrowUpRight size={13} />
          </Button>
        </div>
      </div>

      {/* Trajectory + Tier progress (fills the bottom with useful context) */}
      <div className="flex-1 mt-6 pt-5 border-t border-[var(--border)] space-y-5">
        <TrajectoryChart versions={visible} />
        <TierBar score={latest.score} />
      </div>
    </Card>
  );
}
