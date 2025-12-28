<template>
  <div>
    <WorkbenchWidgetWrap :title="title">
      <div class="internalMessageWidget-list">
        <img src="../static/img/ad.png" @click="handleAdClick" class="w-full h-full cursor-pointer rounded-[6px]" />
      </div>
    </WorkbenchWidgetWrap>

    <ApplyProfile v-model:show="isShowApplyForProfile" />
  </div>
</template>

<script setup lang="ts">
import WorkbenchWidgetWrap from './WorkbenchWidgetWrap.vue';
import ApplyProfile from '../../components/apply-profile/ApplyProfile.vue';
import { ref } from 'vue';
import { useUserStore } from '/@/store/user';
import { useCool } from '/@/cool';
import { ElMessage, ElMessageBox } from 'element-plus';
const { service, router } = useCool();

const userStore = useUserStore();

const props = defineProps<{
  title: string;
}>();

const isShowApplyForProfile = ref(false);

const handleAdClick = () => {
  // 判断是否有角色
  if (
    !userStore.info?.roleIds?.includes(6) &&
    !userStore.info?.roleIds?.includes(7) &&
    !userStore.info?.roleIds?.includes(8) &&
    !userStore.info?.roleIds?.includes(9)
  ) {
    // 不是6团长 7副团长 8团员 没有权限进入个人主页
    ElMessageBox.confirm('You do not have permission to enter the personal homepage', '', {
      confirmButtonText: 'Apply as Creator',
      cancelButtonText: 'Cancel',
      type: 'info',
    })
      .then(async () => {
        // 申请个人博主
        const res = await service.base.sys.user.becomeBlogger();
        // 跳转到个人主页

        // router.push('/work/personal-homepage/@' + userStore.info?.name);
        if (res) {
          ElMessage.success('Apply as Creator Success');
        }
      })
      .catch(() => {});
  }
};
</script>

<style lang="scss" scoped>
.internalMessageWidget-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f2f2f2;
  // padding: 10px;
  border-radius: 10px;
  width: 100%;
  // min-height: 100px;
}

.internalMessageWidget-todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 10px;
  padding-block: 10px;
}

.internalMessageWidget-todo-item {
  background: #f2f2f2;
  padding: 10px;
  border-radius: 10px;
}
</style>
