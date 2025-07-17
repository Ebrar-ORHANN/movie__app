import { createContext, useContext, useState } from 'react';
import i18n from '../i18n/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {

  const getInitialLanguage = () => {
    const currentLang = i18n.language || 'tr';
    return currentLang.split('-')[0];
  };

  const [language, setLanguage] = useState(getInitialLanguage());

  const changeLanguage = (lang) => {
    console.log('Language changing to:', lang);
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};