"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  return (
    <nav
      aria-label="Main navigation"
      className="relative flex w-full items-center justify-between px-4 py-2 sm:px-6 md:px-8 md:py-4"
    >
      {/* Logo - slides in from left */}
      <motion.span
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        className="bg-clip-text font-bold text-brand text-lg tracking-tighter sm:text-4xl md:text-4xl dark:text-primary"
        initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      >
        Latte
      </motion.span>

      {/* Right side - slides in from right */}
      <motion.div
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
      >
        <ThemeToggle className="rounded-full" />
        <motion.div
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            className="rounded-md bg-brand px-4 py-2 font-semibold text-white text-xs shadow transition hover:bg-brand-secondary"
            href="/auth/signup"
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>
    </nav>
  );
}
