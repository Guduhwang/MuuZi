<template>
  <el-form-item label="Days" prop="days">
    <el-select v-model="form.weekdays" multiple clearable collapse-tags>
      <el-option v-for="item in weekOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </el-form-item>
  <el-form-item label="Time" prop="time">
    <el-time-picker v-model="form.time" clearable :default-value="defaultTime" format="HH:mm" value-format="HH:mm" />
  </el-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { weekOptions } from '/@/modules/work/dict';

defineOptions({
  name: 'TaskTriggerDaysOfWeek',
});
const defaultTime = ref(new Date());

const form = ref({
  weekdays: [],
  time: '',
});

defineExpose({
  getForm: () => form.value,
});
</script>
