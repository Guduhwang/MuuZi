<template>
  <div class="discord-login" @click="handleDiscordLogin">
    <div class="w-[48px] h-[48px] cursor-pointer">
      <img src="../static/Discord.png" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import { service } from '/@/cool';
import { useUserStore } from '/@/store/user';
import { router } from '/@/cool';
import { useRoute } from 'vue-router';

const route = useRoute();
let isApplyForProfile = ref(false);
if (route && route.query) {
  isApplyForProfile = ref(route.query?.type === 'applyForProfile' || false);
}

const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
const redirectUri = window.location.origin + window.location.pathname;
const scope = 'identify email';

const user = ref(null);
const avatarUrl = ref('');

function base64UrlEncode(arr: Uint8Array) {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
const generateRandomVerifier = () => {
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  return base64UrlEncode(arr);
};

// 生成PKCE
const generatePkce = () => {
  const codeVerifier = generateRandomVerifier();
  const hash = sha256.array(codeVerifier);
  const codeChallenge = base64UrlEncode(new Uint8Array(hash));
  return { codeVerifier, codeChallenge };
};
const emit = defineEmits(['additionalInfoFn']);
const handleDiscordLogin = () => {
  const { codeVerifier, codeChallenge } = generatePkce();
  sessionStorage.setItem('discordPkce', codeVerifier);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
};
onMounted(async () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (code) {
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.pathname);
    const codeVerifier = sessionStorage.getItem('discordPkce');
    const params = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier || '',
    });
    const userStore = useUserStore();
    const saveLoginToken = (res: any) => {
      localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
      localStorage.setItem('username', res.userInfo.name);
    };
    try {
      const { data } = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (data.access_token) {
        const userRes = await axios.get('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const res = await service.base.sys.user.discordLogin(userRes.data);
        console.log('resDiscord', res);
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
        if (isApplyForProfile.value) {
          router.push('/apply_profile');
        }
        if (res.isFirst || !res.userInfo.inviteCode) {
          emit('additionalInfoFn', res);
          // 补充资料这块待处理
        } else {
          await userStore.get();
          router.push('/workbench');
        }
        user.value = userRes.data;
        avatarUrl.value = userRes.data.avatar
          ? `https://cdn.discordapp.com/avatars/${userRes.data.id}/${userRes.data.avatar}.png`
          : 'https://cdn.discordapp.com/embed/avatars/0.png';
        sessionStorage.setItem('discordUser', JSON.stringify(userRes.data));
      }
    } catch (err) {
      alert('Discord 登录失败: ' + (err?.response?.data?.error_description || err));
    }
  } else {
    const u = sessionStorage.getItem('discordUser');
    if (u) user.value = JSON.parse(u);
  }
});
</script>
<style scoped lang="scss">
.discord-login-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  color: #5865f2;
}
.discord-login {
  color: #3c4043;
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  cursor: pointer;
  position: relative;
}
</style>
