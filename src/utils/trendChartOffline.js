/** 趋势图离线 HTML（结构与 TrendChart.vue 一致） */
import { formatNumber } from '../mock/dashboardData'
import { CHART_FONT_NUMBER } from './chartSvgFont'
import {
  TREND_LAYOUT,
  buildTrendGrids,
  mapTrendPoints,
  smoothPath,
} from './chartMath'

const LEGEND = [
  { key: 'calls', label: '调用量', color: '#3C6EF0' },
  { key: 'hits', label: '命中量', color: '#3AD3D9' },
  { key: 'hitRate', label: '命中率', color: '#FFD83D' },
  { key: 'acc', label: '准确率', color: '#BABEC7', muted: true },
  { key: 'handle', label: '处置率', color: '#BABEC7', muted: true },
  { key: 'penalty', label: '落罚率', color: '#BABEC7', muted: true },
]

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function renderTrendChartSection(points) {
  const layout = TREND_LAYOUT
  const plotted = mapTrendPoints(points, layout)
  const grids = buildTrendGrids(layout)
  const { PLOT_X2 } = { PLOT_X2: layout.W - layout.SIDE_INSET }

  const gridHtml = grids.map(
    (g) => `
      <line x1="${layout.AXIS_X}" y1="${g.y}" x2="${PLOT_X2}" y2="${g.y}" stroke="#EAEAEA" stroke-width="1" stroke-dasharray="4 4"></line>
      <text x="${layout.AXIS_X - 8}" y="${g.y + 4}" text-anchor="end" fill="#BABEC7" font-size="14" font-family="${CHART_FONT_NUMBER}">${g.left}</text>
      <text x="${PLOT_X2 + 8}" y="${g.y + 4}" text-anchor="start" fill="#BABEC7" font-size="14" font-family="${CHART_FONT_NUMBER}">${g.right}</text>`,
  ).join('')

  const xLabels = plotted.map(
    (p) => `<text x="${p.x}" y="${layout.X_LABEL_Y}" text-anchor="middle" fill="#868D9F" font-size="14" font-weight="400" font-family="${CHART_FONT_NUMBER}">${esc(p.time)}</text>`,
  ).join('')

  const callPath = smoothPath(plotted, 'x', 'callY')
  const hitPath = smoothPath(plotted, 'x', 'hitY')
  const ratePath = smoothPath(plotted, 'x', 'rateY')

  const legendHtml = LEGEND.map(
    (item) => `<span><i class="lg-dot" style="background:${item.color}"></i><em${item.muted ? ' class="is-muted"' : ''}>${item.label}</em></span>`,
  ).join('')

  const svgHtml = `
    <svg id="snapTrendSvg" viewBox="0 0 ${layout.W} ${layout.H}" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" style="cursor:crosshair">
      <line x1="${layout.AXIS_X}" y1="${layout.TOP}" x2="${layout.AXIS_X}" y2="${layout.BOT}" stroke="#EAEAEA" stroke-width="1"></line>
      <line x1="${layout.AXIS_X}" y1="${layout.BOT}" x2="${PLOT_X2}" y2="${layout.BOT}" stroke="#EAEAEA" stroke-width="1"></line>
      <line id="snapCross" y1="${layout.TOP}" y2="${layout.BOT}" stroke="#3C6EF0" stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.35" style="display:none"></line>
      ${gridHtml}
      ${xLabels}
      <path d="${callPath}" fill="none" stroke="#3C6EF0" stroke-width="2"></path>
      <path d="${hitPath}" fill="none" stroke="#3AD3D9" stroke-width="2"></path>
      <path d="${ratePath}" fill="none" stroke="#FFD83D" stroke-width="2"></path>
      <circle id="snapDotCall" r="4" fill="#FFFFFF" stroke="#3C6EF0" stroke-width="2" style="display:none"></circle>
      <circle id="snapDotHit" r="4" fill="#FFFFFF" stroke="#3AD3D9" stroke-width="2" style="display:none"></circle>
      <circle id="snapDotRate" r="4" fill="#FFFFFF" stroke="#FFD83D" stroke-width="2" style="display:none"></circle>
    </svg>`

  const script = `
(function(){
  var PTS=${JSON.stringify(plotted)};
  var L=${JSON.stringify({ TOP: layout.TOP, W: layout.W })};
  var svg=document.getElementById('snapTrendSvg');
  if(!svg||!PTS.length)return;
  var cross=document.getElementById('snapCross');
  var dCall=document.getElementById('snapDotCall');
  var dHit=document.getElementById('snapDotHit');
  var dRate=document.getElementById('snapDotRate');
  var tip=document.getElementById('snapTip');
  var wrap=document.getElementById('snapTrendWrap');
  function nf(n){return Number(n).toLocaleString('en-US');}
  function row(c,l,v){
    return '<div class="tip-row"><span><i style="background:'+c+'"></i>'+l+'</span><b>'+v+'</b></div>';
  }
  function positionTip(clientY){
    if(!wrap||!tip)return;
    var i=PTS.findIndex(function(p){return p.i===hover.i;});
    var p=PTS[i>=0?i:0];
    var pt=svg.createSVGPoint();
    pt.x=p.x; pt.y=L.TOP;
    var screen=pt.matrixTransform(svg.getScreenCTM());
    var wrapRect=wrap.getBoundingClientRect();
    var tipWidth=tip.offsetWidth||168;
    var tipHeight=tip.offsetHeight||108;
    var anchorX=screen.x-wrapRect.left;
    var mouseY=clientY-wrapRect.top;
    var rightLeft=anchorX+6+6;
    var leftLeft=anchorX-6-6-tipWidth;
    var flip=rightLeft+tipWidth>wrapRect.width&&leftLeft>=0;
    tip.classList.toggle('trend-chart__tip--flip',flip);
    tip.style.left=(flip?leftLeft:rightLeft)+'px';
    tip.style.top=Math.min(Math.max(mouseY-tipHeight/2,0),Math.max(wrapRect.height-tipHeight,0))+'px';
    tip.style.setProperty('--tip-arrow-top',Math.min(Math.max(mouseY-parseFloat(tip.style.top||0),16),tipHeight-16)+'px');
  }
  var hover=null;
  svg.addEventListener('mousemove',function(e){
    var pt=svg.createSVGPoint();
    pt.x=e.clientX; pt.y=e.clientY;
    var svgPt=pt.matrixTransform(svg.getScreenCTM().inverse());
    var best=0,bestDist=Infinity;
    PTS.forEach(function(p,i){
      var d=Math.abs(p.x-svgPt.x);
      if(d<bestDist){bestDist=d;best=i;}
    });
    hover=PTS[best];
    cross.setAttribute('x1',hover.x);cross.setAttribute('x2',hover.x);cross.style.display='';
    dCall.setAttribute('cx',hover.x);dCall.setAttribute('cy',hover.callY);dCall.style.display='';
    dHit.setAttribute('cx',hover.x);dHit.setAttribute('cy',hover.hitY);dHit.style.display='';
    dRate.setAttribute('cx',hover.x);dRate.setAttribute('cy',hover.rateY);dRate.style.display='';
    tip.style.display='block';
    tip.innerHTML='<div class="tip-title">'+hover.time+'</div>'
      +row('#3C6EF0','调用量',nf(hover.calls))
      +row('#3AD3D9','命中量',nf(hover.hits))
      +row('#FFD83D','命中率',hover.hitRate+'%');
    positionTip(e.clientY);
  });
  svg.addEventListener('mouseleave',function(){
    cross.style.display='none';dCall.style.display='none';dHit.style.display='none';dRate.style.display='none';tip.style.display='none';
  });
})();`

  return `
    <div class="trend-chart">
      <div id="snapTrendWrap" class="trend-chart__svg-wrap">
        ${svgHtml}
        <div id="snapTip" class="trend-chart__tip trend-chart__tip--dark" style="display:none"></div>
      </div>
      <div class="trend-chart__legend">${legendHtml}</div>
    </div>
    <script>${script}<\/script>`
}
