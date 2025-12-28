import { decodeCredential } from 'vue3-google-login';

import { service } from '/@/cool';

import { router } from '/@/cool';
import { useUserStore } from '/@/store/user';
import { useStore } from '/@/store';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
const { resetAllStore } = useStore();
const route = useRoute();
let isApplyForProfile = ref(false);
if (route && route.query) {
  isApplyForProfile = ref(route.query?.type === 'applyForProfile' || false);
}
export const useGoogleLogin = ({ additionalInfoFn }: { additionalInfoFn: (userInfo: any) => void }) => {
  const userStore = useUserStore();
  const saveLoginToken = (res) => {
    localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
    localStorage.setItem('username', res.userInfo.name);
  };
  const googleCallback = async (response) => {
    // 注册或者登录前，重置信息
    resetAllStore();
    const userData = decodeCredential(response.credential);
    console.log(userData, 1111);
    const res = await service.base.sys.user.googleLogin(userData);
    // 设置登录token
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
    // 如果是申请团长跳转到 /apply_profile
    // if (isApplyForProfile.value) {
    //   router.push('/apply_profile');
    // }
    // todo 暂时以这个字段来判断是否补充过信息，以后修改   修改为nickName判断是否补充过信息
    if (!res.userInfo.inviteCode) {
      // 到补充信息页面
      additionalInfoFn?.(res);
    } else {
      await userStore.get();
      // router.push('/work/personal-homepage/@' + res.userInfo.name);
      router.replace('/workbench').then(() => {
        window.location.reload();
      });
    }
  };
  return {
    googleCallback,
  };
};
