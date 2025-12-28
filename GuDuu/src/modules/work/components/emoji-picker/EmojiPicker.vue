<template>
  <ElPopover trigger="click" placement="top" popper-class="emoji-picker-popover" ref="popoverRef">
    <template #reference>
      <slot name="button"></slot>
    </template>
    <Picker :data="emojiIndex" set="twitter" @select="showEmoji" v-if="emojiIndex" title="Emoji" />
  </ElPopover>
</template>

<script setup lang="ts">
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
import data from 'emoji-mart-vue-fast/data/all.json';
// Import default CSS
import 'emoji-mart-vue-fast/css/emoji-mart.css';
import { onMounted, ref } from 'vue';
import { ElPopover } from 'element-plus';

export interface IEmojiOutput {
  id: string;
  name: string;
  short_name: string;
  native: string;
  colons: string;
}

const emit = defineEmits<{
  select: [any];
}>();

let emojiIndex = null;
const popoverRef = ref<InstanceType<typeof ElPopover>>();

const showEmoji = (emoji) => {
  emit('select', emoji);
  popoverRef.value?.hide();
};

onMounted(() => {
  emojiIndex = new EmojiIndex(data);
});
</script>

<style lang="scss">
.emoji-picker-popover.el-popover {
  padding: 0;
}
</style>
