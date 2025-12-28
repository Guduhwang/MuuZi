<template>
  <ChatInputFormDialog @confirm="submit" @close="handleClosed" class="taskTriggerDialog-wrap" title="Trigger">
    <el-form
      label-width="auto"
      label-position="top"
      class="h-[500px] overflow-y-auto"
      ref="formRef"
      size="small"
      :rules="rules"
      :model="form"
    >
      <el-form-item label="Trigger Interval" prop="type">
        <el-select v-model="form.type" append-to="body">
          <el-option :label="item.label" :value="item.value" v-for="item in triggerIntervalOptions" :key="item.value" />
        </el-select>
      </el-form-item>
      <TaskTriggerOnce v-if="form.type === 'once'" ref="onceRef" />
      <TaskTriggerDaysOfWeek v-else-if="form.type === 'weekly'" ref="weeklyRef" />
    </el-form>
  </ChatInputFormDialog>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus';
import type { TChatInputTimerForm } from './types/chat-input-timer-form.type';
import { ref, defineProps, defineEmits } from 'vue';
import TaskTriggerOnce from './components/TaskTriggerOnce.vue';
import TaskTriggerDaysOfWeek from './components/TaskTriggerDaysOfWeek.vue';
import ChatInputFormDialog from '/$/work/components/chat-editor-2/ChatInputFormDialog.vue';
import './css/taskTriggerDialog.scss';

defineOptions({
  name: 'ChatInputTimerForm',
});

const props = withDefaults(
  defineProps<{
    groupId?: number;
    editForm?: Eps.BaseGroupMemberEntity;
  }>(),
  {},
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', value: TChatInputTimerForm): void;
}>();

const formRef = ref<FormInstance>();
const onceRef = ref<InstanceType<typeof TaskTriggerOnce>>();
const weeklyRef = ref<InstanceType<typeof TaskTriggerDaysOfWeek>>();

function handleClosed() {
  emit('close');
}

const triggerIntervalOptions = [
  // { label: 'Seconds', value: 'seconds' },
  // { label: 'Minutes', value: 'minutes' },
  // { label: 'Hours', value: 'hours' },
  { label: 'Once', value: 'once' },
  // { label: 'EveryDay', value: 'everyDay' },
  // { label: 'Days of the week', value: 'weekly' },
  // { label: 'Days', value: 'days' },
  // { label: 'Weeks', value: 'weeks' },
  // { label: 'Months', value: 'months' },
] as const;

// 提取 value 的类型
type TriggerIntervalValue = (typeof triggerIntervalOptions)[number]['value'];

interface TForm {
  // 触发类型 类型是triggerIntervalOptions的value的集合
  type: TriggerIntervalValue | '';
}

function initForm() {
  return {
    type: '',
  } as TForm;
}

const form = ref(initForm());

const rules = {
  avatar: [{ required: true, message: 'Please upload a avatar' }],
  name: [{ required: true, message: 'Please enter a name' }],
  parentType: [{ required: true, message: 'Please select a type' }],
  type: [{ required: true, message: 'Please select a sub type' }],
  remark: [{ max: 200, message: 'The maximum length is 200 characters' }],
};

const submit = async () => {
  const refMap = {
    once: onceRef,
    weekly: weeklyRef,
    everyDay: weeklyRef,
    days: weeklyRef,
    weeks: weeklyRef,
    months: weeklyRef,
  } as const;
  if (form.value.type) {
    const formData = {
      type: form.value.type as string,
      config: refMap[form.value.type].value?.getForm() || {},
    };
    // 触发弹出@列表
    emit('save', formData);
  }
};

// watch(
//   () => props.show,
//   (newVal) => {
//     if (!newVal) {
//       formRef.value?.resetFields();
//     } else {
//       form.value = initForm();
//     }
//   },
// );
</script>
