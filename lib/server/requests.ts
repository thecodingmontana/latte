import { headers } from "next/headers";
import { RefillingTokenBucket } from "./rate-limit";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

const header = await headers();

export function globalGETRateLimit(): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = header.get("X-Forwarded-For");
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}

export function globalPOSTRateLimit(): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = header.get("X-Forwarded-For");
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 3);
}
