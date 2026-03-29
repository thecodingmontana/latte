"use server";
import { faker } from "@faker-js/faker";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkEmailAvailability, verifyEmailInput } from "@/lib/server/email";
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
} from "@/lib/server/email-verification";
import { verifyPasswordStrength } from "@/lib/server/password";
import { RefillingTokenBucket } from "@/lib/server/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/requests";
import type { SessionFlags, SessionMetadata } from "@/lib/server/session";
import {
  createSession,
  createSessionMetadata,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/server/session";
import { createUser } from "@/lib/server/user";
import { capitalize } from "@/lib/server/utils";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export async function signupAction(form: {
  email: string;
  password: string;
  clientBrowser: string;
}): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return { error: "Too many requests", message: null };
  }

  const headersList = await headers();
  const clientIP = headersList.get("X-Forwarded-For");

  if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
    return { error: "Too many requests", message: null };
  }

  const { email, clientBrowser, password } = form;

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid or missing fields", message: null };
  }
  if (email === "" || password === "") {
    return { error: "Please enter your email and password.", message: null };
  }
  if (!verifyEmailInput(email)) {
    return { error: "Invalid email", message: null };
  }

  const emailTaken = await checkEmailAvailability(email);
  if (emailTaken) {
    return { error: "Email is already used", message: null };
  }

  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) {
    return { error: "Weak password", message: null };
  }

  if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
    return { error: "Too many requests", message: null };
  }

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${capitalize(firstName)} ${capitalize(lastName)}`;
  const firstInitial = capitalize(firstName.charAt(0));
  const lastInitial = capitalize(lastName.charAt(0));
  const imageText = `https://avatar.vercel.sh/vercel.svg?text=${firstInitial}${lastInitial}`;

  const user = await createUser(email, fullName, password, imageText);

  const emailVerificationRequest = await createEmailVerificationRequest(
    user.email
  );
  await sendVerificationEmail(
    emailVerificationRequest.email,
    emailVerificationRequest.code,
    emailVerificationRequest.expires_at
  );

  const rawHeaders = Object.fromEntries(headersList.entries());
  const metadata: SessionMetadata = await createSessionMetadata(
    rawHeaders,
    typeof clientBrowser === "string" ? clientBrowser : undefined
  );

  const sessionFlags: SessionFlags = { two_factor_verified: false };
  const sessionToken = generateSessionToken();
  const session = await createSession(
    sessionToken,
    user.id,
    metadata,
    sessionFlags
  );
  await setSessionTokenCookie(sessionToken, session.expires_at);
  return redirect("/auth/verify-email");
}

interface ActionResult {
  error: string | null;
  message: string | null;
}
