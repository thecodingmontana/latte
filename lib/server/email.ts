import { eq } from "drizzle-orm";
import { db } from "@/database/db";

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const row = await db.query.user.findFirst({
    where: (table) => eq(table.email, email),
  });
  return !!row;
}
