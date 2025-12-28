<template>
  <el-scrollbar class="site-config">
    <el-card>
      <el-tabs v-model="activeTab">
        <!-- 基础信息 -->
        <el-tab-pane :label="t('基础信息')" name="base">
          <el-form :model="form" label-width="120px">
            <el-form-item :label="t('网站名')">
              <el-input v-model="form.siteName" :placeholder="t('请输入网站名')" />
            </el-form-item>

            <el-form-item label="LOGO">
              <cl-upload
                v-model="form.siteLogo"
                :title="t('上传LOGO')"
                :limit="1"
                accept="image/*"
              />
            </el-form-item>

            <el-form-item :label="t('浅色图标')">
              <cl-upload
                v-model="form.siteLightLogo"
                :title="t('上传浅色图标')"
                :limit="1"
                accept="image/*"
              />
            </el-form-item>

            <el-form-item :label="t('登录页LOGO')">
              <cl-upload
                v-model="form.loginLogo"
                :title="t('上传LOGO')"
                :limit="1"
                accept="image/*"
              />
            </el-form-item>


            <el-form-item :label="t('网站图标')">
              <cl-upload
                v-model="form.cornerIcon"
                :title="t('上传网站图标')"
                :limit="1"
                accept="image/*"
              />
            </el-form-item>

            <el-form-item :label="t('浏览器图标')">
              <cl-upload
                v-model="form.siteIcon"
                :title="t('上传浏览器图标')"
                :limit="1"
                accept=".ico"
              />
            </el-form-item>

            <el-form-item :label="t('域名')">
              <el-input v-model="form.siteDomain" :placeholder="t('请输入域名')" />
            </el-form-item>

            <el-form-item :label="t('token套餐')">
              <el-input
                type="textarea"
                :rows="10"
                v-model="form.tokenPlan"
                :placeholder="t('请输入token套餐')"
              />
            </el-form-item>

            <el-form-item :label="t('最低token数')">
              <el-input v-model="form.minTokenAmount" :placeholder="t('请输入最低token数')" />
            </el-form-item>

            <el-form-item :label="t('新用户赠送token数')">
              <el-input-number
                v-model="form.newUserGiftTokens"
                :min="0"
                :placeholder="t('请输入新用户赠送token数')"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item :label="t('活动赠送天数')">
              <el-input-number
                v-model="form.activityGifDays"
                :min="0"
                :placeholder="t('请输入活动赠送天数')"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item :label="t('活动截至日期')">
              <el-date-picker
                v-model="form.activityEndDate"
                type="date"
                :placeholder="t('请选择活动截至日期')"
                clearable
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 网站公告 -->
        <el-tab-pane :label="t('公告协议')" name="announcement">
          <el-form :model="form" label-width="120px">
            <el-form-item :label="t('桌面公告')">
              <cl-editor-wang v-model="form.desktopAnnouncement" :height="200" />
            </el-form-item>

            <el-form-item :label="t('弹窗公告')">
              <cl-editor-wang v-model="form.postAnnouncement" :height="200" />
            </el-form-item>

            <el-form-item :label="t('角落二维码')">
              <cl-upload
                v-model="form.cornerQr"
                :title="t('上传二维码')"
                :limit="1"
                accept="image/*"
              />
            </el-form-item>

            <el-form-item :label="t('角落邮箱')">
              <el-input v-model="form.cornerEmail" :placeholder="t('请输入邮箱')" />
            </el-form-item>

            <el-form-item :label="t('角落链接')">
              <el-input v-model="form.cornerLink" :placeholder="t('请输入链接')" />
            </el-form-item>

            <el-form-item :label="t('登录协议')">
              <cl-editor-wang v-model="form.loginAgreement" :height="200" />
            </el-form-item>
            <el-form-item :label="t('登录页介绍')">
              <cl-editor-wang v-model="form.loginIntro" :height="200" />
            </el-form-item>
            <el-form-item :label="t('支付协议')">
              <cl-editor-wang v-model="form.paymentAgreement" :height="200" />
            </el-form-item>

            <el-form-item :label="t('网站协议')">
              <cl-editor-wang v-model="form.websiteAgreement" :height="200" />
            </el-form-item>

            <el-form-item :label="t('法律条款')">
              <cl-editor-wang v-model="form.legalTerms" :height="200" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 第三方登录 -->
        <el-tab-pane :label="t('第三方登录')" name="oauth">
          <el-form :model="form" label-width="120px">
            <el-form-item label="Google Client ID">
              <el-input
                v-model="form.googleClientId"
                :placeholder="t('请输入 Google Client ID')"
              />
            </el-form-item>

            <el-form-item label="Discord Client ID">
              <el-input
                v-model="form.webDiscordClientId"
                :placeholder="t('请输入网页 Discord Client ID')"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Stripe 支付 -->
        <el-tab-pane :label="t('Stripe支付')" name="stripe">
          <el-form :model="form" label-width="120px">
            <el-form-item label="Stripe Secret Key">
              <el-input
                v-model="form.stripeSecretKey"
                :placeholder="t('请输入 Stripe Secret Key')"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 邮件服务器 -->
        <el-tab-pane :label="t('邮件服务器')" name="email">
          <el-form :model="form" label-width="120px">
            <el-form-item :label="t('邮件服务器')">
              <el-input v-model="form.emailHost" :placeholder="t('请输入邮件服务器地址')" />
            </el-form-item>

            <el-form-item :label="t('账号')">
              <el-input v-model="form.emailAccount" :placeholder="t('请输入邮件账号')" />
            </el-form-item>

            <el-form-item :label="t('密码')">
              <el-input
                type="password"
                v-model="form.emailPassword"
                :placeholder="t('请输入邮件密码')"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 支付宝支付 -->
        <el-tab-pane :label="t('支付宝支付')" name="alipay">
          <el-form :model="form" label-width="120px">
            <el-form-item label="APP ID">
              <el-input v-model="form.alipayAppId" :placeholder="t('请输入支付宝 APP ID')" />
            </el-form-item>

            <el-form-item :label="t('私钥')">
              <el-input
                type="textarea"
                rows="4"
                v-model="form.alipayPrivateKey"
                :placeholder="t('请输入支付宝私钥')"
              />
            </el-form-item>

            <el-form-item :label="t('公钥')">
              <el-input
                type="textarea"
                rows="4"
                v-model="form.alipayPublicKey"
                :placeholder="t('请输入支付宝公钥')"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Discord 机器人 -->
        <el-tab-pane :label="t('Discord机器人')" name="discord">
          <el-form :model="form" label-width="120px">
            <el-form-item :label="t('启用 Bot')">
              <el-switch
                v-model="form.discordBotEnable"
                active-value="true"
                inactive-value="false"
              />
            </el-form-item>

            <el-form-item :label="t('用户ID')">
              <el-input v-model="form.discordUserId" :placeholder="t('请输入用户ID')" />
            </el-form-item>

            <el-form-item label="Bot Token">
              <el-input v-model="form.discordBotToken" :placeholder="t('请输入 Bot Token')" />
            </el-form-item>

            <el-form-item label="Client ID">
              <el-input v-model="form.discordClientId" :placeholder="t('请输入 Client ID')" />
            </el-form-item>

            <el-form-item label="Guild ID">
              <el-input v-model="form.discordGuildId" :placeholder="t('请输入 Guild ID')" />
            </el-form-item>

            <el-form-item :label="t('API 地址')">
              <el-input v-model="form.discordApiBase" :placeholder="t('请输入 API 地址')" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 网站数据 -->
        <el-tab-pane :label="t('网站数据')" name="data">
          <el-form :model="form" label-width="120px">
            <el-form-item :label="t('发送网站数据')">
              <el-switch
                v-model="form.sendSiteData"
                active-value="true"
                inactive-value="false"
              />
            </el-form-item>

            <el-form-item :label="t('网站数据接收地址')">
              <el-input
                v-model="form.siteDataReceiveUrl"
                :placeholder="t('请输入网站数据接收地址')"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 保存按钮 -->
      <div style="margin-top: 20px; text-align: right">
        <el-button type="primary" :loading="loading" @click="saveInfo">{{ t("保存") }}</el-button>
      </div>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service } = useCool();
