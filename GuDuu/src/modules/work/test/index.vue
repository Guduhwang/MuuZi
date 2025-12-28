<template></template>

<script setup lang="ts">
import FlowChartDemo from '../components/FlowChartDemo.vue';
</script>

<style scoped>
.flow-chart-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>
