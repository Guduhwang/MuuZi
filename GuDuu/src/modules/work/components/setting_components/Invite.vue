<template>
  <div class="invite-wrap">
    <el-form class="detail-form" v-if="userInfo !== null" label-width="120px" label-position="top">
      <!-- <el-form-item v-if="userInfo.invitationShortUrl" label="Invitation Link">
      {{ userInfo.invitationShortUrl }}
       <el-input :value="path + '?invitation=' + userInfo.key" />
    </el-form-item> -->
      <el-form-item label="Invitation Link">
        <div v-if="userInfo.invitationShortUrl" class="flex items-center justify-between w-full">
          {{ userInfo.invitationShortUrl }}
          <el-button round plain type="primary" class="" @click="copyToClipboard(userInfo.invitationShortUrl)">
            Copy
          </el-button>
        </div>
        <div v-else class="flex items-center justify-between w-full">
          {{ getInvitationCode() }}
          <el-button round plain type="primary" class="" @click="copyToClipboard(getInvitationCode())">
            Copy
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="Invitation Code">
        <div class="flex items-center justify-between w-full">
          {{ userInfo.key }}
          <el-button round plain type="primary" class="" @click="copyToClipboard(userInfo.key)"> Copy </el-button>
        </div>
      </el-form-item>
    </el-form>
    <el-table :data="inviteList" style="width: 100%">
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="avatar" label="Avatar"
        ><template #default="scope"><el-avatar shape="square" :size="30" :src="scope.row.avatar" /></template
      ></el-table-column>
      <el-table-column prop="email" label="Email" />

      <el-table-column prop="createTime" label="Joined At" />
      <template #empty>
        <NoData />
      </template>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
import NoData from '../no-data/NoData.vue';
import { onMounted, ref } from 'vue';
import { useCool } from '/@/cool';
import { useRoute } from 'vue-router';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
const { userStore, invite } = useStore();
const { service } = useCool();
const route = useRoute();
const path = `${window.location.origin}${route.path}`;
const { info: userInfo } = storeToRefs(userStore);
const { inviteList } = storeToRefs(invite);

const getInvitationCode = () => {
  const domain: string = window.location.origin;
  const url = `${domain}/register?invitation=${userInfo.value?.key}`;
  return url;
};
const copyToClipboard = (textToCopy?: string) => {
  if (!textToCopy) {
    textToCopy = getInvitationCode();
  }
  // navigator clipboard 需要https等安全上下文
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard 向剪贴板写文本
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // 创建text area
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    // 使text area不在viewport，同时设置不可见
    textArea.style.position = 'absolute';
    textArea.style.opacity = 0;
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // 执行复制命令并移除文本框
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
    });
  }
};
onMounted(async () => {
  invite.refresh();
});
</script>
<style lang="scss" scoped>
.invite-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
</style>
