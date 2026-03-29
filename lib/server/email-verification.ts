import { eq } from "drizzle-orm";
import { cache } from "react";
import { db, tables } from "@/database/db";
import { sendEmailVerificationMail } from "./mails/email-verification";
import { ExpiringTokenBucket } from "./rate-limit";
import { getCurrentSession } from "./session";
import { createDate, generateUniqueCode, TimeSpan } from "./utils";

export async function createEmailVerificationRequest(
  email: string
): Promise<EmailVerificationRequest> {
  await deleteUserEmailVerificationRequest(email);
  const code = generateUniqueCode(6);
  const expires_at = createDate(new TimeSpan(10, "m"));
  const [row] = await db
    .insert(tables.unique_code)
    .values({
      email,
      code,
      expires_at,
    })
    .returning();

  const request: EmailVerificationRequest = {
    id: row.id,
    code,
    email,
    expires_at,
  };
  return request;
}

export async function deleteUserEmailVerificationRequest(
  email: string
): Promise<void> {
  await db
    .delete(tables.unique_code)
    .where(eq(tables.unique_code.email, email));
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  expires_at: Date
): Promise<void> {
  console.log(`To ${email}: Your verification code is ${code}`);
  const emailData = {
    email,
    subject: `Your unique Latte verification code is ${code}`,
    code,
    expiryTimestamp: expires_at,
  };
  await sendEmailVerificationMail(emailData);
}

export async function getUserEmailVerificationRequest(
  email: string
): Promise<EmailVerificationRequest | null> {
  const row = await db.query.unique_code.findFirst({
    where: (table) => eq(table.email, email),
  });
  return row
    ? {
        id: row.id,
        code: row.code,
        email: row.email,
        expires_at: row.expires_at,
      }
    : null;
}

export const getCurrentUserEmailVerificationRequest = cache(async () => {
  const { user } = await getCurrentSession();
  if (user === null) {
    return null;
  }
  const request = await getUserEmailVerificationRequest(user.email);
  return request;
});

export const sendVerificationEmailBucket = new ExpiringTokenBucket<string>(
  3,
  60 * 10
);

export interface EmailVerificationRequest {
  code: string;
  email: string;
  expires_at: Date;
  id: string;
}