const { t } = useI18n();

interface SiteInfo {
  // 基础信息
  siteName: string;
  siteLogo: string;
  siteLightLogo: string;
  loginLogo: string;
  cornerIcon: string;
  siteIcon: string;
  siteDomain: string;
  tokenPlan: [];
  minTokenAmount: number;
  newUserGiftTokens: number;
  activityGifDays: number;
  activityEndDate?: string;

  // Stripe
  stripeSecretKey: string;

  // 网站公告
  desktopAnnouncement: string;
  postAnnouncement: string;
  cornerQr: string;
  cornerEmail: string;
  cornerLink: string;
  loginAgreement: string;
  paymentAgreement: string;
  websiteAgreement: string;
  legalTerms: string;
  loginIntro: string;

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

  //网站数据
  sendSiteData: string;
  siteDataReceiveUrl: string;
}

const form = ref<SiteInfo>({
  siteName: "",
  siteLogo: "",
  siteLightLogo: "",
  loginLogo: "",
  cornerIcon: "",
  siteIcon: "",
  siteDomain: "",
  tokenPlan: [],
  minTokenAmount: 0,
  newUserGiftTokens: 0,
  activityGifDays: 14,
  activityEndDate: undefined,

  stripeSecretKey: "",

  desktopAnnouncement: "",
  postAnnouncement: "",
  cornerQr: "",
  cornerEmail: "",
  cornerLink: "",
  loginAgreement: "",
  paymentAgreement: "",
  websiteAgreement: "",
  legalTerms: "",
  loginIntro: "",

  emailHost: "",
  emailAccount: "",
  emailPassword: "",

  alipayAppId: "",
  alipayPrivateKey: "",
  alipayPublicKey: "",

  discordBotEnable: false,
  discordUserId: "",
  discordBotToken: "",
  discordClientId: "",
  discordGuildId: "",
  discordApiBase: "",

  googleClientId: "",
  webDiscordClientId: "",

  sendSiteData: "",
  siteDataReceiveUrl: "",
});

const activeTab = ref("base");
const loading = ref(false);

// 获取网站信息
const loadInfo = async () => {
  try {
    const info = await service.base.site.info();
    info.tokenPlan = JSON.stringify(info.tokenPlan, null, 2);
    form.value = info;
  } catch (e) {
    console.error("获取网站信息失败", e);
  }
};

// 保存网站信息
const saveInfo = async () => {
  loading.value = true;
  const info = { ...form.value };
  info.tokenPlan = JSON.parse(info.tokenPlan);
  try {
    await service.base.site.save(info);
    ElMessage.success(t("保存成功"));
  } catch (e) {
    ElMessage.error(t("保存失败"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadInfo();
});
</script>

<style scoped lang="scss">
.site-config {
  .el-card {
    padding: 20px;
  }
}
</style>
