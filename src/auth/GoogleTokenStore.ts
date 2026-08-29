import { safeStorage } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface StoredGoogleToken {
  refreshToken: string;
  emailAddress: string;
}

export class GoogleTokenStore {
  private readonly filePath: string;

  constructor(tokenFilePath: string) {
    this.filePath = tokenFilePath;
  }

  async save(data: StoredGoogleToken): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Secure storage is unavailable on this system.');
    }

    if (!data.refreshToken || !data.emailAddress) {
      throw new Error('Invalid token data: refreshToken and emailAddress are required.');
    }

    const payload: StoredGoogleToken = {
      refreshToken: data.refreshToken,
      emailAddress: data.emailAddress,
    };

    const serialized = JSON.stringify(payload);
    const encrypted = safeStorage.encryptString(serialized);

    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, encrypted, { mode: 0o600 });
  }

  async load(): Promise<StoredGoogleToken | null> {
    try {
      const encryptedBuffer = await fs.readFile(this.filePath);

      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Secure storage is unavailable to decrypt credentials.');
      }

      const decrypted = safeStorage.decryptString(encryptedBuffer);
      const parsed = JSON.parse(decrypted);

      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.refreshToken === 'string' &&
        parsed.refreshToken.length > 0 &&
        typeof parsed.emailAddress === 'string' &&
        parsed.emailAddress.length > 0
      ) {
        return {
          refreshToken: parsed.refreshToken,
          emailAddress: parsed.emailAddress,
        };
      }

      return null;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'ENOENT'
      ) {
        return null;
      }
      return null;
    }
  }

  async delete(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'ENOENT'
      ) {
        return;
      }
      throw error;
    }
  }
}
