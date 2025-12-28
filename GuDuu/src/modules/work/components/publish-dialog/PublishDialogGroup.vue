<template>
  <div style="overflow: hidden">
    <div class="publishDialogWorkflow-wrap">
      <div
        class="publishDialogWorkflow-item-wrap"
        v-for="item in list"
        :key="item.id"
        @click="handleGroupClick(item)"
        :class="{ active: activeId === item.id, noOwner: noOwnerGroupLists.includes(item.id) }"
      >
        <div class="publishDialogWorkflow-item">
          <div class="publishDialogWorkflow-item-img-wrap">
            <img :src="item.avatar" alt="" class="publishDialogWorkflow-item-img" />
            <div class="publishDialogWorkflow-item-time">Edited {{ dayjs(item.updateTime).fromNow() }}</div>
          </div>
          <div class="publishDialogWorkflow-item-name">{{ item.name }}</div>
        </div>
      </div>
      <div v-if="props.searchValue?.trim() && !list.length" class="publishDialogWorkflow-empty">
        <img src="/src/assets/imgs/personal/nodata_search.svg" alt="" class="publishDialogWorkflow-empty-img" />
        <div class="publishDialogWorkflow-empty-text">
          No results matching <span>{{ props.searchValue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TGroupItem } from '../../types/group.type';
import { computed, onMounted, ref, watch } from 'vue';
import { useGroupStore } from '/@/store/group.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './css/publishDialogWorkflow.scss';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import { useMemberStore } from '/@/store/member';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'PublishDialogGroup',
});
dayjs.extend(relativeTime);

const props = defineProps<{
  modelValue?: number;
  searchValue?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void;
  (e: 'change', value: TGroupItem): void;
}>();

const groupStore = useGroupStore();
const memberStore = useMemberStore();
const { userStore } = useStore();
const { info: userInfo } = storeToRefs(userStore);
onMounted(() => {
  if (!groupStore.allGroupList.length) {
    groupStore.refreshAllGroupList();
  }
  if (!memberStore.memberListAll.length) {
    memberStore.refreshAll();
  }
});

const activeId = ref<number | undefined>(props.modelValue);

const list = computed(() => {
  return groupStore.allGroupList.filter((item) => item.name.includes(props.searchValue?.trim() || ''));
});

const noOwnerGroupLists = computed(() => {
  const list: number[] = [];
  memberStore.memberListAll.forEach((item) => {
    if (item.ownerId !== userInfo.value?.id) {
      list.push(item.groupId);
    }
  });
  return list;
});

watch(
  () => props.modelValue,
  (val) => {
    activeId.value = val;
  },
);

function handleGroupClick(item: TGroupItem) {
  if (noOwnerGroupLists.value.includes(item.id)) {
    ElMessage.warning('You are not the author of this group member');
    return;
  }
  if (activeId.value === item.id) {
    activeId.value = undefined;
  } else {
    activeId.value = item.id;
  }

  emit('update:modelValue', activeId.value);
  emit('change', item);
}
</script>
