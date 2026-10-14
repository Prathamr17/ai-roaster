import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BrandCardMarquee } from "./BrandCardMarquee";

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.9'/></svg>\")";

export function AuthShell({ children, headline, subhead }) {
  return (
    <div className="min-h-screen flex bg-[var(--bg)] p-3 sm:p-4 gap-0 lg:gap-4">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>

      {/* Right — brand panel (desktop only) */}
      <BrandPanel headline={headline} subhead={subhead} />
    </div>
  );
}

function BrandPanel({ headline, subhead }) {
  return (
    <div className="hidden lg:block flex-1 relative rounded-[28px] overflow-hidden isolate">
      {/* Base dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(140deg, #18271F 0%, #2F4A3A 38%, #1A2B22 72%, #0E1812 100%)",
        }}
      />

      {/* Animated radial glows */}
      <motion.div
        className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,196,179,0.55) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, 25, 0],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-32 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,124,106,0.6) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, -40, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Diagonal sheen sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_DATA_URI }}
      />

      {/* Soft inner vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 120px 20px rgba(0,0,0,0.35)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between pt-10 xl:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="px-10 xl:px-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-md">
            <Sparkles size={12} className="text-white/80" />
            <span className="text-[11px] tracking-wide text-white/80 uppercase font-semibold">
              AI Resume Roaster
            </span>
          </div>

          <h2
            className="font-serif text-[44px] xl:text-[60px] leading-[1.02] text-white mt-8 max-w-[540px]"
            style={{
              fontStyle: "italic",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {headline}
          </h2>

          <p className="text-white/65 text-base xl:text-lg mt-6 max-w-md leading-relaxed">
            {subhead}
          </p>
        </motion.div>

        <div className="pb-8 xl:pb-0">
          <BrandCardMarquee />
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  extra,
  autoComplete,
  required = true,
  minLength,
  icon: Icon,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[var(--ink)]">{label}</label>
        {extra}
      </div>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={`peer w-full h-12 ${
            Icon ? "pl-11 pr-4" : "px-4"
          } rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 outline-none transition-all duration-200 focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-[var(--accent)]/10`}
        />
        {Icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/55 peer-focus:text-[var(--accent-strong)] peer-[:not(:placeholder-shown)]:text-[var(--accent-strong)] transition-colors">
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthPrimaryButton({ children, disabled, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      disabled={disabled}
      className="relative w-full h-12 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 overflow-hidden shadow-[0_8px_24px_-8px_rgba(47,74,58,0.55)] transition-all duration-200 hover:shadow-[0_12px_28px_-8px_rgba(47,74,58,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background:
          "linear-gradient(135deg, #5B7C6A 0%, #3A5C49 50%, #2F4A3A 100%)",
      }}
      {...props}
    >
      {/* Soft sheen on top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 50%)",
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

export function AuthErrorBanner({ children }) {
  if (!children) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-[var(--danger)] bg-[#F8E3E0] rounded-2xl px-4 py-2.5 leading-snug"
    >
      {children}
    </motion.div>
  );
}
