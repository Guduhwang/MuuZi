<template>
  <div class="flex gap-2">
    <el-tag v-for="tag in dynamicTags" :key="tag" closable :disable-transitions="false" @close="handleClose(tag)">
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="w-20"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else size="small" @click="showInput"> + New Tag </el-button>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue';
import type { InputInstance } from 'element-plus';

const props = defineProps<{
  modelValue?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

watch(
  () => props.modelValue,
  (val) => {
    dynamicTags.value = val || [];
  },
);

const inputValue = ref('');
const dynamicTags = ref<string[]>(props.modelValue || []);

watch(dynamicTags, (val) => {
  emit('update:modelValue', val);
});
const inputVisible = ref(false);
const InputRef = ref<InputInstance>();

const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value.trim());
  }
  inputVisible.value = false;
  inputValue.value = '';
};
</script>
