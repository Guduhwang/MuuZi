<template>
  <ElDialog
    :modelValue="dialogVisible"
    title="Prompts"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="prompt-dialog-wrap">
      <div class="prompt-dialog-header">
        <el-button type="warning" size="small" @click="handleAdd">Add</el-button>
      </div>
      <el-table :data="promptList" style="width: 100%" v-loading="loading">
        <el-table-column prop="prompt" label="Prompt" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="Create Time" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="Actions" width="180" fixed="right">
          <template #default="scope">
            <el-button class="operation-button" size="small" @click="handleEdit(scope.row)">Edit</el-button>
            <el-button size="small" plain @click="handleDelete(scope.row)" type="danger">Delete</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <NoData tip="No prompts yet" />
        </template>
      </el-table>
    </div>
    <!-- 新增/编辑弹窗 -->
    <ElDialog
      :modelValue="showFormDialog"
      :title="editForm.id ? 'Edit Prompt' : 'Add Prompt'"
      width="800px"
      :close-on-click-modal="false"
      class="dialog-vertical-center"
    >
      <el-form ref="formRef" :model="editForm" :rules="formRules" label-width="80px">
        <el-form-item label="Prompt" prop="prompt">
          <el-input
            v-model="editForm.prompt"
            type="textarea"
            :rows="4"
            placeholder="Please enter prompt content"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFormDialog = false">Cancel</el-button>
        <el-button class="operation-button" type="primary" :loading="submitLoading" @click="handleSubmit"
          >Confirm</el-button
        >
      </template>
    </ElDialog>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { useCool } from '/@/cool';
import dayjs from 'dayjs';
import NoData from '/@/modules/work/components/no-data/NoData.vue';

defineOptions({
  name: 'PromptDialog',
});

const props = defineProps<{
  show: boolean;
  appId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const { service } = useCool();

const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const formRef = ref<InstanceType<typeof ElForm>>();
const loading = ref(false);
const submitLoading = ref(false);
const promptList = ref<Eps.PromptEntity[]>([]);
const showFormDialog = ref(false);
const editForm = ref({
  id: undefined as number | undefined,
  prompt: '',
});

const formRules = {
  prompt: [{ required: true, message: 'Please enter prompt content', trigger: 'blur' }],
};

// 监听弹窗打开，加载数据
watch(
  () => props.show,
  async (val) => {
    if (val && props.appId) {
      await loadPromptList();
    } else {
      promptList.value = [];
    }
  },
);

// 加载 prompt 列表
async function loadPromptList() {
  if (!props.appId) {
    ElMessage.warning('App ID is required');
    return;
  }

  try {
    loading.value = true;
    const list = await service.base.prompt.list({ appId: props.appId });
    promptList.value = list || [];
  } catch (error: any) {
    console.error('Failed to load prompt list:', error);
    ElMessage.error(error?.message || 'Failed to load prompts');
  } finally {
    loading.value = false;
  }
}

// 格式化时间
function formatTime(time: string | undefined): string {
  if (!time) return '-';
  return dayjs(time).format('YYYY-MM-DD HH:mm');
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false;
  showFormDialog.value = false;
  resetForm();
}

// 重置表单
function resetForm() {
  editForm.value = {
    id: undefined,
    prompt: '',
  };
  formRef.value?.clearValidate();
}

// 新增
function handleAdd() {
  resetForm();
  showFormDialog.value = true;
}

// 编辑
function handleEdit(row: Eps.PromptEntity) {
  editForm.value = {
    id: row.id,
    prompt: row.prompt || '',
  };
  showFormDialog.value = true;
}

// 删除
async function handleDelete(row: Eps.PromptEntity) {
  try {
    await ElMessageBox.confirm('Are you sure to delete this prompt?', 'Tips', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });

    await service.base.prompt.delete({ id: row.id });
    ElMessage.success('Deleted successfully');
    await loadPromptList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || 'Failed to delete');
    }
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    if (!props.appId) {
      ElMessage.error('App ID is required');
      return;
    }

    try {
      submitLoading.value = true;

      if (editForm.value.id) {
        // 编辑
        await service.base.prompt.update({
          id: editForm.value.id,
          prompt: editForm.value.prompt,
        });
        ElMessage.success('Updated successfully');
      } else {
        // 新增
        await service.base.prompt.add({
          appId: props.appId,
          prompt: editForm.value.prompt,
        });
        ElMessage.success('Added successfully');
      }

      showFormDialog.value = false;
      await loadPromptList();
    } catch (error: any) {
      ElMessage.error(error?.message || 'Operation failed');
    } finally {
      submitLoading.value = false;
    }
  });
}
</script>

<style lang="scss" scoped>
.prompt-dialog-wrap {
  min-height: 300px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  .prompt-dialog-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
