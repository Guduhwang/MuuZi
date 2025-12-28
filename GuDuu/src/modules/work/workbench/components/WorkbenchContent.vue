<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import WorkbenchGroup from './workbench-group/WorkbenchGroup.vue';
import GroupAdd from '/$/work/components/group-add/GroupAdd.vue';
import InternalMessageWidget from './InternalMessageWidget.vue';
import WorkbenchAdWidget from './WorkbenchAdWidget.vue';
import useDesktopStore from '/@/store/desktop';
import { useGroupStore } from '/@/store/group.store';
import { useBase } from '/$/base';
import LayoutWorkbench from './LayoutWorkbench.vue';
import DefaultDesktop from './DefaultDesktop.vue';
import LayoutWorkbenchPhone from './LayoutWorkbenchPhone.vue';
import DefaultDesktopPhone from './DefaultDesktopPhone.vue';

const { app } = useBase();
const isContentOverflow = ref(false);
const shouldCenterContent = ref(false); // 是否应该居中内容

defineOptions({
  name: 'WorkbenchContent',
});

const desktopStore = useDesktopStore();
const groupStore = useGroupStore();

// const updateTheme = inject('updateTheme');
const activeGroupIds = ref<Record<string, Set<string>>>({
  '1': new Set(['1']),
  '4': new Set(['4.3']),
  '15': new Set(['15.3', '15.4']),
  '22': new Set(['22.1']),
});

// 获取群
const getGroupList = () => {
  groupStore.refresh();
};
const layoutContainerRef = ref<HTMLElement>();
const layoutContentRef = ref();
const layoutContentPhoneRef = ref();
const liveWrapRef = ref<HTMLElement>(); // 直播模式容器引用

const showAddGroup = ref(false);
const groupList = computed(() => {
  const list = [...(groupStore.groupList || [])];
  const result = new Array(12).fill({
    type: 'add',
  });
  list.forEach((item, index) => {
    if (item.position || item.position === 0) {
      result[item.position] = item;
    } else {
      result[index] = item;
    }
  });
  return result;
});

// 检测内容是否超出屏幕
const checkContentOverflow = () => {
  // 使用 setTimeout 确保 DOM 完全渲染后再检测
  setTimeout(() => {
    nextTick(() => {
      if (!layoutContainerRef.value || !liveWrapRef.value) return;

      const container = layoutContainerRef.value;
      const parent = liveWrapRef.value;

      // 获取容器和父容器的高度
      const containerHeight = container.scrollHeight;
      const parentHeight = parent.clientHeight;

      // 如果内容高度小于等于父容器高度，则居中显示
      shouldCenterContent.value = containerHeight <= parentHeight;
    });
  }, 100);
};

// 监听窗口大小变化
const handleResize = () => {
  checkContentOverflow();
};

watch(
  () => desktopStore.defaultDesktop,
  async (value) => {
    if (value && value.id !== 999) {
      getGroupList();
    }
    // 桌面切换后检测内容高度
    checkContentOverflow();
  },
);

// 监听群组列表变化
watch(
  () => groupList.value,
  () => {
    checkContentOverflow();
  },
  { deep: true },
);

