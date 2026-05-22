import type {
  Category,
  Industry,
  FusionApproach,
  TimelineEvent,
  CostData,
  QuizQuestion,
} from '../types';
import {
  categories,
  industries,
  fusionApproaches,
  timelineEvents,
  costData,
  quizQuestions,
} from '../data/seed';

const ok = <T>(value: T): Promise<T> => Promise.resolve(value);

export const getCategories = (): Promise<Category[]> =>
  ok([...categories].sort((a, b) => a.sort_order - b.sort_order));

export const getCategoryIndustries = (slug: string): Promise<Industry[]> => {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return Promise.reject(new Error('Category not found'));
  return ok(
    industries
      .filter((i) => i.category_id === cat.id)
      .sort((a, b) => a.sort_order - b.sort_order)
  );
};

export const getIndustries = (): Promise<Industry[]> =>
  ok([...industries].sort((a, b) => a.sort_order - b.sort_order));

export const getIndustry = (id: number): Promise<Industry> => {
  const found = industries.find((i) => i.id === id);
  return found ? ok(found) : Promise.reject(new Error('Industry not found'));
};

export const getFusionApproaches = (): Promise<FusionApproach[]> =>
  ok([...fusionApproaches]);

export const getTimeline = (
  type?: 'past' | 'current' | 'projected'
): Promise<TimelineEvent[]> => {
  const filtered = type
    ? timelineEvents.filter((t) => t.event_type === type)
    : [...timelineEvents];
  return ok(filtered.sort((a, b) => a.year - b.year));
};

export const getCosts = (params?: {
  source?: string;
  year_min?: number;
}): Promise<CostData[]> => {
  let result = [...costData];
  if (params?.source) result = result.filter((c) => c.energy_source === params.source);
  if (params?.year_min !== undefined) {
    const min = params.year_min;
    result = result.filter((c) => c.year >= min);
  }
  return ok(result);
};

export const getQuiz = (section?: string): Promise<QuizQuestion[]> => {
  const filtered = section
    ? quizQuestions.filter((q) => q.section === section)
    : [...quizQuestions].sort((a, b) => a.sort_order - b.sort_order);
  return ok(filtered);
};

export const submitQuizAnswer = (
  question_id: number,
  selected_label: string,
  _session_id: string
): Promise<{
  correct: boolean;
  explanation_zh: string | null;
  explanation_en: string | null;
}> => {
  const question = quizQuestions.find((q) => q.id === question_id);
  if (!question) return Promise.reject(new Error('Question not found'));
  const selected = question.options.find((o) => o.label === selected_label);
  return ok({
    correct: selected?.correct ?? false,
    explanation_zh: question.explanation_zh,
    explanation_en: question.explanation_en,
  });
};

export const recordInteraction = (_data: {
  session_id: string;
  interaction_type: 'vote' | 'quiz_answer' | 'bookmark';
  target_type?: string;
  target_id?: number;
  value?: string;
}): Promise<{ success: boolean }> => ok({ success: true });
