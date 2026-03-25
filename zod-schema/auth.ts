import * as z from "zod";

// Reusable email schema
export const emailSchema = z
  .string()
  .check(z.email({ message: "Please enter a valid email address" }))
  .toLowerCase()
  .refine(
    (email) => {
      // Reject emails with consecutive dots
      return !email.includes("..");
    },
    { message: "Email cannot contain consecutive dots" }
  )
  .refine(
    (email) => {
      // Basic domain validation (at least one dot after @)
      const domain = email.split("@")[1];
      return domain?.includes(".");
    },
    { message: "Please enter a valid email domain" }
  );

// Reusable password schema
export const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be at least 8 characters long",
  })
  .max(128, {
    message: "Password is too long (max 128 characters)",
  })
  // At least one lowercase letter
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  // At least one uppercase letter
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  // At least one digit
  .refine((password) => /\d/.test(password), {
    message: "Password must contain at least one number",
  })
  // At least one special character
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    message:
      'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
  })
  // No common weak patterns
  .refine(
    (password) => {
      const weakPatterns = [
        /^(.)\1+$/, // All same character
        /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
        /^(password|123456|qwerty|admin|letmein)/i, // Common passwords
      ];
      return !weakPatterns.some((pattern) => pattern.test(password));
    },
    { message: "Password is too weak - avoid common patterns and sequences" }
  )
  // No whitespace at start or end
  .refine((password) => password === password.trim(), {
    message: "Password cannot start or end with whitespace",
  });

// Reusable verification code schema
export const verificationCodeSchema = z.string().min(6, {
  message: "Verification code must be 6 characters.",
});

// Form schemas using the reusable components
export const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verifyCodeFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  code: verificationCodeSchema,
  clientBrowser: z.string().optional(),
});

export const resendCodeSchema = z.object({
  email: emailSchema,
});

export const codeFormSchema = z.object({
  code: verificationCodeSchema,
});

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

export const resetPasswordFormSchema = z.object({
  code: verificationCodeSchema,
  new_password: passwordSchema,
});

export const resetPasswordActionSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
  new_password: passwordSchema,
});

export const otpCodeVerificationFormSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
});

export const otpCodeVerificationActionSchema = z.object({
  code: verificationCodeSchema,
});

export const setNewPasswordFormSchema = z.object({
  password: passwordSchema,
});
