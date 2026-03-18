import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Theme, Language } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
  localize: (obj: any, field: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

import { translations } from '../data/translations';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('fuel-alert-theme');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fuel-alert-lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('fuel-alert-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fuel-alert-lang', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const localize = (obj: any, field: string): string => {
    if (!obj) return '';
    const langSuffix = language === 'en' ? '' : (language === 'si' ? 'Si' : 'Ta');
    const localizedValue = obj[`${field}${langSuffix}`];
    return localizedValue || obj[field] || '';
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage, toggleTheme, t, localize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
