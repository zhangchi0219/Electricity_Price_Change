import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { getQuiz } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import ScrollReveal from '../common/ScrollReveal';
import QuizCard from '../ui/QuizCard';
import { useInView } from '../../hooks/useInView';
import type { QuizQuestion } from '../../types';

const PHASES = [
  {
    period: '2040–2060',
    color: '#4B6CB7',
    bg: 'linear-gradient(135deg, #1a1a3e, #2a2a5e)',
    zh_title: '第一阶段：技术突破',
    en_title: 'Phase 1: Technical Breakthrough',
    zh_desc: '首批商业聚变示范电厂建成运行。初期成本高达 $80-150/MWh，但证明了工程可行性。私人资本涌入，标准化设计开始迭代。',
    en_desc: 'First commercial fusion demonstration plants come online. Initial costs of $80-150/MWh, but engineering viability is proven. Private capital floods in; standardized designs begin iterating.',
    items_zh: ['ITER 验证 Q>10', 'CFS ARC 商业示范', '首批聚变电网接入', '资本成本 $5,000-7,000/kW'],
    items_en: ['ITER demonstrates Q>10', 'CFS ARC commercial demo', 'First grid-connected fusion', 'Capital cost $5,000-7,000/kW'],
  },
  {
    period: '2060–2080',
    color: '#22C55E',
    bg: 'linear-gradient(135deg, #0d3320, #0d4a2e)',
    zh_title: '第二阶段：规模化降本',
    en_title: 'Phase 2: Scale & Cost Reduction',
    zh_desc: '经过 20 年的技术迭代，聚变成本降至 $40-60/MWh，开始与传统能源竞争。全球各地聚变电厂批量建设，电网结构深度变化。',
    en_desc: 'After 20 years of iteration, fusion costs fall to $40-60/MWh, beginning to compete with conventional energy. Fusion plants are built in bulk globally; grid structure changes profoundly.',
    items_zh: ['资本成本降至 $3,500/kW', '聚变占全球电力 5%', 'AI 数据中心全面用聚变', '绿氢成本降至 $1/kg'],
    items_en: ['Capital cost drops to $3,500/kW', 'Fusion at 5% of global power', 'AI data centers fully on fusion', 'Green hydrogen at $1/kg'],
  },
  {
    period: '2080 – 2100+',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg, #3a2000, #5a3200)',
    zh_title: '第三阶段：产业重塑',
    en_title: 'Phase 3: Industry Transformation',
    zh_desc: '聚变成本降至 $25-40/MWh，占全球发电 10-50%（视成本情景而定）。电力接近免费引发产业革命：铝冶炼、海水淡化、AI算力、碳捕获全面爆发。',
    en_desc: 'Fusion costs reach $25-40/MWh, powering 10-50% of global electricity. Near-free power triggers an industrial revolution: aluminum, desalination, AI compute, and carbon capture all explode.',
    items_zh: ['全球 CO₂ 开始主动下降', '海水淡化解决全球水危机', 'AI 算力不再受电价限制', '化石燃料政治影响力崩塌'],
    items_en: ['Global CO₂ actively decreasing', 'Desalination solves water crisis', 'AI compute unconstrained by power costs', 'Fossil fuel geopolitical power collapses'],
  },
];

function PhaseCard({ phase, index }: { phase: typeof PHASES[0]; index: number }) {
  const { lang } = useLanguage();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="rounded-card p-8 text-white"
      style={{ background: phase.bg }}
    >
      <div
        className="text-xs font-semibold tracking-widest uppercase mb-2"
        style={{ color: phase.color }}
      >
        {phase.period}
      </div>
      <h3 className="text-xl font-medium mb-3">
        {lang === 'zh' ? phase.zh_title : phase.en_title}
      </h3>
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {lang === 'zh' ? phase.zh_desc : phase.en_desc}
      </p>
      <ul className="space-y-1.5">
        {(lang === 'zh' ? phase.items_zh : phase.items_en).map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
            <span style={{ color: phase.color }} className="mt-0.5">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function FutureOutlook() {
  const { lang } = useLanguage();
  const { data: questions } = useApi<QuizQuestion[]>(getQuiz);
  const [sessionId] = useState(generateSessionId);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setAnswered((a) => a + 1);
  };

  return (
    <section id="future" className="py-32" style={{ background: '#0A0A0F' }}>
      <div className="max-w-content mx-auto px-6">
        {/* Future phases */}
        <ScrollReveal>
          <p className="text-xs font-medium tracking-[0.3em] text-blue-400 uppercase mb-4">
            {lang === 'zh' ? '情景推演' : 'Scenario Planning'}
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            {lang === 'zh' ? '未来推演' : 'Future Scenarios'}
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mb-12">
            {lang === 'zh'
              ? '三个阶段描绘了核聚变从突破到改变世界的路径。'
              : 'Three phases mapping fusion\'s journey from breakthrough to world transformation.'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {PHASES.map((phase, i) => (
            <PhaseCard key={i} phase={phase} index={i} />
          ))}
        </div>

        {/* Quiz section */}
        <ScrollReveal>
          <div className="border-t border-white/10 pt-16">
            <p className="text-xs font-medium tracking-[0.3em] text-purple-400 uppercase mb-4">
              {lang === 'zh' ? '学习检验' : 'Knowledge Check'}
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              {lang === 'zh' ? '互动小测验' : 'Interactive Quiz'}
            </h2>
            <p className="text-gray-400 mb-8">
              {lang === 'zh' ? '检验一下你对本页内容的理解。' : 'Test your understanding of what you\'ve learned.'}
            </p>

            {questions && questions.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {questions.map((q) => (
                    <QuizCard
                      key={q.id}
                      question={q}
                      sessionId={sessionId}
                      onAnswer={handleAnswer}
                    />
                  ))}
                </div>

                {answered === questions.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="text-5xl font-light text-white mb-2">
                      {score} / {questions.length}
                    </div>
                    <div className="text-gray-400 mb-4">
                      {lang === 'zh' ? '你的得分' : 'Your Score'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {score === questions.length
                        ? (lang === 'zh' ? '🎉 满分！你已掌握核聚变的基础知识。' : '🎉 Perfect score! You\'ve mastered fusion basics.')
                        : score >= questions.length / 2
                        ? (lang === 'zh' ? '👍 不错！继续学习，加深理解。' : '👍 Good job! Keep learning to deepen your understanding.')
                        : (lang === 'zh' ? '📚 建议再回顾一遍内容。' : '📚 Consider reviewing the content again.')}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </ScrollReveal>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-white/10 text-center text-xs text-gray-600">
          <p className="mb-1">
            {lang === 'zh'
              ? '数据来源：IRENA、EIA、Lazard、MIT Energy Initiative、ITER Organization'
              : 'Data sources: IRENA, EIA, Lazard, MIT Energy Initiative, ITER Organization'}
          </p>
          <p>
            {lang === 'zh'
              ? '本页仅供教育目的，未来预测存在较大不确定性。'
              : 'For educational purposes only. Future projections carry significant uncertainty.'}
          </p>
        </div>
      </div>
    </section>
  );
}
