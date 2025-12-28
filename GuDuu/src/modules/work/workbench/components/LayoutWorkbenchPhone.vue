<template>
  <div
    ref="layoutContainerRef"
    class="layout-demo"
    :class="{ 'content-overflow': !isContentOverflow && !app.isShowLive }"
  >
    <!-- <div ref="layoutContainerRef" class="layout-demo"> -->
    <div class="search-container">
      <el-input v-model="search" placeholder="Search" />
    </div>
    <div ref="layoutContentRef" class="layout-container" :class="{ 'layout-container-live': app.isShowLive }">
      <div class="grid-layout">
        <div
          v-for="(block, index) in blocksResult"
          :key="block.index"
          class="grid-item"
          :class="[`${block.name}`, props.groupList[block.index!]?.type != 'add' ? 'hover-show' : '']"
          :style="{
            width: `${block.width}px`,
            height: `${block.height}px`,
            position: 'absolute',
            left: `${block.x || 0}px`,
            top: `${block.y || 0}px`,
          }"
          @click="handleBlockClick(index + 1, block)"
        >
          <template v-if="props.groupList[block.index!]?.type == 'add'">
            <div
              class="w-full h-full flex items-center justify-center"
              :class="{ 'flex-col justify-between': block.name === 'block-5' }"
              @click="handleAddGroupClick(block.index)"
            >
              <div v-if="block.name === 'block-5'" class=""></div>
              <div class="add-group">
                <div class="w-[32px] h-[32px] m-[auto]">
                  <img src="../static/img/add-circle-fill.svg" alt="" class="w-full h-full" />
                </div>
                <div class="text-[12px] text-[#FA9819] font-normal mt-[8px]">Add group</div>
              </div>
              <div v-if="block.name === 'block-5'" class="section-list">
                <el-row :gutter="7">
                  <el-col :span="24">
                    <div class="section-item">
                      Time saved by Guduu: <span class="time-span">{{ savedTimeTip }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="7">
                  <el-col :span="8">
                    <div class="section-item"></div>
                  </el-col>
                  <el-col :span="8">
                    <div class="section-item pl-[9px]">
                      <div class="circle"></div>
                      <div class="circle"></div>
                      <div class="circle"></div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="section-item"></div>
                  </el-col>
                </el-row>
              </div>
              <!-- <WorkbenchGroup key="add" :item="{}" type="add" :zIndex="groupList.length - index"></WorkbenchGroup> -->
            </div>
          </template>
          <template v-else>
            <WorkbenchGroup
              :savedTimeTip="savedTimeTip"
              :portraitWrapStyle="computeWidth"
              :memberHeaderStyle="computeWidthHeader"
              :align="block.align"
              :typeName="block.name"
              :maxShow="block.maxShow"
              :isRow="block.isRow"
              :zIndex="groupList.length - index"
              :item="props.groupList[block.index!]"
              :active-ids="activeGroupIds[props.groupList[block.index!]?.id!]"
              :members="groupStore.groupMemberMap[props.groupList[block.index!]?.id!]"
            >
            </WorkbenchGroup>
          </template>
        </div>
      </div>
    </div>

    <GroupAdd v-model:show="showAddGroup" :position="currentPosition" width="400" title="Group" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import WorkbenchGroup from './workbench-group/WorkbenchGroup.vue';
import GroupAdd from '/$/work/components/group-add/GroupAdd.vue';
import { useGroupStore } from '/@/store/group.store';
import { useBase } from '/$/base';
import { useCool } from '/@/cool';

const { service } = useCool();

const { app } = useBase();

const props = defineProps<{
  groupList: Eps.GroupEntity[];
}>();

const isContentOverflow = ref(false);
const search = ref('');
// 定义块配置接口
interface BlockConfig {
  index: number;
  width: number;
  height: number;
  name: string;
  maxShow: number;
  isRow: boolean;
  align: string;
  x?: number; // 水平位置
  y?: number; // 垂直位置
}
// 配置比例0.5625
const configRatio = 1110 / 1920;
// 块配置数据
const blocks = ref<BlockConfig[]>([
  {
    index: 0,
    width: 220 * configRatio,
    height: 215 * configRatio,
    align: 'center',
    x: 0,
    y: 0,
    name: 'block-1',
    maxShow: 1,
    isRow: false,
  },
  {
    index: 1,
    width: 220 * configRatio,
    height: 215 * configRatio,
    align: 'center',
    x: 220 * configRatio + 20 * configRatio,
    y: 0,
    name: 'block-2',
    maxShow: 1,
    isRow: false,
  },
  {
    index: 2,
    width: 520 * configRatio,
    height: 215 * configRatio,
    align: 'center',
    x: 220 * configRatio + 220 * configRatio + 40 * configRatio,
    y: 0,
    name: 'block-3',
    maxShow: 2,
    isRow: false,
  },
  {
    index: 3,
    width: 460 * configRatio,
    height: 215 * configRatio,
    align: 'start',
    x: 0,
    y: 215 * configRatio + 20 * configRatio,
    name: 'block-4',
    maxShow: 3,
    isRow: false,
  },
  {
    index: 4,
    width: 520 * configRatio,
    height: 370 * configRatio,
    align: 'start',
    x: 460 * configRatio + 20 * configRatio,
    y: 215 * configRatio + 20 * configRatio,
    name: 'block-5',
    maxShow: 3,
    isRow: false,
  },
  {
    index: 5,
    width: 220 * configRatio,
    height: 450 * configRatio,
    align: 'center',
    x: 0,
    y: 430 * configRatio + 40 * configRatio,
    name: 'block-6',
    maxShow: 3,
    isRow: true,
  },
  {
    index: 6,
    width: 220 * configRatio,
    height: 215 * configRatio,
    align: 'start',
    x: 220 * configRatio + 20 * configRatio,
    y: 430 * configRatio + 40 * configRatio,
    name: 'block-7',
    maxShow: 1,
    isRow: false,
  },
  {
    index: 7,
    width: 220 * configRatio,
    height: 215 * configRatio,
    align: 'end',
    x: 220 * configRatio + 20 * configRatio,
    y: 645 * configRatio + 60 * configRatio,
    name: 'block-8',
    maxShow: 1,
    isRow: false,
  },
  {
    index: 8,
    width: 520 * configRatio,
    height: 295 * configRatio,
    align: 'center',
    x: 440 * configRatio + 40 * configRatio,
    y: 215 * configRatio + 370 * configRatio + 40 * configRatio,
    name: 'block-9',
    maxShow: 2,
    isRow: false,
  },
  {
    index: 9,
    width: 460 * configRatio,
    height: 215 * configRatio,
    align: 'center',
    x: 0,
    y: 430 * configRatio + 450 * configRatio + 60 * configRatio,
    name: 'block-10',
    maxShow: 3,
    isRow: false,
  },
  {
    index: 10,
    width: 250 * configRatio,
    height: 215 * configRatio,
    align: 'end',
    x: 460 * configRatio + 20 * configRatio,
    y: 430 * configRatio + 450 * configRatio + 60 * configRatio,
    name: 'block-11',
    maxShow: 1,
    isRow: false,
  },
  {
    index: 11,
    width: 250 * configRatio,
    height: 215 * configRatio,
    align: 'start',
    x: 460 * configRatio + 250 * configRatio + 40 * configRatio,
    y: 430 * configRatio + 450 * configRatio + 60 * configRatio,
    name: 'block-12',
    maxShow: 1,
    isRow: false,
  },
]);

const currentPosition = ref(0);
const blocksResult = computed(() => {
  return blocks.value;
});
// 添加响应式的容器宽度
const containerWidth = ref(0);
const computeWidth = computed(() => {
  console.log(containerWidth.value);
  if (!containerWidth.value) return 80;
  const width = Math.floor(((containerWidth.value - 20) / 1000) * 100);
  return width;
});
const computeWidthHeader = computed(() => {
  if (!containerWidth.value) return 48;
  const width = Math.floor(((containerWidth.value - 20) / 1000) * 80);
  return width;
});
const showAddGroup = ref(false);

const groupStore = useGroupStore();
const activeGroupIds = ref<Record<string, Set<string>>>({
  '1': new Set(['1']),
  '4': new Set(['4.3']),
  '15': new Set(['15.3', '15.4']),
  '22': new Set(['22.1']),
});
// 点击块的处理函数
const handleBlockClick = (blockNumber: number, block: BlockConfig) => {
  console.log(`点击了块 ${blockNumber}，尺寸: ${block.span}×${block.row}`);

  // 可以在这里添加更多交互逻辑
  // 比如显示详细信息、打开弹窗等
};
const handleAddGroupClick = (index: number) => {
  showAddGroup.value = true;
  currentPosition.value = index;
};
const layoutContainerRef = ref<HTMLElement>();
const layoutContentRef = ref<HTMLElement>();

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  const hoursStr = hours < 10 ? `0${hours}` : hours;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
  return `${hoursStr}:${minutesStr}:${secondsStr}`;
};
const savedTimeTip = ref<string>('');
// 获取消息提示
const getSavedTimeTip = async () => {
  const res = await service.base.sys.user.savedTimeSummary();
  savedTimeTip.value = formatTime(res.mySavedTime);
};

