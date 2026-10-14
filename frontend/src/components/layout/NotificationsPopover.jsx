import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Upload, Sparkles, PenLine, History as HistoryIcon } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useHistory } from "@/hooks/useAnalytics";
import { cn, relativeTime } from "@/lib/utils";

const ICONS = {
  upload: Upload,
  analyze: Sparkles,
  rewrite: PenLine,
};

const ICON_TONE = {
  upload: "bg-[var(--surface-2)] text-[var(--ink-muted)]",
  analyze: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  rewrite: "bg-[#FBEFD9] text-[var(--warning)]",
};

const LAST_SEEN_KEY = "arr-notif-last-seen";
const MAX_ITEMS = 10;

function readLastSeen() {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(LAST_SEEN_KEY);
  return raw ? Number(raw) || 0 : 0;
}

export function NotificationsPopover() {
  const navigate = useNavigate();
  const { data } = useHistory();
  const events = (data?.events || []).slice(0, MAX_ITEMS);

  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(readLastSeen);
  const rootRef = useRef(null);

  const unreadCount = useMemo(() => {
    if (!events.length) return 0;
    return events.filter((e) => new Date(e.at).getTime() > lastSeen).length;
  }, [events, lastSeen]);

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (!open && events.length) {
      const newest = new Date(events[0].at).getTime();
      localStorage.setItem(LAST_SEEN_KEY, String(newest));
      setLastSeen(newest);
    }
    setOpen((v) => !v);
  }

  function goTo(e) {
    if (e?.resumeId) navigate(`/resumes/${e.resumeId}`);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        onClick={toggle}
        title="Notifications"
        dot={unreadCount > 0}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} new)` : ""}`}
      >
        <Bell size={16} />
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[52px] z-40 w-[380px] rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-hover overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--ink)]">
                Activity
              </div>
              {events.length > 0 && (
                <span className="text-[11px] text-[var(--ink-muted)] tabular-nums">
                  {events.length} recent
                </span>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {events.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="h-10 w-10 mx-auto rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-muted)] mb-3">
                    <HistoryIcon size={16} />
                  </div>
                  <div className="text-sm font-medium text-[var(--ink)]">
                    Nothing here yet
                  </div>
                  <div className="text-xs text-[var(--ink-muted)] mt-1">
                    Uploads, analyses, and rewrites will show up here.
                  </div>
                </div>
              ) : (
                <ul>
                  {events.map((e, idx) => {
                    const Icon = ICONS[e.type] || HistoryIcon;
                    const tone = ICON_TONE[e.type] || ICON_TONE.upload;
                    return (
                      <li key={e.id}>
                        <button
                          onClick={() => goTo(e)}
                          className={cn(
                            "w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-[var(--surface-2)] transition-colors",
                            idx > 0 && "border-t border-[var(--border)]"
                          )}
                        >
                          <div
                            className={cn(
                              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                              tone
                            )}
                          >
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--ink)] truncate">
                              {e.title}
                            </div>
                            <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 truncate">
                              {e.subtitle}
                            </div>
                          </div>
                          <div className="text-[10px] text-[var(--ink-muted)] shrink-0 tabular-nums mt-0.5">
                            {relativeTime(e.at)}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              onClick={() => {
                navigate("/history");
                setOpen(false);
              }}
              className="w-full h-11 border-t border-[var(--border)] text-xs font-semibold text-[var(--accent-strong)] hover:bg-[var(--surface-2)] transition-colors"
            >
              View all activity
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
