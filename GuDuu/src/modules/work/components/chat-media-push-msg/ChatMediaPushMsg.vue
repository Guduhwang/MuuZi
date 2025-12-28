<template>
  <NodeViewWrapper as="span">
    <div v-if="msg?.code === 10000">
      Push success:<el-link :href="msg?.data?.url" target="_blank" type="primary">{{ msg?.data.url }}</el-link>
    </div>
    <ChatWorkflowErrorMsg v-else :errorMsg="msg?.msg" />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import type { TMediaPushMsg } from '/@/modules/work/types/message.type';
import ChatWorkflowErrorMsg from '/@/modules/work/components/chat-workflow-error-msg/ChatWorkflowErrorMsg.vue';
import { NodeViewWrapper } from '@tiptap/vue-3';

defineOptions({
  name: 'ChatMediaPushMsg',
});

withDefaults(
  defineProps<{
    msg: TMediaPushMsg;
  }>(),
  {},
);
</script>
