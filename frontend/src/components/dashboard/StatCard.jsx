import { ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

function MiniLine({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <LineChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MiniBars({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <BarChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} barSize={6} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  delta,
  chart = "line",
  data = [],
  icon: Icon,
  accent = false,
}) {
  const positive = delta == null ? null : delta >= 0;
  const color = accent ? "#FFFFFF" : "var(--accent)";
  const ChartCmp = chart === "bars" ? MiniBars : MiniLine;
  const displayValue = value == null || value === "" ? "—" : value;
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card
      variant={accent ? "accent" : "default"}
      className={cn(
        "relative overflow-hidden",
        accent && "text-white"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {Icon && (
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center",
                  accent
                    ? "bg-white/15 text-white"
                    : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                )}
              >
                <Icon size={14} />
              </div>
            )}
            <span
              className={cn(
                "text-xs",
                accent ? "text-white/70" : "text-[var(--ink-muted)]"
              )}
            >
              {label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display tabular text-3xl font-semibold tracking-tight">
              {displayValue}
            </span>
            {suffix && (
              <span
                className={cn(
                  "text-sm font-medium",
                  accent ? "text-white/70" : "text-[var(--ink-muted)]"
                )}
              >
                {suffix}
              </span>
            )}
          </div>
          {delta != null && (
            <Badge
              tone={accent ? "ink" : positive ? "success" : "danger"}
              className={cn(accent && "bg-white/15 text-white")}
            >
              {positive ? "+" : ""}
              {delta}%
            </Badge>
          )}
        </div>

        {hasData && (
          <div className="w-[110px] shrink-0 self-end opacity-90">
            <ChartCmp data={data} color={color} />
          </div>
        )}
      </div>
    </Card>
  );
}
