import { RefreshBoxApi } from './shared/ipc';

declare global {
  interface Window {
    refreshBox: RefreshBoxApi;
  }
}
