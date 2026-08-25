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

/** The authenticated operator, as returned by the auth endpoints and GET /me. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_bot_active: boolean;
}

/** POST /api/auth/register (201) and POST /api/auth/login (200) both return a
 *  bearer token plus the freshly-authenticated user. */
export interface AuthResponse {
  token: string;
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
