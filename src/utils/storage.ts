const CFG_VERSION = '1.0.1';

interface StoragePayload<T> {
  cfg_version: string;
  data: T;
}

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed: StoragePayload<T> = JSON.parse(raw);
      if (parsed.cfg_version !== CFG_VERSION) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  set: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify({ cfg_version: CFG_VERSION, data }));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        localStorage.clear();
      }
    }
  }
};
