import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
import kkTranslation from './locales/kk.json';

const resources = {
  en: { translation: enTranslation },
  ru: { translation: ruTranslation },
  kk: { translation: kkTranslation }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: localStorage.getItem('i18nextLng') || 'ru', // Default to Russian as per requirements
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
