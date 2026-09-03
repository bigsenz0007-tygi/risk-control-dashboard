<template>
  <div class="risk-page__main">
    <!-- 查询区：对齐 8765 QueryForm + filter-panel -->
    <section class="filter-panel">
      <div class="filter-panel__body query-card">
        <query-form
          v-model="filters"
          :fields="queryFields"
          :collapsible="false"
          @search="onQuery"
          @reset="onReset"
        >
          <el-button slot="actions-prepend" @click="onDownload">下载离线看板</el-button>
        </query-form>
      </div>
    </section>

    <!-- 核心指标驾驶舱 -->
    <section class="cockpit-panel">
      <div class="cockpit-panel__head">
        <div class="cockpit-panel__title-wrap">
          <h3 class="cockpit-panel__title">核心指标驾驶舱</h3>
        </div>
      </div>
      <div class="kpi-row kpi-row--5">
        <div
          v-for="card in kpiCards"
          :key="card.key"
          class="kpi-card"
          :class="{ 'is-pending': card.pending }"
        >
          <div class="kpi-card__head">
            <div class="kpi-card__title-row">
              <span class="kpi-card__title">{{ card.label }}</span>
              <HelpIcon :content="card.tip" img-class="kpi-card__help" />
            </div>
            <el-tag
              size="mini"
              :class="{ 'kpi-tag--pending': card.pending }"
              disable-transitions
            >{{ card.badge }}</el-tag>
          </div>
          <div class="kpi-card__value">
            <span class="kpi-card__num">{{ card.value }}</span>
            <span v-if="card.unit" class="kpi-card__unit">{{ card.unit }}</span>
          </div>
          <div class="kpi-card__sub">
            <span v-if="card.mom" class="kpi-card__mom" :class="'is-' + card.mom.tone">
              <span class="kpi-card__sub-label">环比</span>
              <b class="kpi-card__mom-value">{{ card.mom.text }}</b>
              <img
                v-if="card.mom.tone === 'up' || card.mom.tone === 'down'"
                class="kpi-card__arrow"
                :class="{ 'is-down': card.mom.tone === 'down' }"
                :src="card.mom.tone === 'up' ? iconTrendUp : iconTrendDown"
                width="12"
                height="9"
                alt=""
              />
            </span>
            <span v-if="card.subLabel" class="kpi-card__stat">
              <span class="kpi-card__sub-label">{{ card.subLabel }}</span>
              <b class="kpi-card__sub-value">{{ card.subValue }}</b>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 图表 -->
    <section class="chart-grid">
      <div class="chart-card chart-card--funnel">
        <h3 class="chart-card__title">
          风险全链路转化视图
          <HelpIcon
            content="调用量 → 命中量 → 处置量 → 落罚量 → 准确量，展示全链路转化漏斗"
            img-class="chart-card__help"
          />
        </h3>
        <div class="chart-card__plot">
          <FunnelChart
            :calls="kpi.calls"
            :hits="kpi.hits"
            :hit-rate="kpi.hitRate"
            :handle-value="kpi.handleValue"
            :penalty-value="kpi.penaltyValue"
          />
        </div>
      </div>
      <div class="chart-card chart-card--trend">
        <h3 class="chart-card__title">
          核心指标趋势
          <HelpIcon
            content="展示近 7 日调用量、命中量及命中率走势，悬停折线可查看当日明细"
            img-class="chart-card__help"
          />
        </h3>
        <TrendChart :points="trendPoints" />
      </div>
    </section>

    <!-- 每日策略指标：table-card -->
    <section class="table-card">
      <div class="table-card__toolbar">
        <h3 class="table-card__title">每日策略指标</h3>
        <el-radio-group v-model="granularity" size="small" class="biz-tabs" @change="onGranularityChange">
          <el-radio-button label="day">按日</el-radio-button>
          <el-radio-button label="week">按周</el-radio-button>
        </el-radio-group>
      </div>
      <div class="table-card__body">
        <el-table :data="pagedRows" border style="width: 100%" @sort-change="onSortChange">
        <el-table-column
          prop="date"
          :label="granularity === 'day' ? '日期' : '周次'"
          min-width="120"
          sortable="custom"
        />
        <el-table-column prop="code" label="策略编码" min-width="110" />
        <el-table-column prop="name" label="策略名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="version" label="版本号" min-width="90" />
        <el-table-column prop="scene" label="风险场景" min-width="110" />
        <el-table-column prop="type" label="策略类型" min-width="90" />
        <el-table-column prop="calls" label="调用量" min-width="110" sortable="custom">
          <template slot-scope="{ row }">
            <span class="rd-num">{{ formatNumber(row.calls) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="callsDod"
          :label="granularity === 'day' ? '调用量环比昨日' : '调用量环比上周'"
          min-width="140"
        >
          <template slot-scope="{ row }">
            <TableDodCell :value="row.callsDod" />
          </template>
        </el-table-column>
        <el-table-column prop="hits" label="命中量" min-width="100" sortable="custom">
          <template slot-scope="{ row }">
            <span class="rd-num">{{ formatNumber(row.hits) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="hitsDod"
          :label="granularity === 'day' ? '命中量环比昨日' : '命中量环比上周'"
          min-width="140"
        >
          <template slot-scope="{ row }">
            <TableDodCell :value="row.hitsDod" />
          </template>
        </el-table-column>
        <el-table-column prop="hitRate" label="命中率" min-width="90">
          <template slot-scope="{ row }"><span class="rd-num">{{ row.hitRate }}%</span></template>
        </el-table-column>
        </el-table>
      </div>
      <div class="table-card__pagination">
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :current-page.sync="page"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRows.length"
          @size-change="page = 1"
        />
      </div>
    </section>
  </div>
</template>

<script>
import FunnelChart from '../../components/FunnelChart.vue'
import TrendChart from '../../components/TrendChart.vue'
import HelpIcon from '../../components/HelpIcon.vue'
import TableDodCell from '../../components/TableDodCell.vue'
import { exportOfflineHtml } from '../../utils/exportOfflineHtml'
import iconTrendUp from '../../assets/icons/trend-up.svg'
import iconTrendDown from '../../assets/icons/trend-down.svg'
import {
  SCENE_OPTIONS,
  defaultFilters,
  KPI_SUMMARY,
  TREND_POINTS,
  TABLE_ROWS_DAILY,
  TABLE_ROWS_WEEKLY,
  formatNumber,
  formatCockpitCompare,
  filterSummaryText,
  mockQueryResult,
} from '../../mock/dashboardData'

export default {
  name: 'RiskDashboard',
  components: { FunnelChart, TrendChart, HelpIcon, TableDodCell },
  data() {
    return {
      iconTrendUp,
      iconTrendDown,
      filters: defaultFilters(),
      appliedFilters: defaultFilters(),
      queryFields: [
        {
          key: 'riskScene',
          label: '风险场景',
          type: 'select',
          options: SCENE_OPTIONS,
        },
        { key: 'strategyName', label: '策略名称', type: 'input', placeholder: '请输入' },
        { key: 'strategyCode', label: '策略编码', type: 'input', placeholder: '请输入' },
        { key: 'version', label: '版本号', type: 'input', placeholder: '请输入' },
        { key: 'dateRange', label: '日期范围', type: 'daterange' },
      ],
      kpi: { ...KPI_SUMMARY },
      trendPoints: TREND_POINTS.slice(),
      granularity: 'day',
      page: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      allDaily: TABLE_ROWS_DAILY.slice(),
      allWeekly: TABLE_ROWS_WEEKLY.slice(),
    }
  },
  computed: {
    kpiCards() {
      return [
        {
          key: 'calls',
          label: '调用量',
          value: formatNumber(this.kpi.calls),
          unit: '',
          badge: '准实时',
          pending: false,
          tip: '策略被调用的总次数（准实时统计）',
          subLabel: '',
          subValue: '',
        },
        {
          key: 'hits',
          label: '命中量',
          value: formatNumber(this.kpi.hits),
          unit: '',
          badge: '准实时',
          pending: false,
          tip: '策略命中次数',
          mom: formatCockpitCompare(this.kpi.hitsDod),
          subLabel: '命中率',
          subValue: `${this.kpi.hitRate}%`,
        },
        {
          key: 'accuracy',
          label: '准确量',
          value: '-',
          unit: '',
          badge: '待上线',
          pending: true,
          tip: '准确量能力待上线',
          subLabel: '准确率',
          subValue: `${this.kpi.accuracyRate}%`,
        },
        {
          key: 'handle',
          label: '处置量',
          value: '-',
          unit: '',
          badge: '待上线',
          pending: true,
          tip: '处置量能力待上线',
          subLabel: '处置率',
          subValue: '-',
        },
        {
          key: 'penalty',
          label: '落罚量',
          value: '-',
          unit: '',
          badge: '待上线',
          pending: true,
          tip: '落罚量能力待上线',
          subLabel: '落罚率',
          subValue: '-',
        },
      ]
    },
    sourceRows() {
      return this.granularity === 'day' ? this.allDaily : this.allWeekly
    },
    filteredRows() {
      let rows = this.getFilteredRows(this.granularity)
      if (this.sortProp && this.sortOrder) {
        const prop = this.sortProp
        const dir = this.sortOrder === 'ascending' ? 1 : -1
        rows = rows.slice().sort((a, b) => {
          if (a[prop] === b[prop]) return 0
          return a[prop] > b[prop] ? dir : -dir
        })
      }
      return rows
    },
    pagedRows() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
  },
  methods: {
    formatNumber,
    getFilteredRows(granularity) {
      const f = this.appliedFilters
      const source = granularity === 'day' ? this.allDaily : this.allWeekly
      return source.filter((r) => {
        if (f.riskScene && f.riskScene !== '全部' && r.scene !== f.riskScene) return false
        if (f.strategyName && !String(r.name).includes(f.strategyName)) return false
        if (f.strategyCode && !String(r.code).includes(f.strategyCode)) return false
        if (f.version && !String(r.version).includes(f.version)) return false
        if (f.dateRange && f.dateRange.length === 2 && granularity === 'day') {
          if (r.date < f.dateRange[0] || r.date > f.dateRange[1]) return false
        }
        return true
      })
    },
    onQuery() {
      this.appliedFilters = {
        ...this.filters,
        dateRange: (this.filters.dateRange || []).slice(),
      }
      this.page = 1
      const result = mockQueryResult(this.appliedFilters)
      this.kpi = result.kpi
      this.trendPoints = result.trendPoints
      this.$message.success('查询完成')
    },
    onReset() {
      this.filters = defaultFilters()
      this.appliedFilters = defaultFilters()
      const result = mockQueryResult(this.appliedFilters)
      this.kpi = result.kpi
      this.trendPoints = result.trendPoints
      this.page = 1
      this.sortProp = ''
      this.sortOrder = ''
      this.$message.success('已重置')
    },
    onDownload() {
      exportOfflineHtml({
        filtersSummary: filterSummaryText(this.appliedFilters),
        kpi: this.kpi,
        trendPoints: this.trendPoints,
        tableRowsDaily: this.getFilteredRows('day'),
        tableRowsWeekly: this.getFilteredRows('week'),
        granularity: this.granularity,
        sortProp: this.sortProp,
        sortOrder: this.sortOrder,
        downloadedAt: new Date(),
      })
      this.$message.success('离线看板已开始下载')
    },
    onGranularityChange() {
      this.page = 1
    },
    onSortChange({ prop, order }) {
      this.sortProp = order ? prop : ''
      this.sortOrder = order || ''
    },
  },
}
</script>
