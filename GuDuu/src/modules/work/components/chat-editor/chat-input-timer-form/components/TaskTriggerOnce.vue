<template>
  <el-form-item label="Time" prop="time">
    <el-date-picker
      v-model="form.time"
      type="datetime"
      :default-value="defaultTime"
      :disabled-date="disabledDate"
      format="YYYY-MM-DD HH:mm"
      value-format="YYYY-MM-DD HH:mm"
      time-format="HH:mm"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { ref } from 'vue';

defineOptions({
  name: 'TaskTriggerOnce',
});

const defaultTime = ref(new Date(new Date().getTime() + 5 * 60 * 1000));

const form = ref({
  time: dayjs(defaultTime.value).format('YYYY-MM-DD HH:mm'),
});

const disabledDate = (time: Date) => {
  // 不能选昨天
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};
defineExpose({
  getForm: () => {
    return {
      date: form.value.time.split(' ')[0],
      time: form.value.time.split(' ')[1],
    };
  },
});
</script>
