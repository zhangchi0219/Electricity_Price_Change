export interface Category {
  id: number;
  slug: string;
  name_zh: string;
  name_en: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at?: string;
}

export interface Industry {
  id: number;
  category_id: number;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  impact_level: number | null;
  electricity_cost_pct: number | null;
  current_status: string | null;
  future_projection: string | null;
  sort_order: number;
  created_at?: string;
}

export interface FusionApproach {
  id: number;
  name: string;
  name_zh: string;
  description_zh: string;
  description_en: string;
  key_projects: string | null; // JSON string
  status: 'research' | 'experimental' | 'demo' | 'commercial' | null;
  estimated_timeline: string | null;
  estimated_cost_per_kwh: number | null;
  created_at?: string;
}

export interface TimelineEvent {
  id: number;
  year: number;
  title_zh: string;
  title_en: string;
  description_zh: string;
  description_en: string;
  event_type: 'past' | 'current' | 'projected' | null;
  source_url: string | null;
  created_at?: string;
}

export interface CostData {
  id: number;
  energy_source: string;
  year: number;
  lcoe_low: number | null;
  lcoe_high: number | null;
  lcoe_median: number | null;
  is_projection: boolean;
  source: string | null;
  created_at?: string;
}

export interface QuizOption {
  label: string;
  text_zh: string;
  text_en: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: number;
  section: string;
  question_zh: string;
  question_en: string;
  options: QuizOption[];
  explanation_zh: string | null;
  explanation_en: string | null;
  sort_order: number;
}

export type Language = 'zh' | 'en';
