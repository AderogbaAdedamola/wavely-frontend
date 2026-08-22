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

export interface LoginResponse {
  token: string;
  is_bot_active: boolean;
}

export interface RegisterResponse {
  success: boolean;
  userId: number;
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
