import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--ink-muted)] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
