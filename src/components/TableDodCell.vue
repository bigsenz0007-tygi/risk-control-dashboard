<template>
  <span class="rd-dod" :class="'is-' + meta.tone">
    <span class="rd-dod__value">{{ meta.text }}</span>
    <img
      v-if="meta.showArrow"
      class="rd-dod__arrow"
      :class="{ 'is-down': meta.tone === 'down' }"
      :src="meta.arrowSrc"
      width="12"
      height="9"
      alt=""
    />
  </span>
</template>

<script>
import iconTrendUp from '../assets/icons/trend-up.svg'
import iconTrendDown from '../assets/icons/trend-down.svg'
import { formatDod } from '../mock/dashboardData'

export default {
  name: 'TableDodCell',
  props: {
    value: {
      type: Number,
      default: null,
    },
  },
  computed: {
    meta() {
      const { text, tone } = formatDod(this.value)
      const showArrow = tone === 'up' || tone === 'down'
      return {
        text,
        tone,
        showArrow,
        arrowSrc: tone === 'up' ? iconTrendUp : iconTrendDown,
      }
    },
  },
}
</script>
