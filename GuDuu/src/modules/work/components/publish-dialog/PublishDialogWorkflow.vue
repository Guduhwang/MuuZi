<template>
  <div style="overflow: hidden">
    <div class="publishDialogWorkflow-wrap">
      <div
        class="publishDialogWorkflow-item-wrap"
        v-for="item in list"
        :key="item.id"
        @click="handleWorkflowClick(item)"
        :class="{ active: activeId === item.userId }"
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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemberStore } from '/@/store/member';
import './css/publishDialogWorkflow.scss';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
defineOptions({
  name: 'PublishDialogWorkflow',
});
dayjs.extend(relativeTime);

const props = defineProps<{
  type: string;
  modelValue?: number;
  searchValue?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void;
  (e: 'change', value: Eps.BaseSysUserEntity): void;
}>();

const memberStore = useMemberStore();
const { userStore } = useStore();

const { info: userInfo } = storeToRefs(userStore);
onMounted(() => {
  // if (!memberStore.memberList.length) {
  //   memberStore.refresh();
  // }
  if (!memberStore.memberListAll.length) {
    memberStore.refreshAll();
  }
});

const activeId = ref<number | undefined>(props.modelValue);

const list = computed(() => {
  console.log(memberStore.memberListAll);
  console.log(userInfo.value);
  console.log(props.type);
  let parentType = 1;
  if (props.type == 'workflow') {
    parentType = 1;
  } else if (props.type == 'plugins') {
    parentType = 3;
  } else if (props.type == 'widget') {
    parentType = 2;
  }
  const resultList = memberStore.memberListAll.filter((item) => item.ownerId === userInfo.value?.id);
  return resultList.filter((item) => {
    return item.name?.includes(props.searchValue?.trim() || '') && item.parentType == parentType;
  });
});

watch(
  () => props.modelValue,
  (val) => {
    activeId.value = val;
  },
);
function handleWorkflowClick(item: Eps.BaseSysUserEntity) {
  if (activeId.value === item.userId) {
    activeId.value = undefined;
  } else {
    activeId.value = item.userId;
  }
  emit('update:modelValue', activeId.value);
  emit('change', item);
}
</script>
