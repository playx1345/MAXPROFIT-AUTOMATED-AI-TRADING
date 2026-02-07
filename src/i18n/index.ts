import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';
import ar from './locales/ar.json';
import ko from './locales/ko.json';
import ro from './locales/ro.json';
import es from './locales/es.json';

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' as const },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' as const },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' as const },
  { code: 'uk', name: 'Українська', flag: '🇺🇦', dir: 'ltr' as const },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' as const },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' as const },
  { code: 'ro', name: 'Română', flag: '🇷🇴', dir: 'ltr' as const },
];

const resources = {
  en: { translation: en },
  es: { translation: es },
  ru: { translation: ru },
  uk: { translation: uk },
  ar: { translation: ar },
  ko: { translation: ko },
  ro: { translation: ro },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'ru', 'uk', 'ar', 'ko', 'ro'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Update document direction based on language
i18n.on('languageChanged', (lng) => {
  const language = languages.find((l) => l.code === lng);
  if (language) {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = lng;
  }
});

// Set initial direction
const currentLang = languages.find((l) => l.code === i18n.language);
if (currentLang) {
  document.documentElement.dir = currentLang.dir;
  document.documentElement.lang = i18n.language;
}

export default i18n;
