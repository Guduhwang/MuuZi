<template>
  <div v-if="errorMsg" class="chatWorkflowErrorMsg-wrap">
    {{ errorMsg }}
  </div>
</template>

<script setup lang="ts">
import './css/chatWorkflowErrorMsg.scss';
//TODO 这个错误样式要改成discord的
withDefaults(
  defineProps<{
    errorMsg?: string;
  }>(),
  {
    errorMsg: '',
  },
);
</script>
