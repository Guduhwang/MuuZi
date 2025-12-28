<template>
  <div class="personalHomepage-team">
    <!-- 半透明遮罩 -->
    <div v-if="showMask" class="personalHomepage-mask">
      <el-button type="primary" class="btn-pro-member" @click="isShowSubscription = true"> PRO Member </el-button>
    </div>

    <el-row class="mb-[24px]" :gutter="20">
      <el-col :span="24">
        <div class="personalHomepage-team-item account-overview">
          <div class="item-head">
            <div class="item-head-title">
              <div class="item-head-title-text">Account Overview</div>
              <div class="item-head-title-subtext">
                {{ `Data from ${startDate} to ${endDate}` }}
              </div>
            </div>
            <div class="item-head-right">
              <cl-select-button v-model="type" :options="options.type" small />
            </div>
          </div>
          <div class="">
            <!-- 第一行指标 -->
            <div class="metrics-row">
              <div class="metric-item">
                <div class="metric-value">0</div>
                <div class="metric-label">Registered Users</div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <div class="metric-value">0</div>
                <div class="metric-label">First Deposit Users</div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <div class="metric-value">0</div>
                <div class="metric-label">Trading Users</div>
              </div>
            </div>
            <!-- 第二行指标 -->
            <div class="metrics-row">
              <div class="metric-item">
                <div class="metric-value-with-unit">
                  <span class="value">0</span>
                  <span class="unit">USD</span>
                </div>
                <div class="metric-label">Clients' Trading Volume</div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <div class="metric-value-with-unit">
                  <span class="value">0</span>
                  <span class="unit">USD</span>
                </div>
                <div class="metric-label">Clients Commissions</div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <div class="metric-value-with-unit">
                  <span class="value">0</span>
                  <span class="unit">USD</span>
                </div>
                <div class="metric-label">Sub-Affiliates Commissions</div>
              </div>
            </div>
            <!-- 折线图区域 -->
            <div class="chart-container">
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-dot sign-ups"></div>
                  <span>Sign Ups</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot first-deposits"></div>
                  <span>First Time Deposits</span>
                </div>
              </div>
              <div class="chart-placeholder">
                <v-chart :option="chartOption" autoresize />
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="mb-[24px]" :gutter="20">
      <el-col :span="span">
        <div class="personalHomepage-team-item account-balance">
          <div class="gold-style">
            <img src="/@/assets/imgs/personal/gold.svg" />
          </div>
          <div class="item-head">
            <div class="item-head-title">
              <div class="item-head-title-text">Account Balance</div>
            </div>
            <div class="item-head-right">
              <el-button @click="handleViewBalance" class="team-btn">Details</el-button>
            </div>
          </div>
          <div class="item-body">
            <div class="balance-main">
              <div class="balance-amount">
                <span class="balance-value">≈ 0</span>
                <span class="balance-unit">USD</span>
              </div>
              <div class="balance-pending">≈ 0 USD pending</div>
            </div>
            <div class="balance-list">
              <div class="balance-list-title">Recent Transactions</div>
              <div class="balance-item">
                <div class="balance-item-icon">
                  <img src="/@/assets/imgs/personal/small_b.svg" alt="" />
                </div>
                <span class="balance-item-text">+ 0 USD · Commission</span>
              </div>
              <div class="balance-item">
                <div class="balance-item-icon">
                  <img src="/@/assets/imgs/personal/small_b.svg" alt="" />
                </div>
                <span class="balance-item-text">+ 0 USD · Commission</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="span">
        <div class="personalHomepage-team-item commission-tier">
          <div class="percent-style">
            <img src="/@/assets/imgs/personal/percent.svg" />
          </div>
          <div class="item-head">
            <div class="item-head-title">
              <div class="item-head-title-text">My Commission Tier</div>
            </div>
            <div class="item-head-right">
              <el-button
                class="team-btn"
                :disabled="
                  getIdentity(userInfo?.value?.roleIds ?? []) == 'level_2' ||
                  getIdentity(userInfo?.value?.roleIds ?? []) == 'level_3' ||
                  userInfo?.value?.roleIds?.includes(7)
                "
                @click="handleSave"
                >Save</el-button
              >
            </div>
          </div>
          <div class="commission-content">
            <div class="commission-row">
              <span class="commission-label">Profit From Your Clients' Trades:</span>
              <el-input-number
                v-model="currentTeam.allocationRatio"
                :min="0"
                :max="100"
                class="commission-input"
                controls-position="right"
              />
              <span class="commission-percent">%</span>
            </div>
            <div class="commission-row">
              <span class="commission-label">Your Bonus Pool:</span>
              <el-input-number
                v-model="currentTeam.rewardPool"
                :min="0"
                :max="100"
                class="commission-input"
                controls-position="right"
              />
              <span class="commission-percent">%</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="mb-[24px]" :gutter="20">
      <el-col :span="24">
        <div class="personalHomepage-team-item promotion-tools">
          <div class="item-head">
            <div class="item-head-title">
              <div class="item-head-title-text">My Promotion Tools</div>
            </div>
            <div class="item-head-right">
              <el-button @click="handleManage" class="team-btn">Manage</el-button>
            </div>
          </div>
          <div class="">
            <div class="promotion-item">
              <span class="promotion-label">Referral Code:</span>
              <span class="promotion-value">{{ invitationCode }}</span>
              <el-button link type="primary" class="copy-link" @click="handleCopyReferralLink(invitationCode)">
                Copy
              </el-button>
            </div>
            <div class="promotion-item">
              <span class="promotion-label">Referral Link(My Sign-Up Page):</span>
              <span class="promotion-value">{{ referralLink }}</span>
              <el-button link type="primary" class="copy-link" @click="handleCopyReferralLink(referralLink)">
                Copy
              </el-button>
            </div>
            <div class="promotion-item promotion-item-row">
              <div class="promotion-item">
                <span class="promotion-label">Create short link with your affiliate ID,</span>
                <el-button link type="primary" class="copy-link" :loading="shortLoading" @click="handleCreateShortLink">
                  Create now
                </el-button>
              </div>
              <div v-if="shortReferralLink" class="promotion-item">
                <span class="promotion-label">Short Link:</span>
                <span class="promotion-value">{{ shortReferralLink }}</span>
                <el-button link type="primary" class="copy-link" @click="handleCopyReferralLink(shortReferralLink)">
                  Copy
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="" :gutter="24">
      <el-col :span="24">
        <div class="personalHomepage-team-item">
          <div class="item-head">
            <div class="item-head-title">
              <div class="item-head-title-text">Recent Signups</div>
            </div>
          </div>
          <div class="">
            <cl-crud ref="Crud">
              <cl-table ref="Table" :max-height="200" />
            </cl-crud>
          </div>
        </div>
      </el-col>
    </el-row>

    <BalanceDialog v-model:show="showBalanceDialog" @openCommissionDialog="handleOpenCommissionDialog" />
    <CommissionDialog v-model:show="showCommissionDialog" />
    <ManageMembers :teamList="teamList" :teamId="activeItem" v-model:show="showManageDialog" />
    <SubscriptionDialog v-model:show="isShowSubscription" />
  </div>
