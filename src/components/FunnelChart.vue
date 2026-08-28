<template>
  <div class="funnel-chart">
    <svg
      ref="chartSvg"
      :viewBox="viewBox"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      shape-rendering="geometricPrecision"
    >
      <g>
        <path
          v-for="seg in segments"
          :key="seg.key"
          :d="seg.path"
          :fill="seg.fill"
        />
        <template v-for="seg in segments">
          <text
            :key="seg.key + '-label'"
            :x="seg.textX"
            :y="seg.labelY"
            text-anchor="middle"
            :fill="seg.textColor"
            :font-size="svgFontSize"
            font-weight="500"
            :font-family="chartFontSans"
          >
            {{ seg.label }}
          </text>
          <text
            :key="seg.key + '-value'"
            :x="seg.textX"
            :y="seg.valueY"
            text-anchor="middle"
            :fill="seg.valueColor"
            :font-size="svgFontSize"
            font-weight="500"
            :font-family="chartFontNumber"
          >
            {{ seg.valueText }}
          </text>
        </template>

        <template v-for="anno in leftAnnotations">
          <line
            :key="anno.key + '-l'"
            :x1="anno.x1"
            :y1="anno.y"
            :x2="anno.x2"
            :y2="anno.y"
            stroke="#D9D9D9"
            stroke-width="1"
            stroke-dasharray="3"
          />
          <text
            :key="anno.key + '-t1'"
            :x="anno.textX"
            :y="anno.labelY"
            text-anchor="end"
            fill="#525765"
            :font-size="svgFontSize"
            font-weight="400"
            :font-family="chartFontSans"
          >
            命中率
          </text>
          <text
            :key="anno.key + '-t2'"
            :x="anno.textX"
            :y="anno.valueY"
            text-anchor="end"
            fill="#525765"
            :font-size="svgFontSize"
            font-weight="400"
            :font-family="chartFontNumber"
          >
            {{ anno.rateText }}
          </text>
        </template>

        <template v-for="anno in annotations">
          <line
            :key="anno.key + '-l'"
            :x1="anno.x1"
            :y1="anno.y"
            :x2="anno.x2"
            :y2="anno.y"
            stroke="#D9D9D9"
            stroke-width="1"
            stroke-dasharray="3"
          />
          <text
            :key="anno.key + '-t1'"
            :x="anno.textX"
            :y="anno.labelY"
            :fill="anno.muted ? FUNNEL_ANNO_PENDING : '#525765'"
            :font-size="svgAuxFontSize"
            font-weight="400"
            :font-family="chartFontSans"
          >
            转化率
          </text>
          <text
            :key="anno.key + '-t2'"
            :x="anno.textX"
            :y="anno.valueY"
            :fill="anno.muted ? FUNNEL_ANNO_PENDING : '#525765'"
            :font-size="svgFontSize"
            font-weight="400"
            :font-family="chartFontNumber"
          >
            {{ anno.rateText }}
          </text>
        </template>
      </g>
    </svg>
  </div>
</template>

<script>
import { chartSvgFontMixin, CHART_FONT_NUMBER, CHART_FONT_SANS } from '../utils/chartSvgFont'
import { formatConversionRate } from '../utils/chartMath'

/** PC3.0 漏斗蓝阶（上深下浅，取色板 7 档中前 2 档为已上线） */
const FUNNEL_BLUES = ['#486DE8', '#6B86F7']
/** 待上线层：统一灰阶 */
const FUNNEL_PENDING_FILL = '#E5E7EB'
const FUNNEL_PENDING_LABEL = '#868D9F'
const FUNNEL_PENDING_VALUE = '#BABEC7'
const FUNNEL_ANNO_PENDING = '#BABEC7'
const CORNER_RADIUS = 2
const GAP = 6

/** 漏斗几何中心 X */
const CENTER_X = 200

/**
 * 相对初版（顶宽 320 / 底宽 56）整体加宽 20px。
 * viewBox 宽度固定，加宽后图形在画布中占比变大，屏幕上可见变宽。
 */
const FUNNEL = {
  topY: 20,
  botY: 384,
  topWidth: 340,
  botWidth: 76,
}

FUNNEL.leftTopX = CENTER_X - FUNNEL.topWidth / 2
FUNNEL.rightTopX = CENTER_X + FUNNEL.topWidth / 2
FUNNEL.leftBotX = CENTER_X - FUNNEL.botWidth / 2
FUNNEL.rightBotX = CENTER_X + FUNNEL.botWidth / 2

/** 视口水平留白 */
const VIEW_PAD_X = 16

/** 右侧标注文案预估宽度（12px 两字标签） */
const ANNO_TEXT_WIDTH = 40
const ANNO_LINE_LEN = 68
const ANNO_TEXT_OFFSET = 74

