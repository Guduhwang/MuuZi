<template>
  <el-form
    style="width: 100%"
    size="small"
    ref="paramsFormRef"
    label-position="left"
    label-width="200px"
    :model="selfForm"
    :disabled="userIdentity == 'level_0' && parentType !== 4"
    class="membersConfig-form"
  >
    <template v-for="(item, index) in configs" :key="index">
      <el-form-item
        v-if="item.type === 'input' && !isHide(item)"
        :label="item.display"
        :prop="item.name"
        :rules="[{ required: true, message: 'Please enter a value' }]"
      >
        <el-input v-model="selfForm[item.name]" :placeholder="item.display" clearable />
      </el-form-item>
      <el-form-item
        v-if="item.type === 'texarea' && !isHide(item)"
        :label="item.display"
        :prop="item.name"
        :rules="[{ required: true, message: 'Please enter a value' }]"
      >
        <el-input v-model="selfForm[item.name]" type="textarea" :placeholder="item.display" clearable />
      </el-form-item>
      <div v-if="(parentType === 1 || parentType === 4) && item.name === 'params'" class="params-tab">
        <div
          class="params-tab-item"
          v-for="item in tabList"
          :key="item.value"
          :class="{ active: item.isChecked }"
          @click="handleTabChange(item.value)"
        >
          <div v-if="item.isChecked" class="active-line"></div>
          {{ item.label }}
        </div>
        <el-button class="add-btn" type="warning" round size="small" @click="addParam()">
          <el-icon class="mr-2">
            <Plus />
          </el-icon>
          Add
        </el-button>
      </div>
      <el-form-item
        :class="{ hidden: activeTab?.name !== item.name }"
        v-if="(parentType === 1 || parentType === 4) && (item.name === 'params' || item.name === 'outputParams')"
        label-position="top"
      >
        <el-form-item
          :inline="true"
          class="w-full"
          :prop="item.name"
          :rules="[{ required: true, type: 'array', message: 'Please add a parameter' }]"
        >
          <el-table :data="selfForm[item.name]" height="250" width="100%">
            <el-table-column prop="name" label="Name" min-width="140">
              <template #default="scope">
                <el-form-item
                  :prop="`${item.name}.${scope.$index}.name`"
                  :rules="[{ required: true, message: 'Please enter a name' }, nameRule]"
                >
                  <el-input v-model="scope.row.name" placeholder="Name" clearable />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="Type" width="120">
              <template #default="scope">
                <el-form-item
                  :prop="`${item.name}.${scope.$index}.type`"
                  :rules="[{ required: true, message: 'Please select a type' }]"
                >
                  <el-select v-model="scope.row.type" clearable>
                    <el-option label="String" value="String" />
                    <el-option label="Integer" value="Integer" />
                    <el-option label="Number" value="Number" />
                    <el-option label="Boolean" value="Boolean" />
                    <el-option label="Time" value="Time" />
                    <el-option label="Header" value="Header" v-if="item.name === 'params'" />
                    <el-option label="Link" value="Link" v-if="item.name === 'outputParams'" />
                    <el-option label="Image" value="Image" />
                    <el-option label="Video" value="Video" />
                    <el-option label="Audio" value="Audio" v-if="item.name === 'params'" />
                    <el-option label="Html" value="Html" v-if="item.name === 'outputParams'" />
                    <el-option label="File" value="File" />
                    <el-option label="Object" value="Object" />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="required" label="Required" v-if="item.name === 'params'" width="100">
              <template #default="scope">
                <el-form-item>
                  <el-checkbox v-model="scope.row.required" :true-value="1" :false-value="0" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="Description" v-if="item.name === 'params'" width="200">
              <template #default="scope">
                <el-form-item>
                  <el-input v-model="scope.row.description" placeholder="Description" clearable :maxlength="100" />
                </el-form-item>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="value" label="Value" v-if="item.name === 'params'" width="200">
              <template #default="scope">
                <el-form-item>
                  <el-input
                    v-model="scope.row.value"
                    placeholder="Value"
                    clearable
                    v-if="scope.row.type === 'Header'"
                  />
                </el-form-item>
              </template>
            </el-table-column> -->
            <el-table-column width="73" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="deleteParam(item.name, scope.$index)" circle plain type="warning"
                  ><el-icon><Minus /></el-icon
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form-item>
    </template>
  </el-form>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'element-plus';
