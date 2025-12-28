<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useDefaultBg } from '../../hooks/useDefaultBg';
import { useUserStore } from '/@/store/user';
const userStore = useUserStore();
const { defaultAvatarColor } = useDefaultBg();
const defaultAvatarRef = ref<HTMLDivElement>();
const fontSize = ref('12px');
onMounted(() => {
  fontSize.value = `${(defaultAvatarRef.value?.clientWidth || 24) / 2}px`;
  console.log('defaultAvatarRef.value?.clientWidth', defaultAvatarRef.value?.clientWidth);
});
</script>

<template>
  <div :class="[defaultAvatarColor, 'default-avatar']" ref="defaultAvatarRef">
    {{ userStore.info?.nickName?.slice(0, 1) || '' }}
  </div>
</template>
<style scoped lang="scss">
.default-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  font-size: v-bind(fontSize);
  font-weight: 600;
  color: #fff;
}
</style>
