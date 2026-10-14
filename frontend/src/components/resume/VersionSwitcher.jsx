import { cn } from "@/lib/utils";

export function VersionSwitcher({ versions, activeId, onChange }) {
  if (!versions?.length) return null;
  return (
    <div className="inline-flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] p-1 rounded-full">
      {versions.map((v) => (
        <button
          key={v._id}
          onClick={() => onChange(v._id)}
          className={cn(
            "h-8 px-3 text-xs font-medium rounded-full transition-colors tabular",
            activeId === v._id
              ? "bg-[var(--surface)] text-[var(--ink)] shadow-card"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
