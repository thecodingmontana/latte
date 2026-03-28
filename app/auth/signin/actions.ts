"use server";

import {
  decodePKIXECDSASignature,
  decodeSEC1PublicKey,
  p256,
  verifyECDSASignature,
} from "@oslojs/crypto/ecdsa";
import {
  decodePKCS1RSAPublicKey,
  sha256ObjectIdentifier,
  verifyRSASSAPKCS1v15Signature,
} from "@oslojs/crypto/rsa";
import { sha256 } from "@oslojs/crypto/sha2";
import { decodeBase64 } from "@oslojs/encoding";
import type { AuthenticatorData, ClientData } from "@oslojs/webauthn";
import {
  ClientDataType,
  coseAlgorithmES256,
  coseAlgorithmRS256,
  createAssertionSignatureMessage,
  parseAuthenticatorData,
  parseClientDataJSON,
} from "@oslojs/webauthn";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { get2FARedirect } from "@/lib/server/2fa";
import { verifyEmailInput } from "@/lib/server/email";
import { verifyPasswordHash } from "@/lib/server/password";
import { RefillingTokenBucket, Throttler } from "@/lib/server/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/requests";
import type { SessionFlags, SessionMetadata } from "@/lib/server/session";
import {
  createSession,
  createSessionMetadata,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/server/session";
import { getUserFromEmail, getUserPasswordHash } from "@/lib/server/user";
import {
  getPasskeyCredential,
  verifyWebAuthnChallenge,
} from "@/lib/server/webauthn";

const throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function signinAction(form: {
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

  const user = await getUserFromEmail(email);
  if (user === null) {
    return { error: "Account does not exist", message: null };
  }

  if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
    return { error: "Too many requests", message: null };
  }
  if (!throttler.consume(user.id)) {
    return { error: "Too many requests", message: null };
  }

  const passwordHash = await getUserPasswordHash(user.id);
  const validPassword = await verifyPasswordHash(passwordHash, password);
  if (!validPassword) {
    return { error: "Invalid password", message: null };
  }

  throttler.reset(user.id);

  // Build metadata the same way as your other routes
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

  if (!user.email_verified) {
    return redirect("/verify-email");
  }
  if (!user.registered_2fa) {
    return redirect("/2fa/setup");
  }
  return redirect(get2FARedirect(user));
}

export async function loginWithPasskeyAction(
  data: unknown
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return { error: "Too many requests", message: null };
  }

  const parser = new ObjectParser(data);
  let encodedAuthenticatorData: string;
  let encodedClientDataJSON: string;
  let encodedCredentialId: string;
  let encodedSignature: string;
  let clientBrowser: string | undefined;

  try {
    encodedAuthenticatorData = parser.getString("authenticator_data");
    encodedClientDataJSON = parser.getString("client_data_json");
    encodedCredentialId = parser.getString("credential_id");
    encodedSignature = parser.getString("signature");
    // optional — client passes this alongside the webauthn payload
    try {
      clientBrowser = parser.getString("client_browser");
    } catch {
      /* optional */
    }
  } catch {
    return { error: "Invalid or missing fields", message: null };
  }

  let authenticatorDataBytes: Uint8Array;
  let clientDataJSON: Uint8Array;
  let credentialId: Uint8Array;
  let signatureBytes: Uint8Array;
  try {
    authenticatorDataBytes = decodeBase64(encodedAuthenticatorData);
    clientDataJSON = decodeBase64(encodedClientDataJSON);
    credentialId = decodeBase64(encodedCredentialId);
    signatureBytes = decodeBase64(encodedSignature);
  } catch {
    return { error: "Invalid or missing fields", message: null };
  }

  let authenticatorData: AuthenticatorData;
  try {
    authenticatorData = parseAuthenticatorData(authenticatorDataBytes);
  } catch {
    return { error: "Invalid data", message: null };
  }
  if (!authenticatorData.verifyRelyingPartyIdHash("localhost")) {
    return { error: "Invalid data", message: null };
  }
  if (!(authenticatorData.userPresent && authenticatorData.userVerified)) {
    return { error: "Invalid data", message: null };
  }

  let clientData: ClientData;
  try {
    clientData = parseClientDataJSON(clientDataJSON);
  } catch {
    return { error: "Invalid data", message: null };
  }
  if (clientData.type !== ClientDataType.Get) {
    return { error: "Invalid data", message: null };
  }
  if (!verifyWebAuthnChallenge(clientData.challenge)) {
    return { error: "Invalid data", message: null };
  }
  if (clientData.origin !== "http://localhost:3000") {
    return { error: "Invalid data", message: null };
  }
  if (clientData.crossOrigin !== null && clientData.crossOrigin) {
    return { error: "Invalid data", message: null };
  }

  const credential = await getPasskeyCredential(credentialId);
  if (credential === null) {
    return { error: "Invalid credential", message: null };
  }

  let validSignature: boolean;
  if (credential.algorithm_id === coseAlgorithmES256) {
    const ecdsaSignature = decodePKIXECDSASignature(signatureBytes);
    const ecdsaPublicKey = decodeSEC1PublicKey(p256, credential.public_key);
    const hash = sha256(
      createAssertionSignatureMessage(authenticatorDataBytes, clientDataJSON)
    );
    validSignature = verifyECDSASignature(ecdsaPublicKey, hash, ecdsaSignature);
  } else if (credential.algorithm_id === coseAlgorithmRS256) {
    const rsaPublicKey = decodePKCS1RSAPublicKey(credential.public_key);
    const hash = sha256(
      createAssertionSignatureMessage(authenticatorDataBytes, clientDataJSON)
    );
    validSignature = verifyRSASSAPKCS1v15Signature(
      rsaPublicKey,
      sha256ObjectIdentifier,
      hash,
      signatureBytes
    );
  } else {
    return { error: "Internal error", message: null };
  }

  if (!validSignature) {
    return { error: "Invalid signature", message: null };
  }

  const headersList = await headers();
  const rawHeaders = Object.fromEntries(headersList.entries());
  const metadata: SessionMetadata = await createSessionMetadata(
    rawHeaders,
    clientBrowser
  );

  const sessionFlags: SessionFlags = { two_factor_verified: true };
  const sessionToken = generateSessionToken();
  const session = await createSession(
    sessionToken,
    credential.user_id,
    metadata,
    sessionFlags
  );
  await setSessionTokenCookie(sessionToken, session.expires_at);
  return redirect("/");
}

interface ActionResult {
  error: string | null;
  message: string | null;
}
