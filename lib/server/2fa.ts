import type { User } from "./user";

export function get2FARedirect(user: User): string {
  if (user.registered_passkey) {
    return "/2fa/passkey";
  }
  if (user.registered_totp) {
    return "/2fa/totp";
  }
  return "/2fa/setup";
}
