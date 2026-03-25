import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, InfoIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { detectBrowser } from "@/lib/detect-browser";
import type { AuthFormData } from "@/types/auth";
import { codeFormSchema } from "@/zod-schema/auth";
import ResendOTPButton from "../shared/resend-otp";

interface Props {
  formData: AuthFormData;
  isOTPSent: boolean;
  setFormData: Dispatch<SetStateAction<AuthFormData>>;
  setIsOTPSent: Dispatch<SetStateAction<boolean>>;
}

export default function VerifyOTPSignin({ setIsOTPSent, formData }: Props) {
  const router = useRouter();
  const [isResendOtpCode, setIsResendingOtpCode] = useState(false);
  const [isVerifyOtp, setIsVerifyOtp] = useState(false);

  const form = useForm<z.infer<typeof codeFormSchema>>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const isFormValid = form.formState.isValid;
  const codeValue = form.watch("code");
  const hasCode = codeValue.length === 6;

  async function onSubmit(values: z.infer<typeof codeFormSchema>) {
    setIsVerifyOtp(true);
    try {
      const clientBrowser = await detectBrowser();
      console.log("clientBrowser", clientBrowser);

      router.push("/my-stores");

      return toast.success("data.message", {
        position: "top-center",
      });
    } catch (error: any) {
      if (error.response?.status === 429) {
        const timeMessage =
          "Too many attempts. Please try again in a few moments.";

        return toast.error(timeMessage, {
          position: "top-center",
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
      setIsVerifyOtp(false);
    }
  }

  const onCancel = () => {
    setIsOTPSent(false);
  };
  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto flex w-full justify-center">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="mx-auto flex w-full justify-center">
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      disabled={isVerifyOtp || isResendOtpCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full items-center justify-between pt-1">
          <p className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
            <InfoIcon className="size-4" />
            Paste the verification code sent to your email
          </p>
          <ResendOTPButton
            formData={formData}
            isResendOTPCode={isResendOtpCode}
            isVerifyOTP={isVerifyOtp}
            setIsResendingOTPCode={setIsResendingOtpCode}
          />
        </div>
        <div className="space-y-2">
          <Button
            className="w-full bg-brand text-white hover:bg-brand-secondary"
            disabled={
              isVerifyOtp || isResendOtpCode || !isFormValid || !hasCode
            }
            type="submit"
          >
            {isVerifyOtp && <Loader2 className="size-4 animate-spin" />}
            Continue
          </Button>
          <Button
            className="w-full"
            disabled={isVerifyOtp || isResendOtpCode}
            mode="link"
            onClick={() => onCancel()}
            type="button"
          >
            <ChevronLeft />
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
