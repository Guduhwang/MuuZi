<template>
  <div class="current-plan-container">
    <div class="vip-bg">
      <div class="vip-bg-content">
        <img v-if="currentVip.name === 'Free'" src="../imgs/free_bg.svg" alt="" />
        <img v-else src="../imgs/vip_bg.svg" alt="" />
      </div>
      <div class="vip-avatar">
        <img :src="userStore.info?.avatar" alt="" />
        <div class="user-info-name">{{ userStore.info?.nickName }}</div>
      </div>
      <div class="plan-name">Current Plan</div>
      <div class="user-info-free">
        <div v-if="currentVip.name === 'Free'" class="name-style">
          Free
          <div class="active-line"></div>
        </div>
        <div v-else class="name-style">
          {{ currentVip.name }} PLAN <span class="date-style">Expires on {{ formatDate2(userStore.info?.vipEndTime) }}</span>
          <div class="active-line"></div>
        </div>
        <div v-if="currentVip.name == 'Free'" class="">
          <el-button class="w-[140px]" @click="isShowDialogRedeem = true" type="primary" plain>Redeem</el-button>
          <el-button class="w-[140px]" type="primary" plain>Stake</el-button>
          <el-button class="w-[140px]" @click="handleUpgrade" type="primary">Upgrade</el-button>
        </div>
      </div>
    </div>
    <div class="vip-shadow"></div>
    <div class="vip-info">
      <div class="tokens-info">
        <div class="tokens-info-left">
          <div class="text-[28px] font-bold text-[#262626]">{{ token }}</div>
          <div @click="refreshToken" class="refresh-token">
            Remaining Credits
            <div class="w-[16px] h-[16px] ml-[4px]"><img src="../imgs/refresh.svg" alt="" /></div>
          </div>
        </div>
        <div class="tokens-info-right">
          <el-button class="w-[105px]" @click="openTopUpDialog" round type="warning">+ Add Credits</el-button>
        </div>
      </div>
      <div class="topup-history">
        <div class="topup-title">Top-up History‌</div>
        <div class="history-list">
          <div class="history-header">
            <div class="col token">Category</div>
            <div class="col usd">USD</div>
            <div class="col time">Time</div>
          </div>
          <div v-if="historyItems.length > 0" class="history-body">
            <div class="history-row" v-for="item in historyItems" :key="item.userId">
              <div class="col token">{{ getCateg(item) }}</div>
              <div class="col usd">{{ formatNumber(item.amount) }}</div>
              <div class="col time">{{ formatDate(item.updateTime) }}</div>
            </div>
          </div>
          <div class="mt-[24px]">
            <NoData tip="No top-up history‌ yet" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="false" class="current-plan-wrap mb-[20px]">
      <div v-if="!userStore.info?.couponInfo" class="current-plan-left">
        <div class="text-[24px] font-bold">{{ currentVip.name }}</div>
        <div class="text-[14px] text-[#999]">USD {{ currentVip.amount }} / {{ currentVip.period }} Days</div>
        <div v-if="userStore.info?.vipEndTime" class="text-[14px] text-[#666] mt-[8px]">
          Expires: {{ formatExpiryDate(userStore.info?.vipEndTime) }}
        </div>
      </div>
      <div v-else class="current-plan-left">
        <div class="text-[24px] font-bold">{{ userStore.info?.couponInfo.days }}-Days Trial Creator Annual Plan</div>
        <!-- <div class="text-[14px] text-[#999]">USD {{ currentVip.amount }} / {{ currentVip.period }} Days</div> -->
        <div v-if="userStore.info?.vipEndTime" class="text-[14px] text-[#666] mt-[8px]">
          Expires: {{ formatExpiryDate(userStore.info?.vipEndTime) }}
        </div>
      </div>
      <div v-if="currentVip.name === 'Free'" class="current-plan-right">
        <el-button type="primary" class="">Upgrade</el-button>
      </div>
    </div>
    <div v-if="false" class="flex justify-between items-center mb-[20px]">
      <div class="text-[16px] font-bold">Balance</div>
      <el-button type="primary" @click="openTopUpDialog" plain class="">Top up</el-button>
    </div>
    <div v-if="false" class="current-plan-wrap flex justify-between items-center mb-[20px]">
      <div class="balance-left">
        <div class="text-[16px] font-bold">Credits</div>
        <!-- <div v-if="!token" class="text-[14px] text-[#999]">
          Create are reset to 10 every day · Credits will reset in 9h 14m
        </div> -->
      </div>
      <div class="balance-right w-[200px] text-right">
        <div class="text-[14px] text-[#999] flex items-center justify-end">
          <span class="text-[24px] font-bold text-[#333]">{{ token }}</span>
          <!-- 刷新积分 -->
          <IMdiLightRefresh class="ml-[10px] cursor-pointer" @click="refreshToken" />
        </div>
        <!-- <div v-else class="text-[14px] text-[#999]"><span class="text-[24px] font-bold text-[#333]">10</span>/10</div> -->
        <!-- <el-progress v-if="!token" :percentage="100" :show-text="false" class="mt-[10px]" /> -->
      </div>
    </div>
  </div>
  <ElDialog
    v-model="isShowDialog"
    :close-on-click-modal="false"
    title="Top up credits"
    width="800px"
    @close="onTopupDialogClose"
  >
    <div class="dialog-content">
      <div class="dialog-title">Choose an Amount</div>
      <div class="amount-list">
        <div
          class="amount-item"
          :class="{ 'is-active': currentAmountIndex === index }"
          v-for="(item, index) in amountList"
          @click="handleAmountClick(item, index)"
          :key="index"
        >
          <div class="amount-item-left">
            <img src="../imgs/tokens_icon.svg" alt="" />
          </div>
          <div class="amount-item-right">
            <div class="text-[14px] text-[#262626]">
              <span class="text-[28px] font-bold text-[#262626]">{{ formatAmount(item.tokens || 0) }}</span>
              credits
            </div>
            <div class="flex items-center">
              <div class="value-style">USD {{ formatAmount(item.price || 0) }}</div>
            </div>
          </div>
        </div>
        <div
          class="amount-item"
          :class="{ 'is-active': currentAmountIndex === -1 }"
          @click="handleAmountClick({ tokens: num, price: num / 1000 }, -1)"
        >
          <div class="amount-item-right">
            <div class="resize-title">
              <div class="resize-img">
                <img src="../imgs/tokens_icon.svg" alt="" />
              </div>
              Customize
            </div>
            <div class="resize-count">
              <el-input-number class="w-[198px]" v-model="num" :min="9900" />
              <div class="">Credits</div>
            </div>
            <div class="flex items-center">
              <div class="value-style">USD {{ formatAmount(calculateCustomPrice) }}</div>
              <!-- <div class="text-[12px] text-[#999] mr-[10px] line-through">
                USD {{ formatAmount(calculateOriginalPrice) }}
              </div> -->
              <!-- <el-tag type="warning">10% Off</el-tag> -->
            </div>
          </div>
        </div>
      </div>
      <div class="button-group">
        <el-button type="default" @click="isShowDialog = false">Close</el-button>
        <el-button type="primary" @click="handleTopUp">Top up</el-button>
      </div>
    </div>
  </ElDialog>
  <ElDialog v-model="isShowDialogRedeem" :close-on-click-modal="false" title="Redeem" width="500px">
    <div class="dialog-content-redeem">
      <el-input v-model="exchangeCode" size="large" class="mb-[40px]" placeholder="Enter your redemption code" />
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleExchange"
        >Redemption</el-button
      >
    </div>
  </ElDialog>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue';
