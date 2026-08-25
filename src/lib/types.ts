/** Shared API types — mirror the shapes documented in wavely-sever/docs/API.md. */

export type WaStatus =
  | "disconnected"
  | "connecting"
  | "requires_scan"
  | "connected";

export interface WaStatusResponse {
  status: WaStatus;
  hasQr: boolean;
}

export interface QrResponse {
  qr: string;
}

/** The authenticated operator, as returned by the auth endpoints and GET /me.
 *  `email_verified` gates every functional route on the backend (unverified
 *  callers get 403 EMAIL_NOT_VERIFIED), so the console blocks on it too. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_bot_active: boolean;
  email_verified: boolean;
}

/** POST /api/auth/login (200) — a bearer token plus the signed-in user. Login
 *  succeeds even when the email isn't verified; read `user.email_verified`. */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** POST /api/auth/register (201) — no token. The account starts unverified and
 *  a verification email is sent; the user must sign in separately. */
export interface RegisterResponse {
  user: AuthUser;
  message: string;
}

/** POST /api/auth/verify-email (200) — the now-verified user. */
export interface VerifyEmailResponse {
  success: boolean;
  user: AuthUser;
}

/** GET /api/auth/me — the current session's user. */
export interface MeResponse {
  user: AuthUser;
}

export interface Group {
  id: string;
  subject: string;
  size: number;
  isCommunity: boolean;
  isCommunityAnnounce: boolean;
  linkedParent: string | null;
}

export interface BroadcastList {
  id: number;
  name: string;
  owner_jid: string;
  created_at: string;
}

export interface BroadcastContent {
  id: number;
  list_id: number;
  owner_jid: string;
  text_content: string | null;
  media_url: string | null;
  created_at: string;
}

export type ScheduleType = "single" | "broadcast";
export type ScheduleStatus = "pending" | "completed" | "failed";

export interface Schedule {
  id: number;
  owner_jid: string;
  type: ScheduleType;
  target: string;
  message_content: string;
  execute_at: string;
  status: ScheduleStatus;
  created_at: string;
}

export interface CommandPermission {
  command_name: string;
  allow_ai: boolean;
  allow_public: boolean;
  allow_specific: string[];
  deny_specific: string[];
  description: string;
  usage: string;
}

export interface AiSettings {
  aiName: string;
  aiSystemPrompt: string;
}

export interface SettingsState {
  is_bot_active: boolean;
}
