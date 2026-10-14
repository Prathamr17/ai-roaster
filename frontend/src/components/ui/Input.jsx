import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-10 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none transition-colors focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const SearchInput = forwardRef(
  ({ className, leftIcon, rightSlot, ...props }, ref) => (
    <div
      className={cn(
        "group flex items-center gap-3 h-11 rounded-full bg-[var(--surface)] border border-[var(--border)] pl-5 pr-1.5 shadow-card transition-shadow hover:shadow-hover focus-within:ring-2 focus-within:ring-[var(--accent)]/20",
        className
      )}
    >
      {leftIcon && (
        <span className="text-[var(--ink-muted)] shrink-0">{leftIcon}</span>
      )}
      <input
        ref={ref}
        type="text"
        className="flex-1 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none"
        {...props}
      />
      {rightSlot}
    </div>
  )
);
SearchInput.displayName = "SearchInput";
