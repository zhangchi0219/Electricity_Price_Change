import { client } from './index';
import path from 'path';
import fs from 'fs';

// 确保 data 目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function migrate() {
  console.log('Running database migrations...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_zh TEXT NOT NULL,
      name_en TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS industries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name_zh TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_zh TEXT NOT NULL,
      description_en TEXT NOT NULL,
      impact_level INTEGER CHECK(impact_level BETWEEN 1 AND 5),
      electricity_cost_pct REAL,
      current_status TEXT,
      future_projection TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS fusion_approaches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_zh TEXT NOT NULL,
      description_zh TEXT NOT NULL,
      description_en TEXT NOT NULL,
      key_projects TEXT,
      status TEXT CHECK(status IN ('research', 'experimental', 'demo', 'commercial')),
      estimated_timeline TEXT,
      estimated_cost_per_kwh REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS timeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      title_zh TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_zh TEXT NOT NULL,
      description_en TEXT NOT NULL,
      event_type TEXT CHECK(event_type IN ('past', 'current', 'projected')),
      source_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS cost_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      energy_source TEXT NOT NULL,
      year INTEGER NOT NULL,
      lcoe_low REAL,
      lcoe_high REAL,
      lcoe_median REAL,
      is_projection BOOLEAN DEFAULT FALSE,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      interaction_type TEXT CHECK(interaction_type IN ('vote', 'quiz_answer', 'bookmark')),
      target_type TEXT,
      target_id INTEGER,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      question_zh TEXT NOT NULL,
      question_en TEXT NOT NULL,
      options TEXT NOT NULL,
      explanation_zh TEXT,
      explanation_en TEXT,
      sort_order INTEGER DEFAULT 0
    )`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }

  console.log('✓ Migration complete. Database tables created.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
