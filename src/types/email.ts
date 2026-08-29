export type EmailCategory = 'suspicious' | 'newsletter' | 'regular';

export type AuthenticationStatus = 'pass' | 'fail' | 'unknown' | 'error';

export interface AuthenticationCheck {
  status: AuthenticationStatus;
  domain: string | null;
}

export interface EmailAuthentication {
  spf: AuthenticationCheck;
  dkim: AuthenticationCheck;
  dmarc: AuthenticationCheck;
}

export interface NormalizedEmail {
  id: string;
  senderName: string;
  senderAddress: string;
  recipientAddress: string;
  subject: string;
  preview: string;
  bodyText: string;
  receivedAt: string;
  category: EmailCategory;
  classificationReasons: string[];
  authentication: EmailAuthentication;
}
