import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { GoogleOAuthService } from './auth/GoogleOAuthService';
import { GoogleTokenStore } from './auth/GoogleTokenStore';
import { MockEmailProvider } from './providers/MockEmailProvider';
import { IPC_CHANNELS } from './shared/ipc';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const emailProvider = new MockEmailProvider();

// Token storage and Google OAuth service
const tokenStore = new GoogleTokenStore(
  path.join(app.getPath('userData'), 'refreshbox-google-token.enc'),
);

const googleOAuthService = new GoogleOAuthService(
  process.env.REFRESHBOX_GOOGLE_CLIENT_ID,
  process.env.REFRESHBOX_GOOGLE_CLIENT_SECRET,
  tokenStore,
);

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.LIST_EMAILS, async () => {
  try {
    return await emailProvider.listEmails();
  } catch (error) {
    console.error('Failed to list emails from provider:', error);
    throw new Error('Failed to load emails from the provider.');
  }
});

ipcMain.handle(IPC_CHANNELS.GET_GMAIL_STATUS, async () => {
  try {
    return await googleOAuthService.getConnectionStatus();
  } catch (error) {
    console.error('Failed to get Gmail connection status:', error);
    return { state: 'disconnected' };
  }
});

ipcMain.handle(IPC_CHANNELS.CONNECT_GMAIL, async () => {
  try {
    return await googleOAuthService.connect();
  } catch (error: unknown) {
    console.error('Failed to connect Gmail account:', error);
    const message =
      error instanceof Error && error.message.includes('cancelled')
        ? 'Google connection was cancelled.'
        : 'Failed to connect Google account. Please try again.';
    throw new Error(message);
  }
});

ipcMain.handle(IPC_CHANNELS.DISCONNECT_GMAIL, async () => {
  try {
    return await googleOAuthService.disconnect();
  } catch (error) {
    console.error('Failed to disconnect Gmail account:', error);
    return {
      status: { state: 'disconnected' },
      revoked: false,
    };
  }
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
