import { motion } from "framer-motion";
import {
  Gauge,
  Sparkles,
  KeyRound,
  Layers,
  GitCompare,
  LineChart,
  FileDown,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Gauge,
    title: "ATS Score Analysis",
    desc: "Section-level scoring against the same parsers Greenhouse and Lever run.",
    preview: <ScoreBarsPreview />,
    span: "lg:col-span-2",
  },
  {
    icon: Sparkles,
    title: "AI Resume Rewrite",
    desc: "Bullets rewritten in your voice, with quantified outcomes — not generic fluff.",
    preview: <RewritePreview />,
  },
  {
    icon: KeyRound,
    title: "Keyword Optimization",
    desc: "Auto-matches your resume against any job description, surfaces what's missing.",
    preview: <KeywordsPreview />,
  },
  {
    icon: Layers,
    title: "Version History",
    desc: "Every iteration scored, dated, and one click away.",
    preview: <VersionsPreview />,
  },
  {
    icon: GitCompare,
    title: "Diff Comparison",
    desc: "See exactly what changed between V1 and V3 — line by line.",
    preview: <DiffPreview />,
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    desc: "Track score evolution, keywords matched, and issues resolved over time.",
    preview: <ChartPreview />,
    span: "lg:col-span-2",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    desc: "Rebuilt with a clean ATS-friendly template — never trust your old layout again.",
    preview: <PdfPreview />,
  },
  // {
  //   icon: Zap,
  //   title: "Instant AI Feedback",
  //   desc: "Sub-15 second analysis powered by Gemini with structured output.",
  //   preview: <SpeedPreview />,
  // },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative px-3 sm:px-6 mt-18 sm:mt-36"
      style={{ maxWidth: 1240, marginLeft: "auto", marginRight: "auto" }}
    >
      {/* Atmospheric sage glow behind the section header */}
      <div
        aria-hidden
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[480px] pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(143,179,156,0.18) 0%, rgba(143,179,156,0.06) 35%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <SectionHeader
        eyebrow="Features"
        title={
          <>
            Everything your resume
            <br className="hidden sm:block" /> needs to{" "}
            <span
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #5B7C6A 0%, #2F4A3A 60%, #5B7C6A 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              actually land.
            </span>
          </>
        }
        sub="Eight surgical tools built around one workflow: upload, analyze, rewrite, ship."
      />

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.05 }}
            className={`group relative rounded-[22px] border border-[var(--border)] shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden ${f.span || ""}`}
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #FBFBF7 100%)",
            }}
          >
            {/* Top-edge gradient highlight (inset light line) */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(91,124,106,0.25), transparent)",
              }}
            />

            {/* Corner halo on hover */}
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-[260px] h-[260px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(143,179,156,0.28) 0%, rgba(143,179,156,0) 65%)",
                filter: "blur(20px)",
              }}
            />

            <div className="relative p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-[1.06] transition-transform duration-300 text-[var(--accent-strong)]"
                  style={{
                    background:
                      "linear-gradient(135deg, #EEF5EF 0%, #D9E7DD 100%)",
                    boxShadow:
                      "inset 0 1px 0 0 rgba(255,255,255,0.7), 0 1px 2px rgba(47,74,58,0.06)",
                  }}
                >
                  <f.icon size={17} strokeWidth={2.25} />
                </div>
                <div>
                  <h3 className="font-display text-[17px] font-semibold tracking-tight text-[var(--ink)]">
                    {f.title}
                  </h3>
                  <p className="text-[13px] text-[var(--ink-muted)] mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>

              <div className="mt-5">{f.preview}</div>
            </div>

            {/* Bottom sage line on hover */}
            <div
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-px opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, sub, center = true }) {
  return (
    <div className={center ? "text-center max-w-3xl mx-auto" : "max-w-3xl"}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] text-[11px] font-semibold uppercase tracking-[0.12em]">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-tight text-[var(--ink)] mt-4">
        {title}
      </h2>
      {sub && (
        <p className="text-[15px] sm:text-base text-[var(--ink-muted)] mt-4 leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ---------------- mini previews ---------------- */

function ScoreBarsPreview() {
  const bars = [
    { label: "Keywords", value: 88 },
    { label: "Format", value: 74 },
    { label: "Impact", value: 91 },
    { label: "Readability", value: 82 },
  ];
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
            Score breakdown
          </div>
          <div className="font-display tabular text-[26px] font-semibold tracking-tight">
            86<span className="text-sm text-[var(--ink-muted)]">/100</span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--success)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full font-semibold tabular">
          +18 pts
        </div>
      </div>
      <div className="space-y-2.5">
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className="flex justify-between text-[11px] text-[var(--ink-muted)] mb-1">
              <span>{b.label}</span>
              <span className="tabular text-[var(--ink)] font-semibold">
                {b.value}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${b.value}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.9,
                  delay: 0.1 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewritePreview() {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 space-y-2">
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-3">
        <div className="text-[9px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold mb-1">
          Before
        </div>
        <div className="text-[12px] text-[var(--ink-muted)] leading-snug line-through">
          Worked on backend stuff
        </div>
      </div>
      <div className="rounded-xl bg-[var(--accent-soft)] p-3">
        <div className="text-[9px] uppercase tracking-wide text-[var(--accent-strong)] font-semibold mb-1">
          After
        </div>
        <div className="text-[12px] text-[var(--ink)] leading-snug">
          Built 6 Node services handling 4.2M req/day at p99 &lt;120ms.
        </div>
      </div>
    </div>
  );
}

function KeywordsPreview() {
  const matched = ["React", "TypeScript", "Node.js"];
  const missing = ["GraphQL", "Docker"];
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
      <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold mb-2">
        Job: Senior Frontend @ Stripe
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {matched.map((k) => (
          <span
            key={k}
            className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] text-[10px] font-semibold"
          >
            ✓ {k}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {missing.map((k) => (
          <span
            key={k}
            className="px-2 py-0.5 rounded-full bg-[#F8E3E0] text-[var(--danger)] text-[10px] font-semibold"
          >
            + {k}
          </span>
        ))}
      </div>
    </div>
  );
}

function VersionsPreview() {
  const versions = [
    { label: "V1", score: 62 },
    { label: "V2", score: 78 },
    { label: "V3", score: 86 },
  ];
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 flex items-center gap-2">
      {versions.map((v, i) => (
        <div
          key={v.label}
          className={`flex-1 rounded-xl p-2.5 ${
            i === versions.length - 1
              ? "bg-[var(--accent-soft)] border border-[var(--accent)]/30"
              : "bg-[var(--surface)] border border-[var(--border)]"
          }`}
        >
          <div className="text-[9px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
            {v.label}
          </div>
          <div className="font-display tabular text-[20px] font-semibold tracking-tight mt-0.5">
            {v.score}
          </div>
        </div>
      ))}
    </div>
  );
}

function DiffPreview() {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-3 space-y-1 font-mono text-[11px]">
      <div className="flex gap-2 px-2 py-1 rounded-md bg-[#F8E3E0]/50">
        <span className="text-[var(--danger)] font-bold w-3">−</span>
        <span className="text-[var(--ink-muted)] line-through">
          helped team
        </span>
      </div>
      <div className="flex gap-2 px-2 py-1 rounded-md bg-[var(--accent-soft)]/60">
        <span className="text-[var(--success)] font-bold w-3">+</span>
        <span className="text-[var(--ink)]">led 4-person frontend pod</span>
      </div>
      <div className="flex gap-2 px-2 py-1 rounded-md bg-[var(--accent-soft)]/60">
        <span className="text-[var(--success)] font-bold w-3">+</span>
        <span className="text-[var(--ink)]">shipped 12 features in Q3</span>
      </div>
    </div>
  );
}

function ChartPreview() {
  const pts = [42, 58, 51, 67, 74, 81, 86];
  const max = 100;
  const w = 320;
  const h = 90;
  const stepX = w / (pts.length - 1);
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)] font-semibold">
            Score over 7 iterations
          </div>
          <div className="font-display tabular text-[26px] font-semibold tracking-tight">
            86
          </div>
        </div>
        <div className="text-[10px] text-[var(--success)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full font-semibold tabular">
          +44 since V1
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[90px]">
        <defs>
          <linearGradient id="featAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#featAreaGrad)" />
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function PdfPreview() {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 flex items-center justify-center">
      <div className="w-[120px] h-[140px] rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-card p-2 space-y-1.5 rotate-[-3deg]">
        <div className="h-1.5 w-12 rounded-full bg-[var(--ink)]" />
        <div className="h-1 w-16 rounded-full bg-[var(--border)]" />
        <div className="pt-1 space-y-1">
          {[10, 14, 12, 16, 11].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full bg-[var(--border)]"
              style={{ width: `${w * 5}px` }}
            />
          ))}
        </div>
        <div className="pt-1.5 h-1 w-10 rounded-full bg-[var(--accent)]" />
        <div className="space-y-1">
          {[15, 11, 13].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full bg-[var(--border)]"
              style={{ width: `${w * 5}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SpeedPreview() {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
      <div className="flex items-center gap-3">
        <div className="font-display tabular text-[34px] font-semibold tracking-tight text-[var(--ink)]">
          12s
        </div>
        <div className="text-[11px] text-[var(--ink-muted)] leading-snug">
          avg. analysis time
          <br />
          <span className="text-[var(--accent-strong)] font-semibold">
            Gemini · structured output
          </span>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "92%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)]"
        />
      </div>
    </div>
  );
}
