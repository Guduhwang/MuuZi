<script setup lang="ts">
import { computed, onMounted, ref, triggerRef, onUnmounted, watch } from 'vue';
import Setting from '../../Setting.vue';
import { Search } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { storage } from '/@/cool/utils';
import DefaultAvatar from '../../default-avatar/DefaultAvatar.vue';
import { useStore } from '/@/store';
import { useRoute } from 'vue-router';
import PublishParentDialog from '../../publish-dialog/PublishParentDialog.vue';
import SubscriptionDialog from '../../subscription-dialog/SubscriptionDialog.vue';
import ApplyProfile from '../../apply-profile/ApplyProfile.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useBase } from '/$/base';

const { app } = useBase();

const { service, router } = useCool();
const { userStore, resetAllStore, groupStore, siteStore } = useStore();

// 手机端检测
const isMobile = ref(false);

// 检测设备类型
const checkMobile = () => {
  const ua = navigator.userAgent.toLowerCase();
  let deviceType = 'pc'; // 默认为 PC

  // 检测 iPad（包括现代 iPad）
  if (ua.indexOf('ipad') !== -1 || (ua.indexOf('macintosh') !== -1 && 'ontouchend' in document)) {
    deviceType = 'pad';
  }
  // 检测 iPhone
  else if (ua.indexOf('iphone') !== -1) {
    deviceType = 'mobile';
  }
  // 检测 Android 设备
  else if (ua.indexOf('android') !== -1) {
    // 通过屏幕尺寸判断是手机还是平板
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minDimension = Math.min(screenWidth, screenHeight);

    // Android 平板通常屏幕尺寸较大
    if (minDimension >= 600) {
      deviceType = 'androidPad';
    } else {
      deviceType = 'mobile';
    }
  }
  // 检测其他移动设备
  else if (
    ua.indexOf('mobile') !== -1 ||
    ua.indexOf('phone') !== -1 ||
    ua.indexOf('blackberry') !== -1 ||
    ua.indexOf('windows phone') !== -1
  ) {
    deviceType = 'mobile';
  }

  // 只有真正的手机才设置为 mobile
  const isMobile = deviceType === 'mobile';
  userStore.setIsMobile(isMobile);

  return deviceType;
};

// 监听窗口大小变化
const handleResize = () => {
  checkMobile();
};

defineOptions({
  name: 'WorkHead',
});

const route = useRoute();

const loginList = ref(storage.get('loginList'));

const isWorkWorkbenchPage = computed(() => route.name === 'WorkWorkbench');

const isPersonalHomePage = computed(() => route.name === 'WorkPersonalHomePage');

const activeIndex = ref('1');
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
  if (key === '2-1') {
    // 新窗口打开
    const url = window.location.origin + '/workflow_store';
    window.open(url, '_blank');
  }
};
const searchVal = ref('');

// Vue3 watch 监听多个属性的示例
// 方法1：使用数组监听多个属性
watch([searchVal, isMobile], ([newSearchVal, newIsMobile], [oldSearchVal, oldIsMobile]) => {
  console.log('搜索值变化:', newSearchVal, oldSearchVal);
  console.log('手机端状态变化:', newIsMobile, oldIsMobile);
});

// 方法2：监听多个属性，分别处理
watch(
  [searchVal, isMobile],
  (newValues, oldValues) => {
    const [newSearch, newMobile] = newValues;
    const [oldSearch, oldMobile] = oldValues;

    if (newSearch !== oldSearch) {
      console.log('搜索值从', oldSearch, '变为', newSearch);
    }

    if (newMobile !== oldMobile) {
      console.log('设备类型从', oldMobile ? '手机端' : '桌面端', '变为', newMobile ? '手机端' : '桌面端');
    }
  },
  { immediate: true }, // 立即执行一次
);

// 方法3：使用 watchEffect 监听多个响应式数据（自动追踪依赖）
// watchEffect(() => {
//   console.log('当前搜索值:', searchVal.value);
//   console.log('当前设备类型:', isMobile.value ? '手机端' : '桌面端');
// });