// 组件挂载后的处理
onMounted(() => {
  getSavedTimeTip();
  nextTick(() => {
    containerWidth.value = layoutContainerRef.value?.offsetWidth || 0;
  });
});
</script>

<style scoped lang="scss">
.layout-demo {
  width: 100%;
  font-family: Arial, sans-serif;
  &.content-overflow {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  color: #333;
  margin-bottom: 10px;
}

.header p {
  color: #666;
  font-size: 14px;
}

.config-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.config-info h3 {
  margin-bottom: 10px;
  color: #333;
}

.config-info pre {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow-x: auto;
}

.layout-container {
  aspect-ratio: 1180 / 700;
  // width: min(1180px, 65vw);
  width: 100%;
  height: auto;
  margin: 0 auto;
  border-radius: 8px;
  overflow: auto;
  min-width: 320px;
  min-height: 189px;
  padding: 10px 10px 30px;
  display: flex; // 添加flex布局
}

.layout-container-live {
  aspect-ratio: 1040 / 1295;
  width: 100% !important;
  height: auto;
  margin: 0 auto;
}

.grid-layout {
  width: 100%;
  min-height: 600px; // 设置最小高度
  position: relative; // 设置为相对定位，作为绝对定位子元素的参考
  box-sizing: border-box;
}

.grid-item {
  background-color: #fff;
  border-radius: 20px;
  border: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;

  // 字体大小也进行等比缩放
  font-size: calc(14px * min(1, 90vw / 1180px));

  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  :deep(.entity) {
    height: calc(100% - 52px);
    // overflow: hidden;
    // display: flex;
    // align-items: center;
  }
}

.item-content {
  z-index: 1;
  position: relative;
}

.item-title {
  font-size: calc(16px * min(1, 90vw / 1180px));
  margin-bottom: 4px;
}

.item-size {
  font-size: calc(12px * min(1, 90vw / 1180px));
  opacity: 0.8;
}

.join-chart {
  width: calc(60px * min(1, 90vw / 1180px));
  height: calc(60px * min(1, 90vw / 1180px));
  background: linear-gradient(180deg, #ffb554 0%, #ff9914 100%);
  border-radius: 50%;
  position: absolute;
  bottom: calc(-30px * min(1, 90vw / 1180px));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-container {
  width: 100%;
  // height: 60px;
  padding: 10px 10px 0;
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
.hover-show {
  &:hover,
  &:active,
  &:focus {
    outline: calc(4px * min(1, 90vw / 1180px)) solid #fa9819;
  }
}
.section-list {
  width: 100%;
  padding: 20px;
}
.section-item {
  height: 22px;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #262626;
  .time-span {
    margin-left: 5px;
    color: var(--color-theme);
  }
  .circle {
    width: 10px;
    height: 10px;
    background-color: #e6e6e6;
    border-radius: 50%;
    margin-right: 10px;
  }
}
</style>
