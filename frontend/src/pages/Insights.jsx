import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  Trophy,
  Sparkles,
  AlertCircle,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useInsights } from "@/hooks/useAnalytics";

const SEV_TONE = { low: "neutral", medium: "warning", high: "danger" };

export default function Insights() {
  const nav = useNavigate();
  const { data, isLoading, error } = useInsights();

  if (isLoading) return <InsightsSkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Couldn't load insights"
        description={error.message}
      />
    );
  }

  if (data?.empty) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Insights"
          description="Patterns across all your resumes and analyses."
        />
        <EmptyState
          icon={Sparkles}
          title="No analyses yet"
          description="Once you analyze a few resumes, this page lights up with trends across your data."
          action={
            <Button variant="accent" size="md" onClick={() => nav("/resumes")}>
              Go to resumes
            </Button>
          }
        />
      </div>
    );
  }

  const trend = (data.scoreTrend || []).map((p, i) => ({
    label: `#${i + 1}`,
    score: p.score,
    at: p.at,
    resumeTitle: p.resumeTitle,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Patterns across all your resumes and analyses."
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Kpi
          label="Average ATS Score"
          value={data.averageScore}
          suffix="/ 100"
          icon={TrendingUp}
        />
        <Kpi
          label="Best Score"
          value={data.bestScore.value}
          suffix="/ 100"
          sub={data.bestScore.resumeTitle}
          icon={Trophy}
          accent
        />
        <Kpi
          label="Total Analyses"
          value={data.totalAnalyses}
          icon={Sparkles}
        />
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Score Trend</CardTitle>
            <CardDescription className="mt-1">
              Every analysis you've run, chronologically
            </CardDescription>
          </div>
        </CardHeader>
        <div className="h-[240px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="iScoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 4" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-hover px-3 py-2 text-xs">
                      <div className="text-[var(--ink-muted)]">
                        {payload[0].payload.resumeTitle}
                      </div>
                      <div className="font-display tabular text-base font-semibold mt-0.5">
                        {payload[0].value} / 100
                      </div>
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#iScoreFill)"
                dot={{ r: 3.5, stroke: "var(--accent)", fill: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Issues + Missing Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Recurring Issues</CardTitle>
              <CardDescription className="mt-1">
                What comes up most often across your analyses
              </CardDescription>
            </div>
          </CardHeader>
          {data.topIssues.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">No issues recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-muted)] shrink-0">
                    <AlertCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{issue.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone={SEV_TONE[issue.severity] || "neutral"}>
                        {issue.severity}
                      </Badge>
                      <span className="text-xs text-[var(--ink-muted)]">
                        {issue.count}× across analyses
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Most-Missed Keywords</CardTitle>
              <CardDescription className="mt-1">
                Words ATS expected but didn't see
              </CardDescription>
            </div>
          </CardHeader>
          {data.topMissingKeywords.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">
              Nothing missing across your analyses — nice.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.topMissingKeywords.map((k, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8E3E0] text-[var(--danger)]"
                >
                  {k.keyword}
                  <span className="tabular text-[10px] opacity-70">×{k.count}</span>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Most-present keywords */}
      {data.topPresentKeywords?.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Your Keyword Anchors</CardTitle>
              <CardDescription className="mt-1">
                Words ATS consistently sees on your resumes
              </CardDescription>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {data.topPresentKeywords.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              >
                {k.keyword}
                <span className="tabular text-[10px] opacity-70">×{k.count}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Per-resume table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">By Resume</CardTitle>
            <CardDescription className="mt-1">
              How each of your resumes is performing
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-[var(--ink-muted)] border-b border-[var(--border)]">
                <th className="px-2 py-2 font-medium">Resume</th>
                <th className="px-2 py-2 font-medium text-right">Latest</th>
                <th className="px-2 py-2 font-medium text-right">Best</th>
                <th className="px-2 py-2 font-medium text-right">Improvement</th>
                <th className="px-2 py-2 font-medium text-right">Analyses</th>
                <th className="px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {data.resumePerformance.map((r) => (
                <tr
                  key={r.resumeId}
                  onClick={() => nav(`/resumes/${r.resumeId}`)}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
                >
                  <td className="px-2 py-3 font-medium truncate max-w-[260px]">
                    {r.title}
                  </td>
                  <td className="px-2 py-3 text-right tabular font-display font-semibold">
                    {r.latestScore}
                  </td>
                  <td className="px-2 py-3 text-right tabular text-[var(--ink-muted)]">
                    {r.bestScore}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Badge tone={r.improvement >= 0 ? "success" : "danger"}>
                      {r.improvement >= 0 ? "+" : ""}
                      {r.improvement}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-right tabular text-[var(--ink-muted)]">
                    {r.analysesCount}
                  </td>
                  <td className="px-2 py-3 text-[var(--ink-muted)]">
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, suffix, sub, icon: Icon, accent }) {
  return (
    <Card variant={accent ? "accent" : "default"}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                accent
                  ? "bg-white/15 text-white"
                  : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              }`}
            >
              <Icon size={14} />
            </div>
            <span
              className={`text-xs ${accent ? "text-white/70" : "text-[var(--ink-muted)]"}`}
            >
              {label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display tabular text-3xl font-semibold tracking-tight">
              {value}
            </span>
            {suffix && (
              <span
                className={`text-sm ${accent ? "text-white/70" : "text-[var(--ink-muted)]"}`}
              >
                {suffix}
              </span>
            )}
          </div>
          {sub && (
            <div
              className={`text-xs truncate ${accent ? "text-white/80" : "text-[var(--ink-muted)]"}`}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-[300px] rounded-3xl" />
        <Skeleton className="h-[300px] rounded-3xl" />
      </div>
    </div>
  );
}
