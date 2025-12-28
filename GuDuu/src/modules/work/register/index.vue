<template>
  <div class="register-bg">
    <div class="register-card">
      <!--  cosmac Logo -->
      <div v-if="appConfig.type == 'guduu'" class="register-logo">
        <img class="register-logo-img" :src="appConfig.logo" />
      </div>
      <!-- guduu Logo -->
      <div v-else class="register-logo">
        <BrandLogo class="register-logo-img" />
      </div>
      <template v-if="!showAdditionalInfo">
        <!-- Title -->
        <h2 class="register-title">Sign up for {{ appConfig.name }}</h2>
        <p class="register-subtitle">Create your {{ appConfig.name }} account</p>
        <!-- Form -->
        <form class="register-form" @submit.prevent="onSubmit">
          <template v-if="!isSendCode">
            <el-input v-model="email" placeholder="Email" class="form-input" type="email" clearable required />
            <el-input
              v-model="invitationCode"
              placeholder="Invitation code"
              class="form-input"
              clearable
              :readonly="hasInvitation"
            />
          </template>
          <template v-else>
            <el-input v-model="verificationCode" class="form-input" required placeholder="Verification code" />
          </template>
          <el-button type="primary" native-type="submit" class="register-btn" block :loading="isBtnLoading">{{
            isSendCode ? 'Verify code' : 'Send code'
          }}</el-button>
        </form>
      </template>
      <!-- 补充资料表单 -->
      <div v-else class="additional-info-form">
        <h3 class="register-title">
          <div class="register-title-back" @click="handleBack">
            <IMdiArrowBackCircle></IMdiArrowBackCircle>
          </div>
          Additional Information
        </h3>
        <el-form
          label-position="top"
          :model="additionalInfo"
          :rules="rules"
          ref="formRef"
          class="form"
          style="margin-top: 16px"
        >
          <el-form-item label="Avatar" prop="avatar">
            <ClUpload type="image" v-model="additionalInfo.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
              <div class="avatar-upload-wrap">
                <el-avatar :size="50" :src="additionalInfo.avatar">
                  <template v-if="!additionalInfo.avatar">
                    <IMdiCameraOutline></IMdiCameraOutline>
                  </template>
                </el-avatar>
              </div>
            </ClUpload>
          </el-form-item>
          <el-form-item label="Invitation code" prop="invitationCode" v-if="isNeedInviteCode">
            <el-input v-model="invitationCode" placeholder="Invitation code" class="form-input" clearable />
          </el-form-item>
          <el-form-item label="Nickname" prop="nickName">
            <el-input v-model="additionalInfo.nickName" placeholder="Enter your nickname" clearable />
          </el-form-item>
          <el-form-item label="Industry" prop="industryId">
            <el-select
              v-model="additionalInfo.industryId"
              placeholder="Select industry"
              class="industry-select"
              popper-class="register-select-pop"
              clearable
            >
              <el-option value="" label="Please select"></el-option>
              <el-option
                v-for="(item, index) in industryList"
                :value="item.value"
                :key="index"
                :label="item.label"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Password" prop="password">
            <el-input
              type="password"
              v-model="additionalInfo.password"
              placeholder="Enter password"
              clearable
              show-password
            />
          </el-form-item>
          <el-form-item label="Repeat Password" prop="password2">
            <el-input
              type="password"
              v-model="additionalInfo.password2"
              placeholder="Repeat password"
              clearable
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="register-btn" block :loading="isBtnLoading" @click="saveAdditionalInfo">
              Save
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- Divider -->
      <div class="register-divider" v-if="!showAdditionalInfo">
        <div class="register-divider-line"></div>
        <span class="register-divider-text">or</span>
        <div class="register-divider-line"></div>
      </div>
      <!-- Google Sign up -->
      <div class="register-google-login-wrap flex items-center" v-if="!showAdditionalInfo">
        <GoogleLogin :callback="googleCallback" prompt auto-login class=""> </GoogleLogin>
        <DiscordLogin @additionalInfoFn="additionalInfoFn" class="ml-[10px]"></DiscordLogin>
      </div>
      <!-- Login link -->
      <div class="register-login-link" v-if="!showAdditionalInfo">
        Already have an account?
        <router-link to="/login" class="register-login-anchor">Log in</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BrandLogo from '../components/brand-logo/BrandLogo.vue';
