import { encodeHexLowerCase } from "@oslojs/encoding";
import { and, eq } from "drizzle-orm";
import { db, tables } from "@/database/db";

const challengeBucket = new Set<string>();

export function createWebAuthnChallenge(): Uint8Array {
  const challenge = new Uint8Array(20);
  crypto.getRandomValues(challenge);
  const encoded = encodeHexLowerCase(challenge);
  challengeBucket.add(encoded);
  return challenge;
}

export function verifyWebAuthnChallenge(challenge: Uint8Array): boolean {
  const encoded = encodeHexLowerCase(challenge);
  return challengeBucket.delete(encoded);
}

export async function getUserPasskeyCredentials(
  userId: string
): Promise<WebAuthnUserCredential[]> {
  const rows = await db
    .select()
    .from(tables.passkey_credential)
    .where(eq(tables.passkey_credential.user_id, userId));

  return rows.map((row) => ({
    id: new Uint8Array(Buffer.from(row.id, "base64")),
    user_id: row.user_id,
    name: row.name,
    algorithm_id: row.algorithm,
    public_key: new Uint8Array(Buffer.from(row.public_key, "base64")),
    created_at: row.created_at,
  }));
}

export async function getPasskeyCredential(
  credentialId: Uint8Array
): Promise<WebAuthnUserCredential | null> {
  const credentialIdString = Buffer.from(credentialId).toString("base64");

  const row = await db
    .select()
    .from(tables.passkey_credential)
    .where(eq(tables.passkey_credential.id, credentialIdString))
    .limit(1);
  if (row.length === 0) {
    return null;
  }

  return {
    id: new Uint8Array(Buffer.from(row[0].id, "base64")),
    user_id: row[0].user_id,
    name: row[0].name,
    algorithm_id: row[0].algorithm,
    public_key: new Uint8Array(Buffer.from(row[0].public_key, "base64")),
    created_at: row[0].created_at,
  };
}

export async function getUserPasskeyCredential(
  userId: string,
  credentialId: Uint8Array
): Promise<WebAuthnUserCredential | null> {
  const credentialIdString = Buffer.from(credentialId).toString("base64");

  const row = await db
    .select()
    .from(tables.passkey_credential)
    .where(
      and(
        eq(tables.passkey_credential.id, credentialIdString),
        eq(tables.passkey_credential.user_id, userId)
      )
    )
    .limit(1);
  if (row.length === 0) {
    return null;
  }
  return {
    id: new Uint8Array(Buffer.from(row[0].id, "base64")),
    user_id: row[0].user_id,
    name: row[0].name,
    algorithm_id: row[0].algorithm,
    public_key: new Uint8Array(Buffer.from(row[0].public_key, "base64")),
    created_at: row[0].created_at,
  };
}

export async function createPasskeyCredential(
  credential: WebAuthnUserCredential
): Promise<void> {
  const credentialId = Buffer.from(credential.id).toString("base64");
  const public_key = Buffer.from(credential.public_key).toString("base64");

  await db.insert(tables.passkey_credential).values({
    id: credentialId,
    user_id: credential.user_id,
    name: credential.name,
    algorithm: credential.algorithm_id,
    public_key,
  });
}

export async function deleteUserPasskeyCredential(
  userId: string,
  credentialId: Uint8Array
): Promise<boolean> {
  const credentialIdString = Buffer.from(credentialId).toString("base64");
  const result = await db
    .delete(tables.passkey_credential)
    .where(
      and(
        eq(tables.passkey_credential.id, credentialIdString),
        eq(tables.passkey_credential.user_id, userId)
      )
    )
    .returning();
  return result.length > 0;
}

export interface WebAuthnUserCredential {
  algorithm_id: number;
  created_at: Date;
  id: Uint8Array;
  name: string;
  public_key: Uint8Array;
  user_id: string;
}
