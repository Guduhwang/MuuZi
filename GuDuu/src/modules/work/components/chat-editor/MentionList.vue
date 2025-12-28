<template>
  <div class="atPicker-wrap" v-if="selfType === 'mentionList'">
    <div
      class="atPicker-item"
      v-for="(item, index) in list"
      :key="item.id"
      @click="selectItem(item)"
      :class="{
        selected: index === selectedIndex,
        loading: imStore.isGroupMemberLoading(item.groupId!, item.userId!),
      }"
    >
      <img class="atPicker-item-avatar" :src="item.avatar" />
      <div class="atPicker-item-cnt">{{ item.name }}</div>
    </div>
    <div class="atPicker-empty" v-if="!items.length">
      <div class="atPicker-empty-text">No one to mention</div>
    </div>
  </div>
  <ChatInputTimerForm v-else-if="selfType === 'timer'" @close="handleTimerFormCLose" @save="handleTimerFormSave" />
</template>

<script setup lang="ts">
import type { MentionNodeAttrs } from '@tiptap/extension-mention';
import type { Instance as TippyInstance } from 'tippy.js';
import type { TChatInputTimerForm } from './chat-input-timer-form/types/chat-input-timer-form.type';
import type { TWorkflowConfigParam } from '../../types/message.type';
import { computed, ref, watch } from 'vue';
import ChatInputTimerForm from './chat-input-timer-form/ChatInputTimerForm.vue';
import { useImStore } from '/@/store/im.store';

interface TCommandParams extends MentionNodeAttrs {
  // 时间参数
  timerFormData?: TChatInputTimerForm;
  // 工作流父类型
  parentType?: number;
  // 工作流类型
  type?: number;
  params?: TWorkflowConfigParam[];
  config?: Record<string, unknown>;
}
// Define props with type
const props = defineProps<{
  items: Eps.BaseGroupMemberEntity[];
  command: (item: TCommandParams) => void;
  // 根据类型显示@成团列表或者其他类型的表单
  type: string;
  // 更新tiptap的属性
  updatePopup: (params: Partial<TippyInstance['props']>) => void;
}>();

const imStore = useImStore();

const selectedIndex = ref(0);
// 额外创建type，type难以直接修改
const selfType = ref(props.type);

watch(selfType, (val) => {
  // 是@列表的时候，需要设置点击可消失
  props.updatePopup({
    hideOnClick: val === 'mentionList',
  });
});

watch(
  () => props.type,
  (val) => {
    selfType.value = val;
  },
);
// Watch items change
watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  },
);

// 排除的成员类型
const excludeParentType = ref<number>();
const excludeType = ref<number>();

// 实际上出现的成员列表
const list = computed(() => {
  return props.items.filter((item) => item.type !== excludeParentType.value && item.type !== excludeType.value);
});

// Methods
const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length;
};

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
};

const enterHandler = () => {
  selectItem(props.items[selectedIndex.value]);
};

const selectItem = (item: Eps.BaseGroupMemberEntity) => {
  if (item) {
    // 如果正在loading，则不允许选择
    if (imStore.isGroupMemberLoading(item.groupId!, item.userId!)) {
      return;
    }
    // 父类型为45，子类型为51，代表timer类型
    if (item.parentType === 5 && item.type === 51) {
      //在当前组件打开时间参数表单
      selfType.value = 'timer';
    } else {
      // command实际上是插入@+name
      props.command({
        id: item.userId,
        label: item.name,
        timerFormData: timerFormData.value,
        parentType: item.parentType,
        type: item.type,
        params: item.config?.params,
        config: item.config,
      });
    }
  }
};

function handleTimerFormCLose() {
  /** 时间参数表单关闭的时候，恢复点击关闭 */
  selfType.value = 'mentionList';
}

const timerFormData = ref<TChatInputTimerForm>();
function handleTimerFormSave(formData: TChatInputTimerForm) {
  /** 时间参数表单保存的时候 */
  // 保存时间参数
  // 然后打开选择成员列表，并排除所有的定时任务成员
  selfType.value = 'mentionList';
  // widget类型
  excludeParentType.value = 5;
  // timer类型
  excludeType.value = 51;
  timerFormData.value = formData;
}

// Expose methods for parent component
defineExpose({
  onKeyDown: ({ event }: { event: KeyboardEvent }) => {
    if (event.key === 'ArrowUp') {
      upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      enterHandler();
      return true;
    }

    return false;
  },
});
</script>

<style lang="scss">
.atPicker-wrap {
  max-height: 320px;
  background-color: rgb(255, 255, 255);
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 1px 4px,
    rgba(0, 0, 0, 0.08) 0px 6px 10px 4px;
  border: 0.03125rem solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: rgb(26, 26, 26);
  display: flex;
  flex-direction: column;
  z-index: 1;
  width: 320px;
  overflow-y: auto;
}

.atPicker-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  height: 64px;
  padding: 12px;

  &:hover,
  &.selected {
    background: #f2f2f2;
  }

  &.loading {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.atPicker-item-avatar {
  height: 40px;
  width: 40px;
  border-radius: 100px;
  object-fit: cover;
}

.atPicker-item-cnt {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0;
  color: rgb(26, 26, 26);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.atPicker-empty {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.atPicker-empty-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
