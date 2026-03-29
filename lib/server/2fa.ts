import type { User } from "./user";

export function get2FARedirect(user: User): string {
  if (user.registered_passkey) {
    return "/auth/2fa/passkey";
  }
  if (user.registered_totp) {
    return "/auth/2fa/totp";
  }
  return "/auth/2fa/setup";
}
