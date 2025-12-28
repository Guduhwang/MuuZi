<template>
  <div class="default-desktop">
    <div class="search-container">
      <el-input v-model="search" placeholder="Search" />
    </div>
    <!-- 右侧区域 -->
    <div ref="desktopRight" class="desktop-right">
      <div class="grid-container">
        <div v-for="video in videoItems" :key="video.id" class="video-item" @click="handleVideoClick(video)">
          <!-- 视频封面 -->
          <div class="video-cover">
            <img v-if="video.type == 0" :src="video.cover" />
            <img v-if="video.type == 1" :src="video.videoCover" />
            <div class="video-overlay">
              <!-- 播放按钮 -->
              <div v-if="video.type == 1" class="play-button">
                <IMdiPlay />
              </div>
              <!-- 视频时长 -->
              <!-- <div class="video-duration">{{ video.duration }}</div> -->
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="video-info">
            <div class="video-title">{{ video.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频/网页播放弹窗 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentVideo?.title"
      width="80%"
      :before-close="handleVideoDialogClose"
      class="video-dialog"
    >
      <div class="video-player-container">
        <!-- 普通视频播放器 -->
        <div v-if="currentVideo?.type === 1 && !isSupportedVideoPlatform(currentVideo.video)" class="video-player">
          <video
            ref="videoPlayer"
            :src="currentVideo.video"
            controls
            preload="metadata"
            class="video-element"
            @loadstart="onVideoLoadStart"
            @canplay="onVideoCanPlay"
            @ended="onVideoEnded"
            @error="onVideoError"
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- 支持的视频平台播放器 (YouTube, 哔哩哔哩等) -->
        <div v-if="currentVideo?.type === 1 && isSupportedVideoPlatform(currentVideo.video)" class="platform-player">
          <iframe
            ref="platformPlayer"
            :src="getVideoEmbedUrl(currentVideo.video)"
            class="platform-element"
            frameborder="0"
            allowfullscreen
            @load="onPlatformLoad"
            @error="onPlatformError"
          >
            您的浏览器不支持iframe
          </iframe>
        </div>

        <!-- 网页iframe -->
        <div v-if="currentVideo?.type === 0" class="web-player">
          <iframe
            ref="webPlayer"
            :src="currentVideo.url"
            class="web-element"
            frameborder="0"
            allowfullscreen
            @load="onWebLoad"
            @error="onWebError"
          >
            您的浏览器不支持iframe
          </iframe>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="videoDialogVisible = false">Close</el-button>
          <!-- <el-button
            v-if="currentVideo?.type === 1 && !isSupportedVideoPlatform(currentVideo.video)"
            type="primary"
            @click="toggleFullscreen"
          >
            {{ isFullscreen ? 'Exit Fullscreen' : 'Full Screen Playback' }}
          </el-button> -->
          <el-button v-if="currentVideo?.type === 0" type="primary" @click="refreshWeb">Refresh Page</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Bell, VideoPlay } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { useCool } from '/@/cool';

const { service } = useCool();

// 导入图片资源
import desktop1 from '../static/img/desktop1.png';
import desktop2 from '../static/img/desktop2.png';
import desktop3 from '../static/img/desktop3.png';
import desktop4 from '../static/img/desktop4.png';
import desktop5 from '../static/img/desktop5.png';
import desktop6 from '../static/img/desktop6.png';
import desktop7 from '../static/img/desktop7.png';
import desktop8 from '../static/img/desktop8.png';
import carousel_1 from '../static/img/carousel_1.png';
import carousel_2 from '../static/img/carousel_2.png';
import { useSiteStore } from '/@/store/site';
const siteStore = useSiteStore();

// 轮播图配置
const carouselConfig = reactive({
  arrow: 'hover' as const,
  indicatorPosition: 'outside' as const,
});

const carouselItems = ref([
  {
    id: 1,
    title: '欢迎使用工作台',
    description: '高效协作，提升工作效率',
    image: carousel_1,
  },
  {
    id: 2,
    title: '项目管理',
    description: '统一管理项目进度和任务',
    image: carousel_2,
  },
]);

type VideoItem = {
  id: number;
  title: string;
  cover: string;
  views: number;
  createTime: string;
  updateTime: string;
  url: string;
  type: number;
  sort: number;
  video: string;
  videoCover: string;
};

// 视频数据
const videoItems = ref<VideoItem[]>([]);

const messageTip = ref<{
  mySavedTime: number[];
  myUsersSavedTime: number[];
}>({
  mySavedTime: '',
  myUsersSavedTime: '',
});
// 获取消息提示
const getMessage = async () => {
  const res = await service.base.sys.user.savedTimeSummary();
  messageTip.value.mySavedTime = formatSeconds(res.mySavedTime);
  messageTip.value.myUsersSavedTime = formatSeconds(res.myUsersSavedTime);
};

const getVideoList = async () => {
  const res = await service.base.guide.all();
  videoItems.value = res;
  videoItems.value[1].video = 'https://www.youtube.com/watch?v=AbDw5nFeoCo&list=RDAbDw5nFeoCo&index=1';
};
const handleVideoClick = (video: VideoItem) => {
  currentVideo.value = video;
  videoDialogVisible.value = true;
};
// 视频/网页弹窗相关状态
const videoDialogVisible = ref(false);
const currentVideo = ref<(typeof videoItems.value)[0] | null>(null);
const videoPlayer = ref<HTMLVideoElement | null>(null);
const platformPlayer = ref<HTMLIFrameElement | null>(null);
const webPlayer = ref<HTMLIFrameElement | null>(null);
const isFullscreen = ref(false);

// 检查视频平台类型
const getVideoPlatform = (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('bilibili.com')) {
    return 'bilibili';
  }
  return 'other';
};

