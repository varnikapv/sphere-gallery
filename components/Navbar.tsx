"use client";

import { motion } from "framer-motion";

const navLinks = [
  { label: "Work", href: "#works" },
  { label: "For hiring managers", href: "#about" },
];

export default function Navbar() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-5 pt-4"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <nav
        className="flex w-full max-w-[1100px] items-center justify-between rounded-full px-3 py-2.5"
        style={{
          background: "rgba(10, 18, 18, 0.8)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Logo — asterisk in circle */}
        <a
          href="#"
          className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span
            className="text-2xl leading-none text-white/90"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            ✳
          </span>
        </a>

        {/* Nav links — centered */}
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-5 py-2 text-[0.95rem] font-normal text-white/70 hover:text-white transition-colors duration-200"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Say hello button */}
        <motion.a
          href="#contact"
          className="flex items-center gap-2 rounded-full px-7 py-3 text-[0.95rem] font-medium text-white/90 shrink-0"
          style={{
            fontFamily: "var(--font-sans)",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          Say hello!
          <span className="text-sm">→</span>
        </motion.a>
      </nav>
    </motion.header>
  );
}