</template>

<script setup lang="ts">
import './css/personalTeam.scss';
import { useCrud, useTable } from '@cool-vue/crud';
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCool } from '/@/cool';
import { range } from 'lodash-es';
import BalanceDialog from './BalanceDialog.vue';
import CommissionDialog from './CommissionDialog.vue';
import ManageMembers from './ManageMembers.vue';
import { useUserStore } from '/@/store/user';
import { storeToRefs } from 'pinia';
import avatar from '/@/modules/base/components/avatar';
import { ElMessage } from 'element-plus';
import { useBase } from '/$/base';
import SubscriptionDialog from '/@/modules/work/components/subscription-dialog/SubscriptionDialog.vue';
import { getIdentity } from '/@/utils';
import { useSiteStore } from '/@/store/site';
const siteStore = useSiteStore();

const { app } = useBase();

const span = app.isShowLive ? 24 : 12;
const { service } = useCool();
const props = defineProps<{
  // title: string;
}>();
const { t } = useI18n();
const userStore = useUserStore();
const { info: userInfo } = storeToRefs(userStore);
// 添加遮罩控制变量
const showMask = ref(false);
// 添加遮罩点击处理函数
const handleMaskClick = () => {
  showMask.value = false;
};
// 添加一个方法来显示遮罩（可以根据需要调用）
const showOverlayMask = () => {
  showMask.value = true;
};

