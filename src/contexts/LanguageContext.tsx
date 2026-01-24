import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationKey, getTranslation } from '@/i18n/translations';
import { getSettings, saveSettings } from '@/utils/storage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const settings = getSettings();
    setLanguageState(settings.language);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const settings = getSettings();
    saveSettings({ ...settings, language: lang });
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
