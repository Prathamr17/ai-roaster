import { useNavigate } from "react-router-dom";
import {
  Gauge,
  Layers,
  Lightbulb,
  KeyRound,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ScoreEvolutionChart } from "@/components/dashboard/ScoreEvolutionChart";
import { AtsGauge } from "@/components/dashboard/AtsGauge";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { VersionStack } from "@/components/dashboard/VersionStack";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { KeepSharpCard } from "@/components/dashboard/KeepSharpCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={Gauge}
        title="Couldn't load your dashboard"
        description={error.message}
      />
    );
  }

  const { totals, latestResume, scoreSeries, versionStack, kpi, activity } =
    data || {};

  if (!totals?.resumes) {
    return (
      <EmptyState
        icon={UploadCloud}
        title="Welcome — let's roast your resume"
        description="Upload a PDF to get an instant ATS score, fixable issues, your strengths, and AI-rewritten bullets."
        action={
          <Button variant="accent" size="lg" onClick={() => nav("/resumes")}>
            Upload your first resume
          </Button>
        }
      />
    );
  }

  const profileStats = [
    { label: "Resumes", value: totals.resumes },
    { label: "Rewrites", value: totals.rewrites },
    { label: "Analyses", value: totals.analyses },
  ];

  const current = kpi?.atsScore?.value;
  const first = scoreSeries?.[0]?.score;
  const evolutionDelta = current != null && first != null ? current - first : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="ATS Score"
          value={kpi?.atsScore?.value ?? "—"}
          suffix={kpi?.atsScore?.value != null ? "/ 100" : null}
          delta={kpi?.atsScore?.delta}
          chart="bars"
          data={kpi?.atsScore?.spark || []}
          icon={Gauge}
        />
        <StatCard
          label="Versions"
          value={kpi?.versions?.value ?? totals.resumes}
          chart="line"
          data={kpi?.versions?.spark || []}
          icon={Layers}
        />
        <StatCard
          label="Issues Identified"
          value={kpi?.issuesIdentified?.value ?? "—"}
          delta={kpi?.issuesIdentified?.delta}
          chart="line"
          data={kpi?.issuesIdentified?.spark || []}
          icon={Lightbulb}
        />
        <StatCard
          label="Keywords Matched"
          value={kpi?.keywordsMatched?.value ?? "—"}
          suffix={
            kpi?.keywordsMatched?.total
              ? `/ ${kpi.keywordsMatched.total}`
              : null
          }
          delta={kpi?.keywordsMatched?.delta}
          chart="line"
          data={kpi?.keywordsMatched?.spark || []}
          icon={KeyRound}
          accent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          {scoreSeries?.length ? (
            <ScoreEvolutionChart
              data={scoreSeries}
              currentScore={current}
              delta={evolutionDelta}
            />
          ) : (
            <NoAnalysisCard
              onAction={() =>
                latestResume?._id && nav(`/resumes/${latestResume._id}`)
              }
            />
          )}
        </div>
        <div className="lg:col-span-3">
          {current != null ? (
            <AtsGauge score={current} delta={kpi?.atsScore?.delta ?? 0} />
          ) : (
            <Card className="h-full flex items-center justify-center text-center">
              <div className="font-display text-sm font-semibold mb-1">
                No score yet
              </div>
              <div className="text-xs text-[var(--ink-muted)]">
                Run analysis to populate
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-3">
          <ProfileCard user={user} stats={profileStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          {versionStack?.length ? (
            <VersionStack
              versions={versionStack}
              resumeId={latestResume?._id}
              resumeTitle={latestResume?.title}
            />
          ) : (
            <Card className="h-full flex items-center justify-center text-center min-h-[200px]">
              <div className="font-display text-sm font-semibold mb-1">
                No versions yet
              </div>
              <div className="text-xs text-[var(--ink-muted)]">
                Versions appear after you analyze and rewrite
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-5">
          {activity?.length ? (
            <ActivityFeed items={activity} />
          ) : (
            <Card className="h-full flex items-center justify-center text-center min-h-[200px]">
              <div className="font-display text-sm font-semibold mb-1">
                Quiet here
              </div>
              <div className="text-xs text-[var(--ink-muted)]">
                Your activity feed lights up after you analyze
              </div>
            </Card>
          )}
        </div>
        {/* <div className="lg:col-span-2">
          <KeepSharpCard />
        </div> */}
      </div>
    </div>
  );
}

function NoAnalysisCard({ onAction }) {
  return (
    <Card className="h-full flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="h-14 w-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center mb-3">
        <Sparkles size={22} />
      </div>
      <div className="font-display text-base font-semibold tracking-tight">
        Ready when you are
      </div>
      <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-sm">
        You've uploaded a resume — run analysis to see your ATS score, fixable
        issues, and rewrite suggestions.
      </p>
      {onAction && (
        <Button variant="accent" size="md" className="mt-4" onClick={onAction}>
          <Sparkles size={14} /> Analyze now
        </Button>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-7 h-[300px] rounded-3xl" />
        <Skeleton className="lg:col-span-3 h-[300px] rounded-3xl" />
        <Skeleton className="lg:col-span-2 h-[300px] rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-7 h-[260px] rounded-3xl" />
        <Skeleton className="lg:col-span-3 h-[260px] rounded-3xl" />
        <Skeleton className="lg:col-span-2 h-[260px] rounded-3xl" />
      </div>
    </div>
  );
}
