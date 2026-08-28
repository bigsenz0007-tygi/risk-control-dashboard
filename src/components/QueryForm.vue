<template>
  <el-form
    :model="value"
    size="small"
    :label-width="labelWidth"
    label-position="right"
    :class="['query-grid', { 'is-collapsed': collapsible && collapsed }]"
  >
    <el-form-item
      v-for="field in fields"
      :key="field.key"
      :label="field.label"
      :required="!!field.required"
    >
      <el-input
        v-if="field.type === 'input' || !field.type"
        :value="value[field.key]"
        clearable
        :placeholder="field.placeholder || '请输入'"
        @input="setField(field.key, $event)"
      />
      <el-select
        v-else-if="field.type === 'select'"
        :value="value[field.key]"
        clearable
        :filterable="!!field.filterable"
        :placeholder="field.placeholder || '请选择'"
        @input="setField(field.key, $event)"
      >
        <el-option
          v-for="opt in field.options || []"
          :key="String(opt.value)"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-date-picker
        v-else-if="field.type === 'daterange'"
        :value="value[field.key]"
        type="daterange"
        value-format="yyyy-MM-dd"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        range-separator="至"
        unlink-panels
        popper-class="lui-daterange-popper"
        @input="setField(field.key, $event)"
      />
      <el-date-picker
        v-else-if="field.type === 'month'"
        :value="value[field.key]"
        type="month"
        value-format="yyyy-MM"
        :placeholder="field.placeholder || '请选择月份'"
        @input="setField(field.key, $event)"
      />
    </el-form-item>

    <div class="query-actions">
      <slot name="actions-prepend" />
      <el-button @click="$emit('reset')">重置</el-button>
      <el-button type="primary" @click="$emit('search')">查询</el-button>
      <el-button
        v-if="collapsible"
        type="text"
        @click="toggleCollapse"
      >
        {{ collapsed ? '展开' : '收起' }}
        <i :class="collapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" />
      </el-button>
    </div>
  </el-form>
</template>

<script>
/**
 * LUI PC3.0 查询区：统一 label 120 / 右对齐 / 默认最多 2 行收起 / 重置·查询·展开
 * 字段通过 fields schema 配置，禁止各页手写一套 query-actions。
 */
export default {
  name: 'QueryForm',
  props: {
    value: {
      type: Object,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
    /** 字段数 > 6 时建议开启，默认开启 */
    collapsible: {
      type: Boolean,
      default: true,
    },
    collapsed: {
      type: Boolean,
      default: true,
    },
    labelWidth: {
      type: String,
      default: '120px',
    },
  },
  methods: {
    setField(key, val) {
      const next = { ...this.value, [key]: val }
      if (key === 'dateRange' && Array.isArray(val)) {
        next.dateRange = val.slice()
      }
      this.$emit('input', next)
    },
    toggleCollapse() {
      this.$emit('update:collapsed', !this.collapsed)
    },
  },
}
</script>