const referralLink = ref('');
const shortReferralLink = ref('');
const shortLoading = ref(false);
const isShowSubscription = ref(false);

const SHORT_IO_DOMAIN = 'guduu.short.gy';
const SHORT_IO_API_KEY = import.meta.env.VITE_SHOTIO_APIKEY;

const handleCreateShortLink = async () => {
  shortLoading.value = true;
  try {
    const res = await service.base.shortLink.add({
      originalUrl: referralLink.value,
    });
    const shortKey = res.shortKey;
    const domain = window.location.origin;
    // https://guduu.co/s/EkKtai
    shortReferralLink.value = `${domain}/s/${shortKey}`;
    // const res = await fetch('https://api.short.io/links', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     authorization: SHORT_IO_API_KEY,
    //   },
    //   body: JSON.stringify({
    //     originalURL: referralLink.value,
    //     domain: SHORT_IO_DOMAIN,
    //   }),
    // });
    // 保存短链接
    await service.base.comm.personUpdate({
      invitationShortUrl: shortReferralLink.value,
      id: userInfo.value?.id,
    });
    // 更新缓存中的userInfo
    userStore.get();
  } catch (e) {
    shortReferralLink.value = 'Error';
  }
  shortLoading.value = false;
};

const startDate = ref('2024-01-01');
const endDate = ref('2024-01-01');
const type = ref('24H');

// 生成假数据：24小时的数据点（0-23）
const generateChartData = () => {
  // Sign Ups 数据（绿色线）- 范围 0-800
  const signUpsData = range(24).map(() => Math.floor(Math.random() * 800));

  // First Time Deposits 数据（橙色线）- 范围 0-800，通常比 Sign Ups 少一些
  const firstDepositsData = range(24).map(() => Math.floor(Math.random() * 600));
  return {
    signUpsData,
    firstDepositsData,
  };
};

// ECharts 配置
const chartOption = reactive({
  grid: {
    left: 40,
    right: 20,
    top: 10,
    bottom: 30,
    containLabel: false,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: range(24).map((i) => i.toString()),
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#999999',
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      lineHeight: 20,
    },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 800,
    interval: 200,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#e6e6e6',
        type: 'solid',
        width: 1,
      },
    },
    axisLabel: {
      color: '#999999',
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      lineHeight: 20,
      formatter: (value: number) => value.toString(),
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
    },
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    textStyle: {
      color: '#fff',
      fontSize: 12,
    },
  },
  legend: {
    show: false, // 图例已经在模板中手动实现了
  },
  series: [
    {
      name: 'Sign Ups',
      type: 'line',
      data: [] as number[],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      itemStyle: {
        color: '#22c55e',
      },
      lineStyle: {
        color: '#22c55e',
        width: 2,
      },
    },
    {
      name: 'First Time Deposits',
      type: 'line',
      data: [] as number[],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      itemStyle: {
        color: '#fa9819',
      },
      lineStyle: {
        color: '#fa9819',
        width: 2,
      },
    },
  ],
});

// 初始化图表数据
const initChartData = () => {
  const { signUpsData, firstDepositsData } = generateChartData();
  chartOption.series[0].data = signUpsData;
  chartOption.series[1].data = firstDepositsData;
};

const options = reactive({
  type: [
    { label: '24H', value: '24H' },
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '1Y', value: '1Y' },
    { label: 'All', value: 'All' },
  ],
  currency: [
    { label: 'USD', value: 'USD' },
    { label: 'CNY', value: 'CNY' },
  ],
});
const showBalanceDialog = ref(false);
const showCommissionDialog = ref(false);
const showManageDialog = ref(false);
const activeItem = ref(0);
const invitationCode = ref('');
const teamMember = ref<
  Array<{
    userId?: number;
    level1?: number;
    level2?: number;
    level3?: number;
    [key: string]: unknown;
  }>
