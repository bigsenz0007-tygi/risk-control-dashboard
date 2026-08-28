/**
 * Mock 数据与纯函数工具层（非 Vue 组件）。
 * 页面须在 data()/computed 中持有副本或派生结果，勿直接修改本模块导出的常量数组/对象。
 */

export const SCENE_OPTIONS = [
  { label: '全部', value: '全部' },
  { label: '交易风控', value: '交易风控' },
  { label: '账户风控', value: '账户风控' },
  { label: '营销风控', value: '营销风控' },
]

export const defaultFilters = () => ({
  riskScene: '全部',
  strategyName: '',
  strategyCode: '',
  version: '',
  dateRange: [],
})

export const KPI_SUMMARY = {
  calls: 1284920,
  hits: 85420,
  hitRate: 6.65,
  hitsDod: -1.8,
  accuracyValue: null,
  accuracyRate: 92.4,
  handleValue: null,
  penaltyValue: null,
}

export const TREND_POINTS = [
  { time: '08-20', calls: 1137862, hits: 84035, hitRate: 7.39 },
  { time: '08-21', calls: 1009462, hits: 71258, hitRate: 7.06 },
  { time: '08-22', calls: 1094231, hits: 76442, hitRate: 6.99 },
  { time: '08-23', calls: 1118654, hits: 79287, hitRate: 7.09 },
  { time: '08-24', calls: 1004314, hits: 80321, hitRate: 8.0 },
  { time: '08-25', calls: 1070094, hits: 78887, hitRate: 7.37 },
  { time: '08-26', calls: 1070793, hits: 71852, hitRate: 6.71 },
]

/** 每日策略指标：对齐图1，按日每天 3 条策略 */
const TABLE_ROWS_DAILY_CORE = [
  {
    date: '2026-08-27',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 143293,
    callsDod: 9.2,
    hits: 10634,
    hitsDod: 8.1,
    hitRate: 7.42,
  },
  {
    date: '2026-08-27',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 76444,
    callsDod: -17.5,
    hits: 3497,
    hitsDod: -24.8,
    hitRate: 4.57,
  },
  {
    date: '2026-08-27',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 152304,
    callsDod: 8.2,
    hits: 12890,
    hitsDod: 9.5,
    hitRate: 8.46,
  },
  {
    date: '2026-08-26',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 134842,
    callsDod: 17.4,
    hits: 10435,
    hitsDod: 12.1,
    hitRate: 7.74,
  },
  {
    date: '2026-08-26',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 98621,
    callsDod: -5.6,
    hits: 6210,
    hitsDod: -3.2,
    hitRate: 6.3,
  },
  {
    date: '2026-08-26',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 152304,
    callsDod: 8.2,
    hits: 12890,
    hitsDod: 9.5,
    hitRate: 8.46,
  },
  {
    date: '2026-08-25',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 114860,
    callsDod: -2.1,
    hits: 9310,
    hitsDod: 1.4,
    hitRate: 8.11,
  },
  {
    date: '2026-08-25',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 104510,
    callsDod: 6.3,
    hits: 6412,
    hitsDod: 4.0,
    hitRate: 6.14,
  },
  {
    date: '2026-08-25',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 152304,
    callsDod: 8.2,
    hits: 12890,
    hitsDod: 9.5,
    hitRate: 8.46,
  },
  {
    date: '2026-08-24',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 128440,
    callsDod: 1.2,
    hits: 9980,
    hitsDod: 0.8,
    hitRate: 7.77,
  },
  {
    date: '2026-08-24',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 104510,
    callsDod: 6.3,
    hits: 6412,
    hitsDod: 4.0,
    hitRate: 6.14,
  },
  {
    date: '2026-08-24',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 140880,
    callsDod: 2.9,
    hits: 11760,
    hitsDod: 3.6,
    hitRate: 8.35,
  },
  {
    date: '2026-08-23',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 126320,
    callsDod: -1.5,
    hits: 9720,
    hitsDod: -0.6,
    hitRate: 7.69,
  },
  {
    date: '2026-08-23',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 98310,
    callsDod: 0.5,
    hits: 6150,
    hitsDod: -0.8,
    hitRate: 6.26,
  },
  {
    date: '2026-08-23',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 136540,
    callsDod: 3.1,
    hits: 11380,
    hitsDod: 2.8,
    hitRate: 8.34,
  },
  {
    date: '2026-08-22',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 128440,
    callsDod: 1.2,
    hits: 9980,
    hitsDod: 0.8,
    hitRate: 7.77,
  },
  {
    date: '2026-08-22',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 97820,
    callsDod: -2.4,
    hits: 6088,
    hitsDod: -1.2,
    hitRate: 6.22,
  },
  {
    date: '2026-08-22',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 132410,
    callsDod: 4.6,
    hits: 11020,
    hitsDod: 5.1,
    hitRate: 8.32,
  },
]

