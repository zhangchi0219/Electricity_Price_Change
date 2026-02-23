# 便宜电力与核聚变：交互式教学网页 — 完整项目规格书

## 项目概述

一个极简几何美学风格的全栈交互式教学 Web 应用，探讨「如果电力变得接近免费，世界会怎样」以及「核聚变能否实现这一切」。

- **设计语言**：极简主义 + 几何美感（大量留白、网格系统、几何图形动画）
- **前端**：React + TypeScript + Three.js + Framer Motion
- **后端**：Node.js + Express + SQLite（轻量级，便于本地开发）
- **核心体验**：Three.js 3D 粒子/几何场景 + 2D 过渡动画 + 可交互的数据卡片

---

## 一、技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | React 18 + TypeScript | Vite 构建 |
| 3D 动画 | Three.js + @react-three/fiber + @react-three/drei | 声明式 Three.js |
| 2D 动画 | Framer Motion | 滚动驱动 + 页面过渡 |
| 样式 | Tailwind CSS | 极简几何风格系统 |
| 数据可视化 | D3.js | 时间线、成本对比图 |
| 后端 | Express.js | REST API |
| 数据库 | SQLite（better-sqlite3） | 零配置、单文件数据库 |
| ORM | Drizzle ORM | 类型安全、轻量 |

---

## 二、数据库设计

### 2.1 核心数据表

```sql
-- 产业影响分类
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,          -- 'energy-intensive', 'compute', 'transport' ...
  name_zh TEXT NOT NULL,              -- '能源密集型产业'
  name_en TEXT NOT NULL,              -- 'Energy-Intensive Industries'
  icon TEXT NOT NULL,                 -- emoji 或 icon 标识: '🏭'
  color TEXT NOT NULL,                -- 主题色 hex: '#3B82F6'
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 受影响的产业条目
CREATE TABLE industries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name_zh TEXT NOT NULL,              -- '铝冶炼'
  name_en TEXT NOT NULL,              -- 'Aluminum Smelting'
  description_zh TEXT NOT NULL,       -- 详细说明（支持 Markdown）
  description_en TEXT NOT NULL,
  impact_level INTEGER CHECK(impact_level BETWEEN 1 AND 5),  -- 影响程度 1-5
  electricity_cost_pct REAL,          -- 电力占生产成本比例 (0-1)
  current_status TEXT,                -- 当前状态描述
  future_projection TEXT,             -- 未来预测描述
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 核聚变技术路线
CREATE TABLE fusion_approaches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                 -- 'Tokamak', 'Inertial Confinement' ...
  name_zh TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  description_en TEXT NOT NULL,
  key_projects TEXT,                  -- JSON: ["ITER", "CFS ARC"]
  status TEXT CHECK(status IN ('research', 'experimental', 'demo', 'commercial')),
  estimated_timeline TEXT,            -- '2040-2050'
  estimated_cost_per_kwh REAL,        -- 美元
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 时间线里程碑
CREATE TABLE timeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  description_en TEXT NOT NULL,
  event_type TEXT CHECK(event_type IN ('past', 'current', 'projected')),
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 成本数据（用于可视化对比图）
CREATE TABLE cost_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  energy_source TEXT NOT NULL,         -- 'solar', 'wind', 'nuclear_fission', 'fusion', 'natural_gas'
  year INTEGER NOT NULL,
  lcoe_low REAL,                       -- $/MWh 低估
  lcoe_high REAL,                      -- $/MWh 高估
  lcoe_median REAL,                    -- $/MWh 中位
  is_projection BOOLEAN DEFAULT FALSE,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户互动数据（投票、评论等）
CREATE TABLE user_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  interaction_type TEXT CHECK(interaction_type IN ('vote', 'quiz_answer', 'bookmark')),
  target_type TEXT,                    -- 'industry', 'fusion_approach', 'timeline_event'
  target_id INTEGER,
  value TEXT,                          -- 投票选项 / 答案 / JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 小测验题目
CREATE TABLE quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,               -- 对应页面区块: 'industry_impact', 'fusion_basics', 'cost'
  question_zh TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options TEXT NOT NULL,                -- JSON: [{"label":"A","text_zh":"...","text_en":"...","correct":true}, ...]
  explanation_zh TEXT,
  explanation_en TEXT,
  sort_order INTEGER DEFAULT 0
);
```

### 2.2 种子数据结构

