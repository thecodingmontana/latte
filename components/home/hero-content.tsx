"use client";
import { motion, type Variants } from "motion/react";
import Link from "next/link";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.3,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export default function HeroContent() {
  return (
    <motion.div
      animate="show"
      className="space-y-4 px-4 pt-4 pb-10 sm:px-6 sm:pt-8 sm:pb-12 md:px-8 md:py-16"
      initial="hidden"
      variants={container}
    >
      {/* Heading — slides up from below with blur */}
      <motion.h1
        className="max-w-4xl font-medium text-3xl capitalize tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
        variants={fadeUp}
      >
        The personal finance app for everyone.
      </motion.h1>

      {/* Paragraph — slides in from the left with blur */}
      <motion.p
        className="max-w-2xl text-base text-neutral-500 tracking-tighter sm:text-lg md:text-xl lg:text-2xl dark:text-neutral-300"
        variants={slideLeft}
      >
        Latte helps you track every expense, understand your spending, and stay
        in control of your finances — beautifully simple.
      </motion.p>

      {/* Button — pops in with spring scale */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
        variants={popIn}
      >
        <motion.div
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            className="inline-block rounded-md bg-linear-to-t from-blue-600 to-blue-500 px-6 py-3 font-semibold text-sm text-white shadow hover:brightness-105"
            href="/auth/signup"
          >
            Get started for free today
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
