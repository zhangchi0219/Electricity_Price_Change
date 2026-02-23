import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../lib/i18n';

const HeroScene = lazy(() => import('../three/HeroScene'));

export default function HeroSection() {
  const { lang } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#0A0A0F' }}
    >
      {/* Three.js background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Geometric grid overlay */}
      <div className="absolute inset-0 geo-grid-dark opacity-40 z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-xs font-medium tracking-[0.3em] text-blue-400 uppercase mb-6">
            {lang === 'zh' ? '思想实验' : 'Thought Experiment'}
          </p>
          <h1
            className="text-5xl md:text-7xl font-light text-white mb-4"
            style={{ letterSpacing: '0.05em' }}
          >
            {lang === 'zh' ? '如果电力接近免费' : 'If Electricity Were Nearly Free'}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-12">
            {lang === 'zh' ? '世界会发生什么？' : 'What Would Happen to the World?'}
          </h2>
        </motion.div>

        {/* Key stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8 mb-16"
        >
          {[
            { label: lang === 'zh' ? '铝冶炼的电力成本占比' : 'Electricity share in aluminum smelting', value: '40%' },
            { label: lang === 'zh' ? '数据中心的运营成本占比' : 'Electricity share in data center costs', value: '30–50%' },
            { label: lang === 'zh' ? '比特币挖矿的运营成本占比' : 'Electricity share in Bitcoin mining', value: '90%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-semibold text-blue-400 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400 max-w-[140px] leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 tracking-widest uppercase">
            {lang === 'zh' ? '向下探索' : 'Scroll to Explore'}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3L10 17M5 12L10 17L15 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0A0A0F] z-10" />
    </section>
  );
}
