<template>
  <el-dialog
    v-model="visible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="true"
    class="workbench-dialog"
  >
    <div v-html="siteStore.info?.postAnnouncement" class="message-content"></div>
    <!-- <div class="dialog-content">
      <div class="title">
        <strong>GuDuuOS Closed Beta: Phase 2</strong>
      </div>

      <div class="section">
        <div class="section-title"><strong>Testing period:</strong>August 15 – September 15, 2025</div>
      </div>

      <div class="section">
        <div class="section-title">
          <strong>Focus Areas:</strong>
        </div>
        <ul class="focus-list">
          <li>1. Payment system functionality and bug testing</li>
          <li>2. Workflow, widget, and plugin modular separation bugs</li>
          <li>3. User-reported bugs from the early-stage public version rollout</li>
        </ul>
      </div>

      <div class="section">
        <p>
          The Open Beta is scheduled between September 15–30, 2025. We will announce the exact public release date and
          Closed Beta user reward plan on our official Twitter channel. Stay tuned!
        </p>
      </div>

      <div class="section">
        <div class="section-title">
          <strong>Contact Us:</strong>
        </div>
        <p>
          General inquiries:
          <a
            href="https://api.whatsapp.com/send/?phone=16463257453&text=Welcome%21+Thanks+for+reaching+out+about+GuDuu+OS+%E2%80%94+a+system+that+lets+you+freely+build+your+own+AI+workspace.+If+you%27re+interested+in+learning+more%2C+feel+free+to+message+me+anytime.&type=phone_number&app_absent=0"
            target="_blank"
            class="contact-link"
          >
            WhatsApp
          </a>
        </p>
      </div>
      <div class="section">
        <p>
          Technical issues, bug reports, or development-related questions:
          <span class="contact-link">support@guduu.co</span>
        </p>
      </div>
    </div> -->

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">Got it</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSiteStore } from '/@/store/site';
const siteStore = useSiteStore();
const visible = ref(false);

// 检查今天是否已经显示过弹窗
const checkTodayShown = (): boolean => {
  const today = new Date().toDateString();
  const lastShown = localStorage.getItem('workbench-dialog-last-shown');
  return lastShown === today;
};

// 标记今天已经显示过弹窗
const markTodayShown = (): void => {
  const today = new Date().toDateString();
  localStorage.setItem('workbench-dialog-last-shown', today);
};

// 显示弹窗
const showDialog = (): void => {
  if (!checkTodayShown()) {
    visible.value = true;
    markTodayShown();
  }
};

// 关闭弹窗
const handleClose = (): void => {
  visible.value = false;
};

// 暴露方法给父组件调用
defineExpose({
  showDialog,
});

// 组件挂载时自动检查并显示
onMounted(() => {
  showDialog();
});
</script>

<style scoped lang="scss">
.workbench-dialog {
  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.dialog-content {
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
  }

  .section {
    margin-bottom: 16px;

    .section-title {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .focus-list {
      margin: 8px 0;
      padding-left: 10px;

      li {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 4px;
      }
    }

    p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .contact-link {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style>
