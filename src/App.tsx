import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EmailDetails } from './components/EmailDetails';
import { GmailConnectionCard } from './components/GmailConnectionCard';
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
  const [emails, setEmails] = useState<NormalizedEmail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await window.refreshBox.listEmails();
      setEmails(data);
      setSelectedEmailId(null);
    } catch {
      setError('Unable to load emails from the provider. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const counts = useMemo(() => {
    return {
      all: emails.length,
      suspicious: emails.filter((e) => e.category === 'suspicious').length,
      newsletter: emails.filter((e) => e.category === 'newsletter').length,
      regular: emails.filter((e) => e.category === 'regular').length,
    };
  }, [emails]);

  const filteredEmails = useMemo(() => {
    if (activeFilter === 'all') {
      return emails;
    }
    return emails.filter((email) => email.category === activeFilter);
  }, [activeFilter, emails]);

  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    return emails.find((email) => email.id === selectedEmailId) || null;
  }, [selectedEmailId, emails]);

  const filterOptions: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'suspicious', label: 'Suspicious', count: counts.suspicious },
    { id: 'newsletter', label: 'Newsletters', count: counts.newsletter },
    { id: 'regular', label: 'Regular', count: counts.regular },
  ];

  const handleFilterChange = (filterId: FilterType) => {
    setActiveFilter(filterId);
    setSelectedEmailId(null);
  };

  const handleBackToInbox = () => {
    setSelectedEmailId(null);
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

        {/* Gmail Connection Card */}
        <GmailConnectionCard />

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
                  onClick={() => handleFilterChange(option.id)}
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

        {/* Split / Responsive Content Area */}
        <div className={`workspace-split ${selectedEmail ? 'has-selected-email' : ''}`}>
          {/* Email List Pane */}
          <section className="message-pane" aria-label="Message list">
            <div className="message-surface">
              {isLoading ? (
                <div className="state-surface loading-surface" role="status" aria-live="polite">
                  <div className="loading-spinner" aria-hidden="true" />
                  <p className="state-title">Loading messages...</p>
                  <p className="state-text">Fetching inbox messages from the provider.</p>
                </div>
              ) : error ? (
                <div className="state-surface error-surface" role="alert">
                  <div className="error-icon" aria-hidden="true">!</div>
                  <h2 className="state-title">Unable to load messages</h2>
                  <p className="state-text">{error}</p>
                  <button type="button" className="retry-btn" onClick={loadEmails}>
                    Retry
                  </button>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="state-surface empty-state-surface" role="status">
                  <div className="empty-state-icon" aria-hidden="true">∅</div>
                  <h2 className="state-title">No messages found</h2>
                  <p className="state-text">
                    There are no emails matching &ldquo;{activeFilter}&rdquo;.
                  </p>
                </div>
              ) : (
                <ul className="message-list">
                  {filteredEmails.map((email: NormalizedEmail) => {
                    const isRowSelected = selectedEmailId === email.id;
                    return (
                      <li key={email.id} className="message-list-item">
                        <button
                          type="button"
                          className={`message-row-btn ${isRowSelected ? 'row-selected' : ''}`}
                          onClick={() => setSelectedEmailId(email.id)}
                          aria-label={`Select message from ${email.senderName}: ${email.subject}`}
                          aria-pressed={isRowSelected}
                        >
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
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Details Pane */}
          {selectedEmail && (
            <section className="details-pane" aria-label="Email details view">
              <EmailDetails email={selectedEmail} onBack={handleBackToInbox} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