import { ref, watch, computed } from 'vue';
import { TMembersConfig, TMembersConfigParam } from '../member-add/types/member-add.type';
import { useStore } from '/@/store';
import { getIdentity } from '/@/utils';

const props = withDefaults(
  defineProps<{
    configs: TMembersConfig[];
    form: Record<string, string | TMembersConfigParam[]>;
    parentType: number;
    uniqueId: string;
  }>(),
  {
    configs: () => [],
  },
);
const { userStore } = useStore();
const emit = defineEmits<{
  (e: 'update:form', value: Record<string, string | TMembersConfigParam[]>): void;
}>();
// 判断角色
const userIdentity = computed(() => {
  return getIdentity(userStore.info?.roleIds ?? []);
});
console.log('userIdentity', userIdentity.value);
const selfForm = ref<Record<string, string | TMembersConfigParam[]>>(props.form);

const paramsFormRef = ref<FormInstance>();
const activeTab = ref<TMembersConfig | undefined>({
  name: 'params',
  display: 'Params',
  type: 'params',
  show: 1,
  value: [],
});
const tabList = ref<{ label: string; value: string; isChecked: boolean }[]>([
  { label: 'Input', value: 'params', isChecked: true },
  { label: 'Output', value: 'outputParams', isChecked: false },
]);
const handleTabChange = (value: string) => {
  tabList.value.forEach((item) => {
    item.isChecked = item.value === value;
  });
  activeTab.value = props.configs.find((item) => item.name === value) || undefined;
};

// 只能包含字母、数字或下划线，并且以字母或下划线开头
const nameRule = {
  pattern: /^[a-zA-Z_][a-zA-Z0-9_-]*$/,
  message: 'contains only letters, numbers, or underscores,and start with letter or underscore or dash',
};

watch(
  () => props.form,
  (newValue) => {
    console.log('newValue', newValue);
    console.log(props);
    selfForm.value = newValue;
    if (typeof selfForm.value.headerAuth === 'string') {
      // 这里对应n8n的Webhook节点的Authentication配置的Header Auth，以后应该改成选择框的形式，选择某个N8N配置
      selfForm.value.headerAuth = `Bear 287095c6-a6e8-4bda-a6eb-0c7d185d270b`;
    }
    if (typeof selfForm.value.callbackUrl === 'string') {
      selfForm.value.callbackUrl = `${
        window.location.href.split('/').slice(0, 3).join('/') + '/'
      }api/admin/base/message/receiveWorkflowResult/${props.uniqueId}`;
    }
  },
);

watch(
  () => selfForm.value,
  (newValue) => {
    emit('update:form', newValue);
  },
  { deep: true },
);

const addParam = () => {
  const name = activeTab.value?.name || 'params';
  const config = selfForm.value[name] as TMembersConfigParam[];
  config.push({ name: '', type: 'String', required: 1, description: '', key: generateUniqueId() });
  console.log('添加后', config);
};

function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const deleteParam = (name: string, index: number) => {
  const config = selfForm.value[name] as TMembersConfigParam[];
  config.splice(index, 1);
};

function validateParamsForm() {
  return paramsFormRef.value?.validate();
}

function resetFields() {
  paramsFormRef.value?.resetFields();
}

function isHide(item: TMembersConfig) {
  /* 字段是否显示，如果配置了值，则不显示，以后肯定改 */
  return item.show === 0;
}

defineExpose({
  validateParamsForm,
  resetFields,
});
</script>
<style scoped lang="scss">
.membersConfig-form {
  :deep(.el-form-item .el-form-item) {
    margin-block: 12px;
  }
}
:deep(.el-form-item__label) {
  width: 100%;
  padding-right: 0;
}
.params-tab {
  position: relative;
  display: flex;
  gap: 30px;
  margin-bottom: 12px;
}
.params-tab-item {
  cursor: pointer;
  height: 40px;
  height: 32px;
  line-height: 32px;
  font-size: 16px;
  color: #999;
  position: relative;
  z-index: 1;
  .active-line {
    z-index: -1;
    position: absolute;
    left: -8px;
    top: 0px;
    width: 100%;
    height: 18px;
    opacity: 0.5;
    background: var(--color-theme);
  }
  &.active {
    color: #262626;
    font-weight: 600;
    font-size: 20px;
  }
}
.add-btn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
