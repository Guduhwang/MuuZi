<template>
  <NodeViewWrapper as="span">
    <span class="chatFlexibleInput-wrap" :class="{ invalid: !isValid }">
      <span class="chatFlexibleInput-label">{{ node.attrs.field }}</span>
      <el-select
        v-model="selfValue"
        placeholder="Select"
        style="width: 240px"
        size="small"
        @change="handleValidate"
        @blur="handleValidate"
      >
        <el-option v-for="item in node.attrs.options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import { watch, ref } from 'vue';
import './css/chatSelectInput.scss';

defineOptions({
  name: 'ChatSelectInput',
});

const props = defineProps({
  ...nodeViewProps,
});
const selfValue = ref<string | number>('');
// 输入框内容是否合法
const isValid = ref(true);

watch(
  () => props.node.attrs.value,
  (val) => {
    selfValue.value = val || '';
  },
);

watch(
  () => selfValue.value,
  (val) => {
    const index = props.node.attrs.options.findIndex((item: { value: string | number }) => item.value == val);
    props.updateAttributes({
      value: val,
      index: index,
      label: props.node.attrs.options[index].label,
    });
  },
);

function handleValidate() {
  /* 验证输入框内容是否为空，目前只验证非空 */
  if (props.node.attrs.param?.required === 1) {
    let val = selfValue.value;
    if (typeof val == 'string') {
      val = val?.trim();
    }
    isValid.value = !!(val || val === 0);
  }
}

watch(
  () => props.node.attrs.valid,
  (val) => {
    isValid.value = val;
  },
);
</script>
