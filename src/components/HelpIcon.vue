<template>
  <span
    v-if="content"
    class="help-icon"
    tabindex="0"
    role="button"
    :aria-label="content"
  >
    <img
      :class="['help-icon__img', imgClass]"
      :src="iconSrc"
      width="16"
      height="16"
      alt=""
    />
    <span class="help-icon__tip" role="tooltip">{{ content }}</span>
  </span>
</template>

<script>
import iconHelp from '../assets/icons/lui-icon-help.svg'

export default {
  name: 'HelpIcon',
  props: {
    content: {
      type: String,
      required: true,
    },
    imgClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      iconSrc: iconHelp,
    }
  },
}
</script>

<style scoped>
.help-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  cursor: help;
  flex-shrink: 0;
  outline: none;
}

.help-icon__img {
  display: block;
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.help-icon__tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  z-index: 3100;
  width: max-content;
  min-width: 120px;
  max-width: 200px;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(35, 37, 43, 0.92);
  box-shadow: var(--lui-shadow-dropdown);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  font-family: var(--lui-font-sans);
  font-weight: 400;
  white-space: normal;
  text-align: left;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.help-icon__tip::after {
  content: '';
  position: absolute;
  left: 50%;
  top: calc(100% - 1px);
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(35, 37, 43, 0.92);
}

.help-icon:hover .help-icon__tip,
.help-icon:focus .help-icon__tip,
.help-icon:focus-within .help-icon__tip {
  opacity: 1;
  visibility: visible;
}
</style>
