import { createContext, useContext } from 'react';
import type { Language } from '../types';

export const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
}>({ lang: 'zh', setLang: () => {} });

export const useLanguage = () => useContext(LanguageContext);

export function t(obj: { zh: string; en: string }, lang: Language): string {
  return lang === 'zh' ? obj.zh : obj.en;
}
