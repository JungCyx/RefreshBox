import React, { useCallback, useEffect, useState } from 'react';
import { GmailConnectionStatus } from '../shared/ipc';

export const GmailConnectionCard: React.FC = () => {
  const [status, setStatus] = useState<GmailConnectionStatus>({ state: 'disconnected' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRevokeNotice, setShowRevokeNotice] = useState<boolean>(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentStatus = await window.refreshBox.getGmailConnectionStatus();
      setStatus(currentStatus);
    } catch {
      setStatus({ state: 'unconfigured' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setShowRevokeNotice(false);
    try {
      const newStatus = await window.refreshBox.connectGmail();
      setStatus(newStatus);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('cancelled')) {
        setErrorMessage('Google authentication was cancelled.');
      } else {
        setErrorMessage('Unable to connect Google account. Please check your network and try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setShowRevokeNotice(false);
    try {
      const result = await window.refreshBox.disconnectGmail();
      setStatus(result.status);
      if (!result.revoked) {
        setShowRevokeNotice(true);
      }
    } catch {
      setErrorMessage('An error occurred while disconnecting. Local credentials have been cleared.');
      setStatus({ state: 'disconnected' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="account-card" aria-labelledby="account-card-heading">
      <div className="account-card-header">
        <div className="account-header-left">
          <h2 id="account-card-heading" className="account-title">
            Gmail Account Connection
          </h2>
          <span className="demo-notice-tag">
            Inbox is currently displaying fictional demo messages
          </span>
        </div>

        <div className="account-actions">
          {isLoading ? (
            <span className="account-status-text">Checking status...</span>
          ) : status.state === 'unconfigured' ? (
            <span className="account-badge badge-unconfigured">Unconfigured</span>
          ) : status.state === 'connected' ? (
            <div className="connected-group">
              <span className="connected-email" title={status.emailAddress}>
                {status.emailAddress}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={isProcessing}
                onClick={handleDisconnect}
              >
                {isProcessing ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={isProcessing}
              onClick={handleConnect}
            >
              {isProcessing ? 'Connecting in browser...' : 'Connect Gmail'}
            </button>
          )}
        </div>
      </div>

      {status.state === 'unconfigured' && !isLoading && (
        <div className="account-message unconfigured-message">
          <p>
            OAuth configuration is missing. Set both the <code>REFRESHBOX_GOOGLE_CLIENT_ID</code> and <code>REFRESHBOX_GOOGLE_CLIENT_SECRET</code> environment variables before starting the application to enable Gmail authentication.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="account-message error-message" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      {showRevokeNotice && (
        <div className="account-message warning-message" role="note">
          <p>
            Local credentials were removed. Remote token revocation could not be confirmed; you can also remove application access from your Google Account security settings.
          </p>
        </div>
      )}
    </section>
  );
};
