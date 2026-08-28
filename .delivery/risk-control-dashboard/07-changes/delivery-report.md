# 交付报告 · 风控看板

## 摘要

- **模式**：P2C greenfield（Vue2 + LUI PC3.0）
- **feature_id**：`risk-control-dashboard`
- **预览**：`http://localhost:5175/`
- **目标仓**：未定（确认后迁入）

## 已交付能力

1. 筛选区（风险场景 / 策略名称 / 策略编码 / 当前状态 / 版本号 / 日期范围）+ 查询 / 重置
2. **下载离线看板**：生成独立静态 HTML（对齐样例结构：KPI + 漏斗 + 趋势）
3. KPI 五卡（调用量/命中量准实时；准确/处置/落罚待上线）
4. 风险全链路转化漏斗 + 核心指标趋势
5. 每日策略指标表（按日/按周、排序、分页、环比涨跌色）

## 技术

- `@lui/lui-ui`：`el-form` / `el-select` / `el-input` / `el-date-picker` / `el-button` / `el-tag` / `el-tooltip` / `el-radio-button` / `el-table` / `el-pagination`
- 图表：SVG 组件（便于离线 HTML 同源序列化）
- 样式密度：参照财务计费管理工作台筛选卡/表格白底卡

## 验证

- Gate A / B：通过
- `npm run build`：通过
- 功能报告 / 视觉一致性：见 `06-verification/`

## 待确认（Open Questions）

- OQ-001 目标仓库与分支
- OQ-002 待上线指标接口口径

## 证据目录

`.delivery/risk-control-dashboard/`
