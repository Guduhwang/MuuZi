import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { storage } from '/@/cool/utils';
import { service } from '/@/cool';

// 网站信息接口类型定义
interface SiteInfo {
  // 基础信息
  siteName: string;
  siteLogo: string;
  siteLightLogo: string;
  cornerIcon: string;
  loginLogo: string;
  loginIntro: string;
  siteIcon: string;
  siteDomain: string;
  tokenPlan: Array<{
    tokens: number;
    price: number;
  }>;
  minTokenAmount: number;
  loginAgreement: string;
  paymentAgreement: string;

  // Stripe
  stripeSecretKey: string;

  // 网站公告
  desktopAnnouncement: string;
  postAnnouncement: string;
  cornerQr: string;
  cornerEmail: string;
  cornerLink: string;

  // 邮件服务器
  emailHost: string;
  emailAccount: string;
  emailPassword: string;

  // 支付宝支付
  alipayAppId: string;
  alipayPrivateKey: string;
  alipayPublicKey: string;

  // Discord 机器人
  discordBotEnable: boolean;
  discordUserId: string;
  discordBotToken: string;
  discordClientId: string;
  discordGuildId: string;
  discordApiBase: string;

  // 第三方登录
  googleClientId: string;
  webDiscordClientId: string;

  // 网站数据
  sendSiteData: string;
  siteDataReceiveUrl: string;
}

// 本地缓存
const data = storage.info();

export const useSiteStore = defineStore('site', () => {
  // 网站信息
  const info = ref<SiteInfo | null>(data.siteInfo || null);

  // 加载状态
  const loading = ref<boolean>(false);

  // 设置网站信息
  function setInfo(data: SiteInfo) {
    info.value = data;
    // 缓存到本地存储
    storage.set('siteInfo', data);
  }

  // 获取网站信息
  async function getInfo(): Promise<SiteInfo> {
    if (loading.value) {
      return info.value || ({} as SiteInfo);
    }

    loading.value = true;
    try {
      const res = await service.base.site.info();
      setInfo(res);
      return res;
    } catch (e) {
      console.error('获取网站信息失败', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // 清除网站信息
  function clearInfo() {
    info.value = null;
    storage.remove('siteInfo');
  }

  return {
    info,
    loading,
    getInfo,
    clearInfo,
    setInfo,
  };
});
