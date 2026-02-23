import { useLanguage } from '../../lib/i18n';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      className="fixed top-6 right-6 z-50 px-3 py-1.5 text-xs font-medium
                 border border-white/20 rounded-full text-white/70 hover:text-white
                 hover:border-white/40 transition-all duration-200 backdrop-blur-sm
                 bg-white/5 hover:bg-white/10"
    >
      {lang === 'zh' ? 'EN' : '中文'}
    </button>
  );
}