import { formatAmount } from '/@/utils';
import { router, service } from '/@/cool';
import { useBase } from '/@/modules/base';
import { useStore } from '/@/store';
import dayjs from 'dayjs';
import { Ref } from 'vue';
import NoData from '/@/modules/work/components/no-data/NoData.vue';
import { ElMessage } from 'element-plus';
import { useSiteStore } from '/@/store/site';
const isShowDialog = ref(false);
const isShowDialogRedeem = ref(false);
const num = ref(10);
const currentAmountIndex = ref(0);
const choosedItem = ref({
  tokens: 0,
  price: 0,
});
const { eventStore } = useBase();
const { userStore } = useStore();
const siteStore = useSiteStore();
const token = ref(0);
const exchangeCode = ref('');
const loading = ref(false);
const allVipList = ref([]);
const currentVip = ref<{ name: string; amount: number; period: number }>({
  name: 'Free',
  amount: 0,
  period: 30,
});
const amountList = ref<Array<{ tokens: number; price: number }>>([]);

interface HistoryData {
  userId: number;
  orderId: number;
  amount: number;
  type: number;
  tokens: number;
  vipType: number;
  status: number;
  updateTime: string;
}

// Top-up history 列表（示例数据，建议用接口替换）
const historyItems: Ref<HistoryData[]> = ref([]);
const emit = defineEmits(['upgrade']);
const handleUpgrade = () => {
  emit('upgrade');
};
function formatDate(t: string | number) {
  if (!t) return '';
  return dayjs(t).format('YYYY.MM.DD HH:mm');
}
function formatDate2(t: string | number) {
  if (!t) return '';
  return dayjs(t).format('YYYY-MM-DD');
}
function formatNumber(v: number) {
  if (v === null || v === undefined) return '';
  return new Intl.NumberFormat().format(v);
}
function getCateg(item: HistoryData) {
  debugger;
  if (item.type === 1) {
    return 'Tokens:' + item.tokens;
  } else if (item.type === 0) {
    return 'order:' + item.orderId;
  } else if (item.type === 2) {
    // 获取会员类型
    const vip = allVipList.value.find((vip) => vip.type === item.vipType);
    if (!vip) return '';
    let parentVip = '';
    if (vip && vip.type == 10) {
      parentVip = 'User ';
    } else if (vip && vip.type == 11) {
      parentVip = 'Creator ';
    } else {
      parentVip = 'Forever ';
    }
    return parentVip + vip.name;
  } else {
    return 'Other';
  }
}
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
    getCurrentVip();
  } catch (e) {}

  loading.value = false;
};
// 如果需要从后端获取历史记录，请在此处调用接口并赋值给 historyItems，例如：
async function loadHistory() {
  const res = await service.base.paidLog.list(); // 示例接口名
  console.log(res);
  historyItems.value = res;
}

