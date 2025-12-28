<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <el-config-provider :empty-values="[undefined, null, '', 0]">
        <component :is="Component" />
      </el-config-provider>
    </transition>
  </router-view>
  <Cool />

  <!-- Stagewise toolbar (only in development) -->
  <StagewiseToolbar v-if="isDevTools" :config="stagewiseConfig" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { isDevelopment, StagewiseToolbar, stagewiseConfig } from '/@/plugins/stagewise';
import Cool from '/@/cool/index.vue';
import NProgress from 'nprogress';

const isDevTools = computed(
  () => isDevelopment() && import.meta.env.DEV && import.meta.env.VITE_SHOW_DEV_TOOLS === '1',
);
// 动态更改ico
const changeIco = () => {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (link) {
    let isGuduu = false;
    if (window.location.hostname.includes('guduu.co')) {
      isGuduu = true;
    }
    if (isGuduu) {
      link.href = '/favicon_guduu.ico';
    } else {
      link.href = '/favicon.ico';
    }
  }
};
onMounted(() => {
  changeIco();
  // 临时将dev-tools在开发者模式下隐藏,因为开发者模式下无法设置隐藏
  if (isDevTools.value) {
    setTimeout(() => {
      const devDom = document.querySelector('.dev-tools__close');
      if (devDom) {
        (devDom as HTMLElement).style.display = 'none';
      }
    }, 2000);
  }

  // 确保进度条被正确清理
  // 当页面加载完成后，强制关闭可能残留的进度条
  setTimeout(() => {
    NProgress.done();
  }, 1000);

  // 添加进度条状态保护，防止循环显示
  const progressBarCheckInterval = setInterval(() => {
    // 检查进度条是否异常显示超过5秒
    const progressElement = document.querySelector('#nprogress');
    if (progressElement && progressElement.classList.contains('nprogress-busy')) {
      const startTime = parseInt(progressElement.getAttribute('data-start-time') || '0');
      const currentTime = Date.now();
      if (currentTime - startTime > 3000) {
        console.warn('进度条异常显示超过5秒，强制关闭');
        NProgress.done();
      }
    }
  }, 1000);

  // 清理定时器
  setTimeout(() => {
    clearInterval(progressBarCheckInterval);
  }, 30000);
});

// 组件卸载时确保进度条关闭
onUnmounted(() => {
  NProgress.done();
});

// 监听全局错误，确保进度条关闭
window.addEventListener('error', () => {
  NProgress.done();
});

// 监听未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', () => {
  NProgress.done();
});
</script>

<style lang="scss">
.pointer {
  cursor: pointer;
}
</style>
