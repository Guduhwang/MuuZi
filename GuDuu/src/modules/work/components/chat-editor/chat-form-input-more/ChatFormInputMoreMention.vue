<template>
  <div class="chatFormInputMoreMention-wrap">
    <template v-if="requiredList.length">
      <div class="chatFormInputMoreMention-head">Required options</div>
      <div class="chatFormInputMoreMention-list">
        <div
          class="chatFormInputMoreMention-item"
          v-for="item in requiredList"
          :key="item.name"
          @click="selectItem(item)"
          :class="{ selected: item.name === selectedIndex }"
        >
          <div class="chatFormInputMoreMention-item-cnt">{{ item.name }}</div>
        </div>
      </div>
    </template>
    <template v-if="otherList.length">
      <div class="chatFormInputMoreMention-head">Other options</div>
      <div class="chatFormInputMoreMention-list">
        <div
          class="chatFormInputMoreMention-item"
          v-for="item in otherList"
          :key="item.name"
          @click="selectItem(item)"
          :class="{ selected: item.name === selectedIndex }"
        >
          <div class="chatFormInputMoreMention-item-cnt">{{ item.name }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { chatEditorInsertedMemberFieldMapSymbol, chatEditorUpdateInsertedMemberFieldMapSymbol } from '../injections';
import type { TWorkflowConfigParam } from '/@/modules/work/types/message.type';
import { computed, inject, ref } from 'vue';

defineOptions({
  name: 'ChatFormInputMoreMention',
});
const props = defineProps<{
  params: TWorkflowConfigParam[];
  // insertedMemberFields: Record<string, 1>;
  onSelect: (param: TWorkflowConfigParam) => void;
  // addInsertedMemberFields: (field: string) => void;
  onDestroy: () => void;
}>();

const updateInsertedMemberField = inject(chatEditorUpdateInsertedMemberFieldMapSymbol);
const insertedMemberFieldMap = inject(chatEditorInsertedMemberFieldMapSymbol);

const selectedIndex = ref();

const requiredList = computed(() => {
  return props.params.filter((item) => item.required === 1 && !insertedMemberFieldMap?.value[item.name]);
});

const otherList = computed(() => {
  return props.params.filter((item) => item.required === 0 && !insertedMemberFieldMap?.value[item.name]);
});

const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.params.length - 1) % props.params.length;
};

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.params.length;
};

const enterHandler = () => {
  selectItem(props.params[selectedIndex.value]);
};

const selectItem = (item: TWorkflowConfigParam) => {
  if (item) {
    props.onSelect(item);
    updateInsertedMemberField?.(item.name, 1);
    props.onDestroy();
  }
};

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
.chatFormInputMoreMention-wrap {
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

.chatFormInputMoreMention-head {
  height: 40px;
  line-height: 24px;
  padding: 8px;
  font-size: 12px;
  text-transform: uppercase;
  color: #5f606a;
  font-weight: 600;
}

.chatFormInputMoreMention-list {
  padding-inline: 8px;
  padding-bottom: 8px;
  font-size: 14px;
}

.chatFormInputMoreMention-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  height: 36%;
  padding: 8px;
  pointer: cursor;
  border-radius: 2px;
  color: #2f3035;

  &:hover,
  &.selected {
    background: #f2f2f3;
  }
}

.chatFormInputMoreMention-item-avatar {
  height: 40px;
  width: 40px;
  border-radius: 100px;
  object-fit: cover;
}

.chatFormInputMoreMention-item-cnt {
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

.chatFormInputMoreMention-empty {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.chatFormInputMoreMention-empty-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
