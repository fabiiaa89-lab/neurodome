/**
 * @file storage.ts
 * @description Gestión persistente con validación de versión y manejo de cuota seguro.
 */

const CFG_VERSION = '1.0.1';

interface StoragePayload<T> {
  cfg_version: string;
  data: T;
}

export const storage = {
  /**
   * Recupera un dato validando la versión de arquitectura.
   */
  get: <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed: StoragePayload<T> = JSON.parse(raw);
      
      if (parsed.cfg_version !== CFG_VERSION) {
        console.warn(`[Storage] Versión obsoleta detectada para "${key}". Eliminando...`);
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`[Storage] Error de lectura/parseo en "${key}":`, error);
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Guarda datos de forma segura. 
   * Si la cuota se excede, solo afecta a la clave actual.
   */
  set: <T>(key: string, data: T): void => {
    try {
      const payload: StoragePayload<T> = {
        cfg_version: CFG_VERSION,
        data,
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      if (error instanceof DOMException && 
         (error.name === 'QuotaExceededError' || 
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || // Firefox
          error.code === 22)) { // Chrome/Safari viejo
        
        console.error(`[Storage] CRÍTICO: Cuota de almacenamiento excedida al intentar guardar "${key}".`);
        
        // FIX: Eliminamos únicamente la entrada que causó el fallo para evitar datos corruptos
        // sin tocar el resto del ecosistema de la App.
        localStorage.removeItem(key);
      } else {
        console.error(`[Storage] Error inesperado al escribir "${key}":`, error);
      }
    }
  },

  /**
   * Eliminación explícita de una clave.
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Limpieza total (Solo usar en resets de fábrica o debug).
   */
  clear: (): void => {
    localStorage.clear();
  }
};
