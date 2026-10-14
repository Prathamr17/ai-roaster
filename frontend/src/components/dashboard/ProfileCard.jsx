import { useNavigate } from "react-router-dom";
import { Upload, BarChart3, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function memberSince(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function ProfileCard({ user, stats }) {
  const nav = useNavigate();
  const since = memberSince(user?.createdAt);

  return (
    <Card className="h-full flex flex-col items-center text-center">
      <div className="relative">
        <Avatar name={user?.name} size={72} className="ring-4" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)] flex items-center justify-center text-[10px] text-white font-bold">
          ✓
        </span>
      </div>

      <div className="mt-3">
        <div className="font-display text-lg font-semibold tracking-tight text-[var(--ink)]">
          {user?.name || "Ravi Teja"}
        </div>
        <div className="text-xs text-[var(--ink-muted)] mt-0.5">
          {user?.email || "you@example.com"}
        </div>
        <Badge tone="accent" className="mt-2">
          Pro plan
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-5 border-t border-[var(--border)]">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
              {s.label}
            </div>
            <div className="font-display tabular text-xl font-semibold mt-0.5 text-[var(--ink)]">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + member since */}
      <div className="mt-auto pt-5 w-full space-y-3">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => nav("/resumes")}
            className="w-full"
          >
            <Upload size={13} /> Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => nav("/insights")}
            className="w-full"
          >
            <BarChart3 size={13} /> Insights
          </Button>
        </div>
        {since && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--ink-muted)]">
            <Calendar size={10} />
            Member since {since}
          </div>
        )}
      </div>
    </Card>
  );
}
