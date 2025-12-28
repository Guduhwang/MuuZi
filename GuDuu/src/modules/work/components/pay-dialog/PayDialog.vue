<template>
  <ElDialog
    :modelValue="show"
    title="Confirm purchase information"
    width="500"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <div class="pay-info">
      <div class="img-wrap">
        <img :src="info.mainPic" alt="" />
      </div>
      <div class="info-wrap">
        <div class="info-title text-[16px] font-bold leading-[30px]">{{ info.title }}</div>
        <div class="info-sub-title text-[#666] text-[12px] leading-[24px]">{{ info.subTitle }}</div>
        <div class="info-sub-title text-[#666] text-[12px] leading-[24px]">at {{ info.updateTime }}</div>
        <div class="info-sub-title text-[#666] text-[12px] leading-[24px]">by {{ info.userName }}</div>
      </div>

      <div class="info-price text-[#666] text-[12px] leading-[24px]">{{ info.price }} Tokens</div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm"> Confirm </el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  info: Eps.GoodsInfoEntity;
}>();
const emit = defineEmits(['update:show', 'handleConfirm']);
const handleClose = () => {
  emit('update:show', false);
};
const handleConfirm = () => {
  emit('handleConfirm');
};
</script>

<style scoped lang="scss">
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
