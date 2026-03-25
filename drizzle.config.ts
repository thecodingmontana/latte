import type { Config } from "drizzle-kit";
import { env } from "./env/server";

export default {
  out: "./database/migrations",
  schema: "./database/schema/index.ts",
  breakpoints: true,
  verbose: true,
  strict: true,
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
