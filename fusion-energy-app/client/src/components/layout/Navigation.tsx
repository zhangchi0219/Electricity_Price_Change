import { useScrollSection } from '../../hooks/useScrollSection';
import { useLanguage } from '../../lib/i18n';

const SECTIONS = [
  { id: 'hero',     label_zh: '引入', label_en: 'Intro' },
  { id: 'industry', label_zh: '产业', label_en: 'Industry' },
  { id: 'fusion',   label_zh: '聚变', label_en: 'Fusion' },
  { id: 'cost',     label_zh: '成本', label_en: 'Cost' },
  { id: 'future',   label_zh: '未来', label_en: 'Future' },
];

export default function Navigation() {
  const active = useScrollSection(SECTIONS.map((s) => s.id));
  const { lang } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          title={lang === 'zh' ? s.label_zh : s.label_en}
          className="group flex items-center gap-2 cursor-pointer"
          aria-label={lang === 'zh' ? s.label_zh : s.label_en}
        >
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {lang === 'zh' ? s.label_zh : s.label_en}
          </span>
          <div
            className={`w-2 h-2 rounded-full border transition-all duration-300 ${
              active === s.id
                ? 'bg-white border-white scale-125'
                : 'bg-transparent border-gray-500 hover:border-gray-300'
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