onMounted(async () => {
  await desktopStore.refresh();
  getGroupList();

  // 初始检测
  checkContentOverflow();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div
    ref="liveWrapRef"
    class="workbenchContent-wrap"
    :class="{
      'workbenchContent-wrap-live': app.isShowLive,
    }"
  >
    <div
      ref="layoutContainerRef"
      class="content-wrap"
      :class="{
        'content-wrap-live': app.isShowLive,
        'content-overflow': desktopStore.defaultDesktop.id === 999 && !isContentOverflow && !app.isShowLive,
        'content-center': shouldCenterContent && !app.isShowLive,
      }"
      :style="{
        alignItems: shouldCenterContent && !app.isShowLive ? 'center' : 'flex-start',
      }"
    >
      <DefaultDesktopPhone v-if="desktopStore.defaultDesktop.id === 999 && app.isShowLive" />
      <DefaultDesktop v-if="desktopStore.defaultDesktop.id === 999 && !app.isShowLive" ref="layoutContentRef" />
      <LayoutWorkbench v-if="desktopStore.defaultDesktop.id !== 999 && !app.isShowLive" :group-list="groupList" />
      <LayoutWorkbenchPhone v-if="desktopStore.defaultDesktop.id !== 999 && app.isShowLive" :group-list="groupList" />
      <div v-if="false" class="content">
        <template v-for="(item, index) in groupList" :key="item.id">
          <div @click="showAddGroup = true" v-if="item.type == 'add'">
            <WorkbenchGroup key="add" :item="{}" type="add" :zIndex="groupList.length - index"></WorkbenchGroup>
          </div>
          <WorkbenchGroup
            v-else
            :zIndex="groupList.length - index"
            :item="item"
            :active-ids="activeGroupIds[item.id!]"
            :members="groupStore.groupMemberMap[item.id!]"
          ></WorkbenchGroup>
        </template>
      </div>
      <div v-if="!app.isShowLive && false" class="right">
        <!-- <div class="search-wrap">
          <el-input v-model="searchInput" placeholder="search" />
          <i class="iconfont icon-a-23-sousuo" @click="updateTheme"></i>
        </div> -->
        <InternalMessageWidget title="Message"></InternalMessageWidget>
        <WorkbenchAdWidget title="Ad"></WorkbenchAdWidget>
        <!-- <WorkbenchWidget title="Group" :group-list="groupList2"></WorkbenchWidget>
        <WorkbenchWidget title="Group" :group-list="groupList3"></WorkbenchWidget>
        <WorkbenchWidget title="Group" :group-list="groupList1"></WorkbenchWidget> -->
      </div>
    </div>
  </div>
  <GroupAdd v-model:show="showAddGroup" width="400" title="Group" />
</template>
<style lang="scss" scoped>
.workbenchContent-wrap {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  height: 100%;
  // padding: 10px;

  // 隐藏滚动条 - 更完整的方案
  &::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  // 兼容 Firefox
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;

  // 兼容 IE
  -ms-overflow-style: none;

  // 确保所有子元素也隐藏滚动条
  * {
    &::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
}
.workbenchContent-wrap-live {
  display: block !important;
  width: 600px !important;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto; // 允许垂直滚动

  // 隐藏滚动条 - 更完整的方案
  &::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  // 兼容 Firefox
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;

  // 兼容 IE
  -ms-overflow-style: none;

  // 确保所有子元素也隐藏滚动条
  * {
    &::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
}

.content-wrap {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  // 当内容超出时，允许正常滚动，不居中
  // 当内容不超出时，通过 content-center 类或内联样式添加 align-items: center 实现居中
}

.content-wrap-live {
  width: 100%;
  padding-top: 20px;
  display: block !important;
}

.content {
  flex: 1;
  display: flex;
  justify-content: space-evenly;
  align-content: center;
  flex-wrap: wrap;
  gap: 10px;
  // column-count: 3;
  // column-gap: 10px;
  & > * {
    flex: 0 1 calc((100% - 30px) / 3);
  }
}
.right {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 10px;
  flex-basis: 40%;
  min-width: 200px;
  padding-left: 20px;
  padding-right: 10px;
  // border-left: 1px solid var(--theme-border-color);
  overflow-y: auto;

  // 隐藏滚动条 - 更完整的方案
  &::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  // 兼容 Firefox
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;

  // 兼容 IE
  -ms-overflow-style: none;

  // 确保所有子元素也隐藏滚动条
  * {
    &::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
}

.search-wrap {
  --el-border-color: var(--theme-border-color);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;

  .iconfont {
    font-size: 28px;
    color: var(--theme-font-color);
  }
}
.content-overflow {
  display: flex;
  // align-items: center;
  justify-content: center;
}

.content-center {
  align-items: center;
}
</style>
