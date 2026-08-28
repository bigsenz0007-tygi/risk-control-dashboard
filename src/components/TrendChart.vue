<template>
  <div class="trend-chart">
    <div ref="wrap" class="trend-chart__svg-wrap" @mousemove="onMove" @mouseleave="onLeave">
      <svg
        ref="chartSvg"
        :viewBox="`0 0 ${W} ${H}`"
        width="100%"
        height="100%"
        style="cursor:crosshair"
        preserveAspectRatio="xMidYMax meet"
      >
        <!-- 坐标轴：横竖线交于原点 -->
        <line
          :x1="AXIS_X"
          :y1="TOP"
          :x2="AXIS_X"
          :y2="BOT"
          stroke="#EAEAEA"
          stroke-width="1"
        />
        <line
          :x1="AXIS_X"
          :y1="BOT"
          :x2="PLOT_X2"
          :y2="BOT"
          stroke="#EAEAEA"
          stroke-width="1"
        />

        <!-- hover 竖虚线：对齐选中日期 -->
        <line
          v-if="hover"
          :x1="hover.x"
          :x2="hover.x"
          :y1="TOP"
          :y2="BOT"
          stroke="#3C6EF0"
          stroke-width="1"
          stroke-dasharray="4 3"
          stroke-opacity="0.35"
        />

        <template v-for="(g, idx) in grids">
          <line
            :key="'gl'+idx"
            :x1="AXIS_X"
            :y1="g.y"
            :x2="PLOT_X2"
            :y2="g.y"
            stroke="#EAEAEA"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <text
            :key="'glv'+idx"
            :x="AXIS_X - 8"
            :y="g.y + 4"
            text-anchor="end"
            fill="#BABEC7"
            :font-size="svgFontSize"
            :font-family="chartFontNumber"
          >
            {{ g.left }}
          </text>
          <text
            :key="'grv'+idx"
            :x="PLOT_X2 + 8"
            :y="g.y + 4"
            text-anchor="start"
            fill="#BABEC7"
            :font-size="svgFontSize"
            :font-family="chartFontNumber"
          >
            {{ g.right }}
          </text>
        </template>

        <text
          v-for="(p, i) in plotted"
          :key="'x'+i"
          :x="p.x"
          :y="X_LABEL_Y"
          text-anchor="middle"
          :fill="hover && hover.i === i ? '#23252B' : '#868D9F'"
          :font-size="svgFontSize"
          :font-weight="hover && hover.i === i ? 600 : 400"
          :font-family="chartFontNumber"
        >
          {{ p.time }}
        </text>

        <path :d="callPath" fill="none" stroke="#3C6EF0" stroke-width="2" />
        <path :d="hitPath" fill="none" stroke="#3AD3D9" stroke-width="2" />
        <path :d="ratePath" fill="none" stroke="#FFD83D" stroke-width="2" />

        <circle
          v-if="hover"
          :cx="hover.x"
          :cy="hover.callY"
          r="4"
          fill="#FFFFFF"
          stroke="#3C6EF0"
          stroke-width="2"
        />
        <circle
          v-if="hover"
          :cx="hover.x"
          :cy="hover.hitY"
          r="4"
          fill="#FFFFFF"
          stroke="#3AD3D9"
          stroke-width="2"
        />
        <circle
          v-if="hover"
          :cx="hover.x"
          :cy="hover.rateY"
          r="4"
          fill="#FFFFFF"
          stroke="#FFD83D"
          stroke-width="2"
        />
      </svg>
      <div
        v-if="hover"
        ref="tip"
        class="trend-chart__tip trend-chart__tip--dark"
        :class="{ 'trend-chart__tip--flip': tipFlipped }"
        :style="{ left: tipLeft + 'px', top: tipTop + 'px', '--tip-arrow-top': tipArrowTop + 'px' }"
      >
        <div class="tip-title">{{ hover.time }}</div>
        <div class="tip-row">
          <span><i style="background:#3C6EF0" />调用量</span>
          <b>{{ formatNum(hover.calls) }}</b>
        </div>
        <div class="tip-row">
          <span><i style="background:#3AD3D9" />命中量</span>
          <b>{{ formatNum(hover.hits) }}</b>
        </div>
        <div class="tip-row">
          <span><i style="background:#FFD83D" />命中率</span>
          <b>{{ hover.hitRate }}%</b>
        </div>
      </div>
    </div>
    <div class="trend-chart__legend">
      <span v-for="item in legend" :key="item.key">
        <i class="lg-dot" :style="{ background: item.color }" />
        <em :class="{ 'is-muted': item.muted }">{{ item.label }}</em>
      </span>
    </div>
  </div>
