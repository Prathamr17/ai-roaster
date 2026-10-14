import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function KeepSharpCard() {
  return (
    <Card className="h-full flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center mb-3">
        <Sparkles size={22} />
      </div>
      <div className="font-display text-base font-semibold tracking-tight">
        Keep sharpening
      </div>
      <p className="text-xs text-[var(--ink-muted)] mt-1 max-w-[180px]">
        Re-run analysis weekly. New roles bring new keyword targets.
      </p>
      <Button variant="accent" size="sm" className="mt-4">
        Re-analyze
      </Button>
    </Card>
  );
}
