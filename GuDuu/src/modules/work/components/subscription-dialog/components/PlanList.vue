<template>
  <div class="plan-list-container">
    <div v-if="false" class="exchange-code">
      <el-input v-model="exchangeCode" placeholder="Redemption code" />
      <el-button type="primary" :loading="loading" @click="handleExchange">Redemption</el-button>
    </div>
    <div class="plan-list">
      <div
        class="plan-item"
        v-for="(item, index) in planListTotal"
        :key="item.totalName"
        :class="getPlanItemClass(index)"
      >
        <div class="plan-item-top text-[#999] mb-[16px]">
          <div class="plan-item-title">{{ item.totalName }}</div>
          <div class="params-tab">
            <div
              class="params-tab-item"
              v-for="j in item.tabList"
              :key="j.value"
              :class="{ active: j.isChecked }"
              @click="handleTabChange(j.value, item.tabList, item.currentPlan, item.list)"
            >
              <div v-if="j.isChecked" class="active-line"></div>
              {{ j.label }}
            </div>
          </div>
          <div class="plan-item-desc">
            <div class="leading-[30px] html-style" v-html="item.currentPlan.remark"></div>
          </div>
          <div class="plan-item-btn">
            <el-button
              :disabled="
                (!agreeChecked || (item.currentPlan.enablePay == 0 && item.currentPlan.useForm == 0)) &&
                (item.currentPlan.useForm == 0 || item.currentPlan.enablePay == 1)
              "
              type="primary"
              @click="handleSubscribe(item.currentPlan)"
              size="large"
              class="w-[100%] text-[24px] font-[700]"
            >
              <div class="flex items-center justify-center">
                <!-- 三种情况：
               1、item.currentPlan.enablePay == 1：显示  {{ item.currentPlan.amount }} USD Subscription
               2、item.currentPlan.enablePay == 0 && item.currentPlan.useForm == 1 ：显示  Contact Us
               3、item.currentPlan.enablePay == 0 && item.currentPlan.useForm == 0 ：显示  Coming Soon 
               totalName == 'Lifetime Plans' 显示 ATOM Subscription -->
                <span v-if="item.currentPlan.enablePay == 1 && item.totalName != 'Lifetime Plans'" class="text-[14px]">
                  Subscription -- ${{ item.currentPlan.amount }}/{{ palnUnit }}
                </span>
                <span
                  v-else-if="item.currentPlan.enablePay == 1 && item.totalName == 'Lifetime Plans'"
                  class="text-[14px]"
                >
                  Buy for {{ item.currentPlan.amount }}ATOM
                </span>
                <span v-else-if="item.currentPlan.useForm == 1" class="text-[14px]"> Contact Us</span>
                <span v-else class="text-[14px]"> Coming Soon</span>
              </div>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="planType == 'ForeverPlan'" class="plan-list">
      <div class="plan-item" v-for="item in planListNFT" :key="item.id">
        <div class="plan-item-top text-[#999] mb-[16px]">
          <div class="text-[16px] mb-[20px] text-[#333]">{{ item.name }}</div>
          <div class="mb-[8px]">
            <span class="text-[30px] text-[#333] font-bold">{{ formatAmount(item.amount) }}</span>
            <span class="ml-[10px] text-[12px]">ATOM · Lifetime </span>
          </div>
          <div class="plan-item-desc mb-[16px] min-h-[130px]">
            <div class="leading-[30px] html-style" v-html="item.remark"></div>
          </div>
          <div class="plan-item-btn">
            <el-button v-if="false" type="default" size="large" class="w-[100%]">Current plan</el-button>
            <el-button v-else type="primary" size="large" @click="goBuy(item.url || '')" class="w-[100%]"
              >Subscribe now</el-button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 新增：自动续费协议区域 -->
    <div class="auto-renew-agreement">
      <el-checkbox v-model="agreeChecked" class="agree-checkbox" />
      <div class="agree-text">
        <div class="agree-desc">
          This is an auto-renewing subscription. Your payment method will be charged automatically each billing period
          unless you cancel in your account settings.
        </div>
        <div class="agreement-link" role="button" tabindex="0" @click="openAgreementDialog">
          《Automatic Renewal Agreement》
        </div>
      </div>
    </div>

    <!-- 协议弹窗 -->
    <ElDialog
      :modelValue="showAgreementDialog"
      title="Automatic Renewal Agreement"
      width="1000"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      @close="showAgreementDialog = false"
    >
      <div class="agreement-dialog">
        <div class="agreement-content scrollbar" v-html="paymentAgreementHtml"></div>
        <div class="agreement-dialog-footer">
          <el-button @click="showAgreementDialog = false">Cancel</el-button>
          <el-button type="primary" @click="agreeFromDialog">I agree</el-button>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useCool } from '/@/cool';
