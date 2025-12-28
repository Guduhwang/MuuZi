<template>
  <NodeViewWrapper as="span">
    <!-- <span class="chatFlexibleInput-wrap" :class="{ invalid: !isValid }" @click="handleClick" @paste="handleClick">
      <span class="chatFlexibleInput-label">{{ node.attrs?.param?.name }}</span>
      <div class="chatFlexibleInput-input-wrap">
        <span
          ref="inputRef"
          :contenteditable="node.attrs.readonly ? false : true"
          class="chatFlexibleInput-input"
          :class="{ maxWidth: !!node.attrs.maxWidth }"
          :style="{ maxWidth: node.attrs.maxWidth ? `${node.attrs.maxWidth}px` : 'none' }"
          @input="onInput"
          @keydown="onKeydown"
          @blur="handleValidate"
          @paste="onPaste"
        ></span>
        <span v-if="!node.attrs.value" class="chatFlexibleInput-placeholder">{{
          node.attrs.placeholder || 'Please input'
        }}</span>
      </div>
    </span> -->
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import { useTemplateRef, onMounted, watch, ref } from 'vue';
import './css/chatFlexibleInput.scss';

defineOptions({
  name: 'ChatFlexibleInput',
});

const props = defineProps({
  ...nodeViewProps,
});

const inputRef = useTemplateRef<HTMLElement>('inputRef');
// 输入框内容是否合法
const isValid = ref(true);

// 输入事件处理
const onInput = (event: Event) => {
  const target = event.target as HTMLElement;
  const newValue = target.textContent || '';

  // emit('input', newValue);
  props.updateAttributes({
    value: newValue,
  });
  props.node.attrs.onInput?.(newValue);
};

// 键盘事件处理
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    // emit('enter');
    props.node.attrs.onEnter?.();
  }
};

const handleClick = () => {
  // 输入框获取焦点
  inputRef.value?.focus();
};

// 粘贴事件处理 - 去掉格式只保留纯文本
const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();

  // 获取剪贴板中的纯文本内容
  const text = event.clipboardData?.getData('text/plain') || '';
  if (!text) return;

  const target = event.target as HTMLElement;

  try {
    // 使用 document.execCommand 来插入纯文本（更简单的方法）
    document.execCommand('insertText', false, text);
  } catch (error) {
    console.error('粘贴处理失败:', error);
    // 降级处理：直接追加文本
    target.textContent = (target.textContent || '') + text;
  }
  // 触发 input 事件以更新值
  const inputEvent = new Event('input', { bubbles: true });
  target.dispatchEvent(inputEvent);
};

watch(
  () => props.node.attrs.value,
  (val) => {
    // 目前只有在readonly为true时，才需要更新输入框内容，因为实时更新内容的时候，光标会跑到最前面，以后解决
    if (props.node.attrs.readonly && inputRef?.value) {
      inputRef.value.textContent = val || '';
    }
  },
);

function handleValidate() {
  /* 验证输入框内容是否为空，目前只验证非空 */
  if (props.node.attrs.param?.required === 1) {
    const val = inputRef.value?.textContent?.trim();
    isValid.value = !!val;
  }
}

watch(
  () => props.node.attrs.valid,
  (val) => {
    isValid.value = val;
  },
);

// 组件挂载后初始化
onMounted(() => {
  if (inputRef.value && props.node.attrs.value !== undefined) {
    console.log('props.node', props.node);
    inputRef.value.textContent = props.node.attrs.value || '';
  }
});

function focus() {
  inputRef.value?.focus();
}

defineExpose({
  focus,
});
</script>
