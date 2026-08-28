import Vue from 'vue'
import Lui from '@lui/lui-ui'
import '@lui/lui-ui/lib/theme-chalk/index.css'
import '@lui/lui-ui/lib/theme-chalk/display.css'
import App from './App.vue'
import QueryForm from './components/QueryForm.vue'
import './styles/preview.scss'
import './styles/risk-dashboard.scss'

Vue.config.productionTip = false
Vue.component('QueryForm', QueryForm)
/* 与 8765 异常中心一致：LUI PC3.0 small = 控件高 32 */
Vue.use(Lui, { size: 'small', zIndex: 3000 })

new Vue({
  el: '#app',
  render: (h) => h(App),
})