```json
// categories 种子数据示例
[
  { "slug": "energy-intensive", "name_zh": "直接受益：能源密集型", "name_en": "Direct Benefit: Energy-Intensive", "icon": "🏭", "color": "#EF4444" },
  { "slug": "compute",         "name_zh": "算力爆发",           "name_en": "Compute Explosion",              "icon": "🧠", "color": "#8B5CF6" },
  { "slug": "transport",       "name_zh": "交通重构",           "name_en": "Transport Restructuring",        "icon": "🚗", "color": "#3B82F6" },
  { "slug": "agriculture",     "name_zh": "农业革命",           "name_en": "Agricultural Revolution",        "icon": "🌾", "color": "#22C55E" },
  { "slug": "environment",     "name_zh": "环境逆转",           "name_en": "Environmental Reversal",         "icon": "🌍", "color": "#06B6D4" },
  { "slug": "disruption",      "name_zh": "产业消亡",           "name_en": "Industry Disruption",            "icon": "⚡", "color": "#F59E0B" },
  { "slug": "urban",           "name_zh": "城市重塑",           "name_en": "Urban Reshaping",                "icon": "🏙️", "color": "#EC4899" }
]
```

---

## 三、页面结构与交互设计

整个应用为单页滚动式（Single Page Scroll），分为 **5 个核心 Section**，每个 Section 占满视口或可滚动展开。

### 3.1 Section 结构

```
┌─────────────────────────────────────────────┐
│  S1: Hero — 开场引入                         │
│  Three.js 粒子聚变动画 + 标题               │
│  "如果电力接近免费，世界会怎样？"             │
├─────────────────────────────────────────────┤
│  S2: 产业影响图谱                            │
│  7 大分类卡片网格，点击展开详情              │
│  几何形状代表不同影响类型                    │
├─────────────────────────────────────────────┤
│  S3: 核聚变科普                              │
│  交互式时间线 + 技术路线对比                 │
│  3D 托卡马克模型可旋转                      │
├─────────────────────────────────────────────┤
│  S4: 成本现实                                │
│  D3 交互式图表：各能源 LCOE 对比            │
│  可拖拽时间轴看未来预测                     │
├─────────────────────────────────────────────┤
│  S5: 未来推演 + 小测验                       │
│  三阶段时间线动画                           │
│  互动问答检验学习成果                       │
└─────────────────────────────────────────────┘
```

### 3.2 各 Section 详细设计

#### S1: Hero — 开场引入

**视觉**：全屏深色背景，Three.js 粒子场景模拟核聚变反应——数千个微小光点从四周汇聚到中心，碰撞后释放出辐射状光线。粒子颜色渐变：蓝→白→橙（模拟等离子体温度）。

**交互**：
- 鼠标/触控移动影响粒子引力场方向
- 向下滚动时粒子逐渐扩散，过渡到 S2

**文案层**：
- 主标题：「如果电力接近免费」（几何无衬线字体，字间距加大）
- 副标题渐入：「世界会发生什么？」
- 引入数据：「电力占铝冶炼成本的 40%、占数据中心运营成本的 30-50%」
- 底部滚动提示箭头（几何三角形，呼吸动画）

**Three.js 实现要点**：
```
场景: 深灰/近黑背景 (#0A0A0F)
粒子系统: BufferGeometry + Points
  - 数量: 3000-5000
  - 大小: 1-3px
  - 颜色: 渐变映射 (温度场)
后处理: UnrealBloomPass (发光效果)
相机: PerspectiveCamera, 轻微自动旋转
```

#### S2: 产业影响图谱

**布局**：CSS Grid，7 个等大卡片排列为不对称网格（桌面端 3+2+2 或 4+3）。

**卡片设计**：
- 每张卡片为几何形状容器（六边形裁剪或圆角矩形 + 微妙边框）
- 默认态：icon + 分类名 + 简要数据（如「影响 5 个子产业」）
- Hover 态：卡片微微上浮 + 边框发光（对应分类颜色）
- 展开态：卡片点击后平滑展开为全宽 Detail Panel

**Detail Panel 内容**（从数据库 `industries` 表读取）：
- 子产业列表，每个子产业显示：
  - 名称
  - 电力成本占比条形图（2D 动画填充）
  - 影响程度指示器（1-5 几何点阵）
  - 当前状态 vs 未来预测（左右对比布局）
- 关闭按钮回到网格

**2D 动画**：
- 卡片入场：stagger 逐个从底部滑入 + 淡入
- 展开/收起：layout animation（Framer Motion）
- 数据条形：滚动到可视区时从左向右动画填充

