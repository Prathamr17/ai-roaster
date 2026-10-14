import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Upload,
  Sparkles,
  PenLine,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";

const ICONS = {
  upload: Upload,
  analyze: Sparkles,
  rewrite: PenLine,
  complete: CheckCircle2,
  export: FileDown,
};

const TONES = {
  upload: "neutral",
  analyze: "accent",
  rewrite: "warning",
  complete: "success",
  export: "neutral",
};

export function ActivityFeed({ items }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="text-base">Activity</CardTitle>
          <CardDescription className="mt-1">
            Recent moves across your resumes
          </CardDescription>
        </div>
        <Badge tone="neutral">{items.length}</Badge>
      </CardHeader>

      <div className="flex-1 space-y-3">
        {items.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-muted)]">
                {Icon && <Icon size={15} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--ink)] truncate">
                  {item.title}
                </div>
                <div className="text-xs text-[var(--ink-muted)] mt-0.5">
                  {item.subtitle}
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge tone={TONES[item.type] || "neutral"}>{item.label}</Badge>
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">
                  {relativeTime(item.at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
