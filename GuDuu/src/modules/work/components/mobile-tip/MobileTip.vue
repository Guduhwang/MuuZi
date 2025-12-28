<template>
  <el-dialog
    :close-on-click-modal="false"
    v-model="isShowTips"
    :align-center="true"
    title="Tips"
    width="80%"
    :show-close="false"
  >
    <div class="text-center leading-6 text-[#333]">
      Mobile access is not supported yet. Please use a computer to continue.
    </div>
  </el-dialog>
</template>
<script setup lang="js">
import { ref, watch, onUnmounted } from 'vue';
import { useUserStore } from '/@/store/user';
const userStore = useUserStore();
const isShowTips = ref(false);
const maskRef = ref(null); // 用于跟踪 mask 元素

// 清理 mask 元素的函数
const cleanupMask = () => {
  if (maskRef.value) {
    try {
      maskRef.value.remove();
    } catch (error) {
      if (maskRef.value.parentNode) {
        maskRef.value.parentNode.removeChild(maskRef.value);
      }
    }
    maskRef.value = null;
  }

  // 清理所有可能的 mask 元素
  const allMasks = document.querySelectorAll('div.mask');
  allMasks.forEach((mask) => {
    try {
      mask.remove();
    } catch (error) {
      if (mask.parentNode) {
        mask.parentNode.removeChild(mask);
      }
    }
  });
};

// 组件卸载时清理
onUnmounted(() => {
  cleanupMask();
});

const handleMobile = (isMobile) => {
  if (isMobile) {
    // 先移除已存在的 mask
    cleanupMask();

    const mask = document.createElement('div');
    mask.style.position = 'fixed';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    mask.style.zIndex = '1000';
    mask.classList.add('mask');
    document.body.appendChild(mask);
    maskRef.value = mask; // 保存引用
    isShowTips.value = true;
  } else {
    cleanupMask();
    isShowTips.value = false;
  }
};
watch(
  () => userStore.isMobile,
  (newVal) => {
    handleMobile(newVal);
  },
  {
    immediate: true,
  },
);
</script>