#### S3: 核聚变科普

**左半区 — 3D 模型**：
- 简化的托卡马克（Tokamak）几何体：一个圆环体（Torus）+ 外部线圈骨架
- 风格化处理：线框 + 半透明面，不追求写实
- 可鼠标拖拽旋转，滚轮缩放
- 内部粒子流模拟等离子体运动（沿圆环路径循环）

```
Three.js 模型构建:
- TorusGeometry (圆环体 = 等离子体腔)
- 多个 TorusGeometry 垂直排列 (磁场线圈)
- 使用 MeshStandardMaterial + wireframe
- 粒子沿 Torus 内部曲线路径运动 (CatmullRomCurve3)
```

**右半区 — 内容面板**：
- Tab 切换：「什么是核聚变」/「技术路线」/「关键挑战」
- 「技术路线」Tab 从 `fusion_approaches` 表读取数据，展示对比卡片
- 「关键挑战」用几何图标 + 简短文字列出：
  - 等离子体约束
  - 氚增殖
  - 材料耐中子辐照
  - 经济可行性

**交互式时间线**（横向滚动）：
- 从 `timeline_events` 表读取
- 节点为圆形（past = 实心，current = 脉冲动画，projected = 虚线圆）
- 鼠标悬停节点弹出详情卡片
- 连接线为几何折线（非曲线，保持极简风格）

#### S4: 成本现实

**核心组件 — 交互式 LCOE 对比图**：
- 从 `cost_data` 表读取
- D3.js 绘制：X 轴为年份（2020-2100），Y 轴为 $/MWh
- 每种能源为一条线 + 不确定性区间带（半透明）
- 可拖拽时间滑块选择年份，右侧显示该年份各能源的排序柱状图

**视觉风格**：
- 图表背景纯白或极浅灰
- 线条使用各能源对应颜色，粗细一致
- 网格线极细、低对比度
- 无多余装饰

**关键洞察卡片**（图表下方）：
- 「聚变 ≠ 免费电力」
- 「70% 的成本来自建设，不是燃料」
- 「聚变的真正价值：稳定的零碳基荷电力」
- 卡片以几何图标 + 一句话 + 可展开详情

#### S5: 未来推演 + 小测验

**三阶段推演**（垂直滚动触发）：
- 阶段一（2040-2060）：首批商业电厂 → 成本高 → 卡片灰蓝色调
- 阶段二（2060-2080）：规模化 → 成本下降 → 卡片渐变为蓝绿
- 阶段三（2080+）：深度融合 → 产业重塑 → 卡片渐变为明亮色
- 每个阶段滚动到时触发入场动画

**互动小测验**：
- 从 `quiz_questions` 表读取
- 每题一个卡片，单选，选后立即反馈（正确/错误 + 解析）
- 完成后显示得分 + 分享按钮
- 答题数据写入 `user_interactions` 表

---

## 四、项目目录结构

