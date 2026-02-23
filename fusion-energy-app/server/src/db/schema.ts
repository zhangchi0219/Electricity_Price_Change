import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').unique().notNull(),
  name_zh: text('name_zh').notNull(),
  name_en: text('name_en').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  sort_order: integer('sort_order').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const industries = sqliteTable('industries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category_id: integer('category_id').notNull().references(() => categories.id),
  name_zh: text('name_zh').notNull(),
  name_en: text('name_en').notNull(),
  description_zh: text('description_zh').notNull(),
  description_en: text('description_en').notNull(),
  impact_level: integer('impact_level'),
  electricity_cost_pct: real('electricity_cost_pct'),
  current_status: text('current_status'),
  future_projection: text('future_projection'),
  sort_order: integer('sort_order').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const fusion_approaches = sqliteTable('fusion_approaches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  name_zh: text('name_zh').notNull(),
  description_zh: text('description_zh').notNull(),
  description_en: text('description_en').notNull(),
  key_projects: text('key_projects'), // JSON string
  status: text('status', { enum: ['research', 'experimental', 'demo', 'commercial'] }),
  estimated_timeline: text('estimated_timeline'),
  estimated_cost_per_kwh: real('estimated_cost_per_kwh'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const timeline_events = sqliteTable('timeline_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  title_zh: text('title_zh').notNull(),
  title_en: text('title_en').notNull(),
  description_zh: text('description_zh').notNull(),
  description_en: text('description_en').notNull(),
  event_type: text('event_type', { enum: ['past', 'current', 'projected'] }),
  source_url: text('source_url'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const cost_data = sqliteTable('cost_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  energy_source: text('energy_source').notNull(),
  year: integer('year').notNull(),
  lcoe_low: real('lcoe_low'),
  lcoe_high: real('lcoe_high'),
  lcoe_median: real('lcoe_median'),
  is_projection: integer('is_projection', { mode: 'boolean' }).default(false),
  source: text('source'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const user_interactions = sqliteTable('user_interactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: text('session_id').notNull(),
  interaction_type: text('interaction_type', { enum: ['vote', 'quiz_answer', 'bookmark'] }),
  target_type: text('target_type'),
  target_id: integer('target_id'),
  value: text('value'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const quiz_questions = sqliteTable('quiz_questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section: text('section').notNull(),
  question_zh: text('question_zh').notNull(),
  question_en: text('question_en').notNull(),
  options: text('options').notNull(), // JSON string
  explanation_zh: text('explanation_zh'),
  explanation_en: text('explanation_en'),
  sort_order: integer('sort_order').default(0),
});
