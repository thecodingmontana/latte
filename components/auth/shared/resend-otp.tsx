import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AuthFormData } from "@/types/auth";

interface Props {
  formData: AuthFormData;
  isResendOTPCode: boolean;
  isVerifyOTP: boolean;
  setIsResendingOTPCode: Dispatch<SetStateAction<boolean>>;
}

export default function ResendOTPButton({
  setIsResendingOTPCode,
  isResendOTPCode,
  formData,
  isVerifyOTP,
}: Props) {
  const [timeElapsed, setTimeElapsed] = useState(30);
  const [isStopTimer, setIsStopTimer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) return;
    setIsStopTimer(true);
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev > 1) {
          return prev - 1;
        }
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsStopTimer(false);
        return 30;
      });
    }, 1000);
  };

  const resendOtpCode = () => {
    setIsResendingOTPCode(true);
    try {
      startTimer();
      return toast.success("data.message", { position: "top-center" });
    } catch (error: any) {
      if (error.response?.status === 429) {
        const timeMessage =
          "Too many attempts. Please try again in a few moments.";

        return toast.error(timeMessage, {
          position: "top-center",
          duration: 5000,
        });
      }

      // Handle other errors
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred";

      return toast.error(errorMessage, {
        position: "top-center",
      });
    } finally {
      setIsResendingOTPCode(false);
    }
  };

  return (
    <button
      className={cn(
        "font-medium",
        isResendOTPCode || (timeElapsed > 0 && isStopTimer)
          ? "cursor-not-allowed text-muted-foreground text-xs"
          : "cursor-pointer text-brand text-sm hover:text-brand-secondary"
      )}
      disabled={
        isResendOTPCode || (timeElapsed > 0 && isStopTimer) || isVerifyOTP
      }
      onClick={resendOtpCode}
      type="button"
    >
      {isResendOTPCode
        ? "Resending..."
        : isStopTimer
          ? `Resend in ${timeElapsed}s`
          : "Resend"}
    </button>
  );
}
