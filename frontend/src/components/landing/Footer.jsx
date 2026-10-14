import { Link } from "react-router-dom";
import AILogo from "@/components/layout/AILogo";

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}
function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M17.53 3H20.7l-6.94 7.94L21.8 21h-6.34l-4.97-6.51L4.8 21H1.62l7.42-8.5L1.5 3h6.5l4.5 5.95L17.53 3zm-1.12 16.13h1.75L6.66 4.78H4.78L16.41 19.13z" />
    </svg>
  );
}
function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.86 3.38-1.86 3.62 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Dashboard", href: "#dashboard-preview" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resume templates", href: "#" },
      { label: "ATS guide", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="px-3 sm:px-6 mt-28 sm:mt-18 pb-12"
      style={{ maxWidth: 1240, marginLeft: "auto", marginRight: "auto" }}
    >
      <div className="rounded-[28px] bg-[var(--surface)] border border-[var(--border)] shadow-card p-8 sm:p-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <AILogo />
              <span className="font-display text-[16px] font-semibold tracking-tight text-[var(--ink)]">
                Resume Roaster
              </span>
            </Link>
            <p className="text-[13px] text-[var(--ink-muted)] mt-4 max-w-xs leading-relaxed">
              AI-powered ATS scoring and resume rewrites — built for engineers who'd
              rather ship than polish.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[GithubIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 rounded-full bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] text-[var(--ink-muted)] hover:text-[var(--accent-strong)] flex items-center justify-center transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--ink)] font-semibold mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[var(--ink-muted)]">
          <div>© 2026 Resume Roaster. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
