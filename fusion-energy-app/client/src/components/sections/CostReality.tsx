import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { getCosts } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import ScrollReveal from '../common/ScrollReveal';
import LCOEChart from '../ui/LCOEChart';
import type { CostData } from '../../types';

const INSIGHTS = [
  {
    icon: '⚡',
    zh_title: '聚变 ≠ 免费电力',
    en_title: 'Fusion ≠ Free Electricity',
    zh_body: '聚变的目标是提供有竞争力的清洁基荷电力，而非字面意义上的「免费」。',
    en_body: 'Fusion aims to provide competitive clean baseload power, not literally "free" electricity.',
    color: '#3B82F6',
  },
  {
    icon: '🏗️',
    zh_title: '70% 的成本来自建设',
    en_title: '70% Cost from Construction',
    zh_body: '超导磁体、等离子体容器等工程造价远超燃料成本。燃料成本几乎可以忽略不计。',
    en_body: 'Superconducting magnets and plasma vessel engineering far outweigh fuel costs, which are nearly negligible.',
    color: '#F59E0B',
  },
  {
    icon: '🌍',
    zh_title: '真正的价值：稳定的零碳基荷',
    en_title: 'True Value: Stable Zero-Carbon Baseload',
    zh_body: '太阳能和风能有间歇性，聚变可以提供 7×24 小时稳定发电，是完美的碳中和基荷来源。',
    en_body: 'Solar and wind are intermittent; fusion can provide 24/7 stable power — the perfect zero-carbon baseload source.',
    color: '#22C55E',
  },
];

const SOURCE_COLORS: Record<string, string> = {
  solar: '#F59E0B',
  onshore_wind: '#22C55E',
  natural_gas: '#6B7280',
  nuclear_fission: '#8B5CF6',
  fusion: '#3B82F6',
};

const SOURCE_LABELS: Record<string, { zh: string; en: string }> = {
  solar:           { zh: '太阳能',   en: 'Solar' },
  onshore_wind:    { zh: '陆上风电', en: 'Onshore Wind' },
  natural_gas:     { zh: '天然气',   en: 'Natural Gas' },
  nuclear_fission: { zh: '核裂变',   en: 'Nuclear Fission' },
  fusion:          { zh: '核聚变',   en: 'Fusion' },
};

const YEAR_MIN = 2010;
const YEAR_MAX = 2100;

export default function CostReality() {
  const { lang } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const { data: costs } = useApi<CostData[]>(getCosts);

  // Get data for selected year (find closest available year per source)
  const yearData = (() => {
    if (!costs) return [];
    const sources = [...new Set(costs.map((d) => d.energy_source))];
    return sources
      .map((src) => {
        const srcData = costs.filter((d) => d.energy_source === src);
        const closest = srcData.reduce((prev, cur) =>
          Math.abs(cur.year - selectedYear) < Math.abs(prev.year - selectedYear) ? cur : prev
        );
        return closest;
      })
      .filter((d) => d.lcoe_median != null)
      .sort((a, b) => (a.lcoe_median ?? 0) - (b.lcoe_median ?? 0));
  })();

  return (
    <section id="cost" className="section-light py-32 geo-grid-light">
      <div className="max-w-content mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs font-medium tracking-[0.3em] text-gray-400 uppercase mb-4">
            {lang === 'zh' ? '数据视角' : 'Data Perspective'}
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            {lang === 'zh' ? '成本现实' : 'Cost Reality'}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mb-12">
            {lang === 'zh'
              ? '拖动时间轴，查看各能源从2010年到2100年的均化电力成本（LCOE）变化。'
              : 'Drag the timeline to see how LCOE changes from 2010 to 2100 for each energy source.'}
          </p>
        </ScrollReveal>

        {/* Chart */}
        <ScrollReveal>
          <div className="bg-white rounded-card shadow-geo p-6 mb-6">
            {costs && <LCOEChart data={costs} selectedYear={selectedYear} />}

            {/* Year slider */}
            <div className="mt-6 px-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{YEAR_MIN}</span>
                <span className="font-semibold text-gray-700">{selectedYear}</span>
                <span>{YEAR_MAX}</span>
              </div>
              <input
                type="range"
                min={YEAR_MIN}
                max={YEAR_MAX}
                step={5}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Year bar chart */}
        {yearData.length > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-card shadow-geo p-6 mb-12">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                {selectedYear} {lang === 'zh' ? '年各能源 LCOE 排序' : 'Energy LCOE Ranking'}
                {selectedYear > 2024 && (
                  <span className="ml-2 text-xs text-amber-600 font-normal">
                    ({lang === 'zh' ? '预测数据' : 'Projected'})
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {yearData.map((d) => {
                  const max = yearData[yearData.length - 1].lcoe_median ?? 1;
                  return (
                    <div key={d.energy_source}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">
                          {lang === 'zh'
                            ? SOURCE_LABELS[d.energy_source]?.zh ?? d.energy_source
                            : SOURCE_LABELS[d.energy_source]?.en ?? d.energy_source}
                        </span>
                        <span className="font-medium text-gray-800">${d.lcoe_median}/MWh</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: SOURCE_COLORS[d.energy_source] ?? '#666' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${((d.lcoe_median ?? 0) / max) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Insight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INSIGHTS.map((ins, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                className="rounded-card border border-gray-200 p-6 cursor-pointer hover:shadow-geo-lg transition-shadow bg-white"
                onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                whileHover={{ y: -4 }}
              >
                <div className="text-2xl mb-3">{ins.icon}</div>
                <h3
                  className="font-semibold mb-2 text-gray-900"
                  style={{ borderLeft: `3px solid ${ins.color}`, paddingLeft: 8 }}
                >
                  {lang === 'zh' ? ins.zh_title : ins.en_title}
                </h3>
                {expandedInsight === i && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-500 leading-relaxed"
                  >
                    {lang === 'zh' ? ins.zh_body : ins.en_body}
                  </motion.p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {expandedInsight === i
                    ? (lang === 'zh' ? '收起' : 'Collapse')
                    : (lang === 'zh' ? '展开详情 ↓' : 'Read more ↓')}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
