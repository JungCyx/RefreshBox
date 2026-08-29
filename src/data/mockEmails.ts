import { NormalizedEmail } from '../types/email';

export const mockEmails: NormalizedEmail[] = [
  {
    id: 'email-1',
    senderName: 'Security Notification',
    senderAddress: 'alerts@verify-account.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Immediate Action Required: Password Reset Request',
    preview:
      'We detected an unauthorized login attempt from an unknown device. Please verify your credentials immediately to avoid account suspension.',
    bodyText:
      'Dear Alex,\n\nWe detected a suspicious login attempt from IP address 198.51.100.23 (Location: Unknown). For your security, your account access has been temporarily restricted.\n\nTo restore full access, you must confirm your username and current password within 24 hours:\nhttps://security-portal.verify-account.example/reset-auth\n\nFailure to verify will result in permanent account deactivation.\n\nBest regards,\nAutomated Account Security Team',
    receivedAt: '2026-08-28T20:15:00.000Z',
    category: 'suspicious',
    classificationReasons: [
      'Creates artificial urgency requiring immediate password verification under threat of suspension',
      'Requests user credentials via an external unverified form',
      'Sender domain was registered recently and attempts to impersonate generic security services',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'verify-account.example' },
      dkim: { status: 'pass', domain: 'verify-account.example' },
      dmarc: { status: 'pass', domain: 'verify-account.example' },
    },
  },
  {
    id: 'email-2',
    senderName: 'Express Courier Service',
    senderAddress: 'tracking@delivery-notice.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Undeliverable Package #RB-99410',
    preview:
      'Your package could not be delivered due to an incomplete address. Update your personal details and pay the re-delivery fee within 24 hours.',
    bodyText:
      'Tracking Number: #RB-99410\nStatus: Delivery Exception - Incomplete Address\n\nOur courier attempted delivery to your address today but was unable to complete the drop-off. A redelivery fee of $2.50 is required to release the package.\n\nPlease update your shipping information and credit card details here:\nhttps://express-parcel.delivery-notice.example/re-dispatch?id=RB-99410\n\nPackages held over 48 hours will be returned to the sender.',
    receivedAt: '2026-08-28T19:40:00.000Z',
    category: 'suspicious',
    classificationReasons: [
      'Requests fee payment and personal card details for an unsolicited package notification',
      'Sending mail server failed SPF authorization for the claimed delivery domain',
      'Message headers lacked valid cryptographic DKIM signatures',
    ],
    authentication: {
      spf: { status: 'fail', domain: 'delivery-notice.example' },
      dkim: { status: 'fail', domain: null },
      dmarc: { status: 'fail', domain: 'delivery-notice.example' },
    },
  },
  {
    id: 'email-3',
    senderName: 'Global Wire Alerts',
    senderAddress: 'notice@wire-processing.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Wire Transfer Confirmation $4,850.00 USD',
    preview:
      'An outbound wire transfer has been scheduled. If you did not authorize this transaction, click here immediately to dispute the charge.',
    bodyText:
      'Reference: WTR-2026-88391\nAmount: $4,850.00 USD\nBeneficiary: Apex Overseas Holdings LLC\n\nYour outbound international wire transfer has been received and is currently processing. Funds are scheduled to leave your linked checking account on Monday morning.\n\nIf you did not approve this transaction, dispute it immediately by calling our fraud desk or opening the dispute link:\nhttps://dispute.wire-processing.example/cancel?ref=88391\n\nGlobal Wire Processing Center',
    receivedAt: '2026-08-28T18:05:00.000Z',
    category: 'suspicious',
    classificationReasons: [
      'Fabricated high-value financial transaction designed to induce panic',
      'DKIM cryptographic signature verification failed during transmission',
      'DMARC alignment check failed between the header sender and authenticated domain',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'wire-processing.example' },
      dkim: { status: 'fail', domain: 'wire-processing.example' },
      dmarc: { status: 'fail', domain: 'wire-processing.example' },
    },
  },
  {
    id: 'email-4',
    senderName: 'Frontend Digest',
    senderAddress: 'digest@webweekly.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Frontend Focus Issue #240: Modern Layouts & Web Security',
    preview:
      'In this edition: CSS Subgrid best practices, sandboxing techniques in desktop web apps, and tips for accessible user interfaces.',
    bodyText:
      'Welcome to Frontend Focus #240!\n\nHere is your weekly summary of the best engineering articles from across the web:\n\n1. Mastering CSS Subgrid & Container Queries\nLearn how subgrid simplifies complex multi-column dashboard layouts without extra DOM wrappers.\n\n2. Desktop App Sandboxing and Process Isolation\nA deep dive into hardening desktop web shells with context isolation, strict CSPs, and permission controls.\n\n3. Accessible Segmented Controls\nImplementing robust ARIA states and keyboard navigation patterns for desktop-grade UI components.\n\nTo manage your subscription or unsubscribe, visit: https://digest.webweekly.example/preferences',
    receivedAt: '2026-08-28T16:30:00.000Z',
    category: 'newsletter',
    classificationReasons: [
      'Contains standard bulk newsletter headers and List-Unsubscribe metadata',
      'Content matches regular weekly educational publication patterns',
      'All cryptographic sender authentication checks verified successfully',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'webweekly.example' },
      dkim: { status: 'pass', domain: 'webweekly.example' },
      dmarc: { status: 'pass', domain: 'webweekly.example' },
    },
  },
  {
    id: 'email-5',
    senderName: 'Design Craft Weekly',
    senderAddress: 'editor@designcraft.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Design Craft #88: Calm Interfaces and Accessible Colors',
    preview:
      'Explore case studies on reducing notification clutter, choosing high-contrast palettes, and designing calm desktop experiences.',
    bodyText:
      'Hello Creators,\n\nIn this week\'s issue of Design Craft:\n\n• Calm Desktop Interfaces: Why quieter color palettes and restrained typography boost sustained focus during knowledge work.\n• High-Contrast Badge Design: Ensuring status badges remain easily interpretable regardless of color vision deficiency.\n• Micro-Interactions: Using subtle hover transitions rather than jarring motion effects.\n\nThanks for reading,\nThe Design Craft Editorial Team',
    receivedAt: '2026-08-28T14:15:00.000Z',
    category: 'newsletter',
    classificationReasons: [
      'Broadcast to an opt-in mailing list with standard publication headers',
      'Editorial digest format with regular periodic cadence',
      'SPF and DKIM records aligned and verified',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'designcraft.example' },
      dkim: { status: 'pass', domain: 'designcraft.example' },
      dmarc: { status: 'pass', domain: 'designcraft.example' },
    },
  },
  {
    id: 'email-6',
    senderName: 'Tech Pulse News',
    senderAddress: 'news@dailytechpulse.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Daily Tech Briefing: Open Source & Security Highlights',
    preview:
      'Catch up on the latest open-source software releases, browser engine improvements, and security best practices for developers.',
    bodyText:
      'Top Stories for August 28, 2026:\n\n- Open Source Security: New automated tooling helps repositories identify stale dependencies faster.\n- Engine Updates: Performance enhancements land in modern JavaScript runtimes for faster cold starts.\n- Developer Survey: Over 70% of engineering teams prioritize desktop app sandboxing.\n\nCatch the full daily audio brief on our site.\n\nYou received this because you subscribed to daily digests at dailytechpulse.example.',
    receivedAt: '2026-08-28T11:00:00.000Z',
    category: 'newsletter',
    classificationReasons: [
      'Broadcast automated news bulletin with bulk mailing signatures',
      'Sender domain verified via SPF and DKIM',
      'DMARC policy record not published by origin domain',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'dailytechpulse.example' },
      dkim: { status: 'pass', domain: 'dailytechpulse.example' },
      dmarc: { status: 'unknown', domain: null },
    },
  },
  {
    id: 'email-7',
    senderName: 'Alex Rivera',
    senderAddress: 'alex.rivera@workspace.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Sprint Planning Agenda & Project Milestones',
    preview:
      'Hey team, I updated the sprint planning board with our Q3 milestones. Please review the agenda before our sync tomorrow morning.',
    receivedAt: '2026-08-28T17:45:00.000Z',
    category: 'regular',
    bodyText:
      'Hi Alex,\n\nI just finalized the agenda for our sprint planning meeting tomorrow at 10:00 AM. Key items we need to cover:\n\n1. Reviewing the updated inbox triage user flow\n2. Finalizing the mock email security evaluation model\n3. Setting deliverable dates for the upcoming milestone release\n\nPlease add any extra discussion topics to the shared workspace doc before 9:00 AM.\n\nThanks,\nAlex Rivera\nProduct Operations',
    classificationReasons: [
      'Direct peer-to-peer workplace correspondence',
      'Absence of mass-marketing, promotional, or urgency-baiting phrasing',
      'Verified sender domain with passing SPF, DKIM, and DMARC alignment',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'workspace.example' },
      dkim: { status: 'pass', domain: 'workspace.example' },
      dmarc: { status: 'pass', domain: 'workspace.example' },
    },
  },
  {
    id: 'email-8',
    senderName: 'Cloud Services Billing',
    senderAddress: 'billing@cloudservices.example',
    recipientAddress: 'alex.taylor@mycompany.example',
    subject: 'Your Monthly Invoice for August 2026',
    preview:
      'Your monthly invoice for Cloud Services is now available. Your account has been automatically billed. No further action is required.',
    bodyText:
      'Invoice #INV-2026-0828\nBilling Period: Aug 1, 2026 – Aug 31, 2026\nTotal Amount: $42.00 USD (Paid via Auto-Pay)\n\nThank you for using Cloud Services. Your monthly statement has been processed and charged to your primary corporate payment method on file.\n\nSummary of charges:\n- Compute & Storage: $35.00\n- Automated Backups: $7.00\n\nNo payment action is needed. For your records, an official PDF receipt has been archived to your billing portal.\n\nCloud Services Support Team',
    receivedAt: '2026-08-28T15:20:00.000Z',
    category: 'regular',
    classificationReasons: [
      'Standard automated transactional receipt with matching historical billing pattern',
      'Contains no clickable credential prompts or urgent payment escalation requests',
      'Full authentication alignment verified across SPF, DKIM, and DMARC',
    ],
    authentication: {
      spf: { status: 'pass', domain: 'cloudservices.example' },
      dkim: { status: 'pass', domain: 'cloudservices.example' },
      dmarc: { status: 'pass', domain: 'cloudservices.example' },
    },
  },
];
