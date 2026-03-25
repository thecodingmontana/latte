import { motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { IconMailbox } from "@/components/svgs/icons/mailbox";
import type { AuthFormData } from "@/types/auth";
import VerifyOTPSignup from "./verify-otp-signup";

interface Props {
  formData: AuthFormData;
  isOtpSent: boolean;
  setFormData: Dispatch<SetStateAction<AuthFormData>>;
  setIsOtpSent: Dispatch<SetStateAction<boolean>>;
}

export default function SignupVerifyOTPWrapper({
  setFormData,
  formData,
  setIsOtpSent,
  isOtpSent,
}: Props) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-100 flex-col gap-6 p-5"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="grid size-16 place-content-center rounded-2xl bg-brand/20 text-brand"
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <IconMailbox className="size-9" />
      </motion.div>
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-1"
        initial={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="font-medium text-2xl text-zinc-950 leading-8 dark:text-white/90">
          Let&apos;s verify OTP
        </h1>
        <p className="text-sm text-zinc-900/50 tracking-tight dark:text-white/50">
          We sent an OTP to <br />
          <strong>{formData.email}</strong>. <br />
          Kindly paste it below to continue.
        </p>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <VerifyOTPSignup
          formData={formData}
          isOTPSent={isOtpSent}
          setFormData={setFormData}
          setIsOTPSent={setIsOtpSent}
        />
      </motion.div>
    </motion.div>
  );
}
