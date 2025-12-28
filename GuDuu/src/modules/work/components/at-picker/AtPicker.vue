<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

defineOptions({
  name: 'AtPicker',
});

const props = withDefaults(
  defineProps<{
    show: boolean;
    list: Eps.BaseGroupMemberEntity[];
  }>(),
  {
    show: false,
    list: () => [],
  },
);

const emit = defineEmits(['select']);

const defaultAvatar =
  'https://x2mu.oss-cn-shanghai.aliyuncs.com/app%2Fbase%2Fd50f6807358744cd9be789fd46cab916_member.png';

// Track selected index
const selectedIndex = ref(0);

// Reset selected index when list changes
watch(
  () => props.list,
  () => {
    selectedIndex.value = 0;
  },
);

// Handle keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
  if (!props.show || props.list.length === 0) return;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value - 1 + props.list.length) % props.list.length;
      scrollSelectedIntoView();
      break;
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % props.list.length;
      scrollSelectedIntoView();
      break;
    case 'Enter':
      e.preventDefault();
      handleSelect(props.list[selectedIndex.value]);
      break;
  }
}

// Scroll selected item into view
function scrollSelectedIntoView() {
  nextTick(() => {
    const selectedElement = document.querySelector('.atPicker-item.selected');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  });
}

// 选择成员
function handleSelect(member: Eps.BaseGroupMemberEntity) {
  emit('select', member);
}

// Add and remove keyboard event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="atPicker-wrap atPicker-position" v-if="show && list.length > 0">
    <div
      class="atPicker-item"
      v-for="(item, index) in list"
      :key="item.id"
      @click="handleSelect(item)"
      :class="{ selected: index === selectedIndex }"
    >
      <img class="atPicker-item-avatar" :src="item.avatar || defaultAvatar" />
      <div class="atPicker-item-cnt">{{ item.nickName }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.atPicker-position {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(0, calc(-100% - 4px));
  z-index: 99;
}

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
</style>
