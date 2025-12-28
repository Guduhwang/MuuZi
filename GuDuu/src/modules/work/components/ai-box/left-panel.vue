<template>
  <view class="left-panel" :class="{ 'left-panel-live-mode': app.isShowLive }">
    <view class="list">
      <!-- 固定的好友项 -->
      <view
        :class="{
          'item-box': true,
          'friend-item': true,
          active: isFriendMode,
        }"
        @click="handleFriendClick"
      >
        <view
          :class="{
            item: true,
            active: isFriendMode,
          }"
        >
          <img src="/images/ai-box/ava.png" alt="" class="item-img" />
        </view>
      </view>
      <!-- 桌面列表 -->
      <view
        v-for="(item, index) in localDesktopList"
        :key="item.id"
        :class="{
          'item-box': true,
          active: activeDesktopMap[item.id] && !isFriendMode,
          activeUp: currentDesktopIndex >= 0 && index === currentDesktopIndex - 1,
          activeDown: currentDesktopIndex >= 0 && index === currentDesktopIndex + 1,
        }"
        @click="handleDesktopClick(item)"
      >
        <view
          :class="{
            item: true,
            active: activeDesktopMap[item.id] && !isFriendMode,
            activeUp: currentDesktopIndex >= 0 && index === currentDesktopIndex - 1,
            activeDown: currentDesktopIndex >= 0 && index === currentDesktopIndex + 1,
          }"
        >
          <img :src="item.avatar" alt="" class="item-img" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, type Ref } from 'vue';
import useDesktopStore from '/@/store/desktop';
import './css/aiBox.scss';
import { useBase } from '/$/base';

const { app } = useBase();

defineOptions({
  name: 'LeftPanel',
});

const desktopStore = useDesktopStore();

// 从父组件获取设置当前桌面的方法
const setCurrentDesktop = inject<(desktop: Required<Eps.DesktopEntity>) => void>('setCurrentDesktop');
// 从父组件获取当前桌面状态（响应式引用）
const localCurrentDesktop = inject<Ref<Required<Eps.DesktopEntity> | null>>('localCurrentDesktop');
// 从父组件获取切换好友模式的方法
const switchToFriendMode = inject<() => void>('switchToFriendMode', () => {});
// 从父组件获取是否为好友模式
const isFriendMode = inject<Ref<boolean>>('isFriendMode', ref(false));

// 本地桌面列表（独立于 desktopStore）
const localDesktopList = ref<Required<Eps.DesktopEntity>[]>([]);

// 获取桌面列表（优先使用 desktopStore 中已有的数据，避免重复请求）
async function fetchDesktopList() {
  try {
    // 如果 desktopStore 中已有数据，直接使用
    if (desktopStore.desktopList && desktopStore.desktopList.length > 0) {
      localDesktopList.value = desktopStore.desktopList;
    } else {
      // 如果没有数据，则获取
      const data = await desktopStore.getDesktopList();
      localDesktopList.value = data;
    }
    // 不再在这里设置当前桌面，让父组件统一管理
  } catch (error) {
    console.error('获取桌面列表失败:', error);
  }
}

// 切换桌面
function handleDesktopClick(item: Required<Eps.DesktopEntity>) {
  // 调用父组件的方法，更新群组列表和当前桌面状态
  if (setCurrentDesktop) {
    setCurrentDesktop(item);
  }
}

// 点击好友项
function handleFriendClick() {
  // 调用父组件的方法，切换到好友模式
  if (switchToFriendMode) {
    switchToFriendMode();
  }
}

// 使用 computed 计算当前桌面索引，确保响应式更新
const currentDesktopIndex = computed(() => {
  if (!localDesktopList.value || !localCurrentDesktop?.value) {
    return -1;
  }
  return localDesktopList.value.findIndex((i: Required<Eps.DesktopEntity>) => i.id === localCurrentDesktop.value?.id);
});

// 使用 computed 计算激活桌面的映射，确保响应式更新
const activeDesktopMap = computed(() => {
  const map: Record<number | string, boolean> = {};
  if (localCurrentDesktop?.value && localDesktopList.value.length > 0) {
    localDesktopList.value.forEach((item) => {
      map[item.id] = item.id === localCurrentDesktop.value?.id;
    });
  }
  return map;
});

// 监听父组件的 localCurrentDesktop 变化，确保样式正确更新
watch(
  () => localCurrentDesktop?.value,
  (newVal) => {
    // 当父组件设置当前桌面时，如果桌面列表还没加载，则加载
    if (newVal && localDesktopList.value.length === 0) {
      fetchDesktopList();
    }
  },
  { immediate: true },
);

// 从父组件获取弹窗显示状态（通过 inject 或 props）
// 由于 left-panel 在 v-if="isShowGroupMenu" 下，只有在弹窗显示时才会挂载
// 组件挂载时立即获取桌面列表
fetchDesktopList();
</script>