import { ElNotification, FormInstance } from 'element-plus';
import { service } from '/@/cool';
import { useRoute, useRouter } from 'vue-router';
import ClUpload from '/@/plugins/upload/components/upload.vue';
import { useDict } from '/@/modules/dict';
import { useStore } from '/@/store';
import guduuTitle from '/@/assets/logo-icon.svg';
import cosmacTitle from '/@/modules/work/login/static/egg-cracked-filled.svg';
import { setRegisterPageSEO } from '/@/utils/seo';
const { userStore } = useStore();
const route = useRoute();
const router = useRouter();
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { isSpecialDomain } from '/@/utils';
import DiscordLogin from '../login/components/discord-login.vue';
import { AVATAR_PREFIX_PATH } from '../util/const';

// 随机头像列表
const randomAvatars = AVATAR_PREFIX_PATH;
const email = ref('');

const invitationCode = ref<string>((route.query.invitation as string) || '');
const hasInvitation = ref<boolean>(!!route.query.invitation);
const isSendCode = ref(false);
const isBtnLoading = ref(false);
const verificationCode = ref('');
// 手动设置的额外信息显示
const focusSetAdditionalInfo = ref(false);
const showAdditionalInfo = computed(() => route.query?.isShowAdditionalInfo === '1' || focusSetAdditionalInfo.value);
const isApplyForProfile = computed(() => route.query?.type === 'applyForProfile' || false);
const isNeedInviteCode = computed(() => route.query?.isNeedInviteCode === '1');
const formRef = ref<FormInstance>();
const checkNickName = (rule: any, value: string, callback: any) => {
  console.log(isSpecialDomain(value));
  if (value === '') {
    callback(new Error('Please enter a nickname'));
  } else if (isSpecialDomain(value)) {
    callback(new Error('Nickname Contains the disabled name'));
  } else {
    callback();
  }
};
const rules = ref({
  avatar: [{ required: true, message: 'Please upload an avatar' }],
  nickName: [{ required: true, validator: checkNickName, trigger: 'blur' }],
  invitationCode: [{ required: true, message: 'Please enter a invitation code', trigger: 'blur' }],
  industryId: [{ required: true, message: 'Please select an industry', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter a password', trigger: 'blur' }],
  password2: [{ required: true, message: 'Please enter a password', trigger: 'blur' }],
});
const additionalInfo = ref({
  id: route.query?.id || '',
  avatar: '',
  nickName: '',
  industryId: '',
  password: '',
  password2: '',
});
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};
// 已经进入此页面，但是query?.id还更改的情况
watch(
  () => route.query?.id,
  async () => {
    additionalInfo.value.id = route.query?.id || '';
    if (!additionalInfo.value.avatar) {
      additionalInfo.value.avatar = await getRandomAvatarAndUpload();
    }
  },
);
watch(
  () => showAdditionalInfo.value,
  async () => {
    if (showAdditionalInfo.value && !additionalInfo.value.avatar) {
      additionalInfo.value.avatar = await getRandomAvatarAndUpload();
    }
  },
);
const { dict } = useDict();
const industryList = ref<any[]>([]);
dict.refresh().then(() => {
  industryList.value = dict.get('industry').value;
});

// any应该指定一个类型，base.open.verifyCode需要指明类型
const loginRes = ref<any>({});

const saveLoginToken = (res) => {
  localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
  localStorage.setItem('username', res.userInfo.name);
};
/**
 * 登录后回调，存储用户数据，跳转至个人主页
 *  */
const loginCallback = () => {
  saveLoginToken(loginRes.value);
  if (loginRes.value.token) {
    userStore.setToken({
      token: loginRes.value.token,
      expire: loginRes.value.expire,
      refreshToken: loginRes.value.refreshToken,
      refreshExpire: loginRes.value.refreshExpire,
    });
  }
  // 如果是申请团长跳转到 /apply_profile
  if (isApplyForProfile.value) {
    router.push('/apply_profile');
  } else {
    router.push('/workbench');
    // router.push('/work/personal-homepage/@' + loginRes.value.userInfo.name);
  }
};

const verifyCode = async () => {
  isBtnLoading.value = true;
  const res = await service.base.open.verifyCode({
    email: email.value,
    code: verificationCode.value,
  });
  isBtnLoading.value = false;

  if (res) {
    ElNotification({
      message: 'Verification successful',
    });

    focusSetAdditionalInfo.value = true;
    additionalInfo.value.id = res.userInfo.id;
    loginRes.value = res;

    // todo 下面应该删掉
    saveLoginToken(loginRes.value);
    userStore.setToken({
      token: loginRes.value.token,
      expire: loginRes.value.expire,
      refreshToken: loginRes.value.refreshToken,
      refreshExpire: loginRes.value.refreshExpire,
    });
    userStore.cacheLoginList(loginRes.value.userInfo, {
      token: loginRes.value.token,
      token_deadtime: loginRes.value.expire,
      refreshToken: loginRes.value.refreshToken,
      refreshToken_deadtime: loginRes.value.refreshExpire,
    });
  } else {
    ElNotification({
      message: 'Incorrect verification code',
    });
  }
};

const { googleCallback } = useGoogleLogin({
  additionalInfoFn: (res) => {
    if (isApplyForProfile.value) {
      router.push('/apply_profile');
      return;
    }
    console.log('res', res);
    focusSetAdditionalInfo.value = true;
    additionalInfo.value.id = res.userInfo.id;
    loginRes.value = res;
  },
});
const additionalInfoFn = (res: { userInfo: Eps.BaseSysUserEntity }) => {
  console.log('res', res);
  focusSetAdditionalInfo.value = true;
  additionalInfo.value.id = (res.userInfo.id || '') as string;
  loginRes.value = res;
};
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

onMounted(() => {
  // 设置注册页SEO
  setRegisterPageSEO();
});
async function onSubmit() {
  if (isSendCode.value) {
    verifyCode();
    return;
  }
  if (!email.value) {
    ElNotification({
      message: 'Please enter your email',
    });
    return;
  }
  if (!isValidEmail(email.value)) {
    ElNotification({
      message: 'Please enter a valid email',
    });
    return;
  }
  isBtnLoading.value = true;
  try {
    const exist = await service.base.open.exist({ email: email.value });
    if (exist) {
      ElNotification({
        message: 'This email already exists',
      });
      return;
    }
    const teamInvitation = route.query.teamInvitation;

    await service.base.open.sendCode({
      email: email.value,
      invitation: encodeURIComponent(invitationCode.value),
      teamInvitation,
    });
    ElNotification({
      message: 'Verification code sent',
    });
    isSendCode.value = true;
  } catch (error) {
    console.error('Registration error:', error);
    // 错误处理可以根据需要添加通知
  } finally {
    isBtnLoading.value = false;
  }
}

const saveAdditionalInfo = async () => {
  await formRef.value?.validate();
  // if (additionalInfo.value.avatar === '') {
  //   ElNotification({
  //     message: 'Please upload an avatar',
  //   });
  //   return;
  // }
  // if (additionalInfo.value.nickName === '') {
  //   ElNotification({
  //     message: 'Please enter a nickname',
  //   });
  //   return;
  // }
  // if (isNeedInviteCode.value && !invitationCode.value) {
  //   ElNotification({
  //     message: 'Please enter a invitation code',
  //   });
  //   return;
  // }
  // if (additionalInfo.value.industryId == '0') {
  //   ElNotification({
  //     message: 'Please select an industry',
  //   });
  //   return;
  // }
  if (additionalInfo.value.password === '') {
    ElNotification({
      message: 'Please enter a password',
    });
    return;
  }
  if (additionalInfo.value.password !== additionalInfo.value.password2) {
    ElNotification({
      message: 'The two passwords are inconsistent',
    });
    return;
  }
  isBtnLoading.value = true;
  const exist = await service.base.sys.user.isExist({ name: additionalInfo.value.nickName });
  if (exist) {
    ElNotification({
      message: 'The username already exists',
    });
    isBtnLoading.value = false;
    return;
  }

  await service.base.sys.user
    .additionalInfo({ ...additionalInfo.value, name: additionalInfo.value.nickName, inviteCode: invitationCode.value })
    .finally(() => {
      isBtnLoading.value = false;
    });
  ElNotification({
    message: 'Saved',
  });
  await userStore.get();
  console.log('userStore.infouserStore.infouserStore.info', userStore.info);
  loginRes.value.userInfo = userStore.info;
  loginCallback();
};

const handleBack = () => {
  focusSetAdditionalInfo.value = false;
  const query = JSON.parse(JSON.stringify(route.query));
  query.isShowAdditionalInfo = '0';
  router.push({
    query,
  });
};
onMounted(async () => {
  if (!additionalInfo.value.avatar) {
    additionalInfo.value.avatar = await getRandomAvatarAndUpload();
  }
});
</script>

<style scoped lang="scss">
.register-bg {
  @apply min-h-screen flex items-center justify-center bg-gray-50;
}
.register-card {
  @apply w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center;
}
.register-logo {
  @apply mb-6;
}
.register-logo-img {
  width: 64px;
  height: 64px;
}
.register-title {
  position: relative;
  padding-left: 24px;
  @apply text-2xl font-bold text-gray-900 mb-2 text-center;
}

.register-title-back {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 10px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #000;
  }
}

