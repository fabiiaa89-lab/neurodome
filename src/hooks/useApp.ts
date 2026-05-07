import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export type AppState = 'splash' | 'setup' | 'main';

export function useApp() {
  const [appState, setAppState] = useState<AppState>('splash');

  useEffect(() => {
    const timer = setTimeout(() => {
      const isSetupComplete = storage.get<boolean>('setup_complete');
      setAppState(isSetupComplete ? 'main' : 'setup');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const completeSetup = () => {
    storage.set('setup_complete', true);
    setAppState('main');
  };

  return { appState, completeSetup };
}
