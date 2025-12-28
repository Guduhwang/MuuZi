<template>
  <ElDialog
    :modelValue="show"
    width="647px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <div class="apply-team-bg">
      <div class="apply-team-card">
        <!--  cosmac Logo -->
        <div v-if="appConfig.type == 'guduu'" class="apply-team-logo">
          <img class="apply-team-logo-img" :src="appConfig.logo" />
        </div>
        <!-- guduu Logo -->
        <div v-else class="apply-team-logo">
          <BrandLogo class="apply-team-logo-img" />
        </div>
        <div class="apply-team-title">
          <h3>Apply as Creator</h3>
        </div>
        <el-form class="w-full" label-width="auto">
          <el-form-item label="Social media links">
            <el-input v-model="data.otherSocialMediaLink" placeholder="Enter your social media links" />
            <span class="text-gray-400 text-sm"> Recommend: Twitter, YouTube, etc. </span>
          </el-form-item>
          <!-- <el-form-item label="Twitter链接">
            <el-input v-model="data.twitterLink" />
          </el-form-item>
          <el-form-item label="YouTube链接">
            <el-input v-model="data.youtubeLink" />
          </el-form-item>
          <el-form-item label="TikTok/抖音链接">
            <el-input v-model="data.tiktokLink" />
          </el-form-item>
          <el-form-item label="其他">
            <el-input v-model="data.otherSocialMediaLink" />
          </el-form-item>
          <el-form-item label="Twitter">
            <el-input v-model="data.twitterFollowers" />
          </el-form-item>
          <el-form-item label="YouTube">
            <el-input v-model="data.youtubeFollowers" />
          </el-form-item>
          <el-form-item label="TikTok/抖音">
            <el-input v-model="data.tiktokFollowers" />
          </el-form-item>
          <el-form-item label="其他">
            <el-input v-model="data.otherSocialMediaFollowers" />
          </el-form-item> -->
          <el-form-item label="Reason for application">
            <el-input v-model="data.reason" :rows="6" placeholder="Enter your reason for application" type="textarea" />
          </el-form-item>
          <div class="text-sm text-gray-500 text-center mb-4 p-[0 60px]">
            Once your application is approved, you will be removed from all existing groups and granted your own
            dedicated group and group leader.
          </div>
        </el-form>
        <el-button block class="apply-team-btn" @click="submit()" :loading="isBtnLoading">Submit</el-button>
      </div>
    </div>
  </ElDialog>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import guduuTitle from '/@/assets/logo-icon.svg';
import cosmacTitle from '/@/modules/work/login/static/egg-cracked-filled.svg';
import { useCool } from '/@/cool';
const { service } = useCool();
const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();
const router = useRouter();
const initData = {
  twitterLink: '',
  youtubeLink: '',
  tiktokLink: '',
  otherSocialMediaLink: '',
  twitterFollowers: '',
  youtubeFollowers: '',
  tiktokFollowers: '',
  otherSocialMediaFollowers: '',
  reason: '',
};
const isBtnLoading = ref(false);
const appConfig = computed(() => {
  const domain = window.location.hostname;
  if (domain.includes('guduu.co')) {
    return {
      type: 'guduu',
      name: 'GuDuu OS',
      logo: guduuTitle,
    };
  }
  return {
    type: 'default',
    name: 'CosMac',
    logo: cosmacTitle,
  };
});
const data = ref({
  ...initData,
});

const submit = async () => {
  if (data.value.reason === '') {
    ElNotification({
      type: 'error',
      message: '请输入申请理由',
    });
    return;
  }
  try {
    isBtnLoading.value = true;
    const res = await service.base.personalPageApplication.submit({ ...data.value });
    ElNotification({
      type: 'success',
      message: '申请已经提交',
    });
    data.value = { ...initData };
    isBtnLoading.value = false;
    emit('update:show', false);
  } catch (e) {
    let message = (e as Error).message;
    if (message.includes('已提交过申请，请不要重复提交')) {
      message = '已提交过申请，请联系管理员进行审批';
    }
    ElNotification({
      type: 'error',
      message,
    });
    isBtnLoading.value = false;
    emit('update:show', false);
  }
};
</script>
<style scoped lang="scss">
.apply-team-bg {
  @apply flex items-center justify-center;
}
.apply-team-card {
  @apply w-full  rounded-2xl flex flex-col items-center;
}
.apply-team-logo {
  @apply mb-6;
}
.apply-team-logo-img {
  width: 64px;
  height: 64px;
}
.apply-team-title {
  @apply text-2xl font-bold mb-8;
}
.apply-team-btn {
  @apply w-[200px] bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition;
  border: none;
  height: 48px;
}
</style>
