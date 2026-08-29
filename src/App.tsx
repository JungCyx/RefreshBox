import React, { useMemo, useState } from 'react';
import { mockEmails } from './data/mockEmails';
import { EmailCategory, NormalizedEmail } from './types/email';

type FilterType = 'all' | EmailCategory;

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const App: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const counts = useMemo(() => {
    return {
      all: mockEmails.length,
      suspicious: mockEmails.filter((e) => e.category === 'suspicious').length,
      newsletter: mockEmails.filter((e) => e.category === 'newsletter').length,
      regular: mockEmails.filter((e) => e.category === 'regular').length,
    };
  }, []);

  const filteredEmails = useMemo(() => {
    if (activeFilter === 'all') {
      return mockEmails;
    }
    return mockEmails.filter((email) => email.category === activeFilter);
  }, [activeFilter]);

  const filterOptions: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'suspicious', label: 'Suspicious', count: counts.suspicious },
    { id: 'newsletter', label: 'Newsletters', count: counts.newsletter },
    { id: 'regular', label: 'Regular', count: counts.regular },
  ];

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

  return (
    <div className="app-shell">
      {/* Top Application Bar */}
      <header className="app-header">
        <div className="brand-group">
          <div className="brand-icon" aria-hidden="true">
            <span>R</span>
          </div>
          <span className="brand-title">RefreshBox</span>
          <span className="demo-indicator">Demo mode — no email account connected</span>
        </div>
      </header>

      {/* Main Work Area */}
      <main className="app-main">
        {/* Title and Summary Metrics */}
        <section className="dashboard-header" aria-labelledby="inbox-heading">
          <div className="title-area">
            <h1 id="inbox-heading" className="page-title">
              Inbox Review
            </h1>
            <p className="page-description">
              Triage incoming messages safely before opening external content.
            </p>
          </div>

          {/* Summary Metric Cards */}
          <div className="summary-grid" role="region" aria-label="Inbox Summary">
            <div className="summary-card">
              <span className="summary-value">{counts.all}</span>
              <span className="summary-label">Total Messages</span>
            </div>
            <div className="summary-card card-suspicious">
              <span className="summary-value">{counts.suspicious}</span>
              <span className="summary-label">Suspicious</span>
            </div>
            <div className="summary-card card-newsletter">
              <span className="summary-value">{counts.newsletter}</span>
              <span className="summary-label">Newsletters</span>
            </div>
            <div className="summary-card card-regular">
              <span className="summary-value">{counts.regular}</span>
              <span className="summary-label">Regular</span>
            </div>
          </div>
        </section>

        {/* Filter Segmented Control Bar */}
        <div className="toolbar-row">
          <nav className="segmented-control" aria-label="Filter emails by category">
            {filterOptions.map((option) => {
              const isSelected = activeFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`segment-btn ${isSelected ? 'selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => setActiveFilter(option.id)}
                >
                  <span className="segment-label">{option.label}</span>
                  <span className="segment-count">{option.count}</span>
                </button>
              );
            })}
          </nav>
          <div className="results-count" aria-live="polite">
            Showing {filteredEmails.length} of {counts.all} messages
          </div>
        </div>

        {/* Email Message List Surface */}
        <section className="message-surface" aria-label="Message list">
          {filteredEmails.length === 0 ? (
            <div className="empty-state-surface" role="status">
              <div className="empty-state-icon" aria-hidden="true">∅</div>
              <h2 className="empty-state-title">No messages found</h2>
              <p className="empty-state-text">
                There are no emails categorized as &ldquo;{activeFilter}&rdquo; at this time.
              </p>
            </div>
          ) : (
            <ul className="message-list">
              {filteredEmails.map((email: NormalizedEmail) => (
                <li key={email.id} className="message-row">
                  <div className="message-top-line">
                    <div className="sender-block">
                      <span className="sender-name">{email.senderName}</span>
                      <span className="sender-address">&lt;{email.senderAddress}&gt;</span>
                    </div>
                    <div className="meta-block">
                      <span className={`category-tag tag-${email.category}`}>
                        {getCategoryLabel(email.category)}
                      </span>
                      <time className="message-time" dateTime={email.receivedAt}>
                        {formatDate(email.receivedAt)}
                      </time>
                    </div>
                  </div>
                  <div className="message-subject-line">
                    <span className="message-subject">{email.subject}</span>
                  </div>
                  <p className="message-preview-text">{email.preview}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};