const isShowApplyForProfile = ref(false);
const onUploaded = (res: Upload.Item) => {
  const url = res.url;
  service.base.sys.user.update({ id: userStore.info?.id, avatar: url });
  userStore.set({ ...userStore.info, avatar: url });
  const newUserInfo = { ...userStore.info, avatar: url };
  const token = storage.get('token');
  const refreshToken = storage.get('refreshToken');
  const token_deadtime = storage.get('token_deadtime');
  const refreshToken_deadtime = storage.get('refreshToken_deadtime');
  // 更新loginlist
  userStore.cacheLoginList(newUserInfo, {
    token,
    token_deadtime,
    refreshToken,
    refreshToken_deadtime,
  });

  // 强制触发响应式更新
  const newLoginList = storage.get('loginList');
  loginList.value = [...newLoginList]; // 使用展开运算符创建新数组
  triggerRef(loginList); // 强制触发响应式更新
};
const handleJoinTeam = () => {
  ElMessageBox.prompt('Please input your invitation code', 'Join Team', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern: /\S+/, //不能为空
    inputErrorMessage: 'Enter Invitation Code',
  })
    .then(({ value }) => {
      if (value) {
        service.base.groupMember.joinTeam({ invitation: value }).then((res) => {
          if (res) {
            ElMessage.success('Join Team Success');
            // 刷新页面
            // window.location.reload();
          }
        });
      }
    })
    .catch(() => {});
};
// 切换账号
const handleSwitchAccount = async (item: {
  userInfo: Eps.BaseSysUserEntity;
  tokenInfo: { token: string; token_deadtime: number; refreshToken: string; refreshToken_deadtime: number };
}) => {
  // 判断是否是当前账号
  if (item.userInfo.id === userStore.info?.id) {
    // 判断角色是否有 6
    // if (item.userInfo.roleIds?.includes(6)) {
    //   // 跳转到个人主页
    //   handleProfile();
    // } else {
    //   // 跳转到工作台
    //   router.push('/workbench');
    // }
    return;
  }
  try {
    console.log('开始切换账号:', item.userInfo.id);

    // 调用 refreshToken 接口获取最新的 token 信息
    // refreshToken 接口在请求拦截器中被忽略，不需要 Authorization header
    let res;
    try {
      console.log('调用 refreshToken 接口，refreshToken:', item.tokenInfo.refreshToken);
      res = await service.base.open.refreshToken({
        refreshToken: item.tokenInfo.refreshToken,
      });
      console.log('RefreshToken 成功:', res);
    } catch (refreshError) {
      // 如果 refreshToken 失败，直接使用缓存的 token 信息（可能还没过期）
      console.warn('RefreshToken 失败，使用缓存的 token:', refreshError);
      res = {
        token: item.tokenInfo.token,
        expire: item.tokenInfo.token_deadtime,
        refreshToken: item.tokenInfo.refreshToken,
        refreshExpire: item.tokenInfo.refreshToken_deadtime,
      };
    }

    // 更新 loginList 中该账号的 token 信息
    const loginList = storage.get('loginList') || [];
    type LoginListItem = {
      userInfo: Eps.BaseSysUserEntity;
      tokenInfo: { token: string; token_deadtime: number; refreshToken: string; refreshToken_deadtime: number };
    };
    loginList.forEach((loginItem: LoginListItem) => {
      if (loginItem.userInfo.id === item.userInfo.id) {
        loginItem.tokenInfo.token = res.token;
        loginItem.tokenInfo.refreshToken = res.refreshToken;
        loginItem.tokenInfo.token_deadtime = res.expire;
        loginItem.tokenInfo.refreshToken_deadtime = res.refreshExpire;
      }
    });
    storage.set('loginList', loginList);

    // 构建最新的 token 信息对象
    const tokenInfoObj = {
      token: res.token,
      expire: res.expire,
      refreshToken: res.refreshToken,
      refreshExpire: res.refreshExpire,
    };

    console.log('设置用户信息和 token');
    // 清空groupStore中的groupList
    groupStore.groupList = [];
    groupStore.allGroupList = [];
    groupStore.groupMemberMap = {};
    groupStore.groupMemberList = {};

    // 设置用户信息和 token
    userStore.set(item.userInfo);
    userStore.setToken(tokenInfoObj);

    console.log('切换账号完成，准备跳转');
    // 跳转到工作台并刷新页面
    router.replace('/workbench');
    window.location.reload();
  } catch (error) {
    // 如果切换失败，记录错误
    console.error('切换账号失败:', error);
    // ElMessage.error('切换账号失败，请重试');
  }
};
const handleProfile = () => {
  router.push('/person/' + userStore.info?.name);
};
// 判断是否是当前账号
const isActive = computed(() => {
  return (id: number) => {
    return id === userStore.info?.id;
  };
});

