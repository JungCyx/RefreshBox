import { NormalizedEmail } from '../types/email';

export type EmailProviderId = 'mock' | 'gmail' | 'outlook';

export interface EmailProvider {
  readonly id: EmailProviderId;
  readonly displayName: string;
  listEmails(): Promise<NormalizedEmail[]>;
}
