<template>
  <NodeViewWrapper as="span">
    <span class="chatInputButton-wrap">
      <ElButton @click="handleClick" plain size="small" class="chatInputButton-btn">
        {{ btnText }}
      </ElButton>
    </span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { TChatInputTimerForm } from './chat-input-timer-form/types/chat-input-timer-form.type';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import { ElButton } from 'element-plus';
import { computed, inject } from 'vue';
import './css/chatInputButton.scss';

defineOptions({
  name: 'ChatInputButton',
});

const props = defineProps({
  // node: nodeViewProps.node,
  ...nodeViewProps,
  form: {
    type: Object as PropType<Record<string, string | number | boolean>>,
    required: true,
  },
  timerFormData: {
    type: Object as PropType<TChatInputTimerForm>,
    required: false,
  },
});

const showChatInputForm =
  inject<
    (options: {
      editFormValue?: Record<string, string | number | boolean>;
      updateForm?: (newForm: Record<string, string | number | boolean>) => void;
    }) => void
  >('showChatInputForm')!;

const btnText = computed(() => {
  const form = props.node.attrs.form;
  if (form) {
    const keys = Object.keys(form);
    if (keys.length > 0) {
      return keys
        .map((key) => {
          return `${key}: ${form[key] || form[key] === 0 ? form[key] : ''}`;
        })
        .join(', ');
    }
  }
  return 'empty...';
});
function updateForm(newForm: Record<string, string | number | boolean>) {
  props.updateAttributes({
    form: newForm,
  });
}

function handleClick() {
  showChatInputForm({
    editFormValue: props.node.attrs.form,
    updateForm,
  });
}

defineExpose({});
</script>