.register-subtitle {
  @apply text-gray-500 text-sm mb-6;
}
.register-form {
  @apply w-full flex flex-col gap-4;
}
.form-input {
  @apply w-full rounded-lg transition;
}
:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  padding: 0.5rem 1rem;
  background: #fff;
}
:deep(:is(.el-input__wrapper, .el-select__wrapper):is(.is-focus, .is-focused)) {
  box-shadow: 0 0 0 1px #000;
  border: 1px solid #000;
}
.register-btn {
  @apply w-full bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition;
  border: none;
  height: 48px;
}
.register-divider {
  @apply flex items-center w-full my-6;
}
.register-divider-line {
  @apply flex-1 h-px bg-gray-200;
}
.register-divider-text {
  @apply mx-4 text-gray-400 text-xs;
}
.register-google-btn {
  @apply w-full flex items-center justify-center border border-gray-200 rounded-lg py-2 font-medium hover:bg-gray-50 transition mb-4;
  height: 48px;
}
.register-google-icon {
  @apply h-5 w-5 mr-2;
}
.register-login-link {
  @apply text-sm text-gray-500 mt-2;
}
.register-login-anchor {
  @apply text-black font-medium hover:underline;
}

.additional-info-form {
  @apply w-full flex flex-col gap-4 justify-center;
}

.industry-select {
  :deep(.el-select__wrapper) {
    height: 48px;
    min-height: 48px;
    align-items: center;
  }

  :deep(.el-select-dropdown__item.is-selected) {
    color: #000;
  }
}
.avatar-upload-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  position: relative;
  cursor: pointer;
}

.avatar-upload-icon {
  font-size: 24px;
  color: #bdbdbd;
  transition: color 0.2s;
}

.avatar-upload-wrap:hover .avatar-upload-icon {
  color: #409eff;
}
</style>
<style lang="scss">
.register-select-pop {
  .el-select-dropdown__item.is-selected {
    color: #000;
  }
}

.register-google-login-wrap {
  width: 100%;
  .g-btn-wrapper {
    width: 100%;
  }

  .g-btn {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
