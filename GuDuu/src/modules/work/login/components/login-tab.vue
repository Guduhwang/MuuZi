<template>
  <div class="login-tab">
    <div
      class="login-tab-item"
      v-for="item in tabList"
      :key="item.value"
      :class="{ active: props.activeTab === item.value }"
      @click="handleTabChange(item.value)"
    >
      <div v-if="props.activeTab === item.value" class="active-line"></div>
      {{ item.label }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  tabList: {
    label: string;
    value: string;
  }[];
  activeTab: string;
}>();
const emit = defineEmits(['update:activeTab', 'change']);

const handleTabChange = (value: string) => {
  emit('update:activeTab', value);
  emit('change', value);
};
</script>
<style lang="scss" scoped>
.login-tab {
  display: flex;
  gap: 30px;
}
.login-tab-item {
  cursor: pointer;
  height: 40px;
  height: 32px;
  line-height: 32px;
  font-size: 16px;
  color: #999;
  position: relative;
  z-index: 1;
  .active-line {
    z-index: -1;
    position: absolute;
    left: -10px;
    top: 0px;
    width: 80px;
    height: 20px;
    opacity: 0.5;
    background: var(--color-theme);
  }
  &.active {
    color: #262626;
    font-weight: 600;
    font-size: 24px;
  }
}
</style>