import { formatAmount } from '/@/utils';
import { useBase } from '/@/modules/base';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSiteStore } from '/@/store/site'; // 新增
import dayjs from 'dayjs';
import type { Ref } from 'vue';
import { getIdentity } from '/@/utils';

const { eventStore, userStore } = useBase();
const { service, router } = useCool();
const siteStore = useSiteStore();

const tabList = ref<{ label: string; value: string; isChecked: boolean }[]>([
  { label: 'User', value: 'User', isChecked: true },
  { label: 'Creator', value: 'Creator', isChecked: false },
  { label: 'Forever Plan', value: 'ForeverPlan', isChecked: false },
]);
const planList = ref<Eps.VipEntity[]>([]);
const planListCreator = ref<Eps.VipEntity[]>([]);
const planListNFT = ref<Eps.VipEntity[]>([]);
const planListTotal = ref<Eps.VipEntity[]>([]);
const planType = ref('User');
const exchangeCode = ref('');
const loading = ref(false);

// 新增：协议相关状态
const agreeChecked = ref(false);
const showAgreementDialog = ref(false);
// 从 siteStore 中取出 paymentAgreement 内容（可能是带格式的 HTML）
const paymentAgreementHtml = computed(() => {
  // 根据你的 store 字段调整，这里尝试 siteStore.siteInfo.paymentAgreement 或 siteStore.info.paymentAgreement
  // 优先兼容 siteStore.siteInfo
  // @ts-ignore
  return siteStore.siteInfo?.paymentAgreement || siteStore.info?.paymentAgreement || '';
});
const palnUnit = ref('');
const handleTabChange = (
  value: string,
  tabList: { label: string; value: string; isChecked: boolean }[],
  currentPlan: Eps.VipEntity,
  list: Eps.VipEntity[],
) => {
  // 更新选中状态
  tabList.forEach((item) => {
    item.isChecked = item.value === value;
  });

  // 找到选中的计划
  const selectedPlan = list.find((item) => item.id == Number(value));
  const selectName = selectedPlan?.name;
  if (selectName == 'Monthly') {
    palnUnit.value = 'Month';
  } else if (selectName == 'Quarterly') {
    palnUnit.value = 'Quarter';
  } else if (selectName == 'Annual') {
    palnUnit.value = 'Year';
  } else {
    palnUnit.value = '';
  }
  if (selectedPlan) {
    // 找到对应的 planListTotal 项并更新其 currentPlan
    const targetItem = planListTotal.value.find((total) => total.list === list);
    if (targetItem) {
      targetItem.currentPlan = selectedPlan;
    }
  }
};

const getPlanList = async () => {
  const res = await service.base.vip.all();
  planList.value = res.filter((item: Eps.VipEntity) => item.type == 10);
  planListCreator.value = res.filter((item: Eps.VipEntity) => item.type == 11);
  planListNFT.value = res.filter((item: Eps.VipEntity) => item.type == 12);
  planListTotal.value = [
    {
      totalName: 'User Plans',
      list: planList.value,
      activeName: planList.value[0].name,
      tabList: getTabList(planList.value),
      currentPlan: planList.value[0],
    },
    {
      totalName: 'Creator Plans',
      list: planListCreator.value,
      activeName: planListCreator.value[0].name,
      tabList: getTabList(planListCreator.value),
      currentPlan: planListCreator.value[0],
    },
    {
      totalName: 'Lifetime Plans',
      list: planListNFT.value,
      activeName: planListNFT.value[0].name,
      tabList: getTabList(planListNFT.value),
      currentPlan: planListNFT.value[0],
    },
  ];
  console.log(planListTotal.value);

  // 初始化 palnUnit，根据第一个 User Plan 的名称
  if (planList.value.length > 0) {
    const firstPlanName = planList.value[0].name;
    if (firstPlanName == 'Monthly') {
      palnUnit.value = 'Month';
    } else if (firstPlanName == 'Quarterly') {
      palnUnit.value = 'Quarter';
    } else if (firstPlanName == 'Annual') {
      palnUnit.value = 'Year';
    } else {
      palnUnit.value = '';
    }
  }
};

