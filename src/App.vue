<template>
  <div id="risk-app" class="risk-page">
    <RiskDashboard />
  </div>
</template>

<script>
import RiskDashboard from './pages/RiskDashboard/RiskDashboard.vue'

export default {
  name: 'App',
  components: { RiskDashboard },
}
</script>
