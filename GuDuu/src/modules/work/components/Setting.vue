<template>
  <el-dialog
    :model-value="show"
    title="Settings"
    width="1000"
    @close="handleClose"
    height="500"
    class="setting-dialog"
    append-to-body
    :z-index="99"
  >
    <div class="setting-wrap">
      <el-tabs v-model="activeTab" class="setting-tabs" @tab-change="handleTabChange" tabPosition="left">
        <el-tab-pane label="Personal Info" name="Personal info">
          <Personal />
        </el-tab-pane>
        <el-tab-pane label="Invite&Invite & Share" name="Invite"> <Invite /></el-tab-pane>
        <el-tab-pane label="Groups" name="Groups"><Groups /></el-tab-pane>
        <el-tab-pane label="Avatar" name="Members"><Members /></el-tab-pane>
        <el-tab-pane label="Workspace" name="Desktops"><Desktops /></el-tab-pane>
        <!-- <el-tab-pane label="Teams" name="Teams"><Teams /></el-tab-pane> -->
        <el-tab-pane label="Embed Code" name="EmbedCode">
          <div class="embed-code-wrap">
            <div class="mb-[16px] text-right">
              <el-button @click="saveCodes">Save</el-button>
            </div>
            <el-input v-model="embedCodes" :rows="12" type="textarea" placeholder="Paste your embed code here..." />
          </div>
        </el-tab-pane>
        <el-tab-pane label="Lifetime Pass" name="NFT"><NFT /></el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch, provide, toRef } from 'vue';

import { useStore } from '/@/store';
import { useCool } from '/@/cool';
import { useUserStore } from '/@/store/user';
import Desktops from './setting_components/Desktops.vue';
import Groups from './setting_components/Groups.vue';
import Members from './setting_components/Members.vue';
import Invite from './setting_components/Invite.vue';
import Personal from './setting_components/Personal.vue';
import NFT from './setting_components/NFT.vue';
import Teams from './setting_components/Teams.vue';

const userStore = useUserStore();

const { groupStore, memberStore } = useStore();
const { service } = useCool();
const activeTab = ref('Personal info');

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

provide('settingShow', toRef(props, 'show'));

const emit = defineEmits<{
  'update:show': [boolean];
}>();

const handleClose = () => {
  emit('update:show', false);
};
// 嵌入代码以后抽离组件
const embedCodes = ref('');

watch(
  () => userStore.info?.serviceCode,
  (val) => {
    if (val) {
      embedCodes.value = val;
    }
  },
  {
    immediate: true,
  },
);

async function saveCodes() {
  await service.base.sys.user.update({
    id: userStore.info?.id,
    serviceCode: embedCodes.value,
  });
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  // 刷新组件数据
  if (tab === 'Groups') {
    groupStore.refreshAllGroupList();
  } else if (tab === 'Members') {
    memberStore.refresh();
  }
};

onMounted(async () => {});
</script>
<style scoped lang="scss">
.setting-wrap {
  // --el-color-primary: #000;

  // background-color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  border-radius: 10px;
}

.setting-tabs {
}
:deep(.form-wrap) {
  padding: 20px;
  border-radius: 10px;
  background-color: #fff;
}
.embed-code-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
</style>
