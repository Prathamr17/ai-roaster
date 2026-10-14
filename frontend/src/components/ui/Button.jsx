import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 active:scale-[0.98]",
        accent:
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] active:scale-[0.98]",
        outline:
          "bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
        ghost:
          "bg-transparent text-[var(--ink)] hover:bg-[var(--surface-2)]",
        soft:
          "bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]/80",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-full",
        md: "h-10 px-4 text-sm rounded-full",
        lg: "h-12 px-6 text-sm rounded-full",
        icon: "h-10 w-10 rounded-full",
        iconSm: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export const Button = forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
