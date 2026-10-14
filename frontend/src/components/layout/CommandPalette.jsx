import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  LayoutGrid,
  FileText,
  BarChart3,
  Layers,
  History,
  Settings as SettingsIcon,
  CornerDownLeft,
} from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { useResumesList } from "@/hooks/useResumes";

const NAV_ITEMS = [
  { id: "nav:dashboard", kind: "nav", label: "Dashboard", hint: "Overview", to: "/dashboard", icon: LayoutGrid },
  { id: "nav:resumes", kind: "nav", label: "Resumes", hint: "Browse & upload", to: "/resumes", icon: FileText },
  { id: "nav:insights", kind: "nav", label: "Insights", hint: "Score trends", to: "/insights", icon: BarChart3 },
  { id: "nav:versions", kind: "nav", label: "Versions", hint: "Compare V1 / V2 / V3", to: "/versions", icon: Layers },
  { id: "nav:history", kind: "nav", label: "History", hint: "Past analyses", to: "/history", icon: History },
  { id: "nav:settings", kind: "nav", label: "Settings", hint: "Profile, appearance, password", to: "/settings", icon: SettingsIcon },
];

function scoreMatch(query, text) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = (text || "").toLowerCase();
  if (!t) return 0;
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  // crude subsequence match
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
}

export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { data: resumes } = useResumesList();

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // focus after the modal mounts
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const items = useMemo(() => {
    const resumeItems = (resumes || []).map((r) => ({
      id: `resume:${r._id}`,
      kind: "resume",
      label: r.title,
      hint: `Updated ${relativeTime(r.updatedAt)} · ${r.latestVersionNumber || 1} version${
        (r.latestVersionNumber || 1) > 1 ? "s" : ""
      }`,
      to: `/resumes/${r._id}`,
      icon: FileText,
    }));

    const pool = [...NAV_ITEMS, ...resumeItems];

    if (!query.trim()) return pool;

    return pool
      .map((it) => ({ it, score: scoreMatch(query.trim(), `${it.label} ${it.hint || ""}`) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.it);
  }, [resumes, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[activeIdx];
      if (it) {
        navigate(it.to);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  // group items for rendering
  const navMatches = items.filter((i) => i.kind === "nav");
  const resumeMatches = items.filter((i) => i.kind === "resume");

  let renderIdx = -1;
  function renderItem(it) {
    renderIdx += 1;
    const idx = renderIdx;
    const Icon = it.icon;
    const isActive = idx === activeIdx;
    return (
      <button
        key={it.id}
        data-idx={idx}
        onMouseEnter={() => setActiveIdx(idx)}
        onClick={() => {
          navigate(it.to);
          onClose();
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
          isActive
            ? "bg-[var(--accent-soft)] text-[var(--ink)]"
            : "hover:bg-[var(--surface-2)] text-[var(--ink)]"
        )}
      >
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
            isActive
              ? "bg-[var(--surface)] text-[var(--accent-strong)]"
              : "bg-[var(--surface-2)] text-[var(--ink-muted)]"
          )}
        >
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{it.label}</div>
          {it.hint && (
            <div className="text-xs text-[var(--ink-muted)] truncate">{it.hint}</div>
          )}
        </div>
        {isActive && (
          <span className="text-xs text-[var(--ink-muted)] flex items-center gap-1 shrink-0">
            <CornerDownLeft size={12} /> Enter
          </span>
        )}
      </button>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-[var(--ink)]/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[640px] rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-hover overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 h-14 border-b border-[var(--border)]">
              <Search size={16} className="text-[var(--ink-muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search resumes or jump to a page..."
                className="flex-1 bg-transparent outline-none text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 h-6 rounded-md bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--border)] font-medium">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {items.length === 0 && (
                <div className="text-center text-sm text-[var(--ink-muted)] py-10">
                  No matches for &ldquo;{query}&rdquo;
                </div>
              )}

              {navMatches.length > 0 && (
                <div className="mb-1">
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">
                    Navigate
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {navMatches.map(renderItem)}
                  </div>
                </div>
              )}

              {resumeMatches.length > 0 && (
                <div className="mt-1">
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">
                    Resumes
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {resumeMatches.map(renderItem)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 h-10 border-t border-[var(--border)] bg-[var(--surface-2)]/60 text-[11px] text-[var(--ink-muted)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 h-5 rounded bg-[var(--surface)] border border-[var(--border)] inline-flex items-center">↑</kbd>
                  <kbd className="px-1.5 h-5 rounded bg-[var(--surface)] border border-[var(--border)] inline-flex items-center">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 h-5 rounded bg-[var(--surface)] border border-[var(--border)] inline-flex items-center">↵</kbd>
                  to select
                </span>
              </div>
              <span>{items.length} result{items.length === 1 ? "" : "s"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
