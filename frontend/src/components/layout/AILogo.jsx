import { motion } from "framer-motion";

const AILogo = () => {
  return (
    <div
      className="relative h-12 w-12 flex items-center justify-center"
      aria-label="AI is online"
    >
      {/* Soft outer halo glow — breathes */}
      <motion.div
        className="absolute -inset-1 rounded-[20px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 65%)",
          filter: "blur(10px)",
        }}
        animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.85, 1.08, 0.85] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating conic gradient ring (the sweep) */}
      <div className="absolute inset-0 rounded-[16px] overflow-hidden">
        <motion.div
          className="absolute -inset-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, #2F4A3A, #5B7C6A, #A8C4B3, #5B7C6A, #2F4A3A)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Inner card (creates the ring frame) */}
      <div className="relative h-[38px] w-[38px] rounded-[12px] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
        {/* Soft inner gradient backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, var(--accent-soft) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Shimmering diamond */}
        <motion.div
          className="relative h-[18px] w-[18px] rounded-[4px]"
          style={{
            background:
              "linear-gradient(135deg, #5B7C6A 0%, #2F4A3A 50%, #5B7C6A 100%)",
            backgroundSize: "200% 200%",
            rotate: 45,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            scale: [1, 1.12, 1],
            rotate: [45, 60, 45],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Inner highlight sparkle */}
        <motion.div
          className="absolute h-[3px] w-[3px] rounded-full bg-white"
          style={{ boxShadow: "0 0 6px rgba(255,255,255,0.9)" }}
          animate={{
            opacity: [0, 1, 0],
            top: ["28%", "42%", "62%"],
            left: ["38%", "58%", "42%"],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Tiny second sparkle, offset timing */}
        <motion.div
          className="absolute h-[2px] w-[2px] rounded-full bg-white"
          style={{ boxShadow: "0 0 4px rgba(255,255,255,0.8)" }}
          animate={{
            opacity: [0, 1, 0],
            top: ["58%", "30%", "60%"],
            left: ["62%", "40%", "30%"],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.1,
          }}
        />
      </div>
    </div>
  );
};

export default AILogo;
