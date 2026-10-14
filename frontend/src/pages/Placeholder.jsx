import { Card } from "@/components/ui/Card";
import { Construction } from "lucide-react";

export function Placeholder({ title }) {
  return (
    <Card className="h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center mb-4">
        <Construction size={22} />
      </div>
      <div className="font-display text-xl font-semibold tracking-tight">
        {title}
      </div>
      <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-sm">
        Coming up in the next milestone.
      </p>
    </Card>
  );
}