// 检查是否为支持的视频平台
const isSupportedVideoPlatform = (url: string) => {
  return getVideoPlatform(url) !== 'other';
};

// 将视频URL转换为嵌入URL
const getVideoEmbedUrl = (url: string) => {
  const platform = getVideoPlatform(url);

  switch (platform) {
    case 'youtube':
      return getYouTubeEmbedUrl(url);
    case 'bilibili':
      return getBilibiliEmbedUrl(url);
    default:
      return url;
  }
};

// 将 YouTube URL 转换为嵌入 URL
const getYouTubeEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch')) {
    const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtu.be/')) {
    const videoId = url.match(/youtu\.be\/([^?]+)/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  return url;
};

// 将哔哩哔哩 URL 转换为嵌入 URL
const getBilibiliEmbedUrl = (url: string) => {
  // 提取BV号或AV号
  let videoId = '';
  let idType = '';

  // 匹配BV号
  const bvMatch = url.match(/\/video\/(BV[a-zA-Z0-9]+)/);
  if (bvMatch) {
    videoId = bvMatch[1];
    idType = 'bvid';
  }

  // 匹配AV号
  const avMatch = url.match(/\/video\/av(\d+)/);
  if (avMatch) {
    videoId = avMatch[1];
    idType = 'aid';
  }

  // 匹配短链接中的BV号
  const shortMatch = url.match(/\/BV([a-zA-Z0-9]+)/);
  if (shortMatch) {
    videoId = `BV${shortMatch[1]}`;
    idType = 'bvid';
  }

  if (videoId && idType) {
    // 使用哔哩哔哩官方嵌入播放器
    const params = new URLSearchParams({
      [idType]: videoId,
      autoplay: '0',
      high_quality: '1',
      danmaku: '0', // 关闭弹幕
      page: '1',
    });

    return `https://player.bilibili.com/player.html?${params.toString()}`;
  }

  return url;
};

// 平台播放器事件处理
const onPlatformLoad = () => {
  console.log('平台视频加载完成');

  if (currentVideo.value) {
    const platform = getVideoPlatform(currentVideo.value.video);
  }
};

const onPlatformError = (event: Event) => {
  console.error('平台视频加载错误:', event);
};

// 视频事件处理
const onVideoLoadStart = () => {
  console.log('视频开始加载');
};

const onVideoCanPlay = () => {
  console.log('视频可以播放');
};

const onVideoEnded = () => {};

const onVideoError = (event: Event) => {
  console.error('视频播放错误:', event);
  //   ElMessage.error('视频加载失败，请检查网络连接');
};

// 网页事件处理
const onWebLoad = () => {
  console.log('网页加载完成');
};

const onWebError = (event: Event) => {
  console.error('网页加载错误:', event);
  //   ElMessage.error('网页加载失败，请检查网络连接');
};

// 刷新网页
const refreshWeb = () => {
  if (webPlayer.value && currentVideo.value) {
    webPlayer.value.src = currentVideo.value.url;
    ElMessage.success('refresh success');
  }
};

// 关闭视频/网页弹窗
const handleVideoDialogClose = (done: () => void) => {
  // 暂停视频播放
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }

  // 退出全屏
  if (isFullscreen.value) {
    exitFullscreen();
  }

  done();
};

// 全屏切换
const toggleFullscreen = () => {
  if (!videoPlayer.value) return;

  if (!isFullscreen.value) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
};

