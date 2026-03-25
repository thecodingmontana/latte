import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const tables = schema;

const connectionString = process.env.DATABASE_URL!;

const queryClient = postgres(connectionString, {
  prepare: false,
  idle_timeout: 0,
});

const db = drizzle(queryClient, {
  schema,
  casing: "snake_case",
  cache: upstashCache({
    url: process.env.UPSTASH_URL!,
    token: process.env.UPSTASH_TOKEN!,
    global: true,
    config: { ex: 60 },
  }),
});

export { db, queryClient as driver, tables };
