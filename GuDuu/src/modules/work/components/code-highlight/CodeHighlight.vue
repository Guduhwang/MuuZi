<template>
  <div class="codeHighlight-wrap">
    <div class="codeHighlight-header">
      <div class="codeHighlight-header-title">JSON</div>
      <el-tooltip content="Beautify" placement="top" :z-index="99999">
        <div class="codeHighlight-header-icon" @click="handleBeautify">
          <IMdiFormatSection></IMdiFormatSection>
        </div>
      </el-tooltip>
    </div>
    <div class="codeHighlight-editor-wrap">
      <JsonEditorVue
        ref="jsonEditorRef"
        class="codeHighlight-editor"
        v-model="value"
        :mode="mode"
        :mainMenuBar="false"
        :statusBar="false"
        :askToFormat="false"
        :tabSize="2"
        :indentation="2"
        v-bind="{
          /* 局部 props & attrs */
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import JsonEditorVue from 'json-editor-vue';
import { ref, watch } from 'vue';
import { jsonrepair } from 'jsonrepair';

declare enum Mode {
  text = 'text',
  tree = 'tree',
  table = 'table',
}

defineOptions({
  name: 'CodeHighlight',
});

const props = withDefaults(
  defineProps<{
    modelValue: string;
  }>(),
  {
    modelValue: '{}',
  },
);

const jsonEditorRef = ref<{ jsonEditor: InstanceType<typeof JsonEditorVue> }>();

const value = ref<string>(props.modelValue);

const mode = ref<Mode>('text' as Mode.text);

watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal;
  },
);

watch(value, (newVal) => {
  emit('update:modelValue', newVal);
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleBeautify = () => {
  const editor = jsonEditorRef.value?.jsonEditor;
  try {
    const repaired = jsonrepair(editor?.get().text);
    editor?.set({
      text: repaired,
    });
    emit('update:modelValue', editor?.get().text);
  } catch (error) {
    console.error('格式化失败:', error);
  }
};
</script>

<style lang="scss">
.codeHighlight-wrap {
  width: 100%;
  .cm-gutters {
    background-color: #f5f5f5;
  }

  .jse-message.jse-error {
    display: none;
  }
}

.codeHighlight-editor-wrap {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.codeHighlight-editor {
  width: 100%;
}

.codeHighlight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 4px;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e5e5e5;
}

.codeHighlight-header-title {
  font-size: 12px;
  font-weight: 600;
}

.codeHighlight-header-icon {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  &:hover {
    background-color: #f5f5f5;
  }
}
</style>