```
fusion-energy-app/
├── client/                          # 前端
│   ├── public/
│   │   └── fonts/                   # 几何风格字体文件
│   ├── src/
│   │   ├── main.tsx                 # 入口
│   │   ├── App.tsx                  # 路由 + 全局布局
│   │   ├── styles/
│   │   │   └── globals.css          # Tailwind + 自定义几何样式
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navigation.tsx    # 侧边导航点（Section 指示器）
│   │   │   │   ├── ScrollProgress.tsx # 顶部滚动进度条
│   │   │   │   └── LanguageToggle.tsx # 中英文切换
│   │   │   ├── three/
│   │   │   │   ├── HeroScene.tsx     # S1 粒子聚变场景
│   │   │   │   ├── TokamakModel.tsx  # S3 托卡马克模型
│   │   │   │   ├── ParticleField.tsx # 通用粒子背景
│   │   │   │   └── shaders/
│   │   │   │       ├── fusion.vert   # 粒子顶点着色器
│   │   │   │       └── fusion.frag   # 粒子片段着色器
│   │   │   ├── sections/
│   │   │   │   ├── HeroSection.tsx       # S1
│   │   │   │   ├── IndustryMap.tsx        # S2
│   │   │   │   ├── FusionExplainer.tsx    # S3
│   │   │   │   ├── CostReality.tsx        # S4
│   │   │   │   └── FutureOutlook.tsx      # S5
│   │   │   ├── ui/
│   │   │   │   ├── Card.tsx              # 几何风格卡片
│   │   │   │   ├── Timeline.tsx          # 交互式时间线
│   │   │   │   ├── BarChart.tsx          # 条形图组件
│   │   │   │   ├── LCOEChart.tsx         # D3 LCOE 对比图
│   │   │   │   ├── QuizCard.tsx          # 测验卡片
│   │   │   │   ├── ImpactMeter.tsx       # 影响程度指示器
│   │   │   │   └── GeometricDivider.tsx  # 几何分割线
│   │   │   └── common/
│   │   │       ├── AnimatedNumber.tsx    # 数字滚动动画
│   │   │       └── ScrollReveal.tsx     # 滚动显现 wrapper
│   │   ├── hooks/
│   │   │   ├── useScrollSection.ts      # 当前 Section 检测
│   │   │   ├── useInView.ts             # 可视区域检测
│   │   │   └── useApi.ts               # API 请求封装
│   │   ├── lib/
│   │   │   ├── api.ts                   # axios/fetch 配置
│   │   │   └── i18n.ts                  # 简单中英文切换逻辑
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript 类型定义
│   │   └── data/
│   │       └── seed.ts                  # 种子数据（也用于前端 fallback）
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                           # 后端
│   ├── src/
│   │   ├── index.ts                  # Express 入口
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle 表定义
│   │   │   ├── migrate.ts           # 迁移脚本
│   │   │   ├── seed.ts              # 种子数据填充
│   │   │   └── index.ts             # DB 连接实例
│   │   ├── routes/
│   │   │   ├── categories.ts        # GET /api/categories
│   │   │   ├── industries.ts        # GET /api/industries, GET /api/industries/:id
│   │   │   ├── fusion.ts            # GET /api/fusion-approaches
│   │   │   ├── timeline.ts          # GET /api/timeline
│   │   │   ├── costs.ts             # GET /api/costs
│   │   │   ├── quiz.ts              # GET /api/quiz, POST /api/quiz/answer
│   │   │   └── interactions.ts      # POST /api/interactions
│   │   └── middleware/
│   │       └── cors.ts
│   ├── data/
│   │   └── fusion.db                # SQLite 数据库文件（gitignore）
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                      # workspace root
```

---

## 五、API 接口设计

| 方法 | 路径 | 说明 | 返回 |
|------|------|------|------|
| GET | `/api/categories` | 全部分类 | `Category[]` |
| GET | `/api/categories/:slug/industries` | 某分类下的产业 | `Industry[]` |
| GET | `/api/industries/:id` | 单个产业详情 | `Industry` |
| GET | `/api/fusion-approaches` | 全部聚变技术路线 | `FusionApproach[]` |
| GET | `/api/timeline` | 全部时间线事件 | `TimelineEvent[]` |
| GET | `/api/timeline?type=projected` | 按类型筛选 | `TimelineEvent[]` |
| GET | `/api/costs` | 全部成本数据 | `CostData[]` |
| GET | `/api/costs?source=fusion&year_min=2030` | 筛选 | `CostData[]` |
| GET | `/api/quiz?section=fusion_basics` | 获取某区块题目 | `QuizQuestion[]` |
| POST | `/api/quiz/answer` | 提交答案 | `{ correct, explanation }` |
| POST | `/api/interactions` | 记录用户行为 | `{ success }` |

---

## 六、设计系统

### 6.1 色彩

```css
:root {
  /* 背景 */
  --bg-primary: #0A0A0F;       /* 深空黑（Hero + 3D 区域） */
  --bg-secondary: #FAFAFA;     /* 近白（内容区域） */
  --bg-card: #FFFFFF;          /* 卡片 */
  --bg-card-dark: #141420;     /* 深色模式卡片 */

  /* 文字 */
  --text-primary: #1A1A2E;     /* 主文字 */
  --text-secondary: #6B7280;   /* 辅助文字 */
  --text-on-dark: #E5E7EB;    /* 深色背景上的文字 */

  /* 强调色 — 对应 7 大分类 */
  --accent-red: #EF4444;       /* 能源密集型 */
  --accent-purple: #8B5CF6;    /* 算力 */
  --accent-blue: #3B82F6;      /* 交通 */
  --accent-green: #22C55E;     /* 农业 */
  --accent-cyan: #06B6D4;      /* 环境 */
  --accent-amber: #F59E0B;     /* 产业消亡 */
  --accent-pink: #EC4899;      /* 城市 */

  /* 几何元素 */
  --geo-line: rgba(255,255,255,0.08);  /* 深色背景上的网格线 */
  --geo-line-light: rgba(0,0,0,0.06);  /* 浅色背景上的网格线 */
}
```

