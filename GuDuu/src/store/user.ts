import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { storage } from '/@/cool/utils';
import { service, router } from '/@/cool';

// 本地缓存
const data = storage.info();

export const useUserStore = defineStore('user', () => {
  // 标识
  const token = ref<string>(data.token || '');

  // 用户信息
  const info = ref<Eps.BaseSysUserEntity | null>(data.userInfo || null);
  const isMobile = ref<boolean>(false);

  // 计算属性：用户是否已登录
  const isLogined = computed(() => {
    return !!token.value && !!info.value;
  });
  function setIsMobile(value: boolean) {
    isMobile.value = value;
  }

  // 设置标识
  function setToken(data: { token: string; expire: number; refreshToken: string; refreshExpire: number }) {
    // 请求的唯一标识
    token.value = data.token;
    storage.set('token', data.token, data.expire);

    // 刷新 token 的唯一标识
    storage.set('refreshToken', data.refreshToken, data.refreshExpire);
  }

  // 刷新标识
  async function refreshToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      service.base.open
        .refreshToken({
          refreshToken: storage.get('refreshToken'),
        })
        .then((res) => {
          // 更新loginlist中的token 以及 refreshToken
          const loginList = storage.get('loginList') || [];
          loginList.forEach((item: Eps.BaseSysUserEntity) => {
            if (item.userInfo.id === info.value?.id) {
              item.tokenInfo.token = res.token;
              item.tokenInfo.refreshToken = res.refreshToken;
            }
          });
          storage.set('loginList', loginList);
          setToken(res);
          resolve(res.token);
        })
        .catch((err) => {
          logout();
          reject(err);
        });
    });
  }

  // 缓存用户列表
  function cacheLoginList(
    userInfo: Eps.BaseSysUserEntity,
    tokenInfo: { token: string; token_deadtime: number; refreshToken: string; refreshToken_deadtime: number },
  ) {
    console.log('缓存用户信息', userInfo);
    // 判断userInfo是否有值没有则取缓存数据
    if (!userInfo) {
      userInfo = storage.get('userInfo') || null;
      if (!userInfo) {
        return;
      }
    }
    if (!tokenInfo) {
      const token = storage.get('token') || '';
      const token_deadtime = storage.get('token_deadtime') || 0;
      const refreshToken = storage.get('refreshToken') || '';
      const refreshToken_deadtime = storage.get('refreshToken_deadtime') || 0;
      tokenInfo = { token, refreshToken, token_deadtime, refreshToken_deadtime };
    }
    // 已经登录的用户相关信息 做一个缓存用来切换账号
    const loginList = ref<Eps.BaseSysUserEntity[]>([]);
    loginList.value = storage.get('loginList') || [];
    // 删除loginList中的空数据
    loginList.value = loginList.value.filter((item) => item.userInfo && item.userInfo.name !== '');
    // 判断是否已经存在该用户信息，存在则替换，不存在则添加
    const index = loginList.value.findIndex((item) => item.userInfo.id === userInfo.id);
    if (index !== -1) {
      loginList.value[index].userInfo = userInfo;
      loginList.value[index].tokenInfo = tokenInfo;
    } else {
      loginList.value.push({ userInfo, tokenInfo });
    }
    console.log(loginList);
    storage.set('loginList', loginList.value);
  }
  // 设置用户信息
  function set(value: Eps.BaseSysUserEntity) {
    info.value = value;
    storage.set('userInfo', value);
    cacheLoginList(value, {
      token: storage.get('token') || '',
      token_deadtime: storage.get('token_deadtime') || 0,
      refreshToken: storage.get('refreshToken') || '',
      refreshToken_deadtime: storage.get('refreshToken_deadtime') || 0,
    });
  }

  // 清除用户
  function clear() {
    storage.remove('userInfo');
    storage.remove('token');
    token.value = '';
    info.value = null;
  }

  // 退出
  async function logout() {
    clear();
    router.clear();
    router.push('/login');
  }

  // 获取用户信息
  async function get() {
    return service.base.comm.person().then((res) => {
      set(res);
      return res;
    });
  }

  // 登录方法
  async function login(credentials: { username: string; password: string }) {
    try {
      const loginResponse = await service.base.auth.login(credentials);
      set(loginResponse.userInfo); // 更新用户信息
      setToken(loginResponse.tokenData); // 更新 token
      cacheLoginList(loginResponse.userInfo, loginResponse.tokenData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return {
    token,
    info,
    isLogined,
    isMobile,
    get,
    set,
    logout,
    clear,
    setToken,
    refreshToken,
    login,
    cacheLoginList,
    setIsMobile,
  };
});