const getTabList = (planList: Eps.VipEntity[]) => {
  const tabList: { isChecked: boolean; label: string; value: number }[] = [];
  planList.forEach((item) => {
    tabList.push({
      isChecked: item.id == planList[0].id,
      label: item.name as string,
      value: item.id as number,
    });
  });
  return tabList;
};

onMounted(() => {
  agreeChecked.value = false; // 初始化为未同意
  getPlanList();
});

// 协议相关方法
function openAgreementDialog() {
  showAgreementDialog.value = true;
}
function agreeFromDialog() {
  agreeChecked.value = true;
  showAgreementDialog.value = false;
}
function formatDate(t: string | number) {
  if (!t) return '';
  return dayjs(t).format('YYYY.MM.DD HH:mm');
}
function formatNumber(v: number) {
  if (v === null || v === undefined) return '';
  return new Intl.NumberFormat().format(v);
}
// 判断角色
const userIdentity = (v: number) => {
  return getIdentity([v]);
};
// 其余现有方法保持不变...
const handleSubscribe = async (item: Eps.VipEntity) => {
  console.log(userIdentity(item.role));

  // 检查用户角色，如果包含角色 8（团员角色），显示提示弹窗
  if (
    userStore.info?.roleIds?.includes(8) &&
    (userIdentity(item.role) == 'level_2' || userIdentity(item.role) == 'level_3')
  ) {
    ElMessageBox.confirm(
      'You are already a member of another team. You cannot subscribe to the current plan. Please register a new user account to subscribe.',
      'Subscription Notice',
      {
        confirmButtonText: 'Go to Register',
        cancelButtonText: 'Cancel',
        type: 'warning',
        distinguishCancelAndClose: true,
      },
    )
      .then(() => {
        // 前往注册：使用 window.location.href 进行完整页面跳转
        // 先保存邀请码，然后清除登录状态并跳转到登录页面
        const invitationKey = userStore.info?.key || '';
        userStore.clear();
        // 使用完整页面跳转，触发页面重新加载，这样路由守卫会重新检查登录状态
        window.location.href = '/login?invitation=' + invitationKey;
      })
      .catch(() => {
        // 用户点击取消，不做任何操作
      });
    return;
  }

  if (item.url) {
    goBuy(item.url);
    return;
  }
  const res = await service.goods.order.buyVip({
    vipId: item.id,
  });
  const orderNo = res.orderNo;
  console.log(orderNo);
  eventStore.setOrderNo(orderNo);

  let payUrl = `https://cosmac.cc/api/admin/base/stripe/subscribe?orderNo=${orderNo}`;

  const domain = window.location.hostname;
  if (domain.includes('guduu.co')) {
    payUrl = `${window.location.origin}/api/admin/base/stripe/subscribe?orderNo=${orderNo}`;
  }

  window.open(payUrl, '_blank');
};
const goBuy = (url: string) => {
  window.open(url, '_blank');
};
const handleExchange = async () => {
  loading.value = true;
  if (exchangeCode.value.trim() === '') {
    ElMessage.warning('Please enter the redemption code');
    loading.value = false;
    return;
  }

  try {
    const res = await service.base.coupon.use({
      code: exchangeCode.value,
    });
    ElMessage.success('Redemption successful');
    // 刷新userInfo
    userStore.get();
    exchangeCode.value = '';
  } catch (e) {}

  loading.value = false;
};