const getUserPlan = async () => {
  const res = await service.base.vip.all();
  allVipList.value = res;
  getCurrentVip();
};
const getCurrentVip = async () => {
  console.log(userStore.info);
  allVipList.value.forEach((item: { name: string; amount: number; period: number; role: number }) => {
    if (userStore.info?.roleIds?.includes(item.role)) {
      currentVip.value = item;
      // 获取会员类型
      let parentVip = '';
      if (item.type == 10) {
        parentVip = 'User ';
      } else if (item.type == 11) {
        parentVip = 'Creator ';
      } else if (item.type == 12) {
        parentVip = 'Forever ';
      }
      currentVip.value.name = parentVip + item.name;
    }
  });
};
const handleAmountClick = (item: { tokens: number; price: number }, index: number) => {
  currentAmountIndex.value = index;
  if (index === -1) {
    choosedItem.value = {
      tokens: num.value,
      price: num.value / 1000,
    };
    return;
  }
  choosedItem.value = item;
};
// 计算自定义积分价格
const calculateCustomPrice = computed(() => {
  const price = num.value / 1000;
  return price;
});
// 计算原价
const calculateOriginalPrice = computed(() => {
  const price = num.value / 60;
  return price;
});

// 格式化到期时间
const formatExpiryDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('MMM DD, YYYY');
};
const openTopUpDialog = () => {
  isShowDialog.value = true;
  choosedItem.value = {
    tokens: amountList.value[0].tokens,
    price: amountList.value[0].price,
  };
  currentAmountIndex.value = 0;
};
const onTopupDialogClose = () => {
  try {
    clearInterval(timer.value);
  } catch (e) {}
  second = 0;
  eventStore.clearOrderNo();
};
const timer = ref(0);
let second = 0;
watch(
  () => eventStore.orderNo,
  (newVal) => {
    if (newVal && typeof newVal === 'string') {
      console.log('OrderNo changed:', newVal);
      // 循环查询订单是否支付成功
      timer.value = setInterval(async () => {
        try {
          const res = await service.goods.order.orderDetail({
            orderNo: newVal,
            NProgress: false, // 禁用进度条，避免轮询时频繁显示
          });
          second = second + 3;
          if (second > 180) {
            eventStore.clearOrderNo();
            clearInterval(timer.value);
            second = 0;
            return;
          }
          if (res.payStatus == '1') {
            // 支付成功，查询积分并清理orderNo
            await queryToken();
            eventStore.clearOrderNo();
            clearInterval(timer.value);
            second = 0;
          }
        } catch (error) {
          eventStore.clearOrderNo();
          console.error('Query order failed:', error);
          clearInterval(timer.value);
        }
      }, 3000);
    }
  },
  { immediate: true, deep: true },
);
const refreshToken = async () => {
  await queryToken();
};
// 监听storage变化，处理跨窗口的orderNo更新
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'orderNo' && e.newValue) {
    console.log('Storage changed, new orderNo:', e.newValue);
    // 手动更新store中的orderNo
    eventStore.setOrderNo(e.newValue);
  }
};

