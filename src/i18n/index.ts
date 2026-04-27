import { es } from './es';
// import { en } from './en'; // Se creará a continuación

export const translations = {
  es,
  en: es, // Temporalmente usamos 'es' para 'en' hasta crear el archivo completo
};

export type Language = keyof typeof translations;
export type TranslationKeys = keyof typeof es;
