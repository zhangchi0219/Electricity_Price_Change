import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { getFusionApproaches, getTimeline } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import ScrollReveal from '../common/ScrollReveal';
import type { FusionApproach, TimelineEvent } from '../../types';

const TokamakModel = lazy(() => import('../three/TokamakModel'));

type Tab = 'what' | 'approaches' | 'challenges';

const CHALLENGES = [
  { icon: '🔥', zh: '等离子体约束', en: 'Plasma Confinement', desc_zh: '维持1亿°C的等离子体稳定运行', desc_en: 'Maintaining stable plasma at 100M°C' },
  { icon: '⚛️', zh: '氚增殖', en: 'Tritium Breeding', desc_zh: '氚极其稀缺，需在堆内自繁殖', desc_en: 'Tritium is scarce; must be bred inside the reactor' },
  { icon: '🔩', zh: '材料耐辐照', en: 'Radiation-Resistant Materials', desc_zh: '中子辐照会破坏结构材料', desc_en: 'Neutron irradiation degrades structural materials' },
  { icon: '💰', zh: '经济可行性', en: 'Economic Viability', desc_zh: '建造成本高，需达到 $2,800-7,000/kW', desc_en: 'High build cost, target $2,800–7,000/kW' },
];

function Timeline({ events }: { events: TimelineEvent[] }) {
  const { lang } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative flex items-center min-w-max gap-0">
        {events.map((ev, i) => (
          <div key={ev.id} className="relative flex flex-col items-center" style={{ width: 100 }}>
            {/* Connector line */}
            {i < events.length - 1 && (
              <div
                className="absolute top-4 left-1/2 h-px"
                style={{
                  width: 100,
                  background: ev.event_type === 'projected'
                    ? 'repeating-linear-gradient(90deg, #9CA3AF 0, #9CA3AF 4px, transparent 4px, transparent 8px)'
                    : '#D1D5DB',
                }}
              />
            )}

            {/* Node */}
            <button
              className="relative z-10 mb-2 focus:outline-none"
              onMouseEnter={() => setHovered(ev.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <motion.div
                animate={ev.event_type === 'current' ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                style={{
                  borderColor: ev.event_type === 'past' ? '#3B82F6'
                    : ev.event_type === 'current' ? '#F59E0B'
                    : '#9CA3AF',
                  background: ev.event_type === 'past' ? '#3B82F6'
                    : ev.event_type === 'current' ? '#F59E0B'
                    : 'white',
                  color: ev.event_type === 'projected' ? '#9CA3AF' : 'white',
                  borderStyle: ev.event_type === 'projected' ? 'dashed' : 'solid',
                }}
              >
                {ev.event_type === 'current' ? '●' : ''}
              </motion.div>
            </button>

            <span className="text-[10px] text-gray-500 font-medium">{ev.year}</span>

            {/* Tooltip */}
            {hovered === ev.id && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: -12 }}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 w-52 shadow-xl z-20 pointer-events-none"
              >
                <div className="font-semibold mb-1">
                  {lang === 'zh' ? ev.title_zh : ev.title_en}
                </div>
                <div className="text-gray-300 text-[10px] leading-relaxed">
                  {lang === 'zh' ? ev.description_zh : ev.description_en}
                </div>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111827' }}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FusionExplainer() {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<Tab>('what');
  const { data: approaches } = useApi<FusionApproach[]>(getFusionApproaches);
  const { data: events } = useApi<TimelineEvent[]>(getTimeline);

  const TABS: { id: Tab; zh: string; en: string }[] = [
    { id: 'what', zh: '什么是核聚变', en: 'What is Fusion' },
    { id: 'approaches', zh: '技术路线', en: 'Approaches' },
    { id: 'challenges', zh: '关键挑战', en: 'Key Challenges' },
  ];

  return (
    <section id="fusion" className="py-32" style={{ background: '#0A0A0F' }}>
      <div className="max-w-content mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs font-medium tracking-[0.3em] text-blue-400 uppercase mb-4">
            {lang === 'zh' ? '技术解析' : 'Technology Overview'}
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-16">
            {lang === 'zh' ? '核聚变科普' : 'Fusion Energy Explained'}
          </h2>
        </ScrollReveal>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* 3D Model */}
          <div className="relative h-80 lg:h-full min-h-72 rounded-card overflow-hidden" style={{ background: '#0D0D1A' }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                {lang === 'zh' ? '加载托卡马克模型...' : 'Loading Tokamak...'}
              </div>
            }>
              <TokamakModel />
            </Suspense>
            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
              {lang === 'zh' ? '托卡马克 — 可拖拽旋转' : 'Tokamak — Drag to rotate'}
            </div>
          </div>

          {/* Content panel */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-lg w-fit">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                    tab === t.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {lang === 'zh' ? t.zh : t.en}
                </button>
              ))}
            </div>

            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tab === 'what' && (
                <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
                  <p className="text-lg text-white font-light">
                    {lang === 'zh'
                      ? '核聚变：让轻核「合并」释放能量'
                      : 'Nuclear Fusion: Releasing Energy by Merging Light Nuclei'}
                  </p>
                  <p>
                    {lang === 'zh'
                      ? '太阳通过将氢核聚变为氦来产生能量。在地球上复现这一过程需要将等离子体加热到1亿摄氏度，比太阳核心还热10倍。'
                      : 'The sun generates energy by fusing hydrogen nuclei into helium. Replicating this on Earth requires heating plasma to 100 million°C — 10 times hotter than the sun\'s core.'}
                  </p>
                  <p>
                    {lang === 'zh'
                      ? '聚变的燃料是氘和氚——氘来自海水，储量几乎无限；氚可在堆内从锂增殖。与裂变不同，聚变不产生长寿命核废料，也不可能失控链式反应。'
                      : 'Fusion fuel is deuterium (from seawater, nearly unlimited) and tritium (bred from lithium inside the reactor). Unlike fission, fusion produces no long-lived nuclear waste and cannot run away in a chain reaction.'}
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { zh: '燃料几乎无限', en: 'Near-infinite fuel', icon: '♾️' },
                      { zh: '零碳排放', en: 'Zero carbon', icon: '🌿' },
                      { zh: '无链式反应风险', en: 'No chain reaction risk', icon: '🛡️' },
                    ].map((item) => (
                      <div key={item.zh} className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xl mb-1">{item.icon}</div>
                        <div className="text-xs text-gray-400">{lang === 'zh' ? item.zh : item.en}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'approaches' && (
                <div className="space-y-3">
                  {approaches?.map((ap) => (
                    <div
                      key={ap.id}
                      className="border border-white/10 rounded-lg p-4 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-white text-sm">
                            {lang === 'zh' ? ap.name_zh : ap.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            {lang === 'zh' ? ap.description_zh : ap.description_en}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={`text-xs px-2 py-0.5 rounded-full mb-1 ${
                              ap.status === 'experimental' ? 'bg-amber-500/20 text-amber-400'
                              : ap.status === 'research' ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {ap.status}
                          </div>
                          {ap.estimated_timeline && (
                            <div className="text-[10px] text-gray-500">{ap.estimated_timeline}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'challenges' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHALLENGES.map((c) => (
                    <div key={c.zh} className="border border-white/10 rounded-lg p-4">
                      <div className="text-2xl mb-2">{c.icon}</div>
                      <h4 className="font-medium text-white text-sm mb-1">
                        {lang === 'zh' ? c.zh : c.en}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {lang === 'zh' ? c.desc_zh : c.desc_en}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Timeline */}
        <ScrollReveal>
          <h3 className="text-xl font-light text-white mb-6">
            {lang === 'zh' ? '聚变发展时间线' : 'Fusion Timeline'}
          </h3>
          {events && <Timeline events={events} />}
          <div className="flex gap-6 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              {lang === 'zh' ? '已发生' : 'Past'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              {lang === 'zh' ? '当前' : 'Current'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-dashed border-gray-500 inline-block" />
              {lang === 'zh' ? '预测' : 'Projected'}
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
