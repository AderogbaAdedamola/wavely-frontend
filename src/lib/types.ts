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

export interface SelectableMember {
  jid: string;
  type: "contact" | "group";
  name: string;
  description?: string;
  participantCount?: number;
}

export interface SelectableMembersResponse {
  contacts: SelectableMember[];
  groups: SelectableMember[];
}

export type ScheduleType = "single" | "broadcast";
export type ScheduleStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

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
  countryCode?: string;
  timeZone?: string;
}

export interface AdminOverview {
  generatedAt: string;
  system: {
    uptimeSeconds: number;
    memoryBytes: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
    };
    nodeVersion: string;
    environment: string;
  };
  users: {
    total: number;
    verified: number;
    unverified: number;
    botActive: number;
  };
  whatsappSessions: {
    disconnected: number;
    connecting: number;
    requires_scan: number;
    reconnecting: number;
    connected: number;
    requires_reauth: number;
  };
  schedules: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  deliveries: {
    pending: { total: number; last24Hours: number };
    delivered: { total: number; last24Hours: number };
    failed: { total: number; last24Hours: number };
  };
  messages: {
    total: number;
    last24Hours: number;
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  is_bot_active: boolean;
  created_at: string;
  whatsapp_status: string | null;
  whatsapp_status_updated_at: string | null;
}

export interface AdminUsersResponse {
  total: number;
  users: AdminUser[];
}

export type AdminScheduleStatus = ScheduleStatus;

export interface AdminSchedule {
  id: number;
  owner_jid: string;
  owner_name: string;
  owner_email: string;
  type: ScheduleType;
  status: AdminScheduleStatus;
  execute_at: string;
  created_at: string;
  recipient_count: number;
  pending_count: number;
  delivered_count: number;
  failed_count: number;
}

export interface AdminSchedulesResponse {
  total: number;
  schedules: AdminSchedule[];
}
