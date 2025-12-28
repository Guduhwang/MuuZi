<template>
  <div class="dialog-header-wrap" :class="size">
    <div class="dialog-header-close-wrap">
      <IMdiWindowClose @click="handleClose" />
    </div>
    <div class="dialog-header__title">{{ title }}</div>
  </div>
</template>

<script lang="ts" setup>
import './css/dialogHeader.scss';

defineOptions({
  name: 'DialogHeader',
});

withDefaults(
  defineProps<{
    title: string;
    size?: 'default' | 'small';
  }>(),
  {
    size: 'default',
  },
);
const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>
