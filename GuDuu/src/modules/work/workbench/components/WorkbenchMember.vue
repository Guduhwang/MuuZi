<template>
  <Component :is="type === 'add' ? 'div' : 'el-tooltip'" placement="right" :show-arrow="true">
    <template #content v-if="type !== 'add'">
      <span>{{ item.name }}</span>
    </template>
    <div
      class="portrait-wrap"
      :class="{ 'portrait-wrap-live': app.isShowLive }"
      v-if="type !== 'add'"
      @click="handleEditMember"
    >
      <div class="mask mask-1"></div>
      <div :class="['mask mask-2', isActive ? 'mask-2-animation-call' : '']"></div>
      <img :src="item.avatar" alt="" :class="['portrait', isActive ? 'portrait-animation-call' : '']" />
      <!-- 操作工具栏 -->
      <div v-if="shouldShowActions" class="portrait-actions">
        <!-- 售卖信息（仅在自己创建的成员且是特殊桌面时显示） -->
        <el-tooltip v-if="shouldShowEditIcon" content="Edit External Link" placement="top">
          <div class="action-btn" @click.stop="handleEditExternalLink">
            <IMdiLightViewModule />
          </div>
        </el-tooltip>
      </div>
    </div>
    <div
      class="portrait-wrap-add"
      :class="{
        'portrait-wrap-add-block6':
          (props.typeName === 'block-6' && !app.isShowLive) || (props.typeName === 'block-5' && app.isShowLive),
        'portrait-wrap-add-live': app.isShowLive,
      }"
      @click="handleAddMember"
    >
      <img src="../static/img/add-yellow.svg" alt="" />
      <!-- <div class="mask mask-default"></div> -->
    </div>
  </Component>
  <!-- 外部链接配置弹窗 -->
  <ExternalLinkDialog
    v-model:show="showExternalLinkDialog"
    :member-id="props.item.userId"
    :group-id="props.groupId"
    :desktop-id="props.desktopId"
  />
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useBase } from '/$/base';
import { getIdentity } from '/@/utils';
import { useStore } from '/@/store';
import { useCool } from '/@/cool';
import { Edit } from '@element-plus/icons-vue';
import useDesktopStore from '/@/store/desktop';
import ExternalLinkDialog from './ExternalLinkDialog.vue';

const { app } = useBase();
const { userStore } = useStore();
const { service } = useCool();
const desktopStore = useDesktopStore();

defineOptions({
  name: 'WorkbenchMember',
});

const props = withDefaults(
  defineProps<{
    item: Eps.GroupMemberEntity;
    isActive?: boolean;
    type?: 'add' | 'normal';
    portraitWrapStyle: number;
    typeName: string;
    groupId?: number;
    desktopId?: number;
    groupUserId?: number; // 群组创建者ID
  }>(),
  {
    type: 'normal',
  },
);

const emit = defineEmits<{
  (e: 'addMember'): void;
  (e: 'editMember', value: Eps.GroupMemberEntity): void;
}>();

const userIdentity = computed(() => {
  return getIdentity(userStore.info?.roleIds ?? []);
});

const showExternalLinkDialog = ref(false);

// 判断是否是自己创建的成员（通过群组的创建者判断）
const isSelfCreated = computed(() => {
  // 判断群组的创建者是否是当前用户
  return props.groupUserId === userStore.info?.id;
});

// 判断是否是特殊桌面（isExternal === 2）
const isSpecialDesktop = computed(() => {
  if (!props.desktopId) return false;
  const desktop = desktopStore.desktopList.find((d: Required<Eps.DesktopEntity>) => d.id === props.desktopId);
  return desktop?.isExternal === 2;
});

// 是否应该显示外部链接编辑按钮（仅在自己创建的成员且是特殊桌面时显示）
const shouldShowEditIcon = computed(() => {
  return isSelfCreated.value && isSpecialDesktop.value;
});

// 是否应该显示操作工具栏（只要有任何一个功能可用就显示）
const shouldShowActions = computed(() => {
  return shouldShowEditIcon.value;
});

function handleAddMember() {
  emit('addMember');
}

function handleEditMember() {
  emit('editMember', props.item);
}

function handleEditExternalLink() {
  showExternalLinkDialog.value = true;
}

// 监听桌面列表变化，确保能正确判断
watch(
  () => desktopStore.desktopList,
  () => {
    // 桌面列表更新时，重新判断
  },
  { deep: true },
);

onMounted(() => {
  console.log('WorkbenchMember mounted', props.typeName);
  // 确保桌面列表已加载
  if (desktopStore.desktopList.length === 0) {
    desktopStore.getDesktopList();
  }
});
</script>

<style lang="scss" scoped>
.portrait-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 100%;
  aspect-ratio: 1;
  transition: transform 0.1s ease-in-out;
  cursor: pointer;

  // &:hover {
  //   position: relative;
  //   z-index: 10;
  //   transform: scale(1.1);
  // }
}

// 操作工具栏
.portrait-actions {
  position: absolute;
  top: 23px;
  right: 25px;
  display: none;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50px;
  z-index: 10;
  transition: all 0.2s ease;

  .action-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.2s ease;

    .el-icon {
      color: #fff;
      font-size: 14px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.portrait-wrap:hover .portrait-actions {
  display: flex;
}

.portrait-wrap-live {
  width: 49.8px !important;
  height: 49.8px !important;
}

.portrait-wrap-add {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  border-radius: 100%;
  background: #f2f2f2;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.1s ease-in-out;

  img {
    // 图标大小也相应调整，基于容器大小的30%
    width: 24px;
    height: 24px;
  }

  // &:hover {
  //   position: relative;
  //   z-index: 10;
  //   transform: scale(1.1);
  // }
}
.portrait-wrap-add-live {
  width: 49.8px;
  height: 49.8px;
}
.portrait-wrap-add-block6 {
  background: #fff;
}

.portrait {
  position: relative;
  z-index: 3;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  object-fit: cover;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 100%;
}

// 一层蒙版，1确实是第一层的意思
.mask-1 {
  z-index: 2;
  background: #7d787d;
}
.mask-2 {
  z-index: 1;
  background: #565658;
}

.mask-default {
  transition: opacity 0.2s ease-in-out;
  opacity: 0;
  z-index: 3;
  background: #f2f2f2;
}

.portrait-animation-call {
  animation: portrait-animation 0.4s ease-in-out infinite alternate;
}

.mask-2-animation-call {
  animation: mask-2-animation 0.4s ease-in-out infinite alternate;
}

@keyframes portrait-animation {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
}

@keyframes mask-2-animation {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}
</style>
