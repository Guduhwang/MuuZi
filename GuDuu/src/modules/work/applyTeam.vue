<template>
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
        <h3>Apply for Team</h3>
      </div>
      <el-form class="w-full" label-width="auto">
        <el-form-item label="Twitter Link">
          <el-input v-model="data.twitterLink" />
        </el-form-item>
        <el-form-item label="YouTube Link">
          <el-input v-model="data.youtubeLink" />
        </el-form-item>
        <el-form-item label="TikTok/DouYin Link">
          <el-input v-model="data.tiktokLink" />
        </el-form-item>
        <el-form-item label="Other">
          <el-input v-model="data.otherSocialMediaLink" />
        </el-form-item>
        <el-form-item label="Twitter">
          <el-input v-model="data.twitterFollowers" />
        </el-form-item>
        <el-form-item label="YouTube">
          <el-input v-model="data.youtubeFollowers" />
        </el-form-item>
        <el-form-item label="TikTok/DouYin">
          <el-input v-model="data.tiktokFollowers" />
        </el-form-item>
        <el-form-item label="Other">
          <el-input v-model="data.otherSocialMediaFollowers" />
        </el-form-item>
        <el-form-item label="Application Reason (Core Content)">
          <el-input v-model="data.reason" type="textarea" />
        </el-form-item>
      </el-form>
      <el-button block class="apply-team-btn" @click="submit()" :loading="isBtnLoading">Submit</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import guduuTitle from '/@/assets/logo-icon.svg';
import cosmacTitle from '/@/modules/work/login/static/egg-cracked-filled.svg';
import { useCool } from '/@/cool';
const { service } = useCool();

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
      message: 'Please enter application reason',
    });
    return;
  }
  try {
    isBtnLoading.value = true;
    const res = await service.base.personalPageApplication.submit({ ...data.value });
    ElNotification({
      message: 'Application has been submitted',
    });
    data.value = { ...initData };
    isBtnLoading.value = false;
    router.push('/workbench');
  } catch (e) {
    ElNotification({
      message: (e as Error).message,
    });
    isBtnLoading.value = false;
  }
};
</script>
<style scoped lang="scss">
.apply-team-bg {
  @apply min-h-screen flex items-center justify-center bg-gray-50;
}
.apply-team-card {
  @apply w-full max-w-[600px] bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center;
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
