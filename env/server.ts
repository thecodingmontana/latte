import { decodeBase64 } from "@oslojs/encoding";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    UPSTASH_URL: z.string().min(1),
    UPSTASH_TOKEN: z.string().min(1),
    ENCRYPTION_KEY: z
      .string()
      .min(1, "ENCRYPTION_KEY is required")
      .refine(
        (key) => {
          try {
            const decoded = decodeBase64(key);
            return decoded.length === 16;
          } catch {
            return false;
          }
        },
        {
          message:
            "ENCRYPTION_KEY must be a valid base64 string that decodes to exactly 16 bytes",
        }
      ),
  },
  experimental__runtimeEnv: process.env,
});
