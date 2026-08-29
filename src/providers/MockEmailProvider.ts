import { mockEmails } from '../data/mockEmails';
import { NormalizedEmail } from '../types/email';
import { EmailProvider, EmailProviderId } from './EmailProvider';

export class MockEmailProvider implements EmailProvider {
  readonly id: EmailProviderId = 'mock';
  readonly displayName: string = 'Demo mailbox';

  async listEmails(): Promise<NormalizedEmail[]> {
    return Promise.resolve(mockEmails);
  }
}
