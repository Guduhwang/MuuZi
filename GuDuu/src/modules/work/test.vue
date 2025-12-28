<template></template>
<script setup lang="js">
import { onMounted } from 'vue';
const { service } = useCool();
onMounted(async () => {
  const res = await service.base.sys.user.openDetail({ name: '超级管理员' });
  console.log(res, 8888);
});
</script>
