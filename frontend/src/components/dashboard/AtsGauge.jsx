import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const RADIUS = 130;
const ARC_LENGTH = Math.PI * RADIUS; // length of a half circle

function statusFor(score) {
  if (score >= 85) return { label: "Excellent", tone: "success" };
  if (score >= 70) return { label: "Strong", tone: "success" };
  if (score >= 55) return { label: "Fair", tone: "warning" };
  if (score > 0) return { label: "Needs work", tone: "danger" };
  return { label: "No score", tone: "neutral" };
}

function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function AtsGauge({ score = 0, delta = 0 }) {
  const safeScore = Math.max(0, Math.min(100, score || 0));
  const pct = safeScore / 100;
  const dashLength = ARC_LENGTH * pct;
  const status = statusFor(safeScore);
  const animated = useCountUp(safeScore);

  const DeltaIcon =
    delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="text-base">ATS Readiness</CardTitle>
          <CardDescription className="mt-1">
            How well your resume parses for ATS
          </CardDescription>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </CardHeader>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
        <div className="relative w-full max-w-[360px]">
          <svg
            viewBox="0 0 300 170"
            className="w-full h-auto block"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="atsGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-strong)" />
              </linearGradient>
            </defs>

            {/* Track */}
            <path
              d={`M 20 155 A ${RADIUS} ${RADIUS} 0 0 1 280 155`}
              fill="none"
              stroke="var(--surface-2)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Value arc */}
            <motion.path
              d={`M 20 155 A ${RADIUS} ${RADIUS} 0 0 1 280 155`}
              fill="none"
              stroke="url(#atsGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={ARC_LENGTH}
              initial={{ strokeDashoffset: ARC_LENGTH }}
              animate={{ strokeDashoffset: ARC_LENGTH - dashLength }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {/* Score sitting inside the bowl */}
          <div className="absolute inset-x-0 top-[46%] flex flex-col items-center pointer-events-none">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)] font-semibold">
              ATS Score
            </div>
            <div className="font-display tabular text-[60px] font-semibold tracking-tight text-[var(--ink)] leading-none mt-1.5">
              {animated}
            </div>
            <div className="text-[11px] text-[var(--ink-muted)] mt-1">
              out of 100
            </div>
          </div>
        </div>

        {/* Delta pill — below the gauge */}
        <div
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tabular",
            delta > 0 && "bg-[var(--accent-soft)] text-[var(--success)]",
            delta < 0 && "bg-[#F8E3E0] text-[var(--danger)]",
            delta === 0 && "bg-[var(--surface-2)] text-[var(--ink-muted)]"
          )}
        >
          <DeltaIcon size={11} strokeWidth={2.5} />
          {delta > 0 ? "+" : ""}
          {delta} vs last analysis
        </div>
      </div>
    </Card>
  );
}
