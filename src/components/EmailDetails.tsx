import React from 'react';
import {
  AuthenticationCheck,
  AuthenticationStatus,
  EmailCategory,
  NormalizedEmail,
} from '../types/email';

interface EmailDetailsProps {
  email: NormalizedEmail;
  onBack: () => void;
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const getCategoryLabel = (category: EmailCategory): string => {
  switch (category) {
    case 'suspicious':
      return 'Suspicious';
    case 'newsletter':
      return 'Newsletter';
    case 'regular':
      return 'Regular';
  }
};

const getStatusLabel = (status: AuthenticationStatus): string => {
  switch (status) {
    case 'pass':
      return 'Pass';
    case 'fail':
      return 'Fail';
    case 'unknown':
      return 'Unknown';
    case 'error':
      return 'Error';
  }
};

// Application-owned explanations for authentication checks
const getMethodExplanation = (
  method: 'spf' | 'dkim' | 'dmarc',
  status: AuthenticationStatus,
): string => {
  switch (method) {
    case 'spf':
      switch (status) {
        case 'pass':
          return 'The sending mail server is authorized by the domain’s SPF DNS record.';
        case 'fail':
          return 'The sending mail server is not authorized by the domain’s SPF DNS record.';
        case 'unknown':
          return 'No SPF DNS policy could be found for the sending domain.';
        case 'error':
          return 'An error occurred while querying or evaluating the domain’s SPF record.';
      }
      break;
    case 'dkim':
      switch (status) {
        case 'pass':
          return 'The cryptographic email signature is valid and verified against the public key.';
        case 'fail':
          return 'The cryptographic signature is invalid, missing, or was altered during transit.';
        case 'unknown':
          return 'No DKIM signature was attached to this email message.';
        case 'error':
          return 'An error occurred during cryptographic DKIM signature validation.';
      }
      break;
    case 'dmarc':
      switch (status) {
        case 'pass':
          return 'The message complies with the sender domain’s DMARC alignment policy.';
        case 'fail':
          return 'The message failed DMARC alignment checks between sender and authentication identities.';
        case 'unknown':
          return 'The domain does not publish a DMARC policy record.';
        case 'error':
          return 'An error occurred while evaluating the sender domain’s DMARC policy.';
      }
      break;
  }
};

export const EmailDetails: React.FC<EmailDetailsProps> = ({ email, onBack }) => {
  const authChecks: {
    key: 'spf' | 'dkim' | 'dmarc';
    title: string;
    check: AuthenticationCheck;
  }[] = [
    { key: 'spf', title: 'SPF', check: email.authentication.spf },
    { key: 'dkim', title: 'DKIM', check: email.authentication.dkim },
    { key: 'dmarc', title: 'DMARC', check: email.authentication.dmarc },
  ];

  return (
    <article className="details-container" aria-labelledby="details-subject-heading">
      {/* Navigation & Header */}
      <div className="details-top-bar">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
          aria-label="Back to inbox message list"
        >
          <span className="back-arrow" aria-hidden="true">&larr;</span>
          <span>Back to inbox</span>
        </button>

        <span className={`category-tag tag-${email.category}`}>
          {getCategoryLabel(email.category)}
        </span>
      </div>

      <div className="details-content-scroll">
        {/* Email Header Info */}
        <header className="details-header">
          <h1 id="details-subject-heading" className="details-subject">
            {email.subject}
          </h1>

          <div className="details-metadata-grid">
            <div className="meta-row">
              <span className="meta-label">From:</span>
              <div className="meta-value">
                <strong className="sender-strong">{email.senderName}</strong>
                <span className="sender-email-text">&lt;{email.senderAddress}&gt;</span>
              </div>
            </div>

            <div className="meta-row">
              <span className="meta-label">To:</span>
              <div className="meta-value">
                <span className="recipient-email-text">{email.recipientAddress}</span>
              </div>
            </div>

            <div className="meta-row">
              <span className="meta-label">Date:</span>
              <div className="meta-value">
                <time dateTime={email.receivedAt}>{formatDate(email.receivedAt)}</time>
              </div>
            </div>
          </div>
        </header>

        {/* Why RefreshBox Categorized This */}
        <section className="details-section reasons-section" aria-labelledby="reasons-heading">
          <h2 id="reasons-heading" className="section-title">
            Why RefreshBox categorized this
          </h2>
          <ul className="reasons-list">
            {email.classificationReasons.map((reason, idx) => (
              <li key={idx} className="reason-item">
                <span className="reason-bullet" aria-hidden="true">&bull;</span>
                <span className="reason-text">{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sender Authentication */}
        <section className="details-section auth-section" aria-labelledby="auth-heading">
          <div className="auth-header-row">
            <h2 id="auth-heading" className="section-title">
              Sender authentication
            </h2>
          </div>

          <div className="auth-cards-grid">
            {authChecks.map(({ key, title, check }) => {
              const statusLabel = getStatusLabel(check.status);
              const explanation = getMethodExplanation(key, check.status);

              return (
                <div key={key} className={`auth-card auth-${check.status}`}>
                  <div className="auth-card-top">
                    <span className="auth-method-title">{title}</span>
                    <span className={`auth-status-badge status-${check.status}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {check.domain && (
                    <div className="auth-domain-row">
                      <span className="domain-label">Domain:</span>
                      <span className="domain-value">{check.domain}</span>
                    </div>
                  )}

                  <p className="auth-explanation">{explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="auth-disclaimer-box" role="note">
            <strong>Security Notice:</strong> Passing SPF, DKIM, and DMARC proves sender domain authorization, but does not prove the message content or intention is safe.
          </div>
        </section>

        {/* Message Preview (Body Text) */}
        <section className="details-section body-section" aria-labelledby="body-heading">
          <h2 id="body-heading" className="section-title">
            Message preview
          </h2>
          <div className="plain-body-container">
            <pre className="plain-body-text">{email.bodyText}</pre>
          </div>
        </section>
      </div>
    </article>
  );
};
