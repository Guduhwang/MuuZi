<template>
  <el-dialog
    :modelValue="show"
    class="dialogWrap-dialog"
    :show-close="false"
    @closed="handleClosed"
    :width="width"
    v-bind="$attrs"
    :append-to-body="true"
    :title="title"
  >
    <template #header="{ close }">
      <DialogHeader @close="close" :title="title" />
    </template>
    <div class="p-[16px] overflow-y-auto pt-0" v-if="$slots.default">
      <slot></slot>
    </div>
    <template #footer v-if="$slots.footer">
      <div class="p-[16px] pt-0">
        <slot name="footer"></slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { DialogProps } from 'element-plus';
import { defineProps, defineEmits } from 'vue';
import DialogHeader from '../dialog-header/DialogHeader.vue';
import './css/dialogWrap.scss';

defineOptions({
  name: 'DialogWrap',
  inheritAttrs: false,
});

withDefaults(
  defineProps<{
    title?: string;
    show: boolean;
    width?: DialogProps['width'];
  }>(),
  {
    show: false,
    title: '',
  },
);

const emit = defineEmits(['update:show', 'close']);

function handleClosed() {
  emit('update:show', false);
  emit('close');
}
</script>
