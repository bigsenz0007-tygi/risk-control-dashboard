/**
 * 离线静态 HTML 导出：结构与 RiskDashboard.vue 一致，样式复用 offline-export.scss。
 */
import offlineCss from '../styles/offline-export.scss?inline'
import { formatNumber, formatCockpitCompare } from '../mock/dashboardData'
import { renderFunnelSvg } from './funnelChartSvg'
import { renderTrendChartSection } from './trendChartOffline'

const TREND_ARROW_PATH = 'M1.50252 7.79584C0.304479 7.79584 -0.410108 6.46062 0.254447 5.46379L3.45167 0.66795C4.0454 -0.22265 5.35409 -0.22265 5.94782 0.667949L9.14505 5.46379C9.8096 6.46062 9.09501 7.79584 7.89697 7.79584H1.50252Z'
const TREND_UP_FILL = '#4BCE86'
const TREND_DOWN_FILL = '#FC3737'

function buildTrendArrow(className, fill) {
  return `<svg class="${className}" width="12" height="9" viewBox="0 0 9.39949 7.79584" aria-hidden="true"><path fill="${fill}" fill-rule="evenodd" clip-rule="evenodd" d="${TREND_ARROW_PATH}"/></svg>`
}

const KPI_ARROW_UP = buildTrendArrow('kpi-card__arrow', TREND_UP_FILL)
const KPI_ARROW_DOWN = buildTrendArrow('kpi-card__arrow is-down', TREND_DOWN_FILL)
const DOD_ARROW_UP = buildTrendArrow('rd-dod__arrow', TREND_UP_FILL)
const DOD_ARROW_DOWN = buildTrendArrow('rd-dod__arrow', TREND_DOWN_FILL)

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateTime(d) {
  const x = d instanceof Date ? d : new Date(d)
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())} ${pad2(x.getHours())}:${pad2(x.getMinutes())}:${pad2(x.getSeconds())}`
}

function buildFilename(d) {
  const x = d instanceof Date ? d : new Date()
  const stamp = `${x.getFullYear()}${pad2(x.getMonth() + 1)}${pad2(x.getDate())}_${pad2(x.getHours())}${pad2(x.getMinutes())}`
  return `静态风险监控看板_${stamp}.html`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderMom(mom) {
  if (!mom) return ''
  const arrow = mom.tone === 'up'
    ? KPI_ARROW_UP
    : mom.tone === 'down'
      ? KPI_ARROW_DOWN
      : ''
  return `<span class="kpi-card__mom is-${mom.tone}">
    <span class="kpi-card__sub-label">环比</span>
    <b class="kpi-card__mom-value">${escapeHtml(mom.text)}</b>${arrow}
  </span>`
}

function buildKpiCards(kpi) {
  const hitsMom = formatCockpitCompare(kpi.hitsDod)
  return `
    <div class="kpi-card">
      <div class="kpi-card__head">
        <div class="kpi-card__title-row">
          <span class="kpi-card__title">调用量</span>
        </div>
        <span class="offline-tag">准实时</span>
      </div>
      <div class="kpi-card__value"><span class="kpi-card__num">${formatNumber(kpi.calls)}</span></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card__head">
        <div class="kpi-card__title-row">
          <span class="kpi-card__title">命中量</span>
        </div>
        <span class="offline-tag">准实时</span>
      </div>
      <div class="kpi-card__value"><span class="kpi-card__num">${formatNumber(kpi.hits)}</span></div>
      <div class="kpi-card__sub">
        ${renderMom(hitsMom)}
        <span class="kpi-card__stat">
          <span class="kpi-card__sub-label">命中率</span>
          <b class="kpi-card__sub-value">${kpi.hitRate}%</b>
        </span>
      </div>
    </div>
    <div class="kpi-card is-pending">
      <div class="kpi-card__head">
        <div class="kpi-card__title-row">
          <span class="kpi-card__title">准确量</span>
        </div>
        <span class="offline-tag is-pending">待上线</span>
      </div>
      <div class="kpi-card__value"><span class="kpi-card__num">-</span></div>
      <div class="kpi-card__sub">
        <span class="kpi-card__stat">
          <span class="kpi-card__sub-label">准确率</span>
          <b class="kpi-card__sub-value">${kpi.accuracyRate}%</b>
        </span>
      </div>
    </div>
    <div class="kpi-card is-pending">
      <div class="kpi-card__head">
        <div class="kpi-card__title-row">
          <span class="kpi-card__title">处置量</span>
        </div>
        <span class="offline-tag is-pending">待上线</span>
      </div>
      <div class="kpi-card__value"><span class="kpi-card__num">-</span></div>
      <div class="kpi-card__sub">
        <span class="kpi-card__stat">
          <span class="kpi-card__sub-label">处置率</span>
          <b class="kpi-card__sub-value">-</b>
        </span>
      </div>
    </div>
    <div class="kpi-card is-pending">
      <div class="kpi-card__head">
        <div class="kpi-card__title-row">
          <span class="kpi-card__title">落罚量</span>
        </div>
        <span class="offline-tag is-pending">待上线</span>
      </div>
      <div class="kpi-card__value"><span class="kpi-card__num">-</span></div>
      <div class="kpi-card__sub">
        <span class="kpi-card__stat">
          <span class="kpi-card__sub-label">落罚率</span>
          <b class="kpi-card__sub-value">-</b>
        </span>
      </div>
    </div>
  `
}

function buildTableSectionShell() {
  return `
  <section class="table-card" id="snapTableCard">
    <div class="table-card__toolbar">
      <h3 class="table-card__title">每日策略指标</h3>
      <div class="biz-tabs biz-tabs--interactive" id="snapGranTabs" role="group" aria-label="按日按周">
        <span class="biz-tabs__item" data-gran="day" role="button" tabindex="0">按日</span>
        <span class="biz-tabs__item" data-gran="week" role="button" tabindex="0">按周</span>
      </div>
    </div>
    <div class="table-card__body table-wrap">
      <table class="data-table">
        <colgroup>
          <col style="width:120px" />
          <col style="width:110px" />
          <col style="width:140px" />
          <col style="width:90px" />
          <col style="width:110px" />
          <col style="width:90px" />
          <col style="width:110px" />
          <col style="width:140px" />
          <col style="width:100px" />
          <col style="width:140px" />
          <col style="width:90px" />
        </colgroup>
        <thead id="snapTableHead"></thead>
        <tbody id="snapTableBody"></tbody>
      </table>
    </div>
    <div class="table-card__foot" id="snapTableFoot"></div>
  </section>`
}

function buildTableInteractScript({
  tableRowsDaily,
  tableRowsWeekly,
  granularity,
  sortProp,
  sortOrder,
}) {
  const dodArrowUp = DOD_ARROW_UP.replace(/"/g, '\\"')
  const dodArrowDown = DOD_ARROW_DOWN.replace(/"/g, '\\"')
  return `
