import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../i18n';

interface UserData {
  nombre: string;
  telefono: string;
  contactoNombre: string;
  contactoTelefono: string;
  // Se añadirán el resto de campos según sea necesario
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.es;
  userData: UserData;
  setUserData: (data: Partial<UserData>) => void;
  theme: 'dark' | 'light' | 'rainbow';
  setTheme: (theme: 'dark' | 'light' | 'rainbow') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(
    (localStorage.getItem('cfg_lang') as Language) || 'es'
  );
  
  const [theme, setThemeState] = useState<'dark' | 'light' | 'rainbow'>(
    (localStorage.getItem('cfg_theme') as any) || 'dark'
  );

  const [userData, setUserDataState] = useState<UserData>({
    nombre: localStorage.getItem('cfg_n') || '',
    telefono: localStorage.getItem('cfg_tel') || '',
    contactoNombre: localStorage.getItem('cfg_cn') || '',
    contactoTelefono: localStorage.getItem('cfg_ct') || '',
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('cfg_lang', newLang);
    document.documentElement.lang = newLang;
  };

  const setTheme = (newTheme: 'dark' | 'light' | 'rainbow') => {
    setThemeState(newTheme);
    localStorage.setItem('cfg_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setUserData = (newData: Partial<UserData>) => {
    setUserDataState(prev => ({ ...prev, ...newData }));
    // Aquí iría la lógica de persistencia para cada campo
  };

  const t = translations[lang];

  return (
    <AppContext.Provider value={{ lang, setLang, t, userData, setUserData, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
