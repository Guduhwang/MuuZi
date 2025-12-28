<template>
  <div class="goods-view-wrap">
    <el-image v-if="!isVideo" :src="props.listSrc" alt="" class="head-cnt-right-img" />
    <video width="auto" height="100%" controls autoplay v-else :src="props.listSrc" alt="" class="head-cnt-right-img" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './css/goodsView.scss';
defineOptions({
  name: 'GoodsView',
});
const props = defineProps<{
  listSrc: string;
}>();
// 通过listSrc判断是图片还是视频
const isVideo = computed(() => {
  if (!props.listSrc) return false;
  return (
    props.listSrc.endsWith('.mp4') ||
    props.listSrc.endsWith('.mov') ||
    props.listSrc.endsWith('.avi') ||
    props.listSrc.endsWith('.flv') ||
    props.listSrc.endsWith('.wmv') ||
    props.listSrc.endsWith('.mkv')
  );
});
</script>
