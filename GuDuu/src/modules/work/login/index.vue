<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { ElNotification, FormInstance } from 'element-plus';
import { useDict } from '/$/dict';
const { dict } = useDict();
import { useCool } from '/@/cool';
const { service, router } = useCool();
import { useStore } from '/@/store';
const { resetAllStore, userStore } = useStore();
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import guduuTitle from '/@/assets/logo-white.svg';
import cosmacTitle from '/@/assets/cosmac-logo.png';
import DiscordLogin from './components/discord-login.vue';
import { setLoginPageSEO } from '/@/utils/seo';
// import eggLogo from '../../../assets/acosmac-logo.png';
import LoginTab from './components/login-tab.vue';
import { isSpecialDomain } from '/@/utils';
import { useRoute, useRouter } from 'vue-router';
import DynamicTag from '../components/dynamic-tag/DynamicTag.vue';
import { AVATAR_PREFIX_PATH } from '../util/const';
import { useBase } from '/$/base';
import { useSiteStore } from '/@/store/site';
const siteStore = useSiteStore();

const { app } = useBase();

const route = useRoute();
// 随机头像列表
const randomAvatars = AVATAR_PREFIX_PATH;
const tabList = ref([
  {
    label: 'Sign In',
    value: 'signIn',
  },
  {
    label: 'Sign Up',
    value: 'signUp',
  },
  {
    label: 'Reset Password',
    value: 'resetPassword',
  },
]);
const isMobileFlag = ref(false);
const activeTab = ref('signIn');
const isAdditionalInfoStep1 = ref(true);
const showAdditionalInfo = ref(false);
const additionalInfo = ref({
  id: 0,
  avatar: '',
  nickName: '',
  industryId: '',
  password: '',
  password2: '',
  invitationCode: '',
});
// 获取url参数
const getUrlParams = (name: string) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
};

const { googleCallback } = useGoogleLogin({
  additionalInfoFn: async ({ userInfo }) => {
    // 补充信息
    additionalInfo.value.id = userInfo.id || 0;
    // 默认头像
    additionalInfo.value.avatar = await getRandomAvatarAndUpload();
    isNeedInviteCode.value = true;
    showAdditionalInfo.value = true;
  },
});
const additionalInfoFn = async ({ userInfo }: { userInfo: Eps.BaseSysUserEntity }) => {
  // 补充信息
  additionalInfo.value.id = userInfo.id || 0;
  // 默认头像
  additionalInfo.value.avatar = await getRandomAvatarAndUpload();
  isNeedInviteCode.value = true;
  showAdditionalInfo.value = true;
};

// 手动设置的额外信息显示
const focusSetAdditionalInfo = ref(false);
const hasInviteCode = ref(false);
const isNeedInviteCode = ref(false);
const loginInfo = ref({ email: '', password: '' });
// any应该指定一个类型，base.open.verifyCode需要指明类型
const loginRes = ref<any>({});
const signupInfo = ref({
  email: '',
  invitationCode: '',
  verificationCode: '',
});
const resetPasswordInfo = ref({
  email: '',
  verificationCode: '',
  password: '',
  password2: '',
});
const isSendCode = ref(true);
const resetPasswordOffset = ref(0);
const isBtnLoading = ref(false);
const resetBtnText = ref('Send verification code');
dict.refresh();

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

