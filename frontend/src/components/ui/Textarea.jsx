import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      "w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none transition-colors focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 disabled:opacity-50 resize-y font-sans",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
