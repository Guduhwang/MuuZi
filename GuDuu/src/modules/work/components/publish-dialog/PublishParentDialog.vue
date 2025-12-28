<template>
  <ElDialog
    :modelValue="show"
    width="1000px"
    class="publishParentDialog-wrap"
    body-class="publishParentDialog-body"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <template #header>
      <div class="publishParentDialog-header">
        <h2 class="publishParentDialog-title">Add Products</h2>
        <div class="publishParentDialog-header-right">
          <el-input
            v-model="searchValue[activeTab]"
            :placeholder="'Search'"
            class="publishParentDialog-search-input"
            clearable
            @input="handleInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </template>
    <el-tabs v-model="activeTab" class="publishParentDialog-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="Group" name="group"></el-tab-pane>
      <el-tab-pane label="Workflow" name="workflow"></el-tab-pane>
      <el-tab-pane v-if="userInfo.info?.roleIds?.includes(1)" label="Plugins" name="plugins"></el-tab-pane>
      <el-tab-pane v-if="userInfo.info?.roleIds?.includes(1)" label="Widget" name="widget"></el-tab-pane>
    </el-tabs>
    <div class="publishParentDialog-content">
      <PublishDialogGroup
        v-if="activeTab === 'group'"
        :type="workType"
        v-model="activeWorkId"
        :searchValue="searchValue.group"
      ></PublishDialogGroup>
      <PublishDialogWorkflow
        v-else-if="activeTab === 'workflow'"
        :type="activeTab"
        v-model="activeWorkId"
        :searchValue="searchValue.workflow"
        @change="handleWorkflowChange"
      ></PublishDialogWorkflow>
      <PublishDialogWorkflow
        v-else-if="activeTab === 'plugins'"
        :type="activeTab"
        v-model="activeWorkId"
        :searchValue="searchValue.plugins"
      ></PublishDialogWorkflow>
      <PublishDialogWorkflow
        v-else-if="activeTab === 'widget'"
        :type="activeTab"
        v-model="activeWorkId"
        :searchValue="searchValue.widget"
      ></PublishDialogWorkflow>
    </div>
    <template #footer>
      <div class="publishParentDialog-footer">
        <ElButton class="publishParentDialog-btn-cancel" @click="handleCancel">Cancel</ElButton>
        <ElButton
          class="publishParentDialog-btn-next"
          type="primary"
          @click="submit"
          :loading="loading"
          :disabled="!activeWorkId"
        >
          Next
        </ElButton>
      </div>
    </template>
  </ElDialog>
  <PublishDialog
    v-model:show="isShowPublish"
    :type="workType"
    :workId="activeWorkId!"
    :groupId="groupId"
  ></PublishDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import './css/publishParentDialog.scss';
import { useUserStore } from '/@/store/user';
import PublishDialogWorkflow from './PublishDialogWorkflow.vue';
import PublishDialog from './PublishDialog.vue';
import PublishDialogGroup from './PublishDialogGroup.vue';

defineOptions({
  name: 'PublishParentDialog',
});

const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);
function handleInput() {
  console.log(searchValue.value);
}
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const userInfo = useUserStore();

watch(
  () => props.show,
  (val) => {
    // 再次显示才重置，避免新增商品的时候没有值
    if (val) {
      activeTab.value = 'group';
      workType.value = 'group';
      activeWorkId.value = undefined;
    } else {
      searchValue.value = {
        workflow: '',
        group: '',
        plugins: '',
        widget: '',
      };
    }
  },
);

const isShowPublish = ref(false);
const loading = ref(false);
const activeTab = ref('group');
const workType = ref('group');
const searchValue = ref<Record<string, string>>({
  workflow: '',
  group: '',
  plugins: '',
  widget: '',
});
const groupId = ref<number | undefined>(undefined);
function handleTabClick(val: { props: { name: string | undefined } }) {
  workType.value = val.props.name || '';
  console.log(workType.value);
}

function close() {
  emit('update:show', false);
}
// 选中的商品id，可以是群或者工作流
const activeWorkId = ref<number | undefined>(undefined);

function handleCancel() {
  close();
}

function submit() {
  console.log(activeWorkId.value);
  console.log(groupId.value);
  if (activeWorkId.value !== undefined) {
    close();
    isShowPublish.value = true;
  }
}
function handleWorkflowChange(item: Eps.BaseSysUserEntity) {
  console.log(activeWorkId.value);
  // groupId.value = item.groupId;
}
</script>
