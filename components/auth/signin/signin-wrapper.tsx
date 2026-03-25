"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { IconArrowRight } from "@/components/svgs/icons/arrow-right";
import { IconLockPassword } from "@/components/svgs/icons/lock-password";
import type { AuthFormData } from "@/types/auth";
import SigninForm from "./signin-form";
import SigninVerifyOTPWrapper from "./signin-verify-otp-wrapper";

export default function SigninWrapper() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });

  return (
    <>
      {isOtpSent ? (
        <SigninVerifyOTPWrapper
          formData={formData}
          isOtpSent={isOtpSent}
          setFormData={setFormData}
          setIsOtpSent={setIsOtpSent}
        />
      ) : (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex w-full max-w-102 flex-col gap-8 p-5"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              className="grid size-16 place-content-center rounded-2xl bg-brand/20 text-brand"
              href="/"
            >
              <IconLockPassword className="h-auto w-10" />
            </Link>
          </motion.div>
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1"
            initial={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="font-medium text-2xl text-zinc-950 leading-8 dark:text-white/90">
              Sign in to
            </h1>
            <div className="flex items-center gap-1">
              <p className="text-sm text-zinc-900/50 tracking-tight dark:text-white/50">
                Don&apos;t have an account?
              </p>
              <Link
                className="flex items-center justify-center gap-1 font-medium text-brand text-sm outline-none hover:text-brand-secondary disabled:pointer-events-none disabled:text-zinc-950/10 dark:disabled:text-white/20 dark:hover:text-brand-secondary"
                href="/auth/signup"
              >
                <p>Get Started</p>
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SigninForm setFormData={setFormData} setIsOtpSent={setIsOtpSent} />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
