<template>
  <div class="flex flex-wrap gap-2">
    <el-tag
      class="cursor-pointer"
      v-for="tag in dynamicTags"
      :key="tag.value"
      :type="tag.isActive ? 'primary' : 'info'"
      :effect="tag.isActive ? 'dark' : 'light'"
      :disable-transitions="false"
      @click="handleChange(tag)"
    >
      {{ tag.label }}
    </el-tag>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue?: string[];
  dictTags?: Tag[];
}>();

type Tag = {
  value: string;
  label: string;
  isActive?: boolean;
};

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const dynamicTags = ref<Tag[]>([]);

// 初始化 tags
const initTags = () => {
  dynamicTags.value =
    props.dictTags?.map((item) => ({
      ...item,
      isActive: props.modelValue?.includes(item.value) ?? false,
    })) || [];
};

// 同步外部传入的 modelValue → 更新内部状态
watch(
  () => props.modelValue,
  (val) => {
    if (!val) return;
    dynamicTags.value.forEach((tag) => {
      tag.isActive = val.includes(tag.value);
    });
  },
  { immediate: true }
);

// 点击切换
const handleChange = (tag: Tag) => {
  tag.isActive = !tag.isActive;
  // 直接算出当前选中的值 emit
  const result = dynamicTags.value
    .filter((item) => item.isActive)
    .map((item) => item.value);
  emit('update:modelValue', result);
};

onMounted(() => {
  initTags();
});
</script>
