<template>
  <div class="wrap" :class="{ 'live-mode-wrap': app.isShowLive, theme }">
    <Header />
    <div class="cnt" :class="{ 'live-mode-cnt': app.isShowLive }">
      <WorkbenchContent />
    </div>
    <WorkbenchFooter />
    <WorkbenchDialog ref="workbenchDialogRef" />
    <MobileTip />
  </div>
</template>

<script setup lang="js">
import Header from '../components/layout/head/Head.vue';
import WorkbenchContent from './components/WorkbenchContent.vue';
import WorkbenchFooter from './components/WorkbenchFooter.vue';
import { useImStore } from '/@/store/im.store';
import { ref, provide, watchEffect, onMounted } from 'vue';
import WorkbenchDialog from './components/WorkbenchDialog.vue';
import { useUserStore } from '/@/store/user';
import MobileTip from '../components/mobile-tip/MobileTip.vue';
import { useBase } from '/$/base';
const isLogined = ref(false);
const userStore = useUserStore();
const imStore = useImStore();
const { app } = useBase();
watchEffect(() => {
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');
  isLogined.value = !!token && !!userInfo;
});

provide('isLogined', isLogined);
const theme = ref('light');

provide('updateTheme', function () {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
});

onMounted(async () => {
  imStore.refreshFriendList();
});
</script>
<style scoped lang="scss">
.dark {
  --theme-color: #201f22;
  --theme-bg-0-color: #000;
  --theme-bg-color: #201f22;
  --theme-border-color: #201f22;
  --theme-font-color: #fff;
  --theme-active-border-color: #3784f7;
}

.light {
  --theme-color: #201f22;
  --theme-bg-0-color: #f5f5f5;
  --theme-bg-color: #f8f7f7;
  --theme-border-color: #e0e0e0;
  --theme-font-color: #201f22;
  --theme-active-border-color: #3784f7;
}
.wrap {
  --theme-border-radius: 12px;

  position: relative;
  height: 100%;
  // background: var(--theme-bg-0-color);
  background: #f5f5f5;
  padding: 20px 0;
  padding-top: 50px;
  color: var(--theme-font-color);
  overflow-y: auto;
  padding-bottom: 80px;
  // background: url('https://pic4.zhimg.com/v2-49b40db996ada50a8d085cff1432207d_1440w.jpg');
}
.live-mode-wrap {
  padding-top: 42px;
}
.live-mode-cnt {
  padding: 0px !important;
}
.main {
  // background-color: #011627;
  width: 100vw;
  height: 100vh;
  color: white;
}

.cnt {
  width: 100%;
  height: 100%;
  padding: 20px 0 70px;
}
</style>