const handleTopUp = async () => {
  // 获取最小tokens的值
  const minTokens = siteStore.info?.minTokenAmount;
  if (choosedItem.value.tokens < (minTokens || 0)) {
    ElMessage.warning('The minimum tokens is ' + minTokens);
    return;
  }
  isShowDialog.value = false;
  // 生成订单
  const res = await service.goods.order.rechargeToken({
    amount: choosedItem.value.price,
    tokenCount: choosedItem.value.tokens,
  });
  const orderNo = res.orderNo;
  eventStore.setOrderNo(orderNo);

  let payUrl = `https://cosmac.cc/api/admin/base/stripe/pay?orderNo=${orderNo}`;

  const domain = window.location.hostname;
  if (domain.includes('guduu.co')) {
    payUrl = `${window.location.origin}/api/admin/base/stripe/pay?orderNo=${orderNo}`;
  }

  window.open(payUrl, '_blank');

  // window.open(`${window.location.origin}/payment?orderNo=${orderNo}`, '_blank');

  // 新窗口打开
  // window.open(
  //   `${window.location.origin}/payment?orderNo=${orderNo}&price=${choosedItem.value.price}&credits=${choosedItem.value.credits}&type=credits`,
  //   '_blank',
  // );
};
// 查询积分到账
const queryToken = async () => {
  const res = await service.base.comm.person();
  token.value = res.tokens;
};
onMounted(() => {
  // 从网站信息中获取token套餐 删除套餐中tokens==auto 的哪一项
  amountList.value = [];
  if (siteStore.info?.tokenPlan) {
    siteStore.info?.tokenPlan.forEach((item: { tokens: number; price: number }) => {
      if (item.tokens.toString() !== 'auto') {
        amountList.value.push(item);
      } else {
        num.value = item.price * 1000;
      }
    });
  }

  eventStore.clearOrderNo();
  getUserPlan();
  queryToken();
  // 添加storage事件监听
  window.addEventListener('storage', handleStorageChange);
  loadHistory(); // 需要时解除注释并实现接口
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  console.log('unmounted');
  window.removeEventListener('storage', handleStorageChange);
  clearInterval(timer.value);
});
</script>