>([]);
const teamList = ref<Eps.BaseSysUserEntity[]>([]);
const num1 = ref(0);
const num2 = ref(0);
const currentTeam = ref<Eps.BaseSysUserEntity>({} as Eps.BaseSysUserEntity);
const getTeamList = async () => {
  teamList.value = await service.base.groupMember.teams();
  if (teamList.value.length > 0) {
    currentTeam.value = teamList.value[0];
    num1.value = teamList.value[0].allocationRatio ?? 0;
    num2.value = teamList.value[0].rewardPool ?? 0;
    activeItem.value = teamList.value[0].id ?? 0;
    await getTeamMember();
    Crud.value?.refresh();
    invitationCode.value = getInvitationCode();
  }
};
// 监听缓存中的角色变化
watch(
  () => userInfo.value?.roleIds,
  (newRoleIds, oldRoleIds) => {
    console.log('角色变化:', { newRoleIds, oldRoleIds });
    // 判断权限
    if (
      getIdentity(newRoleIds ?? []) === 'level_2' ||
      getIdentity(newRoleIds ?? []) === 'level_3' ||
      newRoleIds?.includes(7)
      // newRoleIds?.includes(8)
    ) {
      handleMaskClick();
    } else {
      showOverlayMask();
    }
  },
  { deep: true, immediate: true },
);
const getInvitationCode = () => {
  if (teamMember.value.length === 0) {
    return '';
  }
  const me = teamMember.value.find((item) => item.userId === userInfo.value?.id);
  if (me) {
    return btoa(`team_${activeItem.value}_${me.level1}_${me.level2}_${me.level3}`);
  }
  return '';
};
const getTeamMember = async () => {
  const res = await service.base.groupMember.memberList({
    groupIds: [activeItem.value],
  });
  teamMember.value = res[0].members;
};
const currency = ref('');
// cl-crud groupMember.memberList
const Crud = useCrud(
  {
    service: service.base.groupMember,
    dict: {
      api: {
        page: 'memberList',
      },
    },
    async onRefresh(params, { next, done, render }) {
      if (!activeItem.value) {
        done();
        return;
      }
      params.groupIds = [activeItem.value];
      const res = await next(params);
      render(res.list[0].members);
      done();
    },
  },
  (app) => {
    app.refresh();
  },
);
const Table = useTable({
  autoHeight: false,
  columns: [
    {
      label: 'Clients',
      prop: 'name',
      minWidth: 120,
    },
    {
      label: 'Time of Joining',
      prop: 'createTime',
      minWidth: 120,
    },
    {
      label: 'KYC',
      prop: 'kyc',
      minWidth: 100,
      formatter() {
        return 'No';
      },
    },
    {
      label: 'First-Time Deposited',
      prop: 'updateTime',
      minWidth: 100,
    },
  ],
});
const handleViewBalance = () => {
  showBalanceDialog.value = true;
};
const handleOpenCommissionDialog = () => {
  showBalanceDialog.value = false;
  showCommissionDialog.value = true;
};
const handleManage = () => {
  showManageDialog.value = true;
};
const handleSave = async () => {
  const res = await service.base.group.updateGroupInfo({
    groupId: currentTeam.value.id,
    info: {
      name: currentTeam.value.name,
      remark: currentTeam.value.remark,
      avatar: currentTeam.value.avatar,
      allocationRatio: currentTeam.value.allocationRatio,
      rewardPool: currentTeam.value.rewardPool,
      row: currentTeam.value.row,
      col: currentTeam.value.col,
    },
  });
  if (res) {
    ElMessage.success('Save success');
    await getTeamList();
  }
};
const handleCopyReferralLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link);
    ElMessage.success('Copied!');
  } catch (e) {
    ElMessage.error('Copy failed');
  }
};
onMounted(async () => {
  console.log(userInfo.value);
  console.log(getIdentity(userInfo.value?.roleIds ?? []));
  // 判断权限
  if (
    getIdentity(userInfo.value?.roleIds ?? []) === 'level_2' ||
    getIdentity(userInfo.value?.roleIds ?? []) === 'level_3' ||
    userInfo.value?.roleIds?.includes(7) ||
    userInfo.value?.roleIds?.includes(8)
  ) {
    handleMaskClick();
  } else {
    showOverlayMask();
  }
  shortReferralLink.value = userInfo.value?.invitationShortUrl ?? '';
  await getTeamList();
  referralLink.value = `https://${siteStore.info?.siteDomain}/login?invitation=${invitationCode.value}`;
  // 初始化图表数据
  initChartData();
});
</script>
