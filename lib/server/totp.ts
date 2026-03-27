import { eq } from "drizzle-orm";
import { db, tables } from "@/database/db";
import { decrypt, encrypt } from "./encryption";
import { ExpiringTokenBucket, RefillingTokenBucket } from "./rate-limit";

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function getUserTOTPKey(
  userId: string
): Promise<Uint8Array | null> {
  const result = await db
    .select()
    .from(tables.totp_credential)
    .where(eq(tables.totp_credential.user_id, userId));

  if (result.length === 0) {
    throw new Error("Invalid user ID");
  }

  const encrypted = result[0].key;
  if (encrypted === null) {
    return null;
  }
  // Convert base64 string to Uint8Array
  const encryptedArray = new Uint8Array(Buffer.from(encrypted, "base64"));
  return decrypt(encryptedArray);
}

export async function updateUserTOTPKey(
  userId: string,
  key: Uint8Array
): Promise<void> {
  const encrypted = encrypt(key);

  await db.transaction(async (tx) => {
    // Check if user already has 2FA registered
    const existingCredential = await tx
      .select()
      .from(tables.totp_credential)
      .where(eq(tables.totp_credential.user_id, userId))
      .limit(1);

    const isAlreadyRegistered = existingCredential.length > 0;

    // Delete existing credential if any
    if (isAlreadyRegistered) {
      await tx
        .delete(tables.totp_credential)
        .where(eq(tables.totp_credential.user_id, userId));
    }

    // Insert new credential
    await tx.insert(tables.totp_credential).values({
      user_id: userId,
      key: Buffer.from(encrypted).toString("base64"),
    });

    // Update registered_2fa flag if not already set
    if (!isAlreadyRegistered) {
      await tx
        .update(tables.user)
        .set({ registered_2fa: true })
        .where(eq(tables.user.id, userId));
    }
  });
}
