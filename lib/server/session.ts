import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db, tables } from "@/database/db";
import type { User } from "./user";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15;
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2;

const cookie = await cookies();

async function fetchUserFromDatabase(
  sessionId: string,
  now: number
): Promise<SessionValidationResult> {
  try {
    const result = await db
      .select({
        sessionId: tables.session.id,
        user_id: tables.session.user_id,
        expires_at: tables.session.expires_at,
        two_factor_verified: tables.session.two_factor_verified,
        email: tables.user.email,
        username: tables.user.username,
        avatar: tables.user.avatar,
        registered_2fa: tables.user.registered_2fa,
        email_verified: tables.user.email_verified,
        created_at: tables.user.created_at,
        updated_at: tables.user.updated_at,
        has_totp: tables.totp_credential.id,
        has_passkey: tables.passkey_credential.id,
      })
      .from(tables.session)
      .innerJoin(tables.user, eq(tables.session.user_id, tables.user.id))
      .leftJoin(
        tables.totp_credential,
        eq(tables.session.user_id, tables.totp_credential.user_id)
      )
      .leftJoin(
        tables.passkey_credential,
        eq(tables.user.id, tables.passkey_credential.user_id)
      )
      .where(eq(tables.session.id, sessionId));

    const row = result?.[0];
    if (!row) return { session: null, user: null };

    const session: Session = {
      id: row.sessionId,
      user_id: row.user_id,
      expires_at: new Date(row.expires_at),
      two_factor_verified: row.two_factor_verified,
    };

    const user: User = {
      id: row.user_id,
      email: row.email,
      username: row.username,
      avatar: row.avatar,
      email_verified: row.email_verified,
      registered_2fa: row.registered_2fa,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      registered_passkey: Boolean(row.has_passkey),
      registered_totp: Boolean(row.has_totp),
    };

    if (user.registered_passkey || user.registered_totp) {
      user.registered_2fa = true;
    }

    if (now >= session.expires_at.getTime()) {
      await db.delete(tables.session).where(eq(tables.session.id, sessionId));
      return { session: null, user: null };
    }

    if (now >= session.expires_at.getTime() - SESSION_REFRESH_INTERVAL_MS) {
      const newExpiresAt = new Date(now + SESSION_MAX_DURATION_MS);
      session.expires_at = newExpiresAt;
      void db
        .update(tables.session)
        .set({ expires_at: sql`${Math.floor(newExpiresAt.getTime() / 1000)}` })
        .where(eq(tables.session.id, sessionId))
        .catch(() => null);
    }

    return { session, user };
  } catch (error) {
    console.error("[fetchUserFromDatabase] Error fetching session", error);
    return {
      session: null,
      user: null,
    };
  }
}

export function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  return fetchUserFromDatabase(sessionId, Date.now());
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = cookie.get("session")?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(token);
    return result;
  }
);

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(tables.session).where(eq(tables.session.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(tables.session).where(eq(tables.session.user_id, userId));
}

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookie.set("session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(): void {
  cookie.set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

// export function generateSessionToken(): string {
//   const tokenBytes = new Uint8Array(20);
//   globalThis.crypto.getRandomValues(tokenBytes);
//   return encodeBase32(tokenBytes).toLowerCase();
// }

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
  metadata: SessionMetadata,
  flags: SessionFlags
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);

  const session: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
    two_factor_verified: flags.two_factor_verified,
  };

  await db.insert(tables.session).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
    location: metadata.location,
    browser: metadata.browser,
    device: metadata.device,
    os: metadata.os,
  });

  return session;
}

export async function setSessionAs2FAVerified(
  sessionId: string
): Promise<void> {
  await db
    .update(tables.session)
    .set({ two_factor_verified: true })
    .where(eq(tables.session.id, sessionId));
}

export interface SessionFlags {
  two_factor_verified: boolean;
}

export interface Session extends SessionFlags {
  expires_at: Date;
  id: string;
  user_id: string;
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export type SessionMetadata = {
  location: string;
  browser: string;
  device: string;
  os: string;
  ipAddress: string;
};
