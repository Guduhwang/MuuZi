<template>
  <ElDialog
    :modelValue="show"
    title=""
    width="1200"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :destroy-on-close="true"
    @close="$emit('update:show', false)"
  >
    <template #header>
      <div class="dialog-header">
        <span>Subscription</span>
      </div>
    </template>
    <div class="subscription-wrap">
      <el-tabs v-model="activeTab" class="subscription-tabs" @tab-change="handleTabChange" tabPosition="left">
        <el-tab-pane label="Plans&Pricing" name="pricing">
          <PlanList />
        </el-tab-pane>
        <el-tab-pane label="Current Plan" name="current">
          <CurrentPlan @upgrade="handleTabChange('pricing')" />
        </el-tab-pane>
        <el-tab-pane label="Credit History" name="credits">
          <CreditsInfo />
        </el-tab-pane>
        <!-- <el-tab-pane label="NFT" name="nft">
          <NFT />
        </el-tab-pane>
        <el-tab-pane label="Credit History" name="credits">
        <div class="credits-history-placeholder">
            <p>Credit History content will be here</p>
          </div>
        </el-tab-pane> -->
      </el-tabs>
    </div>
    <!-- <template #footer> -->
    <!-- <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm"> Confirm </el-button>
      </div> -->
    <!-- </template> -->
  </ElDialog>
</template>

<script setup lang="ts">
import PlanList from './components/PlanList.vue';
import CurrentPlan from './components/CurrentPlan.vue';
import NFT from '../setting_components/NFT.vue';
import CreditsInfo from './components/CreditsInfo.vue';
import { ref } from 'vue';

const props = defineProps<{
  show: boolean;
}>();
const emit = defineEmits(['update:show', 'handleConfirm']);
const activeTab = ref('pricing');
const handleClose = () => {
  emit('update:show', false);
};
const handleConfirm = () => {
  emit('handleConfirm');
};
const handleTabChange = (tab: string | number) => {
  activeTab.value = tab as string;
};
</script>

<style scoped lang="scss">
.subscription-wrap {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  border-radius: 10px;
}

.subscription-tabs {
  // 可以在这里添加自定义的 tabs 样式
  min-height: 400px;
}

.credits-history-placeholder {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  text-align: center;
  color: #666;
}

.pay-info {
  display: flex;
  align-items: center;
  position: relative;
  .img-wrap {
    margin-right: 20px;
    border-radius: 10px;
    overflow: hidden;
    width: 100px;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .info-wrap {
    flex: 1;
  }
  .info-price {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