function xLeft(y) {
  const { topY, botY, leftTopX, leftBotX } = FUNNEL
  return leftTopX + ((leftBotX - leftTopX) * (y - topY)) / (botY - topY)
}

function xRight(y) {
  const { topY, botY, rightTopX, rightBotX } = FUNNEL
  return rightTopX + ((rightBotX - rightTopX) * (y - topY)) / (botY - topY)
}

function xCenter(y) {
  return (xLeft(y) + xRight(y)) / 2
}

function contentBounds() {
  const gapCenters = [88, 162, 236].map((bot) => bot + GAP / 2)
  const funnelHalfW = FUNNEL.topWidth / 2
  let annoRight = 0
  let annoLeft = 0
  gapCenters.forEach((y, i) => {
    annoRight = Math.max(annoRight, xRight(y) + ANNO_TEXT_OFFSET + ANNO_TEXT_WIDTH - CENTER_X)
    if (i === 0) {
      const hitsMidY = (88 + GAP + 162) / 2
      annoLeft = Math.max(annoLeft, CENTER_X - xLeft(hitsMidY) + ANNO_TEXT_OFFSET + ANNO_TEXT_WIDTH)
    }
  })
  const leftExtent = Math.max(funnelHalfW, annoLeft)
  const rightExtent = Math.max(funnelHalfW, annoRight)
  return {
    vbMinX: CENTER_X - leftExtent - VIEW_PAD_X,
    vbW: leftExtent + rightExtent + VIEW_PAD_X * 2,
  }
}

function unit(dx, dy) {
  const len = Math.hypot(dx, dy) || 1
  return [dx / len, dy / len]
}

const SLOPE_L = unit(FUNNEL.leftBotX - FUNNEL.leftTopX, FUNNEL.botY - FUNNEL.topY)
const SLOPE_R = unit(FUNNEL.rightBotX - FUNNEL.rightTopX, FUNNEL.botY - FUNNEL.topY)

function boundsAt(top, bot) {
  return {
    top,
    bot,
    leftTop: xLeft(top),
    rightTop: xRight(top),
    leftBot: xLeft(bot),
    rightBot: xRight(bot),
  }
}

function buildSegmentPath(d, { roundTop = false, roundBottom = false, radius = CORNER_RADIUS }) {
  const { leftTop, rightTop, top, rightBot, leftBot, bot } = d

  if (!roundTop && !roundBottom) {
    return `M${leftTop},${top} L${rightTop},${top} L${rightBot},${bot} L${leftBot},${bot} Z`
  }

  const r = Math.min(
    radius,
    (rightTop - leftTop) / 4,
    (bot - top) / 3,
    Math.abs(rightBot - leftBot) / 4,
  )

  if (roundTop) {
    const [rux, ruy] = SLOPE_R
    const [lux, luy] = SLOPE_L
    const pTL = [leftTop + r, top]
    const pTR1 = [rightTop - r, top]
    const pTR2 = [rightTop + rux * r, top + ruy * r]
    const pTL2 = [leftTop + lux * r, top + luy * r]
    return [
      `M ${pTL[0]} ${pTL[1]}`,
      `L ${pTR1[0]} ${pTR1[1]}`,
      `Q ${rightTop} ${top} ${pTR2[0]} ${pTR2[1]}`,
      `L ${rightBot} ${bot}`,
      `L ${leftBot} ${bot}`,
      `L ${pTL2[0]} ${pTL2[1]}`,
      `Q ${leftTop} ${top} ${pTL[0]} ${pTL[1]}`,
      'Z',
    ].join(' ')
  }

  const [rusx, rusy] = unit(-SLOPE_R[0], -SLOPE_R[1])
  const [lusx, lusy] = unit(-SLOPE_L[0], -SLOPE_L[1])
  const pBR1 = [rightBot + rusx * r, bot + rusy * r]
  const pBR2 = [rightBot - r, bot]
  const pBL2 = [leftBot + r, bot]
  const pBL1 = [leftBot + lusx * r, bot + lusy * r]

  return [
    `M ${leftTop} ${top}`,
    `L ${rightTop} ${top}`,
    `L ${pBR1[0]} ${pBR1[1]}`,
    `Q ${rightBot} ${bot} ${pBR2[0]} ${pBR2[1]}`,
    `L ${pBL2[0]} ${pBL2[1]}`,
    `Q ${leftBot} ${bot} ${pBL1[0]} ${pBL1[1]}`,
    `L ${leftTop} ${top}`,
    'Z',
  ].join(' ')
}