### 6.2 字体

```css
/* 推荐方案（需引入） */
font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
/* Space Grotesk: 几何感英文字体 */
/* Noto Sans SC: 与之搭配的中文字体 */

/* 备选：系统字体方案 */
font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
```

### 6.3 间距与网格

```
基础单位: 8px
间距层级: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128
最大内容宽度: 1200px
栅格: 12 列, gap 24px
Section 垂直间距: 128px
```

### 6.4 几何设计语言

- **分割线**：不用传统 `<hr>`，用 SVG 几何图案（三角网格、平行线组）
- **卡片圆角**：统一 `12px`
- **投影**：极淡长投影 `0 8px 32px rgba(0,0,0,0.06)`
- **边框**：1px, `rgba(0,0,0,0.08)` 或发光效果
- **背景纹理**：用 CSS 或 SVG 绘制极细的等距三角网格

---

## 七、Three.js 场景规格

### 7.1 Hero 粒子聚变场景

```typescript
// 场景参数
const HERO_CONFIG = {
  particleCount: 4000,
  particleSize: { min: 0.5, max: 2.5 },
  colorGradient: ['#3B82F6', '#FFFFFF', '#F59E0B'], // 蓝 → 白 → 橙
  gravityCenterStrength: 0.02,
  mouseInfluenceRadius: 3.0,
  mouseInfluenceStrength: 0.01,
  bloomStrength: 1.5,
  bloomRadius: 0.4,
  bloomThreshold: 0.6,
  cameraFov: 60,
  cameraZ: 15,
  autoRotateSpeed: 0.001,
}

// 自定义着色器要点
// vertex: 根据粒子到中心距离计算 size attenuation
// fragment: 圆形 point + 径向渐变透明度
// 温度映射: uniform float uTime 驱动颜色在 gradient 中插值
```

### 7.2 托卡马克模型

```typescript
const TOKAMAK_CONFIG = {
  torusRadius: 3,           // 主半径
  tubeRadius: 1,            // 管半径
  radialSegments: 32,
  tubularSegments: 64,
  coilCount: 12,            // 环绕线圈数量
  coilRadius: 1.3,          // 线圈半径（略大于管）
  plasmaParticleCount: 500, // 内部等离子体粒子
  plasmaSpeed: 0.5,
  wireframeOpacity: 0.3,
  materialColor: '#3B82F6',
  coilColor: '#6B7280',
}

// 线圈用 TorusGeometry 垂直放置，沿主圆周均匀分布
// 等离子体粒子沿 TorusKnotCurve 或自定义 Torus 内曲线运动
```

---

## 八、2D 动画规格

### 8.1 全局动画

| 元素 | 触发 | 动画 | 参数 |
|------|------|------|------|
| Section 标题 | 滚动进入视口 | 从下方 30px 滑入 + 淡入 | duration: 0.6s, ease: easeOut |
| 段落文字 | 滚动进入视口 | 淡入 | duration: 0.4s, delay: 0.1s |
| 卡片组 | 滚动进入视口 | stagger 逐个入场 | stagger: 0.08s |
| 数字 | 进入视口 | 从 0 滚动到目标值 | duration: 1.2s |
| Section 切换 | 滚动过渡区 | 背景色渐变 | 深色 ↔ 浅色 |

### 8.2 交互动画

| 元素 | 触发 | 动画 |
|------|------|------|
| 卡片 hover | mouseEnter | translateY: -4px, 边框发光 |
| 卡片展开 | click | layoutAnimation 展开到详情面板 |
| 时间线节点 | hover | scale: 1.3, 弹出信息卡 |
| 测验选项 | click | 正确→绿色脉冲，错误→红色抖动 |
| 条形图填充 | 进入视口 | 从左到右填充, ease: easeInOut |
| 滚动进度条 | scroll | 顶部细线宽度随滚动比例增长 |

---

## 九、种子数据（完整）

### 9.1 产业条目（部分示例）

