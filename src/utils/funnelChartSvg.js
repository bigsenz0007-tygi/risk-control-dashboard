/** 漏斗图 SVG（与 FunnelChart.vue 共用几何，供离线 HTML 导出） */
import { formatConversionRate } from './chartMath'
import { CHART_FONT_NUMBER, CHART_FONT_SANS } from './chartSvgFont'

const FUNNEL_BLUES = ['#486DE8', '#6B86F7']
const FUNNEL_PENDING_FILL = '#E5E7EB'
const FUNNEL_PENDING_LABEL = '#868D9F'
const FUNNEL_PENDING_VALUE = '#BABEC7'
const FUNNEL_ANNO_PENDING = '#BABEC7'
const CORNER_RADIUS = 2
const GAP = 6
const CENTER_X = 200
const SVG_FONT_SIZE = 14
const SVG_AUX_FONT_SIZE = 12
const SVG_LINE_GAP = 2

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

const VIEW_PAD_X = 16
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

function buildLayerBounds() {
  const tops = [88, 162, 236, 310]
  const ranges = [[FUNNEL.topY, tops[0]]]
  tops.forEach((bot, i) => {
    const nextTop = tops[i + 1]
    ranges.push([bot + GAP, nextTop != null ? nextTop : FUNNEL.botY])
  })
  return ranges
}

function buildSegments(calls, hits) {
  const nf = (n) => Number(n).toLocaleString('en-US')
  const layerBounds = buildLayerBounds()
  const meta = [
    {
      key: 'calls',
      label: '调用量',
      valueText: nf(calls),
      fill: FUNNEL_BLUES[0],
      textColor: '#FFFFFF',
      valueColor: '#FFFFFF',
    },
    {
      key: 'hits',
      label: '命中量',
      valueText: nf(hits),
      fill: FUNNEL_BLUES[1],
      textColor: '#FFFFFF',
      valueColor: '#FFFFFF',
    },
    {
      key: 'handle',
      label: '处置量',
      valueText: '待上线',
      fill: FUNNEL_PENDING_FILL,
      textColor: FUNNEL_PENDING_LABEL,
      valueColor: FUNNEL_PENDING_VALUE,
    },
    {
      key: 'penalty',
      label: '落罚量',
      valueText: '待上线',
      fill: FUNNEL_PENDING_FILL,
      textColor: FUNNEL_PENDING_LABEL,
      valueColor: FUNNEL_PENDING_VALUE,
    },
    {
      key: 'accuracy',
      label: '准确量',
      valueText: '待上线',
      fill: FUNNEL_PENDING_FILL,
      textColor: FUNNEL_PENDING_LABEL,
      valueColor: FUNNEL_PENDING_VALUE,
    },
  ]
  const last = meta.length - 1
  return meta.map((item, index) => {
    const [top, bot] = layerBounds[index]
    const box = boundsAt(top, bot)
    const midY = (top + bot) / 2
    const labelSize = SVG_FONT_SIZE
    const valueSize = SVG_FONT_SIZE
    const blockHeight = labelSize + SVG_LINE_GAP + valueSize
    const labelY = midY - blockHeight / 2 + labelSize
    const valueY = labelY + labelSize + SVG_LINE_GAP
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
}

function buildLeftAnnotations(segments, hitRate) {
  const hits = segments.find((s) => s.key === 'hits')
  if (!hits) return []
  const layerBounds = buildLayerBounds()
  const [top, bot] = layerBounds[1]
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
      rateText: `${hitRate}%`,
    },
  ]
}

function buildAnnotations(calls, hits, hitRate) {
  const rates = [
    formatConversionRate(hits, calls, hitRate),
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
    const blockHeight = SVG_AUX_FONT_SIZE + SVG_LINE_GAP + SVG_FONT_SIZE
    const labelY = y - blockHeight / 2 + SVG_AUX_FONT_SIZE
    const valueY = labelY + SVG_AUX_FONT_SIZE + SVG_LINE_GAP
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
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function renderFunnelSvg({ calls, hits, hitRate }) {
  const { vbMinX, vbW } = contentBounds()
  const viewBox = `${vbMinX} ${FUNNEL.topY} ${vbW} ${FUNNEL.botY - FUNNEL.topY}`
  const segments = buildSegments(calls, hits)
  const leftAnnotations = buildLeftAnnotations(segments, hitRate)
  const annotations = buildAnnotations(calls, hits, hitRate)

  const paths = segments.map(
    (seg) => `<path d="${seg.path}" fill="${seg.fill}"></path>`,
  ).join('')

  const labels = segments.map(
    (seg) => `
      <text x="${seg.textX}" y="${seg.labelY}" text-anchor="middle" fill="${seg.textColor}" font-size="${SVG_FONT_SIZE}" font-weight="500" font-family="${CHART_FONT_SANS}">${esc(seg.label)}</text>
      <text x="${seg.textX}" y="${seg.valueY}" text-anchor="middle" fill="${seg.valueColor}" font-size="${SVG_FONT_SIZE}" font-weight="500" font-family="${CHART_FONT_NUMBER}">${esc(seg.valueText)}</text>`,
  ).join('')

  const leftAnnoHtml = leftAnnotations.map(
    (anno) => `
      <line x1="${anno.x1}" y1="${anno.y}" x2="${anno.x2}" y2="${anno.y}" stroke="#D9D9D9" stroke-width="1" stroke-dasharray="3"></line>
      <text x="${anno.textX}" y="${anno.labelY}" text-anchor="end" fill="#525765" font-size="${SVG_FONT_SIZE}" font-weight="400" font-family="${CHART_FONT_SANS}">命中率</text>
      <text x="${anno.textX}" y="${anno.valueY}" text-anchor="end" fill="#525765" font-size="${SVG_FONT_SIZE}" font-weight="400" font-family="${CHART_FONT_NUMBER}">${esc(anno.rateText)}</text>`,
  ).join('')

  const annoHtml = annotations.map(
    (anno) => `
      <line x1="${anno.x1}" y1="${anno.y}" x2="${anno.x2}" y2="${anno.y}" stroke="#D9D9D9" stroke-width="1" stroke-dasharray="3"></line>
      <text x="${anno.textX}" y="${anno.labelY}" fill="${anno.muted ? FUNNEL_ANNO_PENDING : '#525765'}" font-size="${SVG_AUX_FONT_SIZE}" font-weight="400" font-family="${CHART_FONT_SANS}">转化率</text>
      <text x="${anno.textX}" y="${anno.valueY}" fill="${anno.muted ? FUNNEL_ANNO_PENDING : '#525765'}" font-size="${SVG_FONT_SIZE}" font-weight="400" font-family="${CHART_FONT_NUMBER}">${esc(anno.rateText)}</text>`,
  ).join('')

  return `<svg viewBox="${viewBox}" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" shape-rendering="geometricPrecision"><g>${paths}${labels}${leftAnnoHtml}${annoHtml}</g></svg>`
}
