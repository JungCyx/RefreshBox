import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, RefreshBoxApi } from './shared/ipc';

const refreshBoxApi: RefreshBoxApi = {
  listEmails: () => ipcRenderer.invoke(IPC_CHANNELS.LIST_EMAILS),
  getGmailConnectionStatus: () => ipcRenderer.invoke(IPC_CHANNELS.GET_GMAIL_STATUS),
  connectGmail: () => ipcRenderer.invoke(IPC_CHANNELS.CONNECT_GMAIL),
  disconnectGmail: () => ipcRenderer.invoke(IPC_CHANNELS.DISCONNECT_GMAIL),
};

contextBridge.exposeInMainWorld('refreshBox', refreshBoxApi);