```json
[
  {
    "category": "energy-intensive",
    "name_zh": "铝冶炼",
    "name_en": "Aluminum Smelting",
    "description_zh": "电解铝是全球最耗电的工业过程之一。电力成本占铝生产总成本的30-40%。如果电力接近免费，铝材价格可能下降至目前的一半，将彻底改变建筑、交通、包装等所有用铝行业。",
    "description_en": "Aluminum electrolysis is one of the most energy-intensive industrial processes globally...",
    "impact_level": 5,
    "electricity_cost_pct": 0.35
  },
  {
    "category": "energy-intensive",
    "name_zh": "海水淡化",
    "name_en": "Desalination",
    "description_zh": "反渗透海水淡化的能耗约为3-4 kWh/立方米。电力成本占运营成本的30-50%。免费电力意味着全球任何沿海地区都能获得廉价淡水，中东、北非、澳洲等缺水地区将彻底改变。",
    "impact_level": 5,
    "electricity_cost_pct": 0.40
  },
  {
    "category": "compute",
    "name_zh": "AI训练与推理",
    "name_en": "AI Training & Inference",
    "description_zh": "训练GPT-4级别模型的电力成本估计在数百万美元。数据中心电力占运营成本的30-50%。免费电力将让AI能力平民化，算力不再是瓶颈。",
    "impact_level": 5,
    "electricity_cost_pct": 0.40
  },
  {
    "category": "compute",
    "name_zh": "加密货币挖矿",
    "name_en": "Cryptocurrency Mining",
    "description_zh": "比特币挖矿90%以上的运营成本是电力。免费电力将使挖矿利润率暴增，但也可能导致算力过剩和通缩压力。整个加密经济的激励机制需要重新设计。",
    "impact_level": 4,
    "electricity_cost_pct": 0.90
  },
  {
    "category": "transport",
    "name_zh": "电动航空",
    "name_en": "Electric Aviation",
    "description_zh": "电动飞机目前受限于电池能量密度和充电成本。免费电力+合成航空燃料（Power-to-Liquid）将使航空业的燃料成本趋近于零。短途电动飞行出租车将变得经济可行。",
    "impact_level": 4,
    "electricity_cost_pct": 0.60
  },
  {
    "category": "agriculture",
    "name_zh": "垂直农场",
    "name_en": "Vertical Farming",
    "description_zh": "室内垂直农场的最大成本是LED照明和温控系统的电费，占运营成本的25-30%。免费电力让「在任何地方种任何东西」成为可能——沙漠、极地、城市中心都能大规模农业生产。",
    "impact_level": 5,
    "electricity_cost_pct": 0.28
  },
  {
    "category": "environment",
    "name_zh": "直接空气碳捕获",
    "name_en": "Direct Air Carbon Capture",
    "description_zh": "DAC目前成本约$400-600/吨CO₂，其中能耗是最大因素。免费电力可将成本压缩到$50-100/吨，使大规模从大气中回收CO₂变得经济可行。这不仅能减碳，还能作为合成燃料和材料的碳源。",
    "impact_level": 5,
    "electricity_cost_pct": 0.70
  },
  {
    "category": "disruption",
    "name_zh": "石油天然气产业",
    "name_en": "Oil & Gas Industry",
    "description_zh": "电力替代化石燃料发电只是开始。免费电力驱动的电解制氢、合成燃料将侵蚀化石燃料在化工和交通领域的最后阵地。石油输出国的经济模式和地缘政治影响力将根本性改变。",
    "impact_level": 5,
    "electricity_cost_pct": null
  },
  {
    "category": "urban",
    "name_zh": "极端气候宜居化",
    "name_en": "Extreme Climate Habitability",
    "description_zh": "供暖和制冷成本归零意味着西伯利亚、撒哈拉沙漠边缘、极地等地区的宜居性大幅提升。城市规划不再受能源基础设施约束，人口分布可能出现历史性迁移。",
    "impact_level": 4,
    "electricity_cost_pct": null
  }
]
```

### 9.2 时间线数据

