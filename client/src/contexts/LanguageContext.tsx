import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../lib/translations';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'zh',
  setLanguage: () => {},
  t: (key) => key
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Props for the provider component
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize with the stored language or default to Chinese
  const getInitialLanguage = (): Language => {
    try {
      const storedLanguage = localStorage.getItem('app-language');
      return (storedLanguage === 'en' || storedLanguage === 'zh') 
        ? storedLanguage as Language 
        : 'zh';
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return 'zh';
    }
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  // Function to change language
  const setLanguage = (lang: Language) => {
    if (lang !== language) {
      setLanguageState(lang);
      try {
        localStorage.setItem('app-language', lang);
      } catch (e) {
        console.error('Error saving language to localStorage:', e);
      }
    }
  };

  // Function to get translation
  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation;
  };

  // Update document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = t('app.title');
  }, [language]);

  // Context value
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;