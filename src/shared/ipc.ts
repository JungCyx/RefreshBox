import { NormalizedEmail } from '../types/email';

export const IPC_CHANNELS = {
  LIST_EMAILS: 'refreshbox:list-emails',
} as const;

export interface RefreshBoxApi {
  listEmails(): Promise<NormalizedEmail[]>;
}
