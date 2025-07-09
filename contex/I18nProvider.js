import { useEffect } from 'react';
import i18n from '../i18n/i18n';
import { useLanguage } from './LanguageContext';

export default function I18nProvider({ children }) {
  const { language } = useLanguage();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return children;
}
