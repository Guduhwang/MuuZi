<template>
  <div class="goodsCarousel-wrap">
    <div
      :class="['goodsCarousel-item', { active: activeIndex === index }]"
      v-for="(item, index) in props.list"
      :key="item"
      @click="handleClick(item, index)"
    >
      <div v-if="isVideo(item)" class="play-icon">
        <el-icon><CaretRight /></el-icon>
      </div>
      <video v-if="isVideo(item)" width="auto" height="100%" :src="item" alt="" class="goodsCarousel-item-img" />
      <el-image v-else :src="item" alt="" fit="cover" class="goodsCarousel-item-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './css/goodsCarousel.scss';

defineOptions({
  name: 'GoodsCarousel',
});

const props = defineProps<{
  list: string[];
  activeIndex: number;
}>();
// 通过listSrc判断是图片还是视频
const isVideo = computed(() => {
  return (src: string) => {
    if (!src) return false;
    return (
      src.endsWith('.mp4') ||
      src.endsWith('.mov') ||
      src.endsWith('.avi') ||
      src.endsWith('.flv') ||
      src.endsWith('.wmv') ||
      src.endsWith('.mkv')
    );
  };
});
const emit = defineEmits<{
  (e: 'click', item: string): void;
  (e: 'update:activeIndex', index: number): void;
}>();

function handleClick(item: string, index: number) {
  emit('click', item);
  emit('update:activeIndex', index);
}
</script>
