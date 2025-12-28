<template>
  <div class="bg-[#f5f5f5] h-full">
    <div class="payment-container">
      <div class="payment-plan">
        <div class="text-[22px] font-bold mb-[16px]">Details</div>
        <div v-if="type === 'credits'" class="payment-detail-row">
          <div class="row-label">Item(s)</div>
          <div class="row-value">{{ credits }} Message Credit</div>
        </div>
        <div v-else class="payment-detail-row">
          <div class="row-label">Plan</div>
          <div class="row-value">Premium</div>
        </div>
        <template v-if="type === 'credits'">
          <div class="text-[22px] font-bold mb-[16px]">Order Summary</div>
          <div class="flex justify-between text-[22px]">
            <div class="">Total</div>
            <div class="">${{ formatAmount(price) }}</div>
          </div>
        </template>
        <template v-else>
          <div class="text-[22px] font-bold mb-[16px]">Subscription details</div>
          <div class="payment-detail-row">
            <div class="row-label">Trial</div>
            <div class="row-value">Free for 3 days</div>
          </div>
          <div class="payment-detail-row">
            <div class="row-label">Standard</div>
            <div class="row-value">19 USD / Month</div>
          </div>
          <div class="text-end text-[14px] text-[#999] mb-[16px]">For 12 months</div>
          <div class="flex justify-between text-[22px] font-bold">
            <div class="">Due today</div>
            <div class="">$19.00</div>
          </div>
        </template>
      </div>
      <div class="payment-method">
        <div class="text-[22px] font-bold mb-[16px]">Payment method</div>
        <div class="payment-method-item" v-for="item in payList" :key="item.label">
          <div class="method-item-title">
            <component class="w-[20px] h-[20px] text-[#0ea5e9]" :is="item.icon" />
            {{ item.label }}
          </div>
          <div class="method-item-desc">
            <el-checkbox v-model="item.checked" />
          </div>
        </div>
      </div>
    </div>
    <div class="payment-footer">
      <div class="payment-footer-content">
        <div class="payment-footer-item">
          <div class="text-[22px] font-bold mr-[16px]">Total:</div>
          <div class="text-[22px] font-bold text-[#0ea5e9]">${{ formatAmount(price) }}</div>
        </div>
        <div class="payment-footer-btn">
          <el-button type="primary" @click="handlePay" size="large">Pay now</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import IIconParkOutlineAlipay from '~icons/icon-park-outline/alipay';
// import ILineMdCreditCard from '~icons/line-md/credit-card';
import { formatAmount } from '/@/utils';
import { service } from '/@/cool';
// import { ElMessage } from 'element-plus';
import { useBase } from '/@/modules/base';
// import StripeCheckout from '/$/work/components/stripe-payment/StripeCheckout.vue';

const payList = ref([
  {
    label: 'Credit Card (Stripe)',
    icon: IIconParkOutlineAlipay,
    value: 'stripe',
    checked: true,
  },
  {
    label: 'Alipay',
    icon: IIconParkOutlineAlipay,
    value: 'alipay',
    checked: false,
  },
]);

// 获取url参数
const route = useRoute();
const router = useRouter();
const price = Number(route.query.price);
const credits = Number(route.query.credits);
const type = route.query.type;
const orderNo = ref((route.query.orderNo as string) || '');
const { eventStore } = useBase();

// 支付方式选择
const selectedPayMethod = ref('stripe'); // 默认选择 Stripe
const paymentProcessing = ref(false);

console.log(price, credits, type);
const handlePay = async () => {
  const res = await service.goods.order.rechargeToken({
    amount: price,
    tokenCount: credits,
  });
  const orderNo = res.orderNo;
  console.log(orderNo);
  eventStore.setOrderNo(orderNo);
  const payUrl = `${window.location.origin}/api/admin/base/alipay/pay?orderNo=${orderNo}`;
  // const payUrl = `https://cosmac.cc/api/admin/base/alipay/pay?orderNo=${orderNo}`;
  window.open(payUrl, '_self');
  // ElMessageBox.alert('After the payment is successful, please return to the page to check your points account', 'Tip', {
  //   // if you want to disable its autofocus
  //   // autofocus: false,
  //   confirmButtonText: 'OK',
  //   callback: () => {
  //     // 关闭当前窗口
  //     window.close();
  //   },
  // });
};
</script>

<style scoped lang="scss">
.payment-container {
  width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 20px;
  border-radius: 10px;
  .payment-plan,
  .payment-method {
    width: calc(50% - 10px);
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
  }
}
.payment-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 16px;
  margin-bottom: 10px;
}
.payment-method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 10px;
  color: #000;
  .method-item-title {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 16px;
  }
}
.payment-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 0px;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  .payment-footer-content {
    width: 1000px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .payment-footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    color: #000;
  }
  .payment-footer-btn {
    width: 100px;
  }
}
</style>