// 进入全屏
const enterFullscreen = () => {
  if (!videoPlayer.value) return;

  const element = videoPlayer.value;

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ('webkitRequestFullscreen' in element) {
    (element as any).webkitRequestFullscreen();
  } else if ('msRequestFullscreen' in element) {
    (element as any).msRequestFullscreen();
  }

  isFullscreen.value = true;
};

// 退出全屏
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ('webkitExitFullscreen' in document) {
    (document as any).webkitExitFullscreen();
  } else if ('msExitFullscreen' in document) {
    (document as any).msExitFullscreen();
  }

  isFullscreen.value = false;
};

const formatSeconds = (seconds) => {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

onMounted(() => {
  getMessage();
  getVideoList();
});

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement;
});
</script>

<style scoped lang="scss">
.default-desktop {
  aspect-ratio: 1080/1255;
  width: 100%;
  height: auto;
  padding: 20px 20px 78px;
  box-sizing: border-box;
}

.desktop-left {
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.desktop-message {
  height: 66%;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;

  // 隐藏滚动条但保持滚动功能
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none; /* Chrome/Safari/Opera */
  }

  .message-header {
    position: relative;
    z-index: 1;
    .active-line {
      z-index: -1;
      position: absolute;
      left: 0;
      top: 20px;
      width: 120px;
      height: 16px;
      background: #fa9819;
    }
    .message-title {
      font-family: 'Google Sans Code';
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }
  }
}

.message-bottom {
  position: relative;
  margin-top: 38px;
  border-radius: 12px;
  border: 1px solid #fa9819;
  background: rgba(250, 152, 25, 0.08);
  .message-bg {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    padding: 0 28px;
    background: url('/$/work/workbench/static/img/message_bg.svg') no-repeat center center;

    background-position: 0 1px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    color: #fa9819;
    text-shadow: 0 2px 0 #fff;
    // font-family: Inter;
    font-style: normal;
    .tip-style {
      line-height: 20px;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
    }
  }
  .nail {
    position: absolute;
    width: 25px;
    height: 25px;
    top: -12px;
    left: 12px;
    background: url('/$/work/workbench/static/img/Vector.png') no-repeat center center;
    background-size: 100% 100%;
  }
}

.desktop-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;

  // 确保 carousel 组件能够填充整个父容器
  :deep(.full-height-carousel) {
    width: 100%;
    height: 100% !important;

    .el-carousel__container {
      height: 100% !important;
    }
  }

  .carousel-item {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
  }
}
// 1000/1155
.desktop-right {
  flex: 1;
  aspect-ratio: 1000/1055;
  width: 100%;
  height: auto;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: calc(24px * 0.5625);
  height: 100%;
  overflow: hidden;
}

.video-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    .play-button {
      transform: scale(1.1);
    }
  }
}

.video-cover {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.3s ease;

  .video-item:hover & {
    opacity: 1;
  }
}

.play-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 52px;
  height: 36px;
  background: url('../static/img/play_bg.png') no-repeat center center;
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.video-info {
  height: 48px;
  align-items: center;
  justify-content: start;
  padding: 0 12px;
  display: flex;
}

.video-title {
  font-size: 12px;
  font-weight: 400;
  color: #262626;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;

  .video-views {
    color: #666;
  }

  .video-date {
    color: #999;
  }
}

// 视频/网页弹窗样式
.video-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.video-player-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
}

.video-player {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  .video-element {
    width: 100%;
    height: 100%;
    max-height: 60vh;
  }
}

.platform-player {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  .platform-element {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  }
}

.web-player {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  .web-element {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  }
}

.video-details {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.video-info-header {
  margin-bottom: 16px;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.video-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;

  span {
    display: flex;
    align-items: center;
  }
}

.video-description {
  margin-bottom: 20px;

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }
}

.related-videos {
  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.related-item {
  display: flex;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;

  &:hover {
    background: #e6f7ff;
    transform: translateY(-2px);
  }

  img {
    width: 80px;
    height: 60px;
    object-fit: cover;
  }
}

.related-info {
  padding: 8px 12px;
  flex: 1;

  .related-title {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .related-meta {
    font-size: 10px;
    color: #999;

    span {
      margin-right: 8px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.contact-link {
  color: var(--color-theme);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.youtube-player {
  width: 100%;
  height: 100%;
  .youtube-element {
    width: 100%;
    height: 100%;
  }
}
.search-container {
  width: 100%;
  // height: 60px;
  padding-bottom: 20px;
  :deep(.el-input__wrapper) {
    border-radius: 30px !important;
  }
  :deep(.el-input__inner) {
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-size: 20px;
  }

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