```json
[
  { "year": 1952, "title_zh": "首次人工聚变反应", "title_en": "First Artificial Fusion", "description_zh": "美国常春藤麦克行动（Ivy Mike）引爆第一颗氢弹，证明聚变可以释放巨大能量——但以不受控的方式。", "event_type": "past" },
  { "year": 1958, "title_zh": "托卡马克概念诞生", "title_en": "Tokamak Concept Born", "description_zh": "苏联物理学家提出托卡马克设计，用环形磁场约束等离子体。成为此后数十年主流聚变方案。", "event_type": "past" },
  { "year": 1997, "title_zh": "JET创纪录", "title_en": "JET Sets Record", "description_zh": "欧洲联合环面装置（JET）产生16.1MW聚变功率，创造当时的世界纪录。但输入能量仍大于产出。", "event_type": "past" },
  { "year": 2006, "title_zh": "ITER启动建设", "title_en": "ITER Construction Begins", "description_zh": "33国合作的国际热核聚变实验堆（ITER）在法国开工。目标是证明聚变发电的工程可行性。", "event_type": "past" },
  { "year": 2022, "title_zh": "NIF实现点火", "title_en": "NIF Achieves Ignition", "description_zh": "美国国家点火设施（NIF）首次实现聚变点火——产出能量超过激光输入能量。科学里程碑。", "event_type": "past" },
  { "year": 2025, "title_zh": "CFS测试SPARC", "title_en": "CFS Tests SPARC", "description_zh": "Commonwealth Fusion Systems的紧凑型托卡马克SPARC进入关键测试阶段，使用高温超导磁体。", "event_type": "current" },
  { "year": 2035, "title_zh": "ITER氘氚实验", "title_en": "ITER D-T Experiments", "description_zh": "ITER预计开始氘-氚聚变实验，目标产出500MW聚变功率，验证Q>10（产出/输入能量比>10）。", "event_type": "projected" },
  { "year": 2040, "title_zh": "首座示范电厂", "title_en": "First Demo Plant", "description_zh": "如果技术顺利，首批聚变示范电厂可能在这个时期建成。将首次把聚变能量转化为电网电力。", "event_type": "projected" },
  { "year": 2050, "title_zh": "商业化部署开始", "title_en": "Commercial Deployment Begins", "description_zh": "乐观情景下，标准化聚变电厂开始批量建设。资本成本目标：$2,800-7,000/kW。", "event_type": "projected" },
  { "year": 2070, "title_zh": "规模化与成本下降", "title_en": "Scale & Cost Reduction", "description_zh": "经过20年迭代，聚变发电成本可能降至$25-50/MWh，开始与风电太阳能正面竞争。", "event_type": "projected" },
  { "year": 2100, "title_zh": "聚变占全球发电10-50%", "title_en": "Fusion 10-50% of Global Power", "description_zh": "MIT建模预测：根据成本情景不同，聚变可能占全球发电量的10%到50%。", "event_type": "projected" }
]
```

### 9.3 成本数据

```json
[
  { "energy_source": "solar",          "year": 2024, "lcoe_median": 35,  "lcoe_low": 20,  "lcoe_high": 55,  "is_projection": false },
  { "energy_source": "onshore_wind",   "year": 2024, "lcoe_median": 40,  "lcoe_low": 25,  "lcoe_high": 60,  "is_projection": false },
  { "energy_source": "natural_gas",    "year": 2024, "lcoe_median": 55,  "lcoe_low": 35,  "lcoe_high": 75,  "is_projection": false },
  { "energy_source": "nuclear_fission","year": 2024, "lcoe_median": 100, "lcoe_low": 70,  "lcoe_high": 140, "is_projection": false },
  { "energy_source": "fusion",         "year": 2024, "lcoe_median": 150, "lcoe_low": 100, "lcoe_high": 250, "is_projection": true },
  { "energy_source": "solar",          "year": 2040, "lcoe_median": 25,  "lcoe_low": 15,  "lcoe_high": 40,  "is_projection": true },
  { "energy_source": "fusion",         "year": 2050, "lcoe_median": 80,  "lcoe_low": 40,  "lcoe_high": 130, "is_projection": true },
  { "energy_source": "fusion",         "year": 2070, "lcoe_median": 40,  "lcoe_low": 25,  "lcoe_high": 70,  "is_projection": true },
  { "energy_source": "fusion",         "year": 2100, "lcoe_median": 25,  "lcoe_low": 15,  "lcoe_high": 50,  "is_projection": true }
]
```

### 9.4 测验题目

