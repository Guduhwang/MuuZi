<template>
  <div class="flex items-center justify-center w-full h-full">
    <div class="">
      <img src="/src/assets/no_data.svg" style="margin: 0 auto" alt="" />
      <div class="data-style">{{ props.tip }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    tip?: string;
  }>(),
  {
    tip: 'No data available',
  },
);
</script>
<style lang="scss" scoped>
.data-style {
  font-size: 12px;
  line-height: 20px;
  color: #999999;
}
</style>