</template>

<script>
import { chartSvgFontMixin, CHART_FONT_NUMBER } from '../utils/chartSvgFont'
import { formatNumber } from '../mock/dashboardData'

/** PC3.0 曲线色板：蓝 / 青 / 藏青 / 绿 / 黄 */
const CHART_COLORS = {
  blue: '#3C6EF0',
  cyan: '#3AD3D9',
  navy: '#435889',
  green: '#3EC986',
  yellow: '#FFD83D',
  muted: '#BABEC7',
}

const SIDE_INSET = 24
const X_AXIS_INSET = 16
const TIP_GAP = 2
const MARKER_R = 4
const MARKER_STROKE = 2
const MARKER_OUTER_R = MARKER_R + MARKER_STROKE / 2
const ARROW_SIZE = 6
const TIP_ARROW_TOP = 40

/** 平滑曲线（Catmull-Rom → cubic Bezier） */
function smoothPath(pts, keyX, keyY) {
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

export default {
  name: 'TrendChart',
  mixins: [chartSvgFontMixin],
  props: {
    points: { type: Array, required: true },
  },
  data() {
    return {
      chartFontNumber: CHART_FONT_NUMBER,
      W: 600,
      H: 240,
      AXIS_X: 46,
      TOP: 16,
      BOT: 216,
      X_LABEL_Y: 232,
      hover: null,
      tipLeft: 0,
      tipTop: 0,
      tipArrowTop: TIP_ARROW_TOP,
      tipFlipped: false,
      legend: [
        { key: 'calls', label: '调用量', color: CHART_COLORS.blue },
        { key: 'hits', label: '命中量', color: CHART_COLORS.cyan },
        { key: 'hitRate', label: '命中率', color: CHART_COLORS.yellow },
        { key: 'acc', label: '准确率', color: CHART_COLORS.muted, muted: true },
        { key: 'handle', label: '处置率', color: CHART_COLORS.muted, muted: true },
        { key: 'penalty', label: '落罚率', color: CHART_COLORS.muted, muted: true },
      ],
    }
  },
  computed: {
    chartViewBoxHeight() {
      return this.H
    },
    PLOT_X1() {
      return this.AXIS_X + X_AXIS_INSET
    },
    PLOT_X2() {
      return this.W - SIDE_INSET
    },
    PLOT_X_END() {
      return this.PLOT_X2 - X_AXIS_INSET
    },
    grids() {
      const span = this.BOT - this.TOP
      return [0, 0.25, 0.5, 0.75, 1].map((t, idx) => ({
        y: this.TOP + span * (1 - t),
        left: ['0w', '38w', '75w', '113w', '150w'][idx],
        right: ['0%', '25%', '50%', '75%', '100%'][idx],
      }))
    },
    plotted() {
      const n = this.points.length
      const span = this.PLOT_X_END - this.PLOT_X1
      const maxCall = 1500000
      const maxRate = 100
      return this.points.map((p, i) => {
        const x = n === 1 ? this.PLOT_X1 : this.PLOT_X1 + (span * i) / (n - 1)
        const callY = this.BOT - (p.calls / maxCall) * (this.BOT - this.TOP)
        const hitY = this.BOT - (p.hits / maxCall) * (this.BOT - this.TOP)
        const rateY = this.BOT - (p.hitRate / maxRate) * (this.BOT - this.TOP)
        return { ...p, i, x, callY, hitY, rateY }
      })
    },
    callPath() {
      return smoothPath(this.plotted, 'x', 'callY')
    },
    hitPath() {
      return smoothPath(this.plotted, 'x', 'hitY')
    },
    ratePath() {
      return smoothPath(this.plotted, 'x', 'rateY')
    },
  },
  methods: {
    formatNum: formatNumber,
    clientToSvg(svg, clientX, clientY) {
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      return pt.matrixTransform(svg.getScreenCTM().inverse())
    },
    svgPointToWrap(svgX, svgY) {
      const svg = this.$refs.chartSvg
      const wrap = this.$refs.wrap
      if (!svg || !wrap) return { x: 0, y: 0 }
      const pt = svg.createSVGPoint()
      pt.x = svgX
      pt.y = svgY
      const screen = pt.matrixTransform(svg.getScreenCTM())
      const wrapRect = wrap.getBoundingClientRect()
      return {
        x: screen.x - wrapRect.left,
        y: screen.y - wrapRect.top,
      }
    },
    positionTip(clientY, wrap) {
      const anchor = this.svgPointToWrap(this.hover.x, this.TOP)
      const wrapRect = wrap.getBoundingClientRect()
      const mouseY = clientY - wrapRect.top
      const tipEl = this.$refs.tip
      const tipWidth = tipEl ? tipEl.offsetWidth : 168
      const tipHeight = tipEl ? tipEl.offsetHeight : 108
      const gap = MARKER_OUTER_R + TIP_GAP
      const rightLeft = anchor.x + gap + ARROW_SIZE
      const leftLeft = anchor.x - gap - ARROW_SIZE - tipWidth
      const fitsRight = rightLeft + tipWidth <= wrapRect.width
      const fitsLeft = leftLeft >= 0

      this.tipFlipped = !fitsRight && fitsLeft
      this.tipLeft = this.tipFlipped ? leftLeft : rightLeft
      this.tipTop = Math.min(
        Math.max(mouseY - tipHeight / 2, 0),
        Math.max(wrapRect.height - tipHeight, 0),
      )
    },
    onMove(e) {
      const svg = this.$refs.chartSvg
      const wrap = this.$refs.wrap
      if (!svg || !wrap || !this.plotted.length) return
      const svgPt = this.clientToSvg(svg, e.clientX, e.clientY)
      const x = svgPt.x
      let best = 0
      let bestDist = Infinity
      this.plotted.forEach((p, i) => {
        const d = Math.abs(p.x - x)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      this.hover = this.plotted[best]
      this.$nextTick(() => {
        this.positionTip(e.clientY, wrap)
      })
    },
    onLeave() {
      this.hover = null
    },
  },
}
</script>

<style scoped>
.trend-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.trend-chart__legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
  margin-top: 16px;
  padding: 0 24px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 14px;
  color: #525765;
}
.trend-chart__legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.trend-chart__legend em {
  font-style: normal;
}
.trend-chart__legend .is-muted {
  color: #babec7;
}
.lg-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.trend-chart__svg-wrap {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 0 24px;
  box-sizing: border-box;
}
.trend-chart__svg-wrap svg {
  display: block;
}
.trend-chart__tip--dark {
  position: absolute;
  background: rgba(35, 37, 43, 0.92);
  box-shadow: 0 4px 16px rgba(35, 37, 43, 0.16);
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  z-index: 10;
  pointer-events: none;
  min-width: 168px;
  color: #ffffff;
}
.trend-chart__tip--dark::before {
  content: '';
  position: absolute;
  left: -6px;
  top: var(--tip-arrow-top, 16px);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid rgba(35, 37, 43, 0.92);
}
.trend-chart__tip--dark.trend-chart__tip--flip::before {
  left: auto;
  right: -6px;
  border-right: none;
  border-left: 6px solid rgba(35, 37, 43, 0.92);
}
.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  padding-bottom: 0;
  border: none;
}
.tip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 14px;
}
.tip-row:last-child {
  margin-bottom: 0;
}
.tip-row span {
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tip-row i {
  width: 8px;
  height: 8px;
  border-radius: 100%;
  display: inline-block;
  flex-shrink: 0;
}
.tip-row b {
  color: #ffffff;
  font-weight: 400;
  font-family: 'JDZhengHT-EN', 'PingFang SC', sans-serif;
  font-variant-numeric: tabular-nums;
}
</style>
