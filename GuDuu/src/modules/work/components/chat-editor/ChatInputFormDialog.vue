<template>
  <div class="chatInputForm-wrap">
    <DialogHeader @close="handleClosed" title="Add" size="small" />
    <div class="chatInputForm-content">
      <slot></slot>
    </div>
    <div class="chatInputForm-footer">
      <el-button type="primary" @click="submit" class="w-full" color="#0c0c0e" size="small">Save</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DialogHeader from '../dialog-header/DialogHeader.vue';
defineOptions({
  name: 'ChatInputFormDialog',
});

const emit = defineEmits(['update:show', 'confirm', 'close']);

function handleClosed() {
  emit('update:show', false);
  emit('close');
}

function submit() {
  emit('confirm');
}

defineExpose({});
</script>

<style lang="scss">
.chatInputForm-wrap {
  max-height: 358px;
  background-color: rgb(255, 255, 255);
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 1px 4px,
    rgba(0, 0, 0, 0.08) 0px 6px 10px 4px;
  border: 0.03125rem solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: rgb(26, 26, 26);
  display: flex;
  flex-direction: column;
  z-index: 1;
  width: 320px;
  overflow-y: auto;
}
.chatInputForm-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.chatInputForm-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.chatInputForm-footer {
  padding: 10px;
}

.chatInputForm-datePicker {
  // tippy.js 的 z-index 是 9999，所以这里需要设置一个更大的值
  // 以后计划替换tippy.js
  z-index: 11000 !important;
}
</style>