export default {
  name: 'FunnelChart',
  mixins: [chartSvgFontMixin],
  data() {
    return {
      chartFontSans: CHART_FONT_SANS,
      chartFontNumber: CHART_FONT_NUMBER,
      FUNNEL_ANNO_PENDING,
    }
  },
  props: {
    calls: { type: Number, required: true },
    hits: { type: Number, required: true },
    hitRate: { type: Number, required: true },
    handleValue: { type: Number, default: null },
    penaltyValue: { type: Number, default: null },
  },
  computed: {
    chartViewBoxHeight() {
      return FUNNEL.botY - FUNNEL.topY
    },
    viewBox() {
      const { vbMinX, vbW } = contentBounds()
      const contentH = FUNNEL.botY - FUNNEL.topY
      return `${vbMinX} ${FUNNEL.topY} ${vbW} ${contentH}`
    },
    layerBounds() {
      const tops = [88, 162, 236, 310]
      const ranges = [[FUNNEL.topY, tops[0]]]
      tops.forEach((bot, i) => {
        const nextTop = tops[i + 1]
        ranges.push([bot + GAP, nextTop != null ? nextTop : FUNNEL.botY])
      })
      return ranges
    },
    segments() {
      const nf = (n) => Number(n).toLocaleString('en-US')
      const meta = [
        {
          key: 'calls',
          label: '调用量',
          valueText: nf(this.calls),
          fill: FUNNEL_BLUES[0],
          textColor: '#FFFFFF',
          valueColor: '#FFFFFF',
        },
        {
          key: 'hits',
          label: '命中量',
          valueText: nf(this.hits),
          fill: FUNNEL_BLUES[1],
          textColor: '#FFFFFF',
          valueColor: '#FFFFFF',
        },
        {
          key: 'handle',
          label: '处置量',
          valueText: '待上线',
          pending: true,
          fill: FUNNEL_PENDING_FILL,
          textColor: FUNNEL_PENDING_LABEL,
          valueColor: FUNNEL_PENDING_VALUE,
        },
        {
          key: 'penalty',
          label: '落罚量',
          valueText: '待上线',
          pending: true,
          fill: FUNNEL_PENDING_FILL,
          textColor: FUNNEL_PENDING_LABEL,
          valueColor: FUNNEL_PENDING_VALUE,
        },
        {
          key: 'accuracy',
          label: '准确量',
          valueText: '待上线',
          pending: true,
          fill: FUNNEL_PENDING_FILL,
          textColor: FUNNEL_PENDING_LABEL,
          valueColor: FUNNEL_PENDING_VALUE,
        },
      ]
      const last = meta.length - 1
      return meta.map((item, index) => {
        const [top, bot] = this.layerBounds[index]
        const box = boundsAt(top, bot)
        const midY = (top + bot) / 2
        const gap = this.svgLineGap
        const labelSize = this.svgFontSize
        const valueSize = this.svgFontSize
        const blockHeight = labelSize + gap + valueSize
        const labelY = midY - blockHeight / 2 + labelSize
        const valueY = labelY + labelSize + gap
        return {
          ...item,
          ...box,
          path: buildSegmentPath(box, {
            roundTop: index === 0,
            roundBottom: index === last,
          }),
          textX: xCenter(midY),
          labelY,
          valueY,
        }
      })
    },
    leftAnnotations() {
      const hits = this.segments.find((s) => s.key === 'hits')
      if (!hits) return []
      const [top, bot] = this.layerBounds[1]
      const midY = (top + bot) / 2
      const x1 = xLeft(midY)
      return [
        {
          key: 'hit-rate',
          y: midY,
          x1,
          x2: x1 - ANNO_LINE_LEN,
          textX: x1 - ANNO_TEXT_OFFSET,
          labelY: hits.labelY,
          valueY: hits.valueY,
          rateText: `${this.hitRate}%`,
        },
      ]
    },
    annotations() {
      const rates = [
        formatConversionRate(this.hits, this.calls, this.hitRate),
        '待上线',
        '待上线',
      ]
      const gaps = [
        [88, 88 + GAP],
        [162, 162 + GAP],
        [236, 236 + GAP],
        [310, 310 + GAP],
      ].slice(0, 3)
      return gaps.map(([bot, top], i) => {
        const y = (bot + top) / 2
        const x1 = xRight(y)
        const blockHeight = this.svgAuxFontSize + this.svgLineGap + this.svgFontSize
        const labelY = y - blockHeight / 2 + this.svgAuxFontSize
        const valueY = labelY + this.svgAuxFontSize + this.svgLineGap
        return {
          key: `a${i + 1}`,
          y,
          x1,
          x2: x1 + ANNO_LINE_LEN,
          textX: x1 + ANNO_TEXT_OFFSET,
          labelY,
          valueY,
          rateText: rates[i],
          muted: i > 0,
        }
      })
    },
  },
}
</script>

<style scoped>
.funnel-chart {
  width: 100%;
  height: 100%;
}
.funnel-chart svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