(function(){
  var TABLE_DATA={day:${JSON.stringify(tableRowsDaily)},week:${JSON.stringify(tableRowsWeekly)}};
  var state={granularity:${JSON.stringify(granularity)},sortProp:${JSON.stringify(sortProp)},sortOrder:${JSON.stringify(sortOrder)}};
  var DOD_ARROW_UP="${dodArrowUp}";
  var DOD_ARROW_DOWN="${dodArrowDown}";
  var headEl=document.getElementById('snapTableHead');
  var bodyEl=document.getElementById('snapTableBody');
  var footEl=document.getElementById('snapTableFoot');
  var tabsEl=document.getElementById('snapGranTabs');
  if(!headEl||!bodyEl||!footEl||!tabsEl)return;

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function nf(n){
    if(n==null||n==='')return '待上线';
    return Number(n).toLocaleString('en-US');
  }
  function formatDod(v){
    if(v==null)return{text:'-',tone:'flat'};
    var abs=Math.abs(v).toFixed(1);
    if(v>0)return{text:abs+'%',tone:'up'};
    if(v<0)return{text:abs+'%',tone:'down'};
    return{text:abs+'%',tone:'flat'};
  }
  function renderDodCell(value){
    var d=formatDod(value);
    if(d.tone==='flat')return '<span class="rd-dod is-flat">'+esc(d.text)+'</span>';
    var arrow=d.tone==='down'?DOD_ARROW_DOWN:DOD_ARROW_UP;
    return '<span class="rd-dod is-'+d.tone+'"><span class="rd-dod__value">'+esc(d.text)+'</span>'+arrow+'</span>';
  }
  function labelWrap(dayText,weekText){
    return '<span class="th-label-wrap"><span class="th-label th-label--day">'+esc(dayText)+'</span><span class="th-label th-label--week">'+esc(weekText)+'</span></span>';
  }
  function sortTh(dayText,weekText,prop){
    return '<th class="is-sortable" data-sort="'+prop+'">'+labelWrap(dayText,weekText)
      +'<span class="th-sort" aria-hidden="true"><i class="th-sort__up"></i><i class="th-sort__down"></i></span></th>';
  }
  function getRows(){
    var rows=(TABLE_DATA[state.granularity]||[]).slice();
    if(state.sortProp&&state.sortOrder){
      var prop=state.sortProp;
      var dir=state.sortOrder==='ascending'?1:-1;
      rows.sort(function(a,b){
        if(a[prop]===b[prop])return 0;
        return a[prop]>b[prop]?dir:-dir;
      });
    }
    return rows;
  }
  function renderTabs(){
    tabsEl.querySelectorAll('.biz-tabs__item').forEach(function(el){
      el.classList.toggle('is-active',el.getAttribute('data-gran')===state.granularity);
    });
  }
  function buildHeadOnce(){
    headEl.innerHTML='<tr>'
      +sortTh('日期','周次','date')
      +'<th>策略编码</th><th>策略名称</th><th>版本号</th><th>风险场景</th><th>策略类型</th>'
      +sortTh('调用量','调用量','calls')
      +'<th>'+labelWrap('调用量环比昨日','调用量环比上周')+'</th>'
      +sortTh('命中量','命中量','hits')
      +'<th>'+labelWrap('命中量环比昨日','命中量环比上周')+'</th>'
      +'<th>命中率</th></tr>';
  }
  function updateGranularityLabels(){
    var isDay=state.granularity==='day';
    headEl.querySelectorAll('.th-label--day').forEach(function(el){ el.hidden=!isDay; });
    headEl.querySelectorAll('.th-label--week').forEach(function(el){ el.hidden=isDay; });
  }
  function updateSortIndicators(){
    headEl.querySelectorAll('th.is-sortable').forEach(function(th){
      var prop=th.getAttribute('data-sort');
      var active=state.sortProp===prop;
      var up=th.querySelector('.th-sort__up');
      var down=th.querySelector('.th-sort__down');
      if(up)up.classList.toggle('is-active',active&&state.sortOrder==='ascending');
      if(down)down.classList.toggle('is-active',active&&state.sortOrder==='descending');
    });
  }
  function renderBody(rows){
    if(!rows.length){
      bodyEl.innerHTML='<tr><td colspan="11" style="text-align:center;color:#868D9F;">暂无数据</td></tr>';
      return;
    }
    bodyEl.innerHTML=rows.map(function(row){
      return '<tr>'
        +'<td>'+esc(row.date)+'</td>'
        +'<td>'+esc(row.code)+'</td>'
        +'<td>'+esc(row.name)+'</td>'
        +'<td>'+esc(row.version)+'</td>'
        +'<td>'+esc(row.scene)+'</td>'
        +'<td>'+esc(row.type)+'</td>'
        +'<td class="num rd-num">'+nf(row.calls)+'</td>'
        +'<td>'+renderDodCell(row.callsDod)+'</td>'
        +'<td class="num rd-num">'+nf(row.hits)+'</td>'
        +'<td>'+renderDodCell(row.hitsDod)+'</td>'
        +'<td class="num rd-num">'+row.hitRate+'%</td>'
        +'</tr>';
    }).join('');
  }
  function renderTable(){
    renderTabs();
    updateGranularityLabels();
    updateSortIndicators();
    var rows=getRows();
    renderBody(rows);
    footEl.textContent='共 '+rows.length+' 条';
  }
  function onSortClick(prop){
    if(state.sortProp!==prop){
      state.sortProp=prop;
      state.sortOrder='ascending';
    }else if(state.sortOrder==='ascending'){
      state.sortOrder='descending';
    }else{
      state.sortProp='';
      state.sortOrder='';
    }
    updateSortIndicators();
    renderBody(getRows());
  }
  tabsEl.addEventListener('click',function(e){
    var item=e.target.closest('.biz-tabs__item');
    if(!item)return;
    var g=item.getAttribute('data-gran');
    if(!g||g===state.granularity)return;
    state.granularity=g;
    renderTabs();
    updateGranularityLabels();
    var rows=getRows();
    renderBody(rows);
    footEl.textContent='共 '+rows.length+' 条';
  });
  tabsEl.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    var item=e.target.closest('.biz-tabs__item');
    if(!item)return;
    e.preventDefault();
    item.click();
  });
  headEl.addEventListener('click',function(e){
    var th=e.target.closest('th.is-sortable');
    if(!th)return;
    onSortClick(th.getAttribute('data-sort'));
  });
  buildHeadOnce();
  renderTable();
})();`
}

export function exportOfflineHtml({
  filtersSummary,
  kpi,
  trendPoints,
  tableRowsDaily = [],
  tableRowsWeekly = [],
  granularity = 'day',
  sortProp = '',
  sortOrder = '',
  downloadedAt,
}) {
  const when = downloadedAt || new Date()
  const funnelSvg = renderFunnelSvg({
    calls: kpi.calls,
    hits: kpi.hits,
    hitRate: kpi.hitRate,
  })
  const trendSection = renderTrendChartSection(trendPoints)

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>静态风险监控看板</title>
<style>${offlineCss}</style>
</head>
<body class="risk-page">
<div class="risk-page__main offline-snap">
  <header class="snap-head">
    <h1>静态风险监控看板</h1>
    <div class="snap-head__row">
      <div class="range">数据范围：${escapeHtml(filtersSummary)}</div>
      <div class="meta">下载时间：${formatDateTime(when)}</div>
    </div>
  </header>

  <section class="cockpit-panel">
    <div class="cockpit-panel__head">
      <div class="cockpit-panel__title-wrap">
        <h3 class="cockpit-panel__title">核心指标驾驶舱</h3>
        <span class="cockpit-panel__hint">数据每10分钟刷新</span>
      </div>
    </div>
    <div class="kpi-row kpi-row--5">${buildKpiCards(kpi)}</div>
  </section>

  <section class="chart-grid">
    <div class="chart-card chart-card--funnel">
      <h3 class="chart-card__title">风险全链路转化视图</h3>
      <div class="chart-card__plot">
        <div class="funnel-chart">${funnelSvg}</div>
      </div>
    </div>
    <div class="chart-card chart-card--trend">
      <h3 class="chart-card__title">核心指标趋势</h3>
      ${trendSection}
    </div>
  </section>

  ${buildTableSectionShell()}
</div>
<script>
${buildTableInteractScript({ tableRowsDaily, tableRowsWeekly, granularity, sortProp, sortOrder })}
<\/script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildFilename(when)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
