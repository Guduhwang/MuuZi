<template>
  <ChatInputFormDialog @confirm="submit" @close="handleClosed">
    <el-form
      ref="formRef"
      label-width="auto"
      @submit.prevent
      label-position="top"
      size="small"
      :rules="rules"
      :model="form"
    >
      <template v-for="item in curMentionMember?.config?.params" :key="item.name">
        <el-form-item v-if="item.type === 'String'" :label="item.name" :prop="item.name">
          <el-input v-model="form[item.name]" class="w-full" clearable />
        </el-form-item>
        <el-form-item v-else-if="item.type === 'Integer'" :label="item.name" :prop="item.name">
          <el-input-number v-model="form[item.name]" :precision="0" class="w-full" clearable>
            <template #decrease-icon>
              <el-icon>
                <Minus />
              </el-icon>
            </template>
            <template #increase-icon>
              <el-icon>
                <Plus />
              </el-icon> </template
          ></el-input-number>
        </el-form-item>
        <el-form-item v-else-if="item.type === 'Number'" :label="item.name" :prop="item.name">
          <el-input-number v-model="form[item.name]" class="w-full" clearable>
            <template #decrease-icon>
              <el-icon>
                <Minus />
              </el-icon>
            </template>
            <template #increase-icon>
              <el-icon>
                <Plus />
              </el-icon>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item v-else-if="item.type === 'Boolean'" :label="item.name" :prop="item.name">
          <el-switch v-model="form[item.name]" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item v-else-if="item.type === 'Time'" :label="item.name" :prop="item.name">
          <el-date-picker
            v-model="form[item.name] as string"
            class="w-full"
            type="datetime"
            style="width: 100%"
            popper-class="chatInputForm-datePicker"
            clearable
          />
        </el-form-item>
        <el-form-item v-else-if="item.type === 'Object'" :label="item.name" :prop="item.name" :rules="jsonRules">
          <CodeHighlight v-model="form[item.name]" clearable />
        </el-form-item>
      </template>
    </el-form>
  </ChatInputFormDialog>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { inject, ref, watch } from 'vue';
import { TChatMemberItem } from '../../types/member.type';
import { FormInstance, FormItemRule, FormRules } from 'element-plus';
import CodeHighlight from '../code-highlight/CodeHighlight.vue';
import ChatInputFormDialog from '/$/work/components/chat-editor-2/ChatInputFormDialog.vue';

defineOptions({
  name: 'ChatInputWorkflowForm',
});

const props = defineProps<{
  // 在编辑器中打开的时候，回显的数据
  preForm?: Record<string, string | number | boolean>;
  onClose: () => void;
  onSave: (form: Record<string, string | number | boolean>) => void;
}>();

const emit = defineEmits(['update:show']);

const curMentionMember = inject<Ref<Eps.BaseGroupMemberEntity>>('curMentionMember')!;

const form = ref(props.preForm || {});
const formRef = ref<FormInstance>();

const rules = ref<FormRules>();

const jsonRules = ref<FormItemRule[]>([
  {
    validator: (rule, value, callback) => {
      try {
        JSON.parse(value);
        callback();
      } catch (error) {
        callback(new Error('Invalid JSON'));
      }
    },
  },
]);

watch(
  curMentionMember,
  (newVal: Eps.BaseGroupMemberEntity) => {
    if (newVal.config?.params?.length) {
      const tempRules: FormRules = {};
      const tempForm = {};
      newVal.config.params.forEach((item: TChatMemberItem) => {
        tempRules[item.name] = [{ required: !!item.required }];
        tempForm[item.name] = undefined;
      });
      rules.value = tempRules;
      console.log(rules.value);

      // todo这里还需要处理curMentionMember改变的情况，目前curMentionMember是不需要改变的
      if (!props.preForm) {
        form.value = tempForm;
      }
    }
  },
  {
    immediate: true,
  },
);

function handleClosed() {
  props.onClose?.();
}

function submit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      props.onSave?.(form.value);
    }
  });
}

defineExpose({});
</script>
