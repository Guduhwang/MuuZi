<template>
  <DialogWrap :show="show" @close="handleClosed">
    <el-link v-if="isShowUrl" class="chatVideo-link">{{ video?.content.path }}</el-link>
    <div class="chatVideo-player-container" :style="containerStyle">
      <div ref="playerContainer" class="plyr-container"></div>
    </div>
  </DialogWrap>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted, defineProps, defineEmits, nextTick } from 'vue';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './css/chatVideo.scss';
import DialogWrap from '../dialog-wrap/DialogWrap.vue';

defineOptions({
  name: 'ChatVideo',
});

interface VideoContent {
  path: string;
  type?: string;
  thumbnail?: string;
}

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isShowUrl: {
    type: Boolean,
    default: false,
  },
  video: {
    type: Object as () => Eps.BaseMessageEntity | null,
    default: null,
  },
  // 添加高度属性
  height: {
    type: [String, Number],
    default: '500px',
  },
  // 添加最大高度属性
  maxHeight: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:show']);

const playerContainer = ref<HTMLElement | null>(null);
let player: Plyr | null = null;

const videoSource = computed(() => {
  if (!props.video) return null;

  const videoContent = props.video.content as VideoContent;
  return {
    type: 'video',
    sources: [
      {
        src: videoContent.path,
        type: videoContent.type || 'video/mp4',
      },
    ],
  };
});

// 添加容器样式计算属性
const containerStyle = computed(() => {
  const style: Record<string, string> = {
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  };

  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
  }

  return style;
});

const plyrOptions = {
  controls: [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'settings',
    'pip',
    'airplay',
    'fullscreen',
  ],
  // 禁用自动调整尺寸
  autoplay: false,
  hideControls: false,
  // 设置固定比例而不是动态调整
  // ratio: '16:9', // 如果需要固定比例可以取消注释
};

function initPlayer() {
  if (playerContainer.value && videoSource.value) {
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    // videoElement.crossOrigin = 'anonymous';
    videoElement.src = videoSource.value.sources[0].src;

    // 强制设置视频元素的样式，防止自动调整大小
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.maxHeight = '100%';
    videoElement.style.objectFit = 'contain';

    playerContainer.value.innerHTML = '';
    playerContainer.value.appendChild(videoElement);

    // Create a new Plyr instance
    if (!player) {
      player = new Plyr(videoElement, plyrOptions);

      // 监听视频加载完成事件，确保尺寸不会改变
      player.on('loadedmetadata', () => {
        // 强制保持容器尺寸
        if (playerContainer.value) {
          const container = playerContainer.value.querySelector('.plyr') as HTMLElement;
          if (container) {
            container.style.height = '100%';
            container.style.maxHeight = '100%';
          }
        }
      });

      // 立即播放
      player.play();
    }
  }
}

function destroyPlayer() {
  if (player) {
    player.destroy();
    player = null;
  }
}

function handleClosed() {
  destroyPlayer();
  emit('update:show', false);
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      nextTick(() => {
        initPlayer();
      });
    } else {
      // Destroy player when dialog closes
      destroyPlayer();
    }
  },
);

onMounted(() => {
  if (props.show) {
    nextTick(() => {
      initPlayer();
    });
  }
});

onUnmounted(() => {
  destroyPlayer();
});
</script>
