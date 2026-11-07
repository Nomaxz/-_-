import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { Language } from './test-content';

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('Language context is missing');
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('university-guide-language') === 'en' ? 'en' : 'ru';
    } catch {
      return 'ru';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('university-guide-language', language);
    } catch {
      // The language toggle still works if browser storage is unavailable.
    }
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

/** Small inline translation helper for feature pages. */
export function tr(language: Language, ru: string, en: string) {
  return language === 'ru' ? ru : en;
}
