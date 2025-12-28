<template>
  <div class="wrap groundGlass">
    <div class="head">{{ title }}</div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style lang="scss" scoped>
.wrap {
  // background: var(--theme-bg-0-color);
  // background: #fff;
  // border: 1px solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  padding: 8px;
  margin-bottom: 10px;
}

.head {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 600;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
