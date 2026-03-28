import { and, eq, sql } from "drizzle-orm";
import { db, tables } from "@/database/db";
import { passkey_credential, totp_credential, user } from "@/database/schema";
import { hashPassword } from "./password";

export interface User {
  avatar: string;
  created_at: Date;
  email: string;
  email_verified: boolean;
  id: string;
  registered_2fa: boolean;
  registered_passkey: boolean;
  registered_totp: boolean;
  updated_at: Date;
  username: string;
}

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  // const recoveryCode = generateRandomRecoveryCode();
  // const encryptedRecoveryCode = encryptString(recoveryCode);
  // const row = db.queryOne(
  // 	"INSERT INTO user (email, username, password_hash, recovery_code) VALUES (?, ?, ?, ?) RETURNING user.id",
  // 	[email, username, passwordHash, encryptedRecoveryCode]
  //  );

  const [row] = await db
    .insert(tables.user)
    .values({
      avatar: "",
      email,
      username,
      password: passwordHash,
      email_verified: false,
    })
    .returning();

  if (row === null) {
    throw new Error("Unexpected error");
  }
  const user: User = {
    id: row.id,
    username,
    email,
    email_verified: row.email_verified,
    registered_2fa: false,
    registered_passkey: false,
    registered_totp: false,
    avatar: row.avatar,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  return user;
}

export async function updateUserPassword(
  user_id: string,
  password: string
): Promise<void> {
  const passwordHash = await hashPassword(password);

  await db
    .update(tables.user)
    .set({
      password: passwordHash,
      updated_at: new Date(),
    })
    .where(eq(tables.user.id, user_id));
}

export async function updateUserEmailAndSetEmailAsVerified(
  user_id: string,
  email: string
): Promise<void> {
  await db
    .update(tables.user)
    .set({
      email_verified: true,
      email,
    })
    .where(eq(tables.user.id, user_id));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
  user_id: string,
  email: string
): Promise<boolean> {
  const result = await db
    .update(tables.user)
    .set({
      email_verified: true,
    })
    .where(and(eq(tables.user.id, user_id), eq(tables.user.email, email)))
    .returning();
  return result.length > 0;
}

export async function getUserPasswordHash(user_id: string): Promise<string> {
  const row = await db.query.user.findFirst({
    where: (table) => eq(table.id, user_id),
    columns: { password: true },
  });
  if (!row) {
    throw new Error("Invalid user ID");
  }
  return row.password!;
}

// export function getUserRecoverCode(userId: number): string {
// 	const row = db.queryOne("SELECT recovery_code FROM user WHERE id = ?", [userId]);
// 	if (row === null) {
// 		throw new Error("Invalid user ID");
// 	}
// 	return decryptToString(row.bytes(0));
// }

// export function resetUserRecoveryCode(userId: number): string {
// 	const recoveryCode = generateRandomRecoveryCode();
// 	const encrypted = encryptString(recoveryCode);
// 	db.execute("UPDATE user SET recovery_code = ? WHERE id = ?", [encrypted, userId]);
// 	return recoveryCode;
// }

export async function getUserFromEmail(email: string): Promise<User | null> {
  const result = await db
    .select({
      id: user.id,
      email: user.email,
      username: user.username,
      email_verified: user.email_verified,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at,
      registered_totp: sql<boolean>`(${totp_credential.id} IS NOT NULL)`,
      registered_passkey: sql<boolean>`(${passkey_credential.id} IS NOT NULL)`,
    })
    .from(user)
    .leftJoin(totp_credential, eq(totp_credential.user_id, user.id))
    .leftJoin(passkey_credential, eq(passkey_credential.user_id, user.id))
    .where(eq(user.email, email))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  const registered_totp = Boolean(row.registered_totp);
  const registered_passkey = Boolean(row.registered_passkey);

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    email_verified: row.email_verified,
    avatar: row.avatar,
    created_at: row.created_at,
    updated_at: row.updated_at,
    registered_totp,
    registered_passkey,
    registered_2fa: registered_totp || registered_passkey,
  };
}
