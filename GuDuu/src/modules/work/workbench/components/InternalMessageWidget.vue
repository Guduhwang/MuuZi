<template>
  <WorkbenchWidgetWrap :title="title">
    <div class="internalMessageWidget-list">
      <div class="internalMessage-content">
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
          <p class="mb-[16px]">
            General inquiries:
            <a
              href="https://wa.me/16463257453?text=Welcome!%20Thanks%20for%20reaching%20out%20about%20GuDuu%20OS%20%E2%80%94%20a%20system%20that%20lets%20you%20freely%20build%20your%20own%20AI%20workspace.%20If%20you're%20interested%20in%20learning%20more%2C%20feel%20free%20to%20message%20me%20anytime."
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
      </div>
    </div>
    <div v-if="false" class="internalMessageWidget-todo-list">
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
      <div class="internalMessageWidget-todo-item"></div>
    </div>
  </WorkbenchWidgetWrap>
</template>

<script setup lang="ts">
import WorkbenchWidgetWrap from './WorkbenchWidgetWrap.vue';

const props = defineProps<{
  title: string;
}>();
</script>

<style lang="scss" scoped>
.internalMessageWidget-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f2f2f2;
  padding: 10px;
  border-radius: 10px;
  width: 100%;
  min-height: 100px;
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
.internalMessage-content {
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
</style>
