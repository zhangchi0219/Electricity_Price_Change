import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { getCategories, getCategoryIndustries } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import ScrollReveal from '../common/ScrollReveal';
import ImpactMeter from '../ui/ImpactMeter';
import BarChart from '../ui/BarChart';
import type { Category, Industry } from '../../types';

function CategoryCard({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}) {
  const { lang } = useLanguage();
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`card-glow relative p-6 rounded-card border text-left cursor-pointer transition-all duration-300 w-full ${
        isActive
          ? 'border-opacity-60 bg-gray-50'
          : 'border-gray-200 bg-white hover:border-opacity-40'
      }`}
      style={{
        borderColor: isActive ? category.color : undefined,
        boxShadow: isActive ? `0 0 0 1px ${category.color}40, 0 8px 32px ${category.color}20` : undefined,
      }}
      whileHover={{ y: -4 }}
    >
      <div className="text-3xl mb-3">{category.icon}</div>
      <div
        className="text-sm font-semibold mb-1"
        style={{ color: category.color }}
      >
        {lang === 'zh' ? category.name_zh : category.name_en}
      </div>
    </motion.button>
  );
}

function DetailPanel({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const { data: industries, loading } = useApi<Industry[]>(
    () => getCategoryIndustries(category.slug),
    [category.slug]
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="overflow-hidden col-span-full"
    >
      <div
        className="rounded-card border p-8"
        style={{ borderColor: `${category.color}30`, background: '#FAFAFA' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {lang === 'zh' ? category.name_zh : category.name_en}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition-colors text-gray-400"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-32 bg-gray-200 rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries?.map((ind, i) => (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-card border border-gray-100 p-5 shadow-geo"
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  {lang === 'zh' ? ind.name_zh : ind.name_en}
                </h4>

                {ind.impact_level && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400">
                      {lang === 'zh' ? '影响程度' : 'Impact'}
                    </span>
                    <ImpactMeter level={ind.impact_level} color={category.color} />
                  </div>
                )}

                {ind.electricity_cost_pct != null && (
                  <div className="mb-3">
                    <BarChart
                      value={ind.electricity_cost_pct}
                      color={category.color}
                      label={lang === 'zh' ? '电力成本占比' : 'Electricity cost share'}
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {lang === 'zh' ? ind.description_zh : ind.description_en}
                </p>

                {(ind.current_status || ind.future_projection) && (
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {lang === 'zh' ? '现状' : 'Now'}
                      </div>
                      <p className="text-xs text-gray-600">{ind.current_status}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium tracking-wider mb-1 uppercase" style={{ color: category.color }}>
                        {lang === 'zh' ? '未来' : 'Future'}
                      </div>
                      <p className="text-xs text-gray-600">{ind.future_projection}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function IndustryMap() {
  const { lang } = useLanguage();
  const { data: categories } = useApi<Category[]>(getCategories);
  const [active, setActive] = useState<Category | null>(null);

  const toggle = (cat: Category) => {
    setActive((prev) => (prev?.id === cat.id ? null : cat));
  };

  return (
    <section id="industry" className="section-light py-32 geo-grid-light">
      <div className="max-w-content mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs font-medium tracking-[0.3em] text-gray-400 uppercase mb-4">
            {lang === 'zh' ? '如果电力接近免费' : 'If Electricity Were Free'}
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            {lang === 'zh' ? '产业影响图谱' : 'Industry Impact Map'}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mb-16">
            {lang === 'zh'
              ? '点击每个分类，探索电力廉价化对各产业的深层影响。'
              : 'Click each category to explore the deep impact of cheap electricity on each industry.'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 0.08}>
              <CategoryCard
                category={cat}
                isActive={active?.id === cat.id}
                onClick={() => toggle(cat)}
              />
            </ScrollReveal>
          ))}

          <AnimatePresence>
            {active && (
              <DetailPanel
                key={active.id}
                category={active}
                onClose={() => setActive(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
