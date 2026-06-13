"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const line = (delay: number) => ({
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.7, delay, ease },
});

function WiggleEmoji({ children }: { children: string }) {
  return (
    <motion.span
      className="inline-block cursor-default"
      whileHover={{ rotate: [0, -12, 12, -8, 0], scale: [1, 1.2, 1.2, 1.1, 1] }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.span>
  );
}

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 50% 45% at 85% 15%, rgba(20, 80, 70, 0.18) 0%, transparent 70%), #050505",
      }}
    >
      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Headline */}
        <div>
          <motion.h1
            className="text-[8vw] md:text-[5.5vw] lg:text-[5vw] font-light leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
            {...line(0.15)}
          >
            Hello, I&apos;m Varnika <WiggleEmoji>👋</WiggleEmoji>
          </motion.h1>

          <motion.h1
            className="text-[8vw] md:text-[5.5vw] lg:text-[5vw] font-light leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
            {...line(0.3)}
          >
            I make products that don&apos;t need
          </motion.h1>

          <motion.h1
            className="text-[8vw] md:text-[5.5vw] lg:text-[5vw] font-light leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
            {...line(0.45)}
          >
            <em className="italic font-normal">tooltips</em>{" "}
            <WiggleEmoji>☝️</WiggleEmoji>. Or{" "}
            <em className="italic font-normal">apologies</em>{" "}
            <WiggleEmoji>💖</WiggleEmoji>
          </motion.h1>
        </div>

        {/* Bio */}
        <motion.p
          className="mt-8 max-w-[540px] text-[0.95rem] md:text-base leading-relaxed"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-secondary)",
          }}
          {...line(0.6)}
        >
          I&apos;m a fullstack developer &amp; designer by profession, problem-solver
          by obsession. I build quietly confident products that let users win.
          <br />
          Career motto = Less bugs, more craft.
        </motion.p>
      </div>
    </section>
  );
}
