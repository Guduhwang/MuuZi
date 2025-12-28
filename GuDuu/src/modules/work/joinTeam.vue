<template>
  点击按钮加入团队
  <el-button :disabled="disabled" @click="join()">加入团队</el-button>
</template>
<script setup lang="js">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCool } from '/@/cool';
import { ElNotification } from 'element-plus';
const { service } = useCool();
const route = useRoute();
const key = ref(route.query.key);
const disabled = ref(false);

const isDisabled = async () => {
  const res = await service.base.groupMember.canJoin({ key: key.value });
  disabled.value = res.data;
};

const join = async () => {
  try {
    const res = await service.base.groupMember.joinTeam({ key: key.value });
    ElNotification({
      message: '已加入团',
    });
    disabled.value = true;
  } catch (e) {
    ElNotification({
      message: e.message,
    });
  }
};
onMounted(() => {
  isDisabled();
});
</script>