<style lang="scss" scoped>
.current-plan-container {
  height: 606px;
  padding: 40px;
  background-color: #fff;
  .vip-bg {
    width: 100%;
    height: 140px;
    border-radius: 20px;
    border: 2px solid #262626;
    // background: var(--, #fff);
    box-shadow: 0 12px 0 0 #262626;
    position: relative;
    .vip-bg-content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      overflow: hidden;
      border-radius: 20px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .plan-name {
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      z-index: 9;
    }
    .user-info-free {
      position: absolute;
      display: flex;
      justify-content: space-between;
      align-items: center;
      right: 30px;
      left: 30px;
      bottom: 20px;
      z-index: 9;
      .name-style {
        font-size: 28px;
        font-weight: 700;
        height: 44px;
        line-height: 44px;
        color: #262626;
        position: relative;
        .date-style {
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: 20px;
        }
        .active-line {
          z-index: -1;
          position: absolute;
          left: 0px;
          top: 19px;
          width: 100%;
          height: 20px;
          opacity: 0.2;
          background: var(--color-theme);
        }
      }
    }
    .vip-avatar {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      border: 2px solid #262626;
      background-color: #fff;
      box-shadow: 0 0 0 2px #fff;
      position: absolute;
      top: -20px;
      left: 30px;
      z-index: 2;
      .user-info-name {
        width: 500px;
        position: absolute;
        left: 100px;
        bottom: 18px;
        font-size: 18px;
        font-weight: 700;
        color: #262626;
      }
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }
  }
  .vip-shadow {
    width: 100%;
    height: 28px;
    background: url('../imgs/shadow.svg') no-repeat center center;
    position: relative;
    top: 0;
    left: 0;
    z-index: 2;
  }
  .vip-info {
    overflow: hidden;
    position: relative;
    top: -27px;
    left: 30px;
    width: calc(100% - 60px);
    height: 386px;
    border-radius: 0 0 8px 8px;
    border-right: 1px solid #e6e6e6;
    border-bottom: 1px solid #e6e6e6;
    border-left: 1px solid #e6e6e6;
    background: linear-gradient(180deg, #fff 11.38%, #f5f5f5 98.66%);
    z-index: 999;
    padding: 30px;
    .tokens-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .tokens-info-left {
        display: flex;
        font-size: 28px;
        font-weight: 700;
        align-items: end;
        color: #262626;
        .refresh-token {
          display: flex;
          align-items: center;
          margin-left: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #595959;
          cursor: pointer;
          line-height: 36px;
        }
      }
      padding-bottom: 16px;
      border-bottom: 1px solid #e6e6e6;
    }
    .topup-history {
      margin-top: 16px;
      .topup-title {
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        color: #262626;
      }
      .history-list {
        margin-top: 12px;
        .history-header,
        .history-row {
          padding: 0 20px;
          display: flex;
          align-items: center;
          height: 42px;
          line-height: 42px;
          color: #262626;
          border-radius: 8px;
        }
        .history-header {
          font-weight: 600;
          font-size: 18px;
          background: #f3f3f3;
        }
        .history-body {
          height: 168px;
          overflow-y: auto;
          // 设置滚动条样式
          &::-webkit-scrollbar {
            width: 6px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: rgba(38, 38, 38, 0.1);
            border-radius: 10px;
          }
        }
        .history-row {
          font-size: 16px;
          &:hover {
            background: #fff;
          }
        }
        .col {
          padding: 0 8px;
          box-sizing: border-box;
        }
        .col.time {
          width: 200px;
          text-align: left;
        }
        .col.usd {
          width: 260px;
          text-align: right;
          padding-right: 16px;
        }
        .col.token {
          width: 290px;
          text-align: left;
          padding-right: 16px;
        }
      }
    }
  }
  .current-plan-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 20px;
  }
}
.model-list {
  .model-item {
    line-height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
.dialog-content {
  width: 760px;
  height: 496px;
  background-color: #fff;
  padding: 40px;
  border-radius: 12px;
  .dialog-title {
    padding-left: 10px;
    border-left: 4px solid #fa9819;
    height: 24px;
    line-height: 24px;
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 20px;
  }
}
.amount-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  .amount-item {
    width: calc(50% - 10px);
    height: 138px;
    display: flex;
    align-items: center;
    border: 2px solid #e5e5e5;
    padding: 20px;
    border-radius: 12px;
    cursor: pointer;
    background: url(../imgs/tokens_bottom.png) no-repeat center bottom;
    &.is-active {
      border-color: #fa9819;
    }
    &:hover {
      border-color: #fa9819;
    }
    .amount-item-left {
      width: 72px;
      height: 72px;
      font-size: 24px;
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24px;
    }
    .resize-title {
      color: #262626;
      font-size: 14px;
      font-weight: 600;
      line-height: 22px;
      display: flex;
      margin-bottom: 8px;
      .resize-img {
        width: 22px;
        height: 22px;
        margin-right: 4px;
        display: inline-block;
        vertical-align: middle;
      }
    }
    .resize-count {
      display: flex;
      align-items: end;
      grid-gap: 12px;
    }
    .value-style {
      font-size: 18px;
      font-weight: 500;
      color: #fa9819;
      line-height: 28px;
      height: 28px;
    }
  }
}
.dialog-content-redeem {
  padding: 80px 40px;
}
.button-group {
  width: 100%;
  display: flex;
  gap: 10px;
  margin-top: 40px;
  button {
    width: 50%;
  }
}
</style>
