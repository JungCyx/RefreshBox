import { NormalizedEmail } from '../types/email';

export type GmailConnectionStatus =
  | { state: 'unconfigured' }
  | { state: 'disconnected' }
  | { state: 'connected'; emailAddress: string };

export interface GmailDisconnectResult {
  status: GmailConnectionStatus;
  revoked: boolean;
}

export const IPC_CHANNELS = {
  LIST_EMAILS: 'refreshbox:list-emails',
  GET_GMAIL_STATUS: 'refreshbox:get-gmail-status',
  CONNECT_GMAIL: 'refreshbox:connect-gmail',
  DISCONNECT_GMAIL: 'refreshbox:disconnect-gmail',
} as const;

export interface RefreshBoxApi {
  listEmails(): Promise<NormalizedEmail[]>;
  getGmailConnectionStatus(): Promise<GmailConnectionStatus>;
  connectGmail(): Promise<GmailConnectionStatus>;
  disconnectGmail(): Promise<GmailDisconnectResult>;
}
