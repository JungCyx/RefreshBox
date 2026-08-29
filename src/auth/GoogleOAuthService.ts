import { net, shell } from 'electron';
import crypto from 'node:crypto';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { GmailConnectionStatus, GmailDisconnectResult } from '../shared/ipc';
import { GoogleTokenStore } from './GoogleTokenStore';

const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
const PROFILE_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
const OAUTH_TIMEOUT_MS = 180000; // 3 minutes

export class GoogleOAuthService {
  private readonly clientId: string | null;
  private readonly clientSecret: string | null;
  private readonly tokenStore: GoogleTokenStore;
  private isConnecting = false;

  constructor(
    clientId: string | null | undefined,
    clientSecret: string | null | undefined,
    tokenStore: GoogleTokenStore,
  ) {
    this.clientId = GoogleOAuthService.validateClientId(clientId);
    this.clientSecret = GoogleOAuthService.validateClientSecret(clientSecret);
    this.tokenStore = tokenStore;
  }

  static validateClientId(clientId: string | null | undefined): string | null {
    if (!clientId) {
      return null;
    }
    const trimmed = clientId.trim();
    if (trimmed.length === 0 || !trimmed.endsWith('.apps.googleusercontent.com')) {
      return null;
    }
    return trimmed;
  }

  static validateClientSecret(clientSecret: string | null | undefined): string | null {
    if (!clientSecret) {
      return null;
    }
    const trimmed = clientSecret.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  }

  isConfigured(): boolean {
    return this.clientId !== null && this.clientSecret !== null;
  }

  async getConnectionStatus(): Promise<GmailConnectionStatus> {
    if (!this.isConfigured()) {
      return { state: 'unconfigured' };
    }

    const stored = await this.tokenStore.load();
    if (stored && stored.emailAddress) {
      return { state: 'connected', emailAddress: stored.emailAddress };
    }

    return { state: 'disconnected' };
  }

  async connect(): Promise<GmailConnectionStatus> {
    if (!this.isConfigured() || !this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth is not configured with a valid client ID and client secret.');
    }

    if (this.isConnecting) {
      throw new Error('A Google authentication attempt is already in progress.');
    }

    this.isConnecting = true;

    try {
      // 1. Generate PKCE verifier, challenge, and OAuth state
      const verifier = crypto.randomBytes(32).toString('base64url');
      const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
      const state = crypto.randomBytes(32).toString('base64url');

      // 2. Start loopback callback server and open authorization URL in browser
      const { code, redirectUri } = await this.listenForCallback(state, challenge);

      // 3. Exchange authorization code for tokens
      const { accessToken, refreshToken } = await this.exchangeCodeForTokens(
        code,
        verifier,
        redirectUri,
      );

      // 4. Fetch profile to confirm connected email address
      const emailAddress = await this.fetchUserEmailAddress(accessToken);

      // 5. Store refresh token securely
      await this.tokenStore.save({ refreshToken, emailAddress });

      return { state: 'connected', emailAddress };
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<GmailDisconnectResult> {
    const stored = await this.tokenStore.load();
    let revoked = false;

    if (stored && stored.refreshToken) {
      try {
        const body = new URLSearchParams({ token: stored.refreshToken }).toString();
        const response = await net.fetch(REVOKE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });
        revoked = response.ok;
      } catch (err) {
        console.error('Remote token revocation request failed:', err);
        revoked = false;
      }
    }

    await this.tokenStore.delete();

    return {
      status: { state: this.isConfigured() ? 'disconnected' : 'unconfigured' },
      revoked,
    };
  }

  private listenForCallback(
    expectedState: string,
    challenge: string,
  ): Promise<{ code: string; redirectUri: string }> {
    return new Promise((resolve, reject) => {
      let server: http.Server | null = null;
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (server) {
          server.close();
          server = null;
        }
      };

      server = http.createServer((req, res) => {
        const responseHeaders = {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        };

        if (!req.url) {
          res.writeHead(400, responseHeaders);
          res.end('Invalid request.');
          return;
        }

        const parsedUrl = new URL(req.url, 'http://127.0.0.1');
        const stateParam = parsedUrl.searchParams.get('state');
        const codeParam = parsedUrl.searchParams.get('code');
        const errorParam = parsedUrl.searchParams.get('error');

        // Verify state parameter with timing-safe comparison
        if (!stateParam || stateParam.length !== expectedState.length) {
          res.writeHead(400, responseHeaders);
          res.end('Invalid request.');
          return;
        }

        const stateMatches = crypto.timingSafeEqual(
          Buffer.from(stateParam),
          Buffer.from(expectedState),
        );

        if (!stateMatches) {
          res.writeHead(400, responseHeaders);
          res.end('Invalid request.');
          return;
        }

        if (errorParam) {
          res.writeHead(200, responseHeaders);
          res.end('Authentication was cancelled. You may close this window and return to RefreshBox.');
          cleanup();
          reject(new Error('Google authentication was cancelled or denied by the user.'));
          return;
        }

        if (!codeParam) {
          res.writeHead(400, responseHeaders);
          res.end('Missing authorization code.');
          cleanup();
          reject(new Error('Missing authorization code from Google OAuth callback.'));
          return;
        }

        res.writeHead(200, responseHeaders);
        res.end('Authentication complete! You may close this window and return to RefreshBox.');

        const port = (server?.address() as AddressInfo).port;
        const redirectUri = `http://127.0.0.1:${port}`;
        cleanup();
        resolve({ code: codeParam, redirectUri });
      });

      server.listen(0, '127.0.0.1', () => {
        const address = server?.address() as AddressInfo;
        const redirectUri = `http://127.0.0.1:${address.port}`;

        const authUrl = new URL(AUTH_ENDPOINT);
        authUrl.searchParams.set('client_id', this.clientId as string);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', GMAIL_READONLY_SCOPE);
        authUrl.searchParams.set('code_challenge', challenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('state', expectedState);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        shell.openExternal(authUrl.toString()).catch((err) => {
          cleanup();
          reject(new Error(`Failed to open system browser for authentication: ${err.message}`));
        });
      });

      server.on('error', (err) => {
        cleanup();
        reject(new Error(`Failed to start loopback callback server: ${err.message}`));
      });

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Google authentication timed out after 3 minutes.'));
      }, OAUTH_TIMEOUT_MS);
    });
  }

  private async exchangeCodeForTokens(
    code: string,
    verifier: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const body = new URLSearchParams({
      client_id: this.clientId as string,
      client_secret: this.clientSecret as string,
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString();

    const response = await net.fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      let errorCode: string | undefined;
      let errorDescription: string | undefined;

      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.error === 'string') {
            errorCode = errorData.error;
          }
          if (typeof errorData.error_description === 'string') {
            errorDescription = errorData.error_description;
          }
        }
      } catch {
        // Non-JSON error response
      }

      console.error('Google token exchange failed:', {
        status: response.status,
        error: errorCode ?? 'unknown',
        errorDescription: errorDescription ?? 'none',
      });

      throw new Error('Failed to exchange authorization code for Google tokens.');
    }

    const data = await response.json();

    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.access_token !== 'string' ||
      typeof data.refresh_token !== 'string'
    ) {
      throw new Error('Invalid token response received from Google OAuth.');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  private async fetchUserEmailAddress(accessToken: string): Promise<string> {
    const response = await net.fetch(PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user profile from Gmail API.');
    }

    const data = await response.json();

    if (!data || typeof data !== 'object' || typeof data.emailAddress !== 'string') {
      throw new Error('Invalid user profile response received from Gmail API.');
    }

    return data.emailAddress;
  }
}
