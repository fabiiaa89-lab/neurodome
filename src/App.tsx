import React from 'react';
import { useApp } from './hooks/useApp';
import { SplashScreen } from './components/SplashScreen';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const { appState, completeSetup } = useApp();

  if (appState === 'splash') return <SplashScreen />;
  if (appState === 'setup') return <SetupScreen onComplete={completeSetup} />;
  
  return <Dashboard />;
}