const DAILY_STRATEGY_TEMPLATES = [
  {
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    baseCalls: 128440,
    baseHits: 9980,
  },
  {
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    baseCalls: 104510,
    baseHits: 6412,
  },
  {
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    baseCalls: 140880,
    baseHits: 11760,
  },
]

function hashSeed(text) {
  return [...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

function formatDateYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildDailyRowsBetween(startDate, endDate) {
  const rows = []
  const cursor = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  while (cursor >= end) {
    const date = formatDateYMD(cursor)
    DAILY_STRATEGY_TEMPLATES.forEach((tpl, index) => {
      const seed = hashSeed(`${date}-${tpl.code}`)
      const dayOffset = Math.floor((new Date(`${date}T00:00:00`) - end) / 86400000)
      const calls = tpl.baseCalls + ((seed + dayOffset * 17) % 18000) - 9000
      const hits = Math.max(1200, tpl.baseHits + ((seed + dayOffset * 11) % 2200) - 1100)
      const callsDod = Math.round((((seed % 400) - 200) / 10) * 10) / 10
      const hitsDod = Math.round((((seed + index * 37) % 500 - 250) / 10) * 10) / 10
      rows.push({
        date,
        code: tpl.code,
        name: tpl.name,
        version: tpl.version,
        scene: tpl.scene,
        type: tpl.type,
        calls,
        callsDod,
        hits,
        hitsDod,
        hitRate: Math.round((hits / calls) * 10000) / 100,
      })
    })
    cursor.setDate(cursor.getDate() - 1)
  }
  return rows
}

export const TABLE_ROWS_DAILY = [
  ...TABLE_ROWS_DAILY_CORE,
  ...buildDailyRowsBetween('2026-08-21', '2026-07-30').filter((row) => row.date < '2026-08-22'),
]

export const TABLE_ROWS_WEEKLY = [
  {
    date: '2026-W34',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 842180,
    callsDod: 6.2,
    hits: 64820,
    hitsDod: 5.1,
    hitRate: 7.7,
  },
  {
    date: '2026-W34',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 610420,
    callsDod: -1.8,
    hits: 38120,
    hitsDod: -2.4,
    hitRate: 6.25,
  },
  {
    date: '2026-W34',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 720560,
    callsDod: 4.5,
    hits: 60210,
    hitsDod: 5.8,
    hitRate: 8.36,
  },
  {
    date: '2026-W33',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 792640,
    callsDod: 3.8,
    hits: 61680,
    hitsDod: 2.9,
    hitRate: 7.78,
  },
  {
    date: '2026-W33',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 621300,
    callsDod: -0.6,
    hits: 39040,
    hitsDod: -1.1,
    hitRate: 6.28,
  },
  {
    date: '2026-W33',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 689520,
    callsDod: 5.2,
    hits: 56880,
    hitsDod: 4.4,
    hitRate: 8.25,
  },
  {
    date: '2026-W32',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 763480,
    callsDod: -2.1,
    hits: 59920,
    hitsDod: -1.6,
    hitRate: 7.85,
  },
  {
    date: '2026-W32',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 625040,
    callsDod: 1.4,
    hits: 39480,
    hitsDod: 0.9,
    hitRate: 6.32,
  },
  {
    date: '2026-W32',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 655320,
    callsDod: -3.2,
    hits: 54460,
    hitsDod: -2.8,
    hitRate: 8.31,
  },
  {
    date: '2026-W31',
    code: 'ST_1001',
    name: '高风险交易拦截',
    version: 'v2.0',
    scene: '交易风控',
    type: '规则集',
    calls: 780120,
    callsDod: 2.6,
    hits: 60840,
    hitsDod: 1.8,
    hitRate: 7.8,
  },
  {
    date: '2026-W31',
    code: 'ST_1002',
    name: '异常登录识别',
    version: 'v1.3',
    scene: '账户风控',
    type: '模型',
    calls: 616280,
    callsDod: -1.2,
    hits: 39120,
    hitsDod: -0.5,
    hitRate: 6.35,
  },
  {
    date: '2026-W31',
    code: 'ST_1003',
    name: '营销刷单防控',
    version: 'v1.8',
    scene: '营销风控',
    type: '规则集',
    calls: 676840,
    callsDod: 0.4,
    hits: 55210,
    hitsDod: 0.4,
    hitRate: 8.16,
  },
]

export function formatNumber(n) {
  if (n == null || n === '') return '待上线'
  return Number(n).toLocaleString('en-US')
}

/** 环比：卡片默认不带单位；表格可带 % */
export function formatDod(v, { withUnit = true } = {}) {
  if (v == null) return { text: '-', tone: 'flat' }
  const abs = Math.abs(v).toFixed(1)
  const unit = withUnit ? '%' : ''
  if (v > 0) return { text: `${abs}${unit}`, tone: 'up' }
  if (v < 0) return { text: `${abs}${unit}`, tone: 'down' }
  return { text: `${abs}${unit}`, tone: 'flat' }
}

/** 驾驶舱环比/同比：文案仅百分比，升降箭头由 Figma 三角图标渲染 */
export function formatCockpitCompare(v) {
  if (v == null) return { text: '—', tone: 'flat' }
  const abs = Math.abs(Number(v)).toFixed(2)
  if (v > 0) return { text: `${abs}%`, tone: 'up' }
  if (v < 0) return { text: `${abs}%`, tone: 'down' }
  return { text: `${abs}%`, tone: 'flat' }
}

export function filterSummaryText(filters) {
  const range =
    filters.dateRange && filters.dateRange.length === 2
      ? `${filters.dateRange[0]} ~ ${filters.dateRange[1]}`
      : '全部'
  return [
    `风险场景=${filters.riskScene || '全部'}`,
    `策略名称=${filters.strategyName || '全部'}`,
    `策略编码=${filters.strategyCode || '全部'}`,
    `版本号=${filters.version || '全部'}`,
    `统计日期=${range}`,
  ].join('｜')
}

/** Mock 查询：返回新对象，由页面赋值给 data 中的响应式字段 */
export function mockQueryResult(filters) {
  const narrowed = Boolean(filters.strategyName)
  if (!narrowed) {
    return {
      kpi: { ...KPI_SUMMARY },
      trendPoints: TREND_POINTS.map((p) => ({ ...p })),
    }
  }
  const scale = 0.42
  return {
    kpi: {
      ...KPI_SUMMARY,
      calls: Math.round(KPI_SUMMARY.calls * scale),
      hits: Math.round(KPI_SUMMARY.hits * 0.48),
      hitRate: 7.12,
      hitsDod: -2.4,
    },
    trendPoints: TREND_POINTS.map((p) => ({
      ...p,
      calls: Math.round(p.calls * scale),
      hits: Math.round(p.hits * 0.48),
      hitRate: Math.round(p.hitRate * 0.95 * 100) / 100,
    })),
  }
}
