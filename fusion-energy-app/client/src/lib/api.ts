import axios from 'axios';
import type { Category, Industry, FusionApproach, TimelineEvent, CostData, QuizQuestion } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getCategories = () =>
  api.get<Category[]>('/categories').then((r) => r.data);

export const getCategoryIndustries = (slug: string) =>
  api.get<Industry[]>(`/categories/${slug}/industries`).then((r) => r.data);

export const getIndustries = () =>
  api.get<Industry[]>('/industries').then((r) => r.data);

export const getIndustry = (id: number) =>
  api.get<Industry>(`/industries/${id}`).then((r) => r.data);

export const getFusionApproaches = () =>
  api.get<FusionApproach[]>('/fusion-approaches').then((r) => r.data);

export const getTimeline = (type?: 'past' | 'current' | 'projected') =>
  api.get<TimelineEvent[]>('/timeline', { params: type ? { type } : {} }).then((r) => r.data);

export const getCosts = (params?: { source?: string; year_min?: number }) =>
  api.get<CostData[]>('/costs', { params }).then((r) => r.data);

export const getQuiz = (section?: string) =>
  api.get<QuizQuestion[]>('/quiz', { params: section ? { section } : {} }).then((r) => r.data);

export const submitQuizAnswer = (question_id: number, selected_label: string, session_id: string) =>
  api
    .post<{ correct: boolean; explanation_zh: string | null; explanation_en: string | null }>(
      '/quiz/answer',
      { question_id, selected_label, session_id }
    )
    .then((r) => r.data);

export const recordInteraction = (data: {
  session_id: string;
  interaction_type: 'vote' | 'quiz_answer' | 'bookmark';
  target_type?: string;
  target_id?: number;
  value?: string;
}) => api.post('/interactions', data).then((r) => r.data);

export default api;
