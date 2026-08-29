import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, RefreshBoxApi } from './shared/ipc';

const refreshBoxApi: RefreshBoxApi = {
  listEmails: () => ipcRenderer.invoke(IPC_CHANNELS.LIST_EMAILS),
};

contextBridge.exposeInMainWorld('refreshBox', refreshBoxApi);