```json
[
  {
    "section": "industry_impact",
    "question_zh": "以下哪个产业的电力成本占比最高？",
    "question_en": "Which industry has the highest electricity cost proportion?",
    "options": [
      { "label": "A", "text_zh": "铝冶炼 (~35%)", "text_en": "Aluminum Smelting (~35%)", "correct": false },
      { "label": "B", "text_zh": "比特币挖矿 (~90%)", "text_en": "Bitcoin Mining (~90%)", "correct": true },
      { "label": "C", "text_zh": "海水淡化 (~40%)", "text_en": "Desalination (~40%)", "correct": false },
      { "label": "D", "text_zh": "垂直农场 (~28%)", "text_en": "Vertical Farming (~28%)", "correct": false }
    ],
    "explanation_zh": "比特币挖矿的运营成本中，90%以上来自电力消耗。这使它成为对电价最敏感的产业。",
    "explanation_en": "Over 90% of Bitcoin mining operational costs come from electricity consumption."
  },
  {
    "section": "fusion_basics",
    "question_zh": "核聚变发电成本中占比最大的部分是什么？",
    "question_en": "What is the largest component of fusion electricity cost?",
    "options": [
      { "label": "A", "text_zh": "燃料（氘和氚）", "text_en": "Fuel (Deuterium & Tritium)", "correct": false },
      { "label": "B", "text_zh": "资本建设成本", "text_en": "Capital Construction Costs", "correct": true },
      { "label": "C", "text_zh": "日常运维", "text_en": "Daily Operations", "correct": false },
      { "label": "D", "text_zh": "废物处理", "text_en": "Waste Management", "correct": false }
    ],
    "explanation_zh": "约70%的聚变发电成本来自反应堆的建造——超导磁体、等离子体容器等工程造价。燃料成本几乎可以忽略不计。",
    "explanation_en": "About 70% of fusion electricity costs come from reactor construction."
  },
  {
    "section": "cost",
    "question_zh": "根据MIT建模，到2100年聚变最多可能占全球发电量的多少？",
    "question_en": "According to MIT modeling, what maximum share of global electricity could fusion reach by 2100?",
    "options": [
      { "label": "A", "text_zh": "10%", "text_en": "10%", "correct": false },
      { "label": "B", "text_zh": "25%", "text_en": "25%", "correct": false },
      { "label": "C", "text_zh": "50%", "text_en": "50%", "correct": true },
      { "label": "D", "text_zh": "80%", "text_en": "80%", "correct": false }
    ],
    "explanation_zh": "在最乐观的成本情景下（$2,800/kW），聚变到2100年可能达到全球发电量的50%。最高成本情景下也能达到10%。",
    "explanation_en": "Under the lowest capital cost scenario ($2,800/kW), fusion could reach up to 50% of global electricity by 2100."
  }
]
```

---

## 十、启动指南

### 10.1 环境准备

```bash
# 确保 Node.js >= 18
node -v

# 克隆并安装
git clone <repo>
cd fusion-energy-app
npm install          # 安装 workspace 依赖

# 初始化数据库
cd server
npm run db:migrate   # 创建表结构
npm run db:seed      # 填充种子数据
```

### 10.2 开发模式

```bash
# 根目录启动（并发前后端）
npm run dev

# 或分别启动
cd server && npm run dev   # http://localhost:3001
cd client && npm run dev   # http://localhost:5173 (自动代理到后端)
```

### 10.3 关键 package.json 依赖

```json
// client/package.json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "@react-three/fiber": "^8.15",
    "@react-three/drei": "^9.88",
    "@react-three/postprocessing": "^2.16",
    "three": "^0.160",
    "framer-motion": "^11.0",
    "d3": "^7.9",
    "axios": "^1.7"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "vite": "^5.4",
    "tailwindcss": "^3.4",
    "@types/three": "^0.160",
    "@types/d3": "^7.4"
  }
}

// server/package.json
{
  "dependencies": {
    "express": "^4.18",
    "better-sqlite3": "^11.0",
    "drizzle-orm": "^0.33",
    "cors": "^2.8"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "tsx": "^4.7",
    "drizzle-kit": "^0.24",
    "@types/express": "^4.17",
    "@types/better-sqlite3": "^7.6"
  }
}
```

---

## 十一、性能优化要点

1. **Three.js 场景**：非当前视口的 3D 场景暂停渲染（`frameloop="demand"`）
2. **图片/字体**：字体 subset 只保留用到的字符，使用 `woff2`
3. **代码分割**：Three.js 和 D3 模块 lazy import
4. **滚动性能**：用 `IntersectionObserver` 替代 scroll 事件监听
5. **数据库**：SQLite 单文件，零网络延迟；生产部署可换 PostgreSQL
6. **SSR/预渲染**：首屏 HTML 预渲染，Three.js 场景客户端激活

---

## 十二、扩展方向

- **管理后台**：添加 CMS 页面，可编辑所有数据库内容
- **多语言**：当前支持中英文，架构已预留 i18n 扩展点
- **用户系统**：添加登录，支持收藏、评论、学习进度
- **数据可视化增强**：添加「如果电价降到 X 元/kWh」的交互式滑块，实时计算各产业影响
- **移动端适配**：Three.js 降级为 2D Canvas 粒子，减少 GPU 负载
- **Spout/NDI 输出**：如需用于展览，可添加 Electron 壳 + Spout 输出供 TouchDesigner 接收