const login = async () => {
  const email = loginInfo.value.email.trim();
  if (!email) {
    ElNotification({
      message: 'Please enter your email',
    });
    return;
  }
  if (!isValidEmail(email)) {
    ElNotification({
      message: 'Please enter a valid email',
    });
    return;
  }
  const password = loginInfo.value.password.trim();
  if (!password) {
    ElNotification({
      message: 'Please enter your password',
    });
    return;
  }
  try {
    const res = await service.base.open.loginByEmail({
      email,
      password,
    });
    // 暂时在这里清理,以后优化
    resetAllStore();
    ElNotification({
      message: 'Login successful',
    });
    saveLoginToken(res);
    userStore.setToken({
      token: res.token,
      expire: res.expire,
      refreshToken: res.refreshToken,
      refreshExpire: res.refreshExpire,
    });
    userStore.set(res.userInfo);
    userStore.cacheLoginList(res.userInfo, {
      token: res.token,
      token_deadtime: res.expire,
      refreshToken: res.refreshToken,
      refreshToken_deadtime: res.refreshExpire,
    });
    // router.push('/work/personal-homepage/@' + res.userInfo.name);
    router.push('/workbench');
    // 每次登录检测此用户NFT是否已经质押
    await service.base.sys.user.isNftStacked();
  } catch (e) {
    ElNotification({
      message: e.message,
    });
  }
};
const industrys = ref<number[]>([]);
const industryList = ref<any[]>([]);
dict.refresh().then(() => {
  industryList.value = dict.get('industry').value;
});
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
    userStore.cacheLoginList(loginRes.value.userInfo, {
      token: loginRes.value.token,
      token_deadtime: loginRes.value.expire,
      refreshToken: loginRes.value.refreshToken,
      refreshToken_deadtime: loginRes.value.refreshExpire,
    });
  }
  router.replace('/workbench').then(() => {
    window.location.reload();
  });
};
function toRegister() {
  router.push('/register');
}

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

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
onMounted(async () => {
  // 更新网站信息
  try {
    await siteStore.getInfo();
  } catch (error) {
    console.error('获取网站信息失败', error);
  }
  // 判断是否是手机端访问
  if (isMobile()) {
    isMobileFlag.value = true;
  }
  // 设置登录页SEO
  setLoginPageSEO();
  // 获取url参数
  const invitation = getUrlParams('invitation');
  if (invitation) {
    signupInfo.value.invitationCode = invitation;
    activeTab.value = 'signUp';
    hasInviteCode.value = true;
    isNeedInviteCode.value = true;
  }
});
const handleTabChange = (value: string) => {
  activeTab.value = value;
};
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};
const verifyCode = async () => {
  isBtnLoading.value = true;
  const res = await service.base.open.verifyCode({
    email: signupInfo.value.email,
    code: signupInfo.value.verificationCode,
  });
  isBtnLoading.value = false;

  if (res) {
    ElNotification({
      message: 'Verification successful',
    });

    additionalInfo.value.id = res.userInfo.id;
    loginRes.value = res;

    // todo 下面应该删掉

    // 补充资料
    showAdditionalInfo.value = true;
    // 默认头像
    additionalInfo.value.avatar = await getRandomAvatarAndUpload();
    // 同步 invitationCode 从 signupInfo 到 additionalInfo
    if (signupInfo.value.invitationCode) {
      additionalInfo.value.invitationCode = signupInfo.value.invitationCode;
    }

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
const handleSendCode = async () => {
  if (!isSendCode.value) {
    verifyCode();
    return;
  }
  if (!signupInfo.value.email) {
    ElNotification({
      message: 'Please enter your email',
    });
    return;
  }
  if (!isValidEmail(signupInfo.value.email)) {
    ElNotification({
      message: 'Please enter a valid email',
    });
    return;
  }
  if (!signupInfo.value.invitationCode) {
    ElNotification({
      message: 'Please enter your invitation code',
    });
    return;
  }
  isBtnLoading.value = true;
  try {
    const exist = await service.base.open.exist({ email: signupInfo.value.email });
    if (exist) {
      ElNotification({
        message: 'This email already exists',
      });
      return;
    }
    // teamInvitation 这个字段暂时没用
    const teamInvitation = route.query.teamInvitation;

    await service.base.open.sendCode({
      email: signupInfo.value.email,
      invitation: encodeURIComponent(signupInfo.value.invitationCode),
      teamInvitation,
    });
    ElNotification({
      message: 'Verification code sent',
    });
    isSendCode.value = false;
  } catch (error) {
    console.error('Send code error:', error);
    // 错误处理可以根据需要添加通知
  } finally {
    isBtnLoading.value = false;
  }
};
const time = ref(60);
const handleSendCodeResetPassword = async () => {
  if (resetPasswordOffset.value === 0) {
    isBtnLoading.value = true;
    if (!resetPasswordInfo.value.email) {
      ElNotification({
        message: 'Please enter your email',
      });
      return;
    }
    if (!isValidEmail(resetPasswordInfo.value.email)) {
      ElNotification({
        message: 'Please enter a valid email',
      });
      return;
    }
    const res = await service.base.sys.user.sendResetPasswordCode({
      email: resetPasswordInfo.value.email,
    });
    isBtnLoading.value = false;
    resetBtnText.value = time.value + 's';
    time.value = 60;
    const timer = setInterval(() => {
      time.value--;
      resetBtnText.value = time.value + 's';
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      resetBtnText.value = 'Send verification code';
    }, 60000);
    if (res) {
      resetPasswordOffset.value = 1;
      ElNotification({
        message: 'Verification code sent',
      });
    }
    return;
  }
  if (resetPasswordOffset.value === 1) {
    if (!resetPasswordInfo.value.verificationCode) {
      ElNotification({
        message: 'Please enter the verification code',
      });
      return;
    }
    resetPasswordOffset.value = 2;
  }
  if (resetPasswordOffset.value === 2) {
    if (!resetPasswordInfo.value.password) {
      ElNotification({
        message: 'Please enter the new password',
      });
      return;
    }
    if (!resetPasswordInfo.value.password2) {
      ElNotification({
        message: 'Please enter the repeat new password',
      });
      return;
    }
    if (resetPasswordInfo.value.password !== resetPasswordInfo.value.password2) {
      ElNotification({
        message: 'The two passwords are inconsistent',
      });
      return;
    }
    isBtnLoading.value = true;
    const res = await service.base.sys.user.resetPassword({
      email: resetPasswordInfo.value.email,
      code: resetPasswordInfo.value.verificationCode,
      password: resetPasswordInfo.value.password,
    });
    if (res) {
      ElNotification({
        message: 'Password reset successfully',
      });
      isBtnLoading.value = false;
    }
    // 跳转到登陆
    activeTab.value = 'signIn';
    resetPasswordOffset.value = 0;
    return;
  }
};

const handleGoBack = () => {
  resetPasswordOffset.value = resetPasswordOffset.value - 1;
  // resetBtnText.value = 'Send verification code';
};
const handleGoBackSignUp = () => {
  isSendCode.value = true;
};
const handleGoBackAdditionalInfo = () => {
  isAdditionalInfoStep1.value = true;
  showAdditionalInfo.value = true;
};
const addtionalFormRef = ref<FormInstance>();
const handleNext = async () => {
  if (isAdditionalInfoStep1.value) {
    if (additionalInfo.value.nickName === '') {
      ElNotification({
        message: 'Please enter a nickname',
      });
      return;
    }
    isBtnLoading.value = true;
    const exist = await service.base.sys.user.isExist({
      name: additionalInfo.value.nickName,
    });
    isBtnLoading.value = false;
    if (exist) {
      ElNotification({
        message: 'The username already exists',
      });
      return;
    }
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
    isAdditionalInfoStep1.value = false;
  } else {
    if (industrys.value.length === 0) {
      ElNotification({
        message: 'Please select an industry',
      });
      return;
    }
    isBtnLoading.value = true;
    // const industryId = industrys.value.join(',');
    try {
      await service.base.sys.user.additionalInfo({
        ...additionalInfo.value,
        industryId: industrys.value,
        name: additionalInfo.value.nickName,
        inviteCode: signupInfo.value.invitationCode || additionalInfo.value.invitationCode,
      });
    } catch (error) {
      console.error('Additional info error:', error);
      ElNotification({
        message: 'Failed to save additional information',
      });
    } finally {
      isBtnLoading.value = false;
    }
    ElNotification({
      message: 'Saved',
    });
    await userStore.get();
    console.log('userStore.infouserStore.infouserStore.info', userStore.info);
    loginRes.value.userInfo = userStore.info;

    loginCallback();
  }
};

const googleLoginRef = ref(null);

function triggerGoogleLogin() {
  // 找到 GoogleLogin 组件渲染出来的元素并触发点击
  const btn = googleLoginRef.value?.$el?.querySelector('div[role=button], button');
  if (btn) {
    btn.click();
  } else {
    console.error('未找到 GoogleLogin 按钮元素');
  }
}
</script>

<template>
  <div class="page-login" :class="{ 'mobile-login': isMobileFlag || app.isShowLive }">
    <div class="bg-left"></div>
    <div class="bg hidden-sm-and-down">
      <!-- <div class="bg-title-wrap" v-if="appConfig.type === 'default'">
        <div class="bg-title-img-wrap-guduu">
          <img class="bg-title-img" :src="appConfig.logo" />
        </div>
        <div class="bg-title">
          <span>X2MU</span>
          <span class="active">AI</span>
        </div> 
      </div> -->
      <div class="bg-title-wrap">
        <div class="bg-title-img-wrap-guduu">
          <!-- <img class="bg-title-img" :src="appConfig.logo" /> -->
          <img class="bg-title-img" :src="siteStore.info?.loginLogo" />
        </div>
      </div>
      <div class="bg-pic">
        <img src="./static/user.png" />
      </div>
      <div class="bg-cnt">
        <div class="bg-cnt-bracket-left">
          <img src="./static/bracket-left.svg" />
        </div>
        <!-- <div class="bg-cnt-block">
          "Since I started using {{ siteStore.info?.siteName }}, I've been saving at least two hours of work every day.
          That means I can shut down my computer on time, have dinner with my kids, read them bedtime stories, and no
          longer stay up late dealing with content and tasks."
        </div> -->
        <div v-html="siteStore.info?.loginIntro" class="bg-cnt-block"></div>
        <div class="bg-cnt-bracket-right">
          <img src="./static/bracket-right.svg" />
        </div>
        <!-- <div class="bg-cnt-name">A real testimonial from a creator ————</div> -->
      </div>
    </div>
    <div class="box">
      <div class="arrow-left">
        <img src="./static/arrow.svg" alt="" />
      </div>
      <div class="relative">
        <div class="box-group">
          <img src="./static/Group_10.svg" alt="" />
        </div>
        <div v-if="!showAdditionalInfo" class="section-form">
          <div class="title">Welcome to {{ siteStore.info?.siteName }}</div>
          <LoginTab
            class="mb-[40px] pl-[10px]"
            :tabList="tabList"
            v-model:activeTab="activeTab"
            @change="handleTabChange"
          />
          <div class="sign-in-form" v-if="activeTab === 'signIn'">
            <el-form class="form">
              <el-form-item class="relative" label="Email">
                <el-input size="large" v-model="loginInfo.email" maxlength="200" @keyup.enter="login" />
              </el-form-item>

              <el-form-item class="relative" label="Password">
                <el-input
                  size="large"
                  v-model="loginInfo.password"
                  type="password"
                  maxlength="200"
                  show-password
                  autocomplete="new-password"
                  @keyup.enter="login"
                />
              </el-form-item>
              <div class="op">
                <el-button type="primary" size="large" @click="login"> Sign In </el-button>
              </div>
            </el-form>
          </div>
          <div class="sign-in-form" v-if="activeTab === 'signUp'">
            <el-form label-position="top" class="form">
              <template v-if="isSendCode">
                <el-form-item class="relative" label="Email">
                  <el-input size="large" v-model="signupInfo.email" maxlength="200" @keyup.enter="handleSendCode" />
                </el-form-item>

                <el-form-item class="relative" label="Invitation Code">
                  <el-input
                    size="large"
                    :disabled="hasInviteCode"
                    v-model="signupInfo.invitationCode"
                    maxlength="200"
                    @keyup.enter="handleSendCode"
                  />
                </el-form-item>
              </template>
              <template v-else>
                <el-button class="mb-[24px]" type="primary" link size="large" @click="handleGoBackSignUp">
                  <IMdiLightArrowLeft />
                  Go back
                </el-button>
                <el-form-item class="relative" label="Verification code">
                  <el-input size="large" v-model="signupInfo.verificationCode" clearable />
                </el-form-item>
              </template>
              <div class="op">
                <el-button type="primary" size="large" :loading="isBtnLoading" @click="handleSendCode">{{
                  isSendCode ? 'Send code' : 'Verify code'
                }}</el-button>
              </div>
            </el-form>
          </div>
          <div class="sign-in-form" v-if="activeTab === 'resetPassword'">
            <el-form class="form">
              <template v-if="resetPasswordOffset === 0">
                <el-form-item class="relative" label="Email">
                  <el-input size="large" v-model="resetPasswordInfo.email" maxlength="200" />
                </el-form-item>
                <el-button
                  class="w-full mt-[22px]"
                  type="primary"
                  size="large"
                  :disabled="!resetBtnText.includes('Send verification code')"
                  :loading="isBtnLoading"
                  @click="handleSendCodeResetPassword"
                  >{{ resetBtnText }}</el-button
                >
              </template>
              <template v-else-if="resetPasswordOffset === 1">
                <el-button class="mb-[24px]" type="primary" link size="large" @click="handleGoBack">
                  <IMdiLightArrowLeft />
                  Go back
                </el-button>
                <el-form-item class="relative">
                  <el-input
                    size="large"
                    placeholder="Please enter the verification code"
                    v-model="resetPasswordInfo.verificationCode"
                    clearable
                  />
                </el-form-item>
                <el-button
                  class="w-full mt-[22px]"
                  type="primary"
                  size="large"
                  :loading="isBtnLoading"
                  @click="handleSendCodeResetPassword"
                  >Next</el-button
                >
              </template>
              <template v-else-if="resetPasswordOffset === 2">
                <el-button class="mb-[24px]" type="primary" link size="large" @click="handleGoBack">
                  <IMdiLightArrowLeft />
                  Go back
                </el-button>
                <el-form-item class="relative">
                  <el-input
                    type="password"
                    size="large"
                    placeholder="New password"
                    v-model="resetPasswordInfo.password"
                    clearable
                    show-password
                  />
                </el-form-item>
                <el-form-item class="relative">
                  <el-input
                    type="password"
                    size="large"
                    placeholder="Repeat new password"
                    v-model="resetPasswordInfo.password2"
                    clearable
                    show-password
                  />
                </el-form-item>
                <el-button
                  class="w-full mt-[22px]"
                  type="primary"
                  size="large"
                  :loading="isBtnLoading"
                  @click="handleSendCodeResetPassword"
                  >Reset password</el-button
                >
              </template>
            </el-form>
          </div>
          <div class="mt-[24px] text-[#737373]" v-if="activeTab === 'signIn'">
            No account yet?
            <span class="text-[var(--el-color-primary)] cursor-pointer" @click="activeTab = 'signUp'">
              Sign up now</span
            >
          </div>
          <div class="mt-[24px] text-center text-[#737373]" v-if="activeTab === 'signUp'">More login options</div>
          <div
            v-if="activeTab !== 'resetPassword'"
            class="absolute bottom-[106px] left-0 right-0 flex items-center justify-center gap-[24px]"
          >
            <GoogleLogin
              ref="googleLoginRef"
              :callback="googleCallback"
              :prompt="false"
              :auto-login="false"
              :type="'icon'"
              class=""
              v-show="1 === 2"
            >
            </GoogleLogin>

            <div class="w-[48px] h-[48px] cursor-pointer" @click="triggerGoogleLogin">
              <img src="./static/Google.png" alt="Google Login" />
            </div>

            <div class="w-[1px] h-[32px] bg-[#ccc]"></div>
            <div class="w-[48px] h-[48px] cursor-pointer">
              <DiscordLogin @additionalInfoFn="additionalInfoFn"></DiscordLogin>
            </div>
          </div>
          <div
            v-html="siteStore.info?.loginAgreement"
            class="absolute bottom-[32px] left-0 right-0 text-center text-[#262626] text-[14px] mt-[50px]"
          ></div>
          <!-- <div class="absolute bottom-[32px] left-0 right-0 text-center text-[#262626] text-[14px] mt-[50px]">
            FAQs Privacy Policy Terms & Conditions Refund Policy
          </div> -->
        </div>
        <div v-if="showAdditionalInfo" class="section-form">
          <el-button v-if="!isAdditionalInfoStep1" type="primary" link size="large" @click="handleGoBackAdditionalInfo">
            <IMdiLightArrowLeft />
            Go back
          </el-button>
          <div class="title">Additional information</div>
          <el-form v-if="isAdditionalInfoStep1" ref="addtionalFormRef" class="form" style="margin-top: 16px">
            <el-form-item class="flex flex-col items-center" prop="avatar">
              <ClUpload type="file" v-model="additionalInfo.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
                <div class="avatar-upload-wrap">
                  <el-avatar :size="50" :src="additionalInfo.avatar">
                    <template v-if="!additionalInfo.avatar">
                      <IMdiCameraOutline></IMdiCameraOutline>
                    </template>
                  </el-avatar>
                </div>
              </ClUpload>
            </el-form-item>

            <el-form-item class="relative" label="Nickname">
              <el-input size="large" v-model="additionalInfo.nickName" clearable />
            </el-form-item>

            <el-form-item class="relative" label="Password">
              <el-input size="large" type="password" v-model="additionalInfo.password" clearable show-password />
            </el-form-item>
            <el-form-item class="relative" label="Repeat Password">
              <el-input size="large" type="password" v-model="additionalInfo.password2" clearable show-password />
            </el-form-item>
            <el-form-item prop="invitationCode" class="relative" label="Invitation code" v-if="isNeedInviteCode">
              <el-input size="large" :disabled="hasInviteCode" v-model="additionalInfo.invitationCode" clearable />
            </el-form-item>
          </el-form>
          <div v-if="!isAdditionalInfoStep1" class="mb-[32px]">
            <div class="font-medium text-[16px] mb-[20px]">Select Industry</div>
            <div class="">
              <DynamicTag v-model="industrys" :dictTags="industryList" />
            </div>
          </div>
          <el-button type="primary" size="large" class="w-full" :loading="isBtnLoading" @click="handleNext">
            {{ isAdditionalInfoStep1 ? 'Next' : 'Save' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$color: #2c3142;

.page-login {
  background-color: var(--color-theme);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
  color: $color;

  * {
    // font-family: Inter;
  }

  .copyright {
    position: absolute;
    bottom: 15px;
    left: 0;
    text-align: center;
    width: 100%;
    color: var(--el-color-info);
    font-size: 14px;
    user-select: none;
  }

  .box {
    transition: all 0.8s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 1230px;
    padding-inline: 50px;
    background-color: #fff;
    border-radius: 122px 0 0 122px;
    .box-group {
      z-index: 1;
      position: absolute;
      right: -52px;
      top: -63px;
      width: 204px;
      height: 135px;
      img {
        width: 100%;
        height: auto;
      }
    }
    .arrow-left {
      position: absolute;
      left: -100px;
      top: 50%;
      transform: translateY(-50%);
      width: 100px;
      height: 250px;
      img {
        width: 100%;
        height: auto;
      }
    }
    .section-form {
      z-index: 5;
      background-color: #fff;
      transition: all 0.8s ease;
      width: 500px;
      min-height: 658px;
      border-radius: 28px;
      border: 1px solid #e6e6e6;
      padding: 40px 60px;
      box-shadow: 0px 0px 50px 0px #00000014;
      position: relative;
    }

    .logo {
      height: 50px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      user-select: none;

      .icon {
        border-radius: 8px;
        padding: 5px;
        margin-right: 10px;
        background-color: $color;

        img {
          height: 36px;
        }
      }

      span {
        font-size: 38px;
        font-weight: bold;
        line-height: 1;
        letter-spacing: 3px;
      }
    }

    .desc {
      font-size: 15px;
      letter-spacing: 1px;
      margin-bottom: 50px;
      user-select: none;
      max-width: 80%;
      text-align: center;
    }

    .form {
      max-width: 480px;
      width: 100%;

      :deep(.el-form) {
        .el-form-item {
          margin-bottom: 20px;
        }

        .el-form-item__label {
          color: var(--el-color-info);
          padding-left: 5px;
          user-select: none;
          font-weight: 600;
        }

        .el-input {
          box-sizing: border-box;
          font-size: 15px;
          border: 1px solid #dedfe0;
          padding: 0 5px;
          border-radius: 8px;
          position: relative;

          &__wrapper {
            box-shadow: none;
            background-color: transparent;
          }
          &:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px #f8f8f8 inset;
            box-shadow: 0 0 0 1000px #f8f8f8 inset;
          }
        }
      }

      :deep(.pic-captcha) {
        position: absolute;
        right: -5px;
        top: 0;
      }
    }

    .op {
      display: flex;
      justify-content: center;
      margin-top: 40px;

      :deep(.el-button) {
        width: 100%;
        font-size: 16px;
        border-radius: 8px;
        letter-spacing: 1px;
      }
    }
  }
}

.bg {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 488px;
  height: 100%;
  background: #fa9819;
  text-align: center;
}

.bg-title-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bg-pic {
  width: 380px;
  margin: 60px auto 0;
  img {
    width: 100%;
    height: auto;
  }
}

.bg-title {
  font-size: 38px;
  color: #fff;
  font-weight: 900;
  padding-block: 4px;
  border-bottom: 4px solid #409eff;
  line-height: 1;

  .active {
    margin-left: 10px;
    color: #409eff;
  }
}

.bg-title-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  background: #006ffd;
  border-radius: 12px;
  margin-right: 20px;
}
.bg-title-img-wrap-guduu {
  width: 300px;
  img {
    width: 100%;
    height: auto;
  }
}
.bg-title-img {
  width: 36px * 1.4;
  height: 42px * 1.4;
}

.bg-cnt {
  width: 400px;
  margin: 60px auto 0;
  color: #fff;
  position: relative;
  .bg-cnt-bracket-left {
    position: absolute;
    left: -50px;
    top: -50px;
  }
  .bg-cnt-bracket-right {
    position: absolute;
    right: -29px;
    bottom: 4px;
  }
}

.bg-cnt-block {
  font-weight: 400;
  font-size: 16px;
  color: #fff;
  line-height: 24px;
  text-align: left;
}

.bg-cnt-name {
  margin-top: 16px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 700;
  text-align: right;
}

.head-wrap {
  max-width: 480px;
  width: 100%;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--Color-Info-color-info-light-7, #dedfe0);
}

.title {
  margin-bottom: 19px;
  color: var(--color-black, #000);
  font-size: 28px;
  font-weight: 900;
  line-height: normal;
}

.title-tips {
  color: var(--Color-Info-color-info, #909399);
  font-size: 16px;
  font-weight: 500;
  line-height: normal;
}

.title-tips-center {
  @extend .title-tips;
  text-align: center;
}

.google-btn-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: #fff;
  cursor: pointer;

  .g-btn-wrapper {
    width: 100%;
    height: 100%;
  }
}

.google-btn {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 16px;
  font-weight: 700;

  .icon {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}

.policy-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 130px;
}

@media screen and (max-width: 1024px) {
  .page-login {
    .box {
      width: 100%;
      border-radius: 0px;
    }
  }
}
:deep(.el-form-item) {
  .el-form-item__label {
    position: absolute;
    height: 48px;
    line-height: 48px;
    left: 10px;
    z-index: 99;
    color: #999;
    font-size: 16px;
  }
  .el-input__inner {
    text-align: right;
  }
}
// :deep(.nsm7Bb-HzV7m-LgbsSe-BPrWId) {
//   display: none;
// }
// :deep(.nsm7Bb-HzV7m-LgbsSe-Bz112c) {
//   width: 36px;
//   height: 40px;
//   margin-right: 0px;
// }
// :deep(.nsm7Bb-HzV7m-LgbsSe) {
//   padding: 0px;
//   border: none;
//   height: 48px;
//   &:focus-within {
//     border: none;
//     outline: none;
//   }
// }
.mobile-login {
  background: #fff;
  .box-group {
    display: none;
  }
  .section-form {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
