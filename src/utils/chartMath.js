/** 图表几何与格式化纯函数（无 Vue 依赖，供组件与离线导出共用） */

export const TREND_LAYOUT = {
  W: 600,
  H: 240,
  AXIS_X: 46,
  TOP: 16,
  BOT: 216,
  X_LABEL_Y: 232,
  SIDE_INSET: 24,
  X_AXIS_INSET: 16,
  maxCall: 1500000,
  maxRate: 100,
}

export function getTrendPlotBounds(layout = TREND_LAYOUT) {
  const PLOT_X1 = layout.AXIS_X + layout.X_AXIS_INSET
  const PLOT_X2 = layout.W - layout.SIDE_INSET
  const PLOT_X_END = PLOT_X2 - layout.X_AXIS_INSET
  return { PLOT_X1, PLOT_X2, PLOT_X_END }
}

export function formatConversionRate(numerator, denominator, fallbackRate = null) {
  if (fallbackRate != null && !Number.isNaN(fallbackRate)) {
    return `${fallbackRate}%`
  }
  if (numerator == null || denominator == null || denominator === 0) {
    return '-'
  }
  const rate = (numerator / denominator) * 100
  const rounded = Math.round(rate * 100) / 100
  return `${rounded}%`
}

/** 平滑曲线（Catmull-Rom → cubic Bezier，与 TrendChart.vue 一致） */
export function smoothPath(pts, keyX, keyY) {
  if (!pts.length) return ''
  if (pts.length === 1) return `M${pts[0][keyX]},${pts[0][keyY]}`
  let d = `M${pts[0][keyX]},${pts[0][keyY]}`
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const cp1x = p1[keyX] + (p2[keyX] - p0[keyX]) / 6
    const cp1y = p1[keyY] + (p2[keyY] - p0[keyY]) / 6
    const cp2x = p2[keyX] - (p3[keyX] - p1[keyX]) / 6
    const cp2y = p2[keyY] - (p3[keyY] - p1[keyY]) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[keyX]},${p2[keyY]}`
  }
  return d
}

export function mapTrendPoints(points, layout = TREND_LAYOUT) {
  const { PLOT_X1, PLOT_X_END } = getTrendPlotBounds(layout)
  const { TOP, BOT, maxCall, maxRate } = layout
  const span = PLOT_X_END - PLOT_X1
  return points.map((p, i) => {
    const x = points.length === 1 ? PLOT_X1 : PLOT_X1 + (span * i) / (points.length - 1)
    const callY = BOT - (p.calls / maxCall) * (BOT - TOP)
    const hitY = BOT - (p.hits / maxCall) * (BOT - TOP)
    const rateY = BOT - (p.hitRate / maxRate) * (BOT - TOP)
    return {
      time: p.time,
      calls: p.calls,
      hits: p.hits,
      hitRate: String(p.hitRate),
      i,
      x,
      callY,
      hitY,
      rateY,
    }
  })
}

export function buildTrendGrids(layout = TREND_LAYOUT) {
  const span = layout.BOT - layout.TOP
  return [0, 0.25, 0.5, 0.75, 1].map((t, idx) => ({
    y: layout.TOP + span * (1 - t),
    left: ['0w', '38w', '75w', '113w', '150w'][idx],
    right: ['0%', '25%', '50%', '75%', '100%'][idx],
  }))
}
