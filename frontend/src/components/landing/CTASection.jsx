import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { DarkPanel } from "./DarkPanel";

export function CTASection() {
  return (
    <section
      className="px-3 sm:px-6 mt-28 sm:mt-36"
      style={{ maxWidth: 1240, marginLeft: "auto", marginRight: "auto" }}
    >
      <DarkPanel className="px-6 sm:px-12 lg:px-20 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#8FB39C]" />
          <span className="text-[11px] tracking-wide text-white/85 uppercase font-semibold">
            Free forever for your first 3 analyses
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-[36px] sm:text-[52px] lg:text-[64px] leading-[1.04] tracking-tight text-white mt-6 max-w-3xl mx-auto"
        >
          Stop guessing what
          <br />
          recruiters{" "}
          <span
            style={{
              backgroundImage:
                "linear-gradient(120deg, #B6CFC0 0%, #8FB39C 50%, #5B7C6A 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            actually see.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/65 text-base sm:text-lg mt-5 max-w-xl mx-auto leading-relaxed"
        >
          Upload your resume now. Get your ATS score, fixable issues, and AI rewrites
          in under 15 seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/register"
            className="group relative inline-flex items-center gap-2 h-12 px-6 rounded-full font-semibold text-[14px] text-white shadow-[0_10px_30px_-8px_rgba(143,179,156,0.5)] hover:shadow-[0_14px_36px_-8px_rgba(143,179,156,0.7)] active:scale-[0.98] transition-all"
            style={{
              background:
                "linear-gradient(135deg, #8FB39C 0%, #5B7C6A 55%, #2F4A3A 100%)",
            }}
          >
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 50%)",
              }}
            />
            <span className="relative">Start free ATS analysis</span>
            <ArrowRight size={15} className="relative group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-12 px-5 rounded-full font-medium text-[14px] text-white bg-white/8 border border-white/12 backdrop-blur-md hover:bg-white/12 transition-colors"
          >
            I already have an account
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 inline-flex items-center gap-1.5 text-[12px] text-white/50"
        >
          <ShieldCheck size={13} className="text-[#8FB39C]" />
          No credit card · We never store your resume PDF
        </motion.div>
      </DarkPanel>
    </section>
  );
}
