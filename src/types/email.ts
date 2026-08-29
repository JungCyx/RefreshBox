export type EmailCategory = 'suspicious' | 'newsletter' | 'regular';

export interface NormalizedEmail {
  id: string;
  senderName: string;
  senderAddress: string;
  subject: string;
  preview: string;
  receivedAt: string;
  category: EmailCategory;
}
