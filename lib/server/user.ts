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