// 根据索引返回套餐卡片的类名
const getPlanItemClass = (index: number) => {
  const classes = ['plan-item-left', 'plan-item-mid', 'plan-item-right'];
  return classes[index % 3] || '';
};
</script>

<style scoped lang="scss">
.plan-list-container {
  height: 596px;
  padding: 40px;
  border-radius: 20px;
  background-color: #fff;
  .plan-list {
    display: flex;
    gap: 20px;
    .plan-item {
      width: 290px;
      height: 479px;
      position: relative;
      background-color: #fff;
      border-radius: 20px;
      border: 1px solid #e5e5e5;
      padding: 0 20px 20px 20px;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        border-color: #262626;
      }

      // 左侧卡片样式
      &.plan-item-left {
        &:hover .plan-item-title {
          background: url(../imgs/title_left.svg);
          background-size: 100% auto;
          background-repeat: no-repeat;
          background-position: left center;
        }
      }

      // 中间卡片样式
      &.plan-item-mid {
        &:hover .plan-item-title {
          background: url(../imgs/title_med.svg);
          background-size: 100% auto;
          background-repeat: no-repeat;
          background-position: center center;
        }
      }

      // 右侧卡片样式
      &.plan-item-right {
        &:hover .plan-item-title {
          background: url(../imgs/title_right.svg);
          background-size: 100% auto;
          background-repeat: no-repeat;
          background-position: right center;
        }
      }
      .plan-item-title {
        width: calc(100% + 40px);
        position: relative;
        left: -20px;
        padding: 0 20px;
        height: 74px;
        line-height: 74px;
        font-size: 18px;
        font-weight: 700;
        color: #262626;
        text-align: center;
        margin-bottom: 8px;
      }
      .plan-item-desc {
        width: calc(100% + 40px);
        position: relative;
        left: -20px;
        padding: 0 20px;
        height: 268px;
        overflow-y: auto;
        &::-webkit-scrollbar {
          width: 6px;
          background: #fff;
          border-radius: 2px;
        }
        &::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 2px;
        }
      }
      .plan-item-btn {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
      }
    }
  }
}
.type-item {
  margin-top: 16px;
  .type-item-title {
    font-size: 16px;
    color: #333;
  }
  .type-item-desc {
    font-size: 14px;
    color: #999;
  }
}
.html-style {
  color: #262626;

  :deep(ul) {
    list-style-type: disc;

    li {
      line-height: 20px;
      margin-bottom: 8px;
    }
  }
}
.exchange-code {
  position: absolute;
  top: 21px;
  right: 23px;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.params-tab {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  .plan-list-title {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    text-shadow: 0 2px 0 #fff;
    position: absolute;
    right: 0px;
    top: 0px;
  }
}
.params-tab-item {
  cursor: pointer;
  position: relative;
  z-index: 1;
  .active-line {
    z-index: -1;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 60px;
    height: 12px;
    opacity: 0.5;
    background: var(--color-theme);
  }
  &.active {
    color: #262626;
    font-weight: 600;
    font-size: 16px;
  }
}
/* 新增：自动续费协议样式 */
.auto-renew-agreement {
  margin-top: 16px;
  position: absolute;
  left: 40px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  .agree-checkbox {
  }
  .agree-text {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    line-height: 20px;
    .agree-desc {
      color: #262626;
    }
    .agreement-link {
      color: var(--color-theme, #fa9819);
      cursor: pointer;
      font-weight: 500;
      display: inline-block;
    }
    .agreement-link:hover {
      text-decoration: underline;
    }
  }
}

/* 弹窗底部按钮样式：两个按钮各占一半宽度 */

.agreement-dialog {
  height: 596px;
  padding: 30px 30px 80px;
  overflow: auto;
  border-radius: 12px;
  background: #fff;
  .agreement-content {
    height: 469px;
    overflow-y: auto;
  }
  .agreement-dialog-footer {
    width: calc(100% - 100px);
    display: flex;
    justify-content: space-between;
    gap: 10px;
    position: absolute;
    bottom: 50px;
    left: 50px;
    button {
      width: 50%;
    }
  }
}
</style>
