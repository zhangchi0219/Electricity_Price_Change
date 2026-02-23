import { client } from './index';

async function seed() {
  console.log('Seeding database...');

  // 清空旧数据
  await client.execute('DELETE FROM quiz_questions');
  await client.execute('DELETE FROM user_interactions');
  await client.execute('DELETE FROM cost_data');
  await client.execute('DELETE FROM timeline_events');
  await client.execute('DELETE FROM fusion_approaches');
  await client.execute('DELETE FROM industries');
  await client.execute('DELETE FROM categories');

  // ─── Categories ──────────────────────────────────────────────────────────────
  const categoriesData = [
    { slug: 'energy-intensive', name_zh: '直接受益：能源密集型', name_en: 'Direct Benefit: Energy-Intensive', icon: '🏭', color: '#EF4444', sort_order: 1 },
    { slug: 'compute',          name_zh: '算力爆发',             name_en: 'Compute Explosion',              icon: '🧠', color: '#8B5CF6', sort_order: 2 },
    { slug: 'transport',        name_zh: '交通重构',             name_en: 'Transport Restructuring',        icon: '🚗', color: '#3B82F6', sort_order: 3 },
    { slug: 'agriculture',      name_zh: '农业革命',             name_en: 'Agricultural Revolution',        icon: '🌾', color: '#22C55E', sort_order: 4 },
    { slug: 'environment',      name_zh: '环境逆转',             name_en: 'Environmental Reversal',         icon: '🌍', color: '#06B6D4', sort_order: 5 },
    { slug: 'disruption',       name_zh: '产业消亡',             name_en: 'Industry Disruption',            icon: '⚡', color: '#F59E0B', sort_order: 6 },
    { slug: 'urban',            name_zh: '城市重塑',             name_en: 'Urban Reshaping',                icon: '🏙️', color: '#EC4899', sort_order: 7 },
  ];

  for (const c of categoriesData) {
    await client.execute({
      sql: 'INSERT INTO categories (slug, name_zh, name_en, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      args: [c.slug, c.name_zh, c.name_en, c.icon, c.color, c.sort_order],
    });
  }

  // 获取 category id 映射
  const catResult = await client.execute('SELECT id, slug FROM categories');
  const catMap: Record<string, number> = {};
  for (const row of catResult.rows) catMap[row.slug as string] = row.id as number;

  // ─── Industries ───────────────────────────────────────────────────────────────
  const industriesData = [
    {
      cat: 'energy-intensive', name_zh: '铝冶炼', name_en: 'Aluminum Smelting',
      desc_zh: '电解铝是全球最耗电的工业过程之一。电力成本占铝生产总成本的30-40%。如果电力接近免费，铝材价格可能下降至目前的一半，将彻底改变建筑、交通、包装等所有用铝行业。',
      desc_en: 'Aluminum electrolysis is one of the most energy-intensive industrial processes globally. Electricity costs account for 30-40% of total aluminum production costs. Near-free electricity could halve aluminum prices, transforming construction, transportation, and packaging industries.',
      impact_level: 5, electricity_cost_pct: 0.35,
      current_status: '电力成本是铝价最大单一变量，中国铝业高度依赖煤电',
      future_projection: '电价趋零后铝成本可降低 50%+，全球铝需求或翻倍',
      sort_order: 1,
    },
    {
      cat: 'energy-intensive', name_zh: '海水淡化', name_en: 'Desalination',
      desc_zh: '反渗透海水淡化的能耗约为3-4 kWh/立方米。电力成本占运营成本的30-50%。免费电力意味着全球任何沿海地区都能获得廉价淡水，中东、北非、澳洲等缺水地区将彻底改变。',
      desc_en: 'Reverse osmosis desalination consumes ~3-4 kWh/m³. Electricity accounts for 30-50% of operating costs. Free electricity means cheap freshwater for any coastal region, transforming water-scarce areas like the Middle East and North Africa.',
      impact_level: 5, electricity_cost_pct: 0.40,
      current_status: '全球淡水危机持续，海水淡化因能耗成本受限',
      future_projection: '免费电力使淡化水成本降至 $0.1/m³ 以下，解锁全球粮食安全',
      sort_order: 2,
    },
    {
      cat: 'energy-intensive', name_zh: '钢铁冶炼', name_en: 'Steel Production',
      desc_zh: '绿色氢基炼钢（DRI+EAF）电力成本占总成本的20-30%。传统高炉炼铁污染严重，电力廉价后氢冶金将全面取代焦炭，钢铁行业实现深度脱碳。',
      desc_en: 'Green hydrogen-based steelmaking (DRI+EAF) has electricity as 20-30% of total costs. Cheap electricity enables green hydrogen production to fully replace coke, decarbonizing the steel industry.',
      impact_level: 4, electricity_cost_pct: 0.25,
      current_status: '钢铁是全球最大工业碳排放来源之一',
      future_projection: '氢基炼钢全面推广，钢铁行业碳排放降至接近零',
      sort_order: 3,
    },
    {
      cat: 'compute', name_zh: 'AI训练与推理', name_en: 'AI Training & Inference',
      desc_zh: '训练GPT-4级别模型的电力成本估计在数百万美元。数据中心电力占运营成本的30-50%。免费电力将让AI能力平民化，算力不再是瓶颈。',
      desc_en: 'Training GPT-4 scale models costs millions in electricity. Data centers spend 30-50% of operating costs on power. Free electricity would democratize AI capabilities, removing compute as a bottleneck.',
      impact_level: 5, electricity_cost_pct: 0.40,
      current_status: '头部AI公司数据中心年电力成本达数十亿美元',
      future_projection: '算力成本趋零，AI推理服务免费化，通用人工智能加速到来',
      sort_order: 1,
    },
    {
      cat: 'compute', name_zh: '加密货币挖矿', name_en: 'Cryptocurrency Mining',
      desc_zh: '比特币挖矿90%以上的运营成本是电力。免费电力将使挖矿利润率暴增，但也可能导致算力过剩和通缩压力。整个加密经济的激励机制需要重新设计。',
      desc_en: 'Over 90% of Bitcoin mining operational costs are electricity. Free electricity would dramatically increase mining margins but could cause hash rate oversaturation and deflationary pressures, requiring rethinking of crypto incentive mechanisms.',
      impact_level: 4, electricity_cost_pct: 0.90,
      current_status: '比特币年耗电量相当于中等国家，受电价波动影响巨大',
      future_projection: '挖矿成本崩塌，PoW 模型经济逻辑受根本性冲击',
      sort_order: 2,
    },
    {
      cat: 'transport', name_zh: '电动航空', name_en: 'Electric Aviation',
      desc_zh: '电动飞机目前受限于电池能量密度和充电成本。免费电力+合成航空燃料（Power-to-Liquid）将使航空业的燃料成本趋近于零。短途电动飞行出租车将变得经济可行。',
      desc_en: 'Electric aircraft are currently limited by battery energy density and charging costs. Free electricity + synthetic aviation fuel (Power-to-Liquid) could bring aviation fuel costs near zero, making short-haul electric air taxis economically viable.',
      impact_level: 4, electricity_cost_pct: 0.60,
      current_status: '航空燃料占航空公司运营成本的 25-30%',
      future_projection: '合成燃料 e-SAF 大规模商业化，航空碳排放归零',
      sort_order: 1,
    },
    {
      cat: 'transport', name_zh: '电动船运', name_en: 'Electric Shipping',
      desc_zh: '海运是全球贸易的基础，燃油成本占船运总成本的 50-60%。绿色氨或甲醇合成燃料（均需大量电力）将取代重油，国际航运脱碳。',
      desc_en: 'Shipping is the backbone of global trade, with fuel costs at 50-60% of total shipping costs. Green ammonia or synthetic methanol (both requiring massive electricity) will replace heavy fuel oil, decarbonizing international shipping.',
      impact_level: 4, electricity_cost_pct: 0.55,
      current_status: '海运占全球碳排放约 3%，脱碳路径高度依赖廉价电力',
      future_projection: '绿氨/绿甲醇燃料全面推广，海运成本结构重组',
      sort_order: 2,
    },
    {
      cat: 'agriculture', name_zh: '垂直农场', name_en: 'Vertical Farming',
      desc_zh: '室内垂直农场的最大成本是LED照明和温控系统的电费，占运营成本的25-30%。免费电力让「在任何地方种任何东西」成为可能——沙漠、极地、城市中心都能大规模农业生产。',
      desc_en: 'The largest cost in indoor vertical farming is electricity for LED lighting and climate control (25-30% of operating costs). Free electricity enables growing anything anywhere — deserts, polar regions, and urban centers can all support large-scale food production.',
      impact_level: 5, electricity_cost_pct: 0.28,
      current_status: '垂直农场因高电费难以与传统农业竞争',
      future_projection: '粮食生产从土地束缚中解放，城市自给自足成为可能',
      sort_order: 1,
    },
    {
      cat: 'agriculture', name_zh: '绿色氢肥', name_en: 'Green Hydrogen Fertilizer',
      desc_zh: '合成氨（化肥原料）的Haber-Bosch工艺占全球能耗的1-2%。电力廉价后绿色氢基合成氨将取代天然气路线，全球粮食生产的碳足迹大幅降低。',
      desc_en: 'The Haber-Bosch process for synthetic ammonia (fertilizer feedstock) accounts for 1-2% of global energy use. Cheap electricity enables green hydrogen-based ammonia synthesis to replace natural gas routes, dramatically reducing the carbon footprint of global food production.',
      impact_level: 4, electricity_cost_pct: 0.45,
      current_status: '传统氨合成高度依赖天然气，价格受能源市场剧烈波动影响',
      future_projection: '绿氨成本降至与化石氨持平，全球化肥供应链重构',
      sort_order: 2,
    },
    {
      cat: 'environment', name_zh: '直接空气碳捕获', name_en: 'Direct Air Carbon Capture',
      desc_zh: 'DAC目前成本约$400-600/吨CO₂，其中能耗是最大因素。免费电力可将成本压缩到$50-100/吨，使大规模从大气中回收CO₂变得经济可行。这不仅能减碳，还能作为合成燃料和材料的碳源。',
      desc_en: 'DAC currently costs ~$400-600/ton CO₂, with energy being the largest factor. Free electricity could compress costs to $50-100/ton, making large-scale atmospheric CO₂ removal economically viable — serving both carbon reduction and as a carbon source for synthetic fuels.',
      impact_level: 5, electricity_cost_pct: 0.70,
      current_status: 'DAC 技术已验证，但成本比植树造林高 10-20 倍',
      future_projection: '廉价 DAC 成为可行的气候工程手段，大气 CO₂ 浓度可主动管理',
      sort_order: 1,
    },
    {
      cat: 'disruption', name_zh: '石油天然气产业', name_en: 'Oil & Gas Industry',
      desc_zh: '电力替代化石燃料发电只是开始。免费电力驱动的电解制氢、合成燃料将侵蚀化石燃料在化工和交通领域的最后阵地。石油输出国的经济模式和地缘政治影响力将根本性改变。',
      desc_en: "Free electricity-driven electrolytic hydrogen and synthetic fuels will erode fossil fuels' last strongholds in chemicals and transportation. The economic models of oil-exporting nations and their geopolitical influence will fundamentally change.",
      impact_level: 5, electricity_cost_pct: null,
      current_status: '石油天然气行业市值数十万亿美元，深度嵌入全球经济',
      future_projection: '化石燃料市场份额在 2050-2080 年间出现断崖式下滑',
      sort_order: 1,
    },
    {
      cat: 'urban', name_zh: '极端气候宜居化', name_en: 'Extreme Climate Habitability',
      desc_zh: '供暖和制冷成本归零意味着西伯利亚、撒哈拉沙漠边缘、极地等地区的宜居性大幅提升。城市规划不再受能源基础设施约束，人口分布可能出现历史性迁移。',
      desc_en: 'Zero heating and cooling costs would dramatically increase the habitability of Siberia, Saharan borders, and polar regions. Urban planning freed from energy infrastructure constraints could trigger historic population redistributions.',
      impact_level: 4, electricity_cost_pct: null,
      current_status: '极端气候区域定居人口极少，供能成本是主要壁垒',
      future_projection: '北极、沙漠地区出现新兴城市，全球人口密度分布重塑',
      sort_order: 1,
    },
  ];

  for (const ind of industriesData) {
    await client.execute({
      sql: `INSERT INTO industries
        (category_id, name_zh, name_en, description_zh, description_en, impact_level, electricity_cost_pct, current_status, future_projection, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        catMap[ind.cat], ind.name_zh, ind.name_en, ind.desc_zh, ind.desc_en,
        ind.impact_level, ind.electricity_cost_pct,
        ind.current_status, ind.future_projection, ind.sort_order,
      ],
    });
  }

  // ─── Fusion Approaches ────────────────────────────────────────────────────────
  const fusionData = [
    {
      name: 'Tokamak', name_zh: '托卡马克',
      desc_zh: '用强磁场将高温等离子体约束在环形腔室中。是目前研究最深入、工程最成熟的磁约束聚变方案。ITER 是其集大成之作。',
      desc_en: "Uses strong magnetic fields to confine high-temperature plasma in a toroidal chamber. The most deeply researched and engineered magnetic confinement fusion approach. ITER is its ultimate realization.",
      key_projects: JSON.stringify(['ITER', 'CFS SPARC', 'UKAEA STEP', 'JET']),
      status: 'experimental', timeline: '2040-2050', cost: 0.08,
    },
    {
      name: 'Inertial Confinement', name_zh: '惯性约束（激光聚变）',
      desc_zh: '用高功率激光从多方向均匀照射氢弹丸，产生内爆压缩实现聚变。NIF 于 2022 年首次实现点火（输出 > 输入）。',
      desc_en: 'Uses high-power lasers to uniformly irradiate a hydrogen fuel pellet from multiple directions, creating implosion compression for fusion. NIF achieved ignition in 2022.',
      key_projects: JSON.stringify(['NIF', 'ELI', 'LMJ', 'Marvel Fusion']),
      status: 'experimental', timeline: '2050-2070', cost: 0.15,
    },
    {
      name: 'Compact High-Field Tokamak', name_zh: '紧凑型高场托卡马克',
      desc_zh: '利用高温超导磁体产生极强磁场，将托卡马克体积缩小 10 倍以上。CFS 的 SPARC 是代表项目。',
      desc_en: "Uses high-temperature superconducting magnets to generate extremely strong fields, reducing tokamak volume by 10x+. CFS's SPARC is the flagship project.",
      key_projects: JSON.stringify(['CFS SPARC', 'CFS ARC', 'Tokamak Energy ST80-HTS']),
      status: 'experimental', timeline: '2035-2045', cost: 0.06,
    },
    {
      name: 'Stellarator', name_zh: '仿星器',
      desc_zh: '通过复杂扭曲的线圈几何形状约束等离子体，无需电流驱动，等离子体天然稳定。德国 Wendelstein 7-X 是最先进的实验仿星器。',
      desc_en: "Confines plasma through complex twisted coil geometry without current drive. Germany's Wendelstein 7-X is the most advanced experimental stellarator.",
      key_projects: JSON.stringify(['Wendelstein 7-X', 'HSX', 'LHD']),
      status: 'research', timeline: '2050-2070', cost: 0.10,
    },
    {
      name: 'Field-Reversed Configuration', name_zh: '场反位形（FRC）',
      desc_zh: '一种紧凑型磁约束方案，等离子体自我约束形成细长圆柱形。TAE Technologies 和 Helion Energy 是主要私人投资方向。',
      desc_en: 'A compact magnetic confinement approach where plasma self-confines into an elongated cylinder. TAE Technologies and Helion Energy are major private investors.',
      key_projects: JSON.stringify(['Helion Energy', 'TAE Technologies', 'Princeton FRC']),
      status: 'research', timeline: '2030-2040', cost: 0.05,
    },
  ];

  for (const f of fusionData) {
    await client.execute({
      sql: `INSERT INTO fusion_approaches (name, name_zh, description_zh, description_en, key_projects, status, estimated_timeline, estimated_cost_per_kwh)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [f.name, f.name_zh, f.desc_zh, f.desc_en, f.key_projects, f.status, f.timeline, f.cost],
    });
  }

  // ─── Timeline Events ───────────────────────────────────────────────────────────
  const timelineData = [
    { year: 1952, title_zh: '首次人工聚变反应', title_en: 'First Artificial Fusion', desc_zh: '美国常春藤麦克行动（Ivy Mike）引爆第一颗氢弹，证明聚变可以释放巨大能量——但以不受控的方式。', desc_en: 'The US Ivy Mike operation detonated the first hydrogen bomb, proving fusion can release enormous energy — but in an uncontrolled manner.', type: 'past' },
    { year: 1958, title_zh: '托卡马克概念诞生', title_en: 'Tokamak Concept Born', desc_zh: '苏联物理学家提出托卡马克设计，用环形磁场约束等离子体。成为此后数十年主流聚变方案。', desc_en: 'Soviet physicists proposed the tokamak design. It became the dominant fusion approach for decades.', type: 'past' },
    { year: 1997, title_zh: 'JET创纪录', title_en: 'JET Sets Record', desc_zh: '欧洲联合环面装置（JET）产生16.1MW聚变功率，创造当时的世界纪录。但输入能量仍大于产出。', desc_en: 'The European Joint European Torus (JET) produced 16.1 MW of fusion power, setting a world record. However, input energy still exceeded output.', type: 'past' },
    { year: 2006, title_zh: 'ITER启动建设', title_en: 'ITER Construction Begins', desc_zh: '35国合作的国际热核聚变实验堆（ITER）在法国开工。目标是证明聚变发电的工程可行性。', desc_en: 'ITER, a collaboration of 35 nations, broke ground in France. Goal: demonstrate the engineering feasibility of fusion power.', type: 'past' },
    { year: 2022, title_zh: 'NIF实现点火', title_en: 'NIF Achieves Ignition', desc_zh: '美国国家点火设施（NIF）首次实现聚变点火——产出能量超过激光输入能量。科学里程碑。', desc_en: 'The US National Ignition Facility achieved fusion ignition for the first time — output exceeded laser input energy. A historic scientific milestone.', type: 'past' },
    { year: 2025, title_zh: 'CFS测试SPARC', title_en: 'CFS Tests SPARC', desc_zh: 'Commonwealth Fusion Systems的紧凑型托卡马克SPARC进入关键测试阶段，使用高温超导磁体。', desc_en: "Commonwealth Fusion Systems' compact tokamak SPARC enters critical testing phase using high-temperature superconducting magnets.", type: 'current' },
    { year: 2035, title_zh: 'ITER氘氚实验', title_en: 'ITER D-T Experiments', desc_zh: 'ITER预计开始氘-氚聚变实验，目标产出500MW聚变功率，验证Q>10。', desc_en: 'ITER is expected to begin D-T fusion experiments, targeting 500 MW fusion power output and demonstrating Q>10.', type: 'projected' },
    { year: 2040, title_zh: '首座示范电厂', title_en: 'First Demo Plant', desc_zh: '如果技术顺利，首批聚变示范电厂可能在这个时期建成，将首次把聚变能量转化为电网电力。', desc_en: 'If technology progresses smoothly, the first fusion demonstration power plants could be completed, converting fusion energy into grid electricity for the first time.', type: 'projected' },
    { year: 2050, title_zh: '商业化部署开始', title_en: 'Commercial Deployment Begins', desc_zh: '乐观情景下，标准化聚变电厂开始批量建设。资本成本目标：$2,800-7,000/kW。', desc_en: 'In the optimistic scenario, standardized fusion power plants begin mass construction. Capital cost target: $2,800-7,000/kW.', type: 'projected' },
    { year: 2070, title_zh: '规模化与成本下降', title_en: 'Scale & Cost Reduction', desc_zh: '经过20年迭代，聚变发电成本可能降至$25-50/MWh，开始与风电太阳能正面竞争。', desc_en: 'After 20 years of iteration, fusion electricity costs may fall to $25-50/MWh, beginning to directly compete with wind and solar.', type: 'projected' },
    { year: 2100, title_zh: '聚变占全球发电10-50%', title_en: 'Fusion 10-50% of Global Power', desc_zh: 'MIT建模预测：根据成本情景不同，聚变可能占全球发电量的10%到50%。', desc_en: 'MIT modeling predicts: depending on cost scenarios, fusion could account for 10% to 50% of global electricity generation.', type: 'projected' },
  ];

  for (const t of timelineData) {
    await client.execute({
      sql: `INSERT INTO timeline_events (year, title_zh, title_en, description_zh, description_en, event_type)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [t.year, t.title_zh, t.title_en, t.desc_zh, t.desc_en, t.type],
    });
  }

  // ─── Cost Data ─────────────────────────────────────────────────────────────────
  const costData = [
    ['solar',           2010, 350, 250, 450, 0, 'IRENA'],
    ['solar',           2015, 130, 80,  200, 0, 'IRENA'],
    ['solar',           2020, 57,  30,  90,  0, 'IRENA'],
    ['solar',           2024, 35,  20,  55,  0, 'IRENA'],
    ['solar',           2030, 28,  15,  45,  1, 'IRENA Projection'],
    ['solar',           2040, 25,  12,  40,  1, 'IRENA Projection'],
    ['solar',           2050, 20,  10,  35,  1, 'IRENA Projection'],
    ['onshore_wind',    2010, 95,  65,  140, 0, 'IRENA'],
    ['onshore_wind',    2015, 68,  45,  100, 0, 'IRENA'],
    ['onshore_wind',    2020, 46,  28,  70,  0, 'IRENA'],
    ['onshore_wind',    2024, 40,  25,  60,  0, 'IRENA'],
    ['onshore_wind',    2030, 35,  20,  55,  1, 'IRENA Projection'],
    ['onshore_wind',    2040, 30,  18,  50,  1, 'IRENA Projection'],
    ['onshore_wind',    2050, 25,  15,  45,  1, 'IRENA Projection'],
    ['natural_gas',     2010, 65,  45,  90,  0, 'EIA'],
    ['natural_gas',     2015, 60,  40,  85,  0, 'EIA'],
    ['natural_gas',     2020, 52,  35,  75,  0, 'EIA'],
    ['natural_gas',     2024, 55,  35,  75,  0, 'EIA'],
    ['natural_gas',     2030, 58,  38,  80,  1, 'EIA Projection'],
    ['natural_gas',     2040, 65,  40,  90,  1, 'EIA Projection'],
    ['nuclear_fission', 2010, 98,  70,  140, 0, 'Lazard'],
    ['nuclear_fission', 2015, 100, 70,  145, 0, 'Lazard'],
    ['nuclear_fission', 2020, 103, 68,  150, 0, 'Lazard'],
    ['nuclear_fission', 2024, 100, 70,  140, 0, 'Lazard'],
    ['nuclear_fission', 2030, 90,  60,  130, 1, 'Lazard Projection'],
    ['nuclear_fission', 2040, 80,  55,  120, 1, 'Lazard Projection'],
    ['fusion',          2024, 150, 100, 250, 1, 'MIT Study'],
    ['fusion',          2040, 120, 70,  180, 1, 'MIT Study'],
    ['fusion',          2050, 80,  40,  130, 1, 'MIT Study'],
    ['fusion',          2060, 60,  30,  100, 1, 'MIT Study'],
    ['fusion',          2070, 40,  25,  70,  1, 'MIT Study'],
    ['fusion',          2080, 32,  18,  55,  1, 'MIT Study'],
    ['fusion',          2100, 25,  15,  50,  1, 'MIT Study'],
  ] as const;

  for (const [src, yr, med, lo, hi, proj, source] of costData) {
    await client.execute({
      sql: `INSERT INTO cost_data (energy_source, year, lcoe_median, lcoe_low, lcoe_high, is_projection, source)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [src, yr, med, lo, hi, proj, source],
    });
  }

  // ─── Quiz Questions ────────────────────────────────────────────────────────────
  const quizData = [
    {
      section: 'industry_impact',
      q_zh: '以下哪个产业的电力成本占比最高？',
      q_en: 'Which industry has the highest electricity cost proportion?',
      options: JSON.stringify([
        { label: 'A', text_zh: '铝冶炼 (~35%)', text_en: 'Aluminum Smelting (~35%)', correct: false },
        { label: 'B', text_zh: '比特币挖矿 (~90%)', text_en: 'Bitcoin Mining (~90%)', correct: true },
        { label: 'C', text_zh: '海水淡化 (~40%)', text_en: 'Desalination (~40%)', correct: false },
        { label: 'D', text_zh: '垂直农场 (~28%)', text_en: 'Vertical Farming (~28%)', correct: false },
      ]),
      exp_zh: '比特币挖矿的运营成本中，90%以上来自电力消耗。这使它成为对电价最敏感的产业。',
      exp_en: 'Over 90% of Bitcoin mining operational costs come from electricity consumption, making it the most electricity-sensitive industry.',
      sort_order: 1,
    },
    {
      section: 'fusion_basics',
      q_zh: '核聚变发电成本中占比最大的部分是什么？',
      q_en: 'What is the largest component of fusion electricity cost?',
      options: JSON.stringify([
        { label: 'A', text_zh: '燃料（氘和氚）', text_en: 'Fuel (Deuterium & Tritium)', correct: false },
        { label: 'B', text_zh: '资本建设成本', text_en: 'Capital Construction Costs', correct: true },
        { label: 'C', text_zh: '日常运维', text_en: 'Daily Operations', correct: false },
        { label: 'D', text_zh: '废物处理', text_en: 'Waste Management', correct: false },
      ]),
      exp_zh: '约70%的聚变发电成本来自反应堆的建造——超导磁体、等离子体容器等工程造价。燃料成本几乎可以忽略不计。',
      exp_en: 'About 70% of fusion electricity costs come from reactor construction. Fuel costs are nearly negligible.',
      sort_order: 2,
    },
    {
      section: 'cost',
      q_zh: '根据MIT建模，到2100年聚变最多可能占全球发电量的多少？',
      q_en: 'According to MIT modeling, what maximum share of global electricity could fusion reach by 2100?',
      options: JSON.stringify([
        { label: 'A', text_zh: '10%', text_en: '10%', correct: false },
        { label: 'B', text_zh: '25%', text_en: '25%', correct: false },
        { label: 'C', text_zh: '50%', text_en: '50%', correct: true },
        { label: 'D', text_zh: '80%', text_en: '80%', correct: false },
      ]),
      exp_zh: '在最乐观的成本情景下（$2,800/kW），聚变到2100年可能达到全球发电量的50%。',
      exp_en: 'Under the lowest capital cost scenario ($2,800/kW), fusion could reach up to 50% of global electricity by 2100.',
      sort_order: 3,
    },
    {
      section: 'fusion_basics',
      q_zh: '托卡马克与仿星器的主要区别是什么？',
      q_en: 'What is the main difference between a tokamak and a stellarator?',
      options: JSON.stringify([
        { label: 'A', text_zh: '托卡马克用激光，仿星器用磁场', text_en: 'Tokamak uses lasers, stellarator uses magnetic fields', correct: false },
        { label: 'B', text_zh: '托卡马克需要等离子体电流，仿星器靠复杂线圈几何实现稳定约束', text_en: 'Tokamak requires plasma current, stellarator achieves stable confinement through complex coil geometry', correct: true },
        { label: 'C', text_zh: '仿星器比托卡马克产生更多能量', text_en: 'Stellarators produce more energy than tokamaks', correct: false },
        { label: 'D', text_zh: '两者没有本质区别', text_en: 'There is no fundamental difference', correct: false },
      ]),
      exp_zh: '托卡马克需要在等离子体中感应电流来产生螺旋磁场，仿星器通过复杂扭曲的线圈几何直接产生稳定的螺旋磁场。',
      exp_en: 'A tokamak induces current in the plasma to create a helical field; a stellarator creates it directly through complex coil geometry.',
      sort_order: 4,
    },
  ];

  for (const q of quizData) {
    await client.execute({
      sql: `INSERT INTO quiz_questions (section, question_zh, question_en, options, explanation_zh, explanation_en, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [q.section, q.q_zh, q.q_en, q.options, q.exp_zh, q.exp_en, q.sort_order],
    });
  }

  console.log('✓ Seed complete.');
  console.log(`  - ${categoriesData.length} categories`);
  console.log(`  - ${industriesData.length} industries`);
  console.log(`  - ${fusionData.length} fusion approaches`);
  console.log(`  - ${timelineData.length} timeline events`);
  console.log(`  - ${costData.length} cost data points`);
  console.log(`  - ${quizData.length} quiz questions`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