const handleLogout = () => {
  resetAllStore();
  userStore.logout();
  router.push('/login');
};
const handleApplyForProfile = () => {
  // 不是6团长 7副团长 8团员 没有权限进入个人主页
  ElMessageBox.confirm('You do not have permission to enter the personal homepage', '', {
    confirmButtonText: 'Apply as Creator',
    cancelButtonText: 'Cancel',
    type: 'info',
  })
    .then(async () => {
      // 申请个人博主
      const res = await service.base.sys.user.becomeBlogger();
      // 跳转到个人主页
      handleProfile();
      // if (res) {
      //   ElMessage.success('Apply as Creator Success');
      // }
    })
    .catch(() => {});
};
// 获取域名
const domain = ref('');

const isShowSetting = ref(false);

const isShowPublish = ref(false);

const isShowSubscription = ref(false);

const toHome = () => {
  window.open('/', '_blank');
};
onMounted(() => {
  domain.value = window.location.href;
  checkMobile(); // 初始化时检查一次
  window.addEventListener('resize', handleResize); // 监听窗口大小变化
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize); // 移除监听
});
async function toWorkbench(isProfile: boolean) {
  if (!isProfile && isWorkWorkbenchPage.value) {
    // 不是6团长 7副团长 8团员 没有权限进入个人主页
    ElMessageBox.confirm('You do not have permission to enter the personal homepage', '', {
      confirmButtonText: 'Apply as Creator',
      cancelButtonText: 'Cancel',
      type: 'info',
    })
      .then(async () => {
        // 申请个人博主
        const res = await service.base.sys.user.becomeBlogger();
        // 跳转到个人主页
        handleProfile();
        // if (res) {
        //   ElMessage.success('Apply as Creator Success');
        // }
      })
      .catch(() => {});
    return;
  }
  if (isWorkWorkbenchPage.value) {
    handleProfile();
  } else {
    router.push('/workbench');
  }
}
const handleSignUp = () => {
  debugger;
  const userInfo = localStorage.getItem('userInfo');
  const userInfoObj = userInfo ? JSON.parse(userInfo) : null;

  console.log('groupStore.invitationShortUrl', groupStore.invitationShortUrl);
  if (groupStore.invitationShortUrl) {
    window.open(groupStore.invitationShortUrl, '_blank');
  } else if (userStore.info?.inviteCode) {
    router.push('/login?invitation=' + userStore.info?.invitationCode);
  } else if (userInfoObj?.key) {
    router.push('/login?invitation=' + userInfoObj?.key);
  } else {
    router.push('/login');
  }
};
const handleDeleteAccount = (item: { userInfo: Eps.BaseSysUserEntity }) => {
  // 判断是否是当前账号
  if (item.userInfo.id === userStore.info?.id) {
    return ElMessage.error('Unable to delete the cache of the current login account');
  }
  // 删除loginList中的空数据
  loginList.value = loginList.value.filter(
    (i: { userInfo: Eps.BaseSysUserEntity }) => item.userInfo && item.userInfo.id !== i.userInfo.id,
  );
  storage.set('loginList', loginList.value);
  triggerRef(loginList);
};

const handleAdminClick = () => {
  try {
    router.replace('/admin');
  } catch (error) {
    console.error('路由跳转失败:', error);
    // 可以尝试其他跳转方式
    window.open(window.location.origin + '/admin', '_self');
  }
};
</script>

