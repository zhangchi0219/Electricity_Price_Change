import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '../../types';
import { useLanguage } from '../../lib/i18n';
import { submitQuizAnswer } from '../../lib/api';

interface Props {
  question: QuizQuestion;
  sessionId: string;
  onAnswer: (correct: boolean) => void;
}

export default function QuizCard({ question, sessionId, onAnswer }: Props) {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation_zh: string | null; explanation_en: string | null } | null>(null);

  const handleSelect = async (label: string) => {
    if (selected) return;
    setSelected(label);
    const res = await submitQuizAnswer(question.id, label, sessionId);
    setResult(res);
    onAnswer(res.correct);
  };

  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-geo p-6">
      <h4 className="font-medium text-gray-900 mb-4 text-base leading-relaxed">
        {lang === 'zh' ? question.question_zh : question.question_en}
      </h4>

      <div className="space-y-2 mb-4">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.correct;
          let borderColor = 'border-gray-200';
          let bg = 'bg-white';
          let textColor = 'text-gray-700';

          if (selected) {
            if (isSelected && isCorrect) {
              borderColor = 'border-green-500';
              bg = 'bg-green-50';
              textColor = 'text-green-800';
            } else if (isSelected && !isCorrect) {
              borderColor = 'border-red-400';
              bg = 'bg-red-50';
              textColor = 'text-red-800';
            } else if (!isSelected && isCorrect) {
              borderColor = 'border-green-300';
              bg = 'bg-green-50/50';
            }
          }

          return (
            <motion.button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              disabled={!!selected}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${borderColor} ${bg} ${textColor} ${!selected ? 'hover:border-blue-300 hover:bg-blue-50' : ''}`}
              animate={
                isSelected && result
                  ? result.correct
                    ? { x: [0, 4, -4, 0] }
                    : { x: [0, -6, 6, -6, 6, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              <span className="font-semibold mr-2">{opt.label}.</span>
              {lang === 'zh' ? opt.text_zh : opt.text_en}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`rounded-lg p-3 text-sm ${result.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            <span className="font-semibold mr-1">
              {result.correct
                ? (lang === 'zh' ? '✓ 正确！' : '✓ Correct!')
                : (lang === 'zh' ? '✗ 错误' : '✗ Wrong')}
            </span>
            {lang === 'zh' ? result.explanation_zh : result.explanation_en}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
