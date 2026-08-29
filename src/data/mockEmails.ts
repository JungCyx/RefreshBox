import { NormalizedEmail } from '../types/email';

export const mockEmails: NormalizedEmail[] = [
  {
    id: 'email-1',
    senderName: 'Security Notification',
    senderAddress: 'alerts@verify-account.example',
    subject: 'Immediate Action Required: Password Reset Request',
    preview:
      'We detected an unauthorized login attempt from an unknown device. Please verify your credentials immediately to avoid account suspension.',
    receivedAt: '2026-08-28T20:15:00.000Z',
    category: 'suspicious',
  },
  {
    id: 'email-2',
    senderName: 'Express Courier Service',
    senderAddress: 'tracking@delivery-notice.example',
    subject: 'Undeliverable Package #RB-99410',
    preview:
      'Your package could not be delivered due to an incomplete address. Update your personal details and pay the re-delivery fee within 24 hours.',
    receivedAt: '2026-08-28T19:40:00.000Z',
    category: 'suspicious',
  },
  {
    id: 'email-3',
    senderName: 'Global Wire Alerts',
    senderAddress: 'notice@wire-processing.example',
    subject: 'Wire Transfer Confirmation $4,850.00 USD',
    preview:
      'An outbound wire transfer has been scheduled. If you did not authorize this transaction, click here immediately to dispute the charge.',
    receivedAt: '2026-08-28T18:05:00.000Z',
    category: 'suspicious',
  },
  {
    id: 'email-4',
    senderName: 'Frontend Digest',
    senderAddress: 'digest@webweekly.example',
    subject: 'Frontend Focus Issue #240: Modern Layouts & Web Security',
    preview:
      'In this edition: CSS Subgrid best practices, sandboxing techniques in desktop web apps, and tips for accessible user interfaces.',
    receivedAt: '2026-08-28T16:30:00.000Z',
    category: 'newsletter',
  },
  {
    id: 'email-5',
    senderName: 'Design Craft Weekly',
    senderAddress: 'editor@designcraft.example',
    subject: 'Design Craft #88: Calm Interfaces and Accessible Colors',
    preview:
      'Explore case studies on reducing notification clutter, choosing high-contrast palettes, and designing calm desktop experiences.',
    receivedAt: '2026-08-28T14:15:00.000Z',
    category: 'newsletter',
  },
  {
    id: 'email-6',
    senderName: 'Tech Pulse News',
    senderAddress: 'news@dailytechpulse.example',
    subject: 'Daily Tech Briefing: Open Source & Security Highlights',
    preview:
      'Catch up on the latest open-source software releases, browser engine improvements, and security best practices for developers.',
    receivedAt: '2026-08-28T11:00:00.000Z',
    category: 'newsletter',
  },
  {
    id: 'email-7',
    senderName: 'Alex Rivera',
    senderAddress: 'alex.rivera@workspace.example',
    subject: 'Sprint Planning Agenda & Project Milestones',
    preview:
      'Hey team, I updated the sprint planning board with our Q3 milestones. Please review the agenda before our sync tomorrow morning.',
    receivedAt: '2026-08-28T17:45:00.000Z',
    category: 'regular',
  },
  {
    id: 'email-8',
    senderName: 'Cloud Services Billing',
    senderAddress: 'billing@cloudservices.example',
    subject: 'Your Monthly Invoice for August 2026',
    preview:
      'Your monthly invoice for Cloud Services is now available. Your account has been automatically billed. No further action is required.',
    receivedAt: '2026-08-28T15:20:00.000Z',
    category: 'regular',
  },
];
