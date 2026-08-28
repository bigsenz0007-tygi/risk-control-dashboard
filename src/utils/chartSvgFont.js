/** Vue 2 mixin：SVG 字号随容器缩放，须在 chart 组件中配合 ref="chartSvg" 使用。 */
const CHART_TEXT_PX = 14
const CHART_AUX_TEXT_PX = 12
const CHART_LINE_GAP_PX = 2

export const CHART_FONT_SANS = "'PingFang SC', -apple-system, sans-serif"
export const CHART_FONT_NUMBER = "'JDZhengHT-EN', 'PingFang SC', sans-serif"

function calcSvgFontSize(svgEl, viewBoxHeight, targetPx = CHART_TEXT_PX) {
  if (!svgEl || !viewBoxHeight) return targetPx
  const height = svgEl.getBoundingClientRect().height
  if (!height) return targetPx
  const scale = height / viewBoxHeight
  return Math.round((targetPx / scale) * 100) / 100
}

export const chartSvgFontMixin = {
  data() {
    return {
      svgFontSize: CHART_TEXT_PX,
      svgAuxFontSize: CHART_AUX_TEXT_PX,
      svgLineGap: CHART_LINE_GAP_PX,
    }
  },
  mounted() {
    this._updateChartSvgFont = () => {
      const svg = this.$refs.chartSvg
      const viewBoxHeight = this.chartViewBoxHeight
      if (!svg || !viewBoxHeight) return
      this.svgFontSize = calcSvgFontSize(svg, viewBoxHeight, CHART_TEXT_PX)
      this.svgAuxFontSize = calcSvgFontSize(svg, viewBoxHeight, CHART_AUX_TEXT_PX)
      this.svgLineGap = calcSvgFontSize(svg, viewBoxHeight, CHART_LINE_GAP_PX)
    }
    this.$nextTick(() => {
      this._updateChartSvgFont()
      if (typeof ResizeObserver !== 'undefined' && this.$refs.chartSvg) {
        this._chartFontRo = new ResizeObserver(this._updateChartSvgFont)
        this._chartFontRo.observe(this.$refs.chartSvg)
      }
      window.addEventListener('resize', this._updateChartSvgFont)
    })
  },
  beforeDestroy() {
    this._chartFontRo?.disconnect()
    window.removeEventListener('resize', this._updateChartSvgFont)
  },
}