<template>
  <div :class="{ 'live-mode-head': app.isShowLive }">
    <div class="head-wrap">
      <div v-if="app.isShowLive" class="live-mode-head-logo">
        <img class="" src="../../../../../assets/logo-words.svg" />
      </div>
      <div v-if="!app.isShowLive" class="left">
        <!-- <el-button type="primary" v-if="!userStore.info" @click="router.push('/login')">Sign in</el-button> -->
        <el-button type="primary" v-if="!userStore.info" @click="handleSignUp">Sign up</el-button>
        <div class="brand-wrap br">
          <div class="brand-img-guduu-wrap" @click="toHome">
            <img class="brand-img" :src="siteStore.info?.siteIcon" />
          </div>
          <!-- <div v-else class="brand-img-wrap" @click="toHome">
            <img class="brand-img" src="../../../login/static/egg-cracked-filled.svg" />
          </div> -->
        </div>
        <el-menu
          v-if="!app.isShowLive"
          :default-active="activeIndex"
          mode="horizontal"
          @select="handleSelect"
          :ellipsis="false"
          class="ml-[8px]"
        >
          <el-sub-menu
            :disabled="!(userStore.info && !app.isShowLive && userStore.info.email === 'guduhwang@gmail.com')"
            index="1"
          >
            <template #title>
              <span class="menu-title">Marketplace</span>
            </template>
            <el-menu-item index="2-1">Workflows</el-menu-item>
            <el-menu-item index="2-2" disabled>Widgets</el-menu-item>
          </el-sub-menu>
          <el-sub-menu disabled index="2">
            <template #title> <span class="menu-title">Top Creators</span></template>
            <el-menu-item index="2-1">Personal Ranking</el-menu-item>
            <el-menu-item index="2-2">Community Ranking</el-menu-item>
          </el-sub-menu>
        </el-menu>
        <div v-if="!app.isShowLive" @click="isShowSubscription = true" type="primary" class="subscription-btn">
          Upgrade Membership
        </div>
      </div>
      <div v-if="!app.isShowLive" class="mid-logo-wrap">
        <img class="mid-logo" :src="siteStore.info?.siteLogo" />
      </div>
      <div class="right flex items-center">
        <el-input
          size="default"
          v-if="!app.isShowLive"
          v-model="searchVal"
          :style="{ width: isMobile ? '160px' : '220px' }"
          placeholder="Search"
          :prefix-icon="Search"
          class="search-input"
        />
        <!-- <el-button v-if="!app.isShowLive" type="primary" class="text-[11px]">Search</el-button> -->
        <el-button
          type="primary"
          v-if="domain.includes('personal-homepage') && userStore.info"
          @click="isShowPublish = true"
          class="text-[11px]"
          >Publish</el-button
        >
        <el-menu mode="horizontal" :ellipsis="false" v-if="userStore.info">
          <el-sub-menu index="1" popper-class="x2-head-menu">
            <template #title>
              <div class="avatar-wrap">
                <el-avatar :size="32" :src="userStore.info?.avatar" v-if="userStore.info?.avatar" />
                <div v-else class="w-[32px] h-[32px]">
                  <DefaultAvatar />
                </div>
                <span>{{ userStore.info?.nickName }}</span>
              </div>
            </template>
            <div class="head-float-menu">
              <div class="head-float-head-wrap">
                <div class="head-float-avatar-wrap">
                  <el-avatar :size="50" :src="userStore.info?.avatar" v-if="userStore.info?.avatar" />
                  <div v-else class="w-[50px] h-[50px]">
                    <DefaultAvatar />
                  </div>
                  <div class="head-float-avatar-edit-wrap">
                    <cl-upload
                      accept=".jpeg,.jpg,.png,.gif"
                      @success="onUploaded"
                      :showFileList="false"
                      :limit="1"
                      preventDefault
                    >
                      <IMdiPencilOutline></IMdiPencilOutline>
                    </cl-upload>
                  </div>
                </div>
                <span class="text-[14px] font-bold leading-[20px]">{{ userStore.info?.nickName }}</span>
                <span class="text-[12px] text-[#737373] leading-[20px]">{{ userStore.info?.email }}</span>
              </div>
              <div class="head-float-menu-group">
                <div
                  class="head-float-menu-group-item"
                  @click="
                    toWorkbench(
                      userStore.info?.roleIds?.includes(6) ||
                        userStore.info?.roleIds?.includes(7) ||
                        userStore.info?.roleIds?.includes(8) ||
                        userStore.info?.roleIds?.includes(9),
                    )
                  "
                >
                  <img src="./img/profile.svg" class="item-icon" />
                  <img src="./img/profile_white.svg" class="item-icon-hover" />
                  <span>{{ isWorkWorkbenchPage ? 'Profile Page' : 'My Workbench' }}</span>
                </div>
                <div
                  class="head-float-menu-group-item"
                  v-if="userStore.info?.roleIds?.includes(1)"
                  @click="handleAdminClick"
                >
                  <img src="./img/admin.svg" class="item-icon" />
                  <img src="./img/admin_white.svg" class="item-icon-hover" />
                  <span>Admin Panel</span>
                </div>
                <div class="head-float-menu-group-item" @click="isShowSetting = true">
                  <img src="./img/setting.svg" class="item-icon" />
                  <img src="./img/setting_white.svg" class="item-icon-hover" />
                  <span>Settings</span>
                </div>
                <!-- 判断是否有团长角色 -->
                <div
                  v-if="
                    !userStore.info?.roleIds?.includes(6) &&
                    !userStore.info?.roleIds?.includes(7) &&
                    !userStore.info?.roleIds?.includes(8) &&
                    !userStore.info?.roleIds?.includes(9)
                  "
                  class="head-float-menu-group-item"
                  @click="handleApplyForProfile"
                >
                  <IIconParkOutlineSend></IIconParkOutlineSend>
                  <span>Apply as Creator</span>
                </div>
                <!-- <div
                  v-if="!userStore.info?.roleIds?.includes(6)"
                  class="head-float-menu-group-item"
                  @click="handleJoinTeam"
                >
                  <IIconParkOutlineSend></IIconParkOutlineSend>
                  <span>Join Team</span>
                </div> -->
                <div class="head-float-menu-group-item text-gray-400">
                  <img src="./img/download_dis.svg" class="item-icon" />
                  <img src="./img/download_white.svg" class="item-icon-hover" />
                  <span>Download Desktop App</span>
                </div>
                <el-divider class="divider-style" />
              </div>
              <div class="head-float-menu-group account-style">
                <div class="text-[12px] text-[#737373] leading-[20px]">Other accounts</div>
                <div class="account-wrap">
                  <div
                    class="account-item-wrap mt-[8px]"
                    @click="handleSwitchAccount(item)"
                    v-for="item in loginList"
                    :key="item.userInfo.id"
                  >
                    <div class="head-float-menu-profile-wrap">
                      <el-avatar
                        :key="`avatar-${item.userInfo.id}-${item.userInfo.avatar}`"
                        :size="32"
                        :src="item.userInfo.avatar"
                        v-if="item.userInfo.avatar"
                      />
                      <div class="min-w-[32px] min-h-[32px] w-[32px] h-[32px]" v-else>
                        <DefaultAvatar />
                      </div>
                      <div class="head-float-menu-profile-wrap-info">
                        <div class="head-float-menu-profile-wrap-info-name">
                          {{ item.userInfo.nickName }}
                          <div
                            v-if="
                              item.userInfo.roleIds?.includes(10) ||
                              item.userInfo.roleIds?.includes(11) ||
                              item.userInfo.roleIds?.includes(12) ||
                              item.userInfo.roleIds?.includes(13) ||
                              item.userInfo.roleIds?.includes(14) ||
                              item.userInfo.roleIds?.includes(15) ||
                              item.userInfo.roleIds?.includes(16) ||
                              item.userInfo.roleIds?.includes(17)
                            "
                            class="pro-style"
                          ></div>
                        </div>
                        <div class="head-float-menu-profile-wrap-info-desc">@{{ item.userInfo.name }}</div>
                      </div>
                    </div>
                    <div class="flex items-center w-[50px] gap-[10px]">
                      <img src="./img/changeaccount_white.svg" class="item-icon-hover" />
                      <img
                        @click.stop="handleDeleteAccount(item)"
                        src="./img/clear_white.svg"
                        class="item-icon-hover"
                      />
                    </div>
                  </div>
                </div>
                <el-divider class="divider-style" style="width: calc(100% - 16px)" />
              </div>
              <div class="head-float-menu-group">
                <div class="head-float-menu-group-item" @click="handleLogout">
                  <img src="./img/add.svg" class="item-icon" />
                  <img src="./img/add_white.svg" class="item-icon-hover" />
                  <span>Add Account</span>
                </div>
                <el-divider class="divider-style" />
              </div>
              <div class="head-float-menu-group">
                <div class="head-float-menu-group-item" @click="handleLogout">
                  <img src="./img/layout.svg" class="item-icon" />
                  <img src="./img/layout_white.svg" class="item-icon-hover" />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          </el-sub-menu>
        </el-menu>
      </div>
    </div>
  </div>
  <ApplyProfile v-model:show="isShowApplyForProfile" />
  <Setting v-model:show="isShowSetting" />
  <PublishParentDialog v-model:show="isShowPublish"></PublishParentDialog>
  <SubscriptionDialog v-model:show="isShowSubscription"></SubscriptionDialog>
</template>
<style scoped lang="scss">
@use 'css/head';
.live-mode-head {
  .head-wrap {
    width: 600px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }
  .live-mode-head-logo {
    height: 24px;
    padding-left: 16px;
    img {
      height: 100%;
    }
  }
}
.menu-title {
  font-family: 'Google Sans Code';
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
}
::v-deep(.el-menu--horizontal > .el-sub-menu:hover .el-sub-menu__title) {
  color: #262626;
}
:deep(.el-avatar--circle) {
  min-height: 32px !important;
  min-width: 32px !important;
}
</style>
