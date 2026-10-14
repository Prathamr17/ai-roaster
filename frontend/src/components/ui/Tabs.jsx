import { createContext, useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TabsCtx = createContext(null);

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsCtx.Provider value={{ value, onValueChange }}>
      <div className={cn("", className)}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] p-1 rounded-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "relative px-3.5 h-8 text-xs font-medium rounded-full transition-colors",
        active ? "text-[var(--bg)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
        className
      )}
    >
      {active && (
        <motion.span
          layoutId="tab-active"
          className="absolute inset-0 rounded-full bg-[var(--ink)]"
          transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return <div className={cn("", className)}>{children}</div>;
}
