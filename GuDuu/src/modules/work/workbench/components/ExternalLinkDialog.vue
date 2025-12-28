<template>
  <el-dialog
    v-model="dialogVisible"
    title="External Link Configuration"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="external-link-dialog"
  >
    <el-form
      class="external-link-form"
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="160px"
      label-position="left"
    >
      <el-form-item label="Limit Type">
        <el-radio-group v-model="limitType" @change="handleLimitTypeChange">
          <el-radio label="count">Count Limit</el-radio>
          <el-radio label="expireTime">Expire Time</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="limitType === 'count'" label="Count Limit" prop="count">
        <el-input-number v-model="form.count" :min="0" :precision="0" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item v-show="limitType === 'expireTime'" label="Expire Time" prop="selectedDays">
        <el-select
          v-model="form.selectedDays"
          placeholder="Select expire days"
          :style="{ width: '100%' }"
          clearable
          @change="handleDaysChange"
        >
          <el-option label="1 Day" :value="1" />
          <el-option label="3 Days" :value="3" />
          <el-option label="7 Days" :value="7" />
          <el-option label="15 Days" :value="15" />
          <el-option label="30 Days" :value="30" />
          <el-option label="180 Days" :value="180" />
          <el-option label="365 Days" :value="365" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="!isEditMode" label="Quantity" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="1"
          :precision="0"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="Show Guide">
        <el-switch v-model="showGuide" @change="handleShowGuideChange" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <template v-if="showGuide">
        <el-form-item label="Guide Title" prop="guideTitle">
          <el-input v-model="form.guideTitle" placeholder="Enter guide title" />
        </el-form-item>
        <el-form-item label="Guide Cover" prop="guideCover">
          <cl-upload type="file" v-model="form.guideCover" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
            <el-avatar v-if="form.guideCover" :size="80" :src="form.guideCover" shape="square" />
            <div v-else class="upload-add-icon">
              <el-icon><Plus /></el-icon>
            </div>
          </cl-upload>
        </el-form-item>
        <el-form-item label="Guide Url" prop="guideContent">
          <el-input v-model="form.guideContent" placeholder="Enter guide content URL" />
        </el-form-item>
      </template>
      <el-form-item label="Chat Background" prop="chatBackground">
        <cl-upload type="file" v-model="form.chatBackground" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
          <el-avatar v-if="form.chatBackground" :size="80" :src="form.chatBackground" shape="square" />
          <div v-else class="upload-add-icon">
            <el-icon><Plus /></el-icon>
          </div>
        </cl-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">Confirm</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import dayjs from 'dayjs';

defineOptions({
  name: 'ExternalLinkDialog',
});

const props = defineProps<{
  show: boolean;
  memberId?: number;
  groupId?: number;
  desktopId?: number;
  editData?: Eps.ExternalLinkEntity; // 直接编辑数据（用于列表弹窗）
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void; // 编辑成功事件
}>();

const { service } = useCool();

const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return !!form.value.id || !!props.editData;
});

const formRef = ref<InstanceType<typeof ElForm>>();
const loading = ref(false);
const externalLinkId = ref<number | null>(null);
const showGuide = ref(false); // 是否展示教程
const limitType = ref<'count' | 'expireTime'>('count'); // 限制类型，默认是次数限制
const form = ref<Eps.ExternalLinkEntity & { selectedDays?: number; quantity?: number }>({
  count: 1,
  expireTime: '',
  selectedDays: undefined,
  quantity: 1,
  guideCover: '',
  guideTitle: '',
  guideContent: '',
  chatBackground: '',
});

// 动态计算验证规则
const rules = computed(() => {
  const baseRules: Record<
    string,
    Array<{ required?: boolean; message: string; trigger: string; pattern?: RegExp }>
  > = {};

  // quantity 字段只在新增模式下验证
  if (!isEditMode.value) {
    baseRules.quantity = [{ required: true, message: 'Please enter quantity', trigger: 'blur' }];
  }

  // 根据限制类型设置验证规则
  if (limitType.value === 'count') {
    baseRules.count = [{ required: true, message: 'Please enter count limit', trigger: 'blur' }];
  } else if (limitType.value === 'expireTime') {
    baseRules.selectedDays = [{ required: true, message: 'Please select expire days', trigger: 'change' }];
  }

  // 如果展示教程，则这三个字段必填
  // 使用 'blur' 触发，失去焦点时才验证，不会在显示字段时立即验证
  if (showGuide.value) {
    baseRules.guideTitle = [{ required: true, message: 'Please enter guide title', trigger: 'blur' }];
    baseRules.guideCover = [{ required: true, message: 'Please upload guide cover', trigger: 'blur' }];
    baseRules.guideContent = [
      { required: true, message: 'Please enter guide content URL', trigger: 'blur' },
      {
        pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
        message: 'Please enter a valid URL',
        trigger: 'blur',
      },
    ];
  }

  return baseRules;
});

// 处理限制类型变化
function handleLimitTypeChange() {
  if (limitType.value === 'count') {
    // 切换到次数限制，清空日期相关字段的显示值（但不影响提交，因为提交时不会包含这个字段）
    form.value.expireTime = '';
    form.value.selectedDays = undefined;
    formRef.value?.clearValidate(['expireTime', 'selectedDays']);
  } else {
    // 切换到日期限制，清空次数相关字段的显示值（但不影响提交，因为提交时不会包含这个字段）
    form.value.count = 1;
    formRef.value?.clearValidate('count');
  }
}

// 处理是否展示教程的变化
function handleShowGuideChange(value: string | number | boolean) {
  if (!value) {
    // 如果选择不展示，清空这三个字段的值
    form.value.guideTitle = '';
    form.value.guideCover = '';
    form.value.guideContent = '';
    // 清除这三个字段的验证错误
    formRef.value?.clearValidate(['guideTitle', 'guideCover', 'guideContent']);
  } else {
    // 如果选择展示，清除这三个字段的验证错误，避免立即显示验证信息
    formRef.value?.clearValidate(['guideTitle', 'guideCover', 'guideContent']);
  }
}

// 根据选择的天数计算过期时间
function calculateExpireTime(days: number): string {
  const now = dayjs();
  const expireTime = now.add(days, 'day');
  return expireTime.format('YYYY-MM-DD HH:mm:ss');
}

// 处理天数选择变化
function handleDaysChange(days: number | undefined) {
  if (days) {
    form.value.expireTime = calculateExpireTime(days);
  } else {
    form.value.expireTime = '';
  }
  // 清除该字段的验证错误
  formRef.value?.clearValidate('selectedDays');
}

// 根据过期时间反推天数（用于编辑模式）
function calculateDaysFromExpireTime(expireTime: string | Date | undefined): number | undefined {
  if (!expireTime) return undefined;

  const expire = dayjs(expireTime);
  const now = dayjs();
  const diffDays = expire.diff(now, 'day');

  // 检查是否匹配预设的天数选项
  const options = [1, 3, 7, 15, 30, 180, 365];
  // 允许一定的误差（±1天）
  for (const option of options) {
    if (Math.abs(diffDays - option) <= 1) {
      return option;
    }
  }

  // 如果不匹配，返回最接近的选项
  const closest = options.reduce((prev, curr) => {
    return Math.abs(curr - diffDays) < Math.abs(prev - diffDays) ? curr : prev;
  });

  return closest;
}

// 监听弹窗打开，加载数据
watch(
  () => props.show,
  async (val) => {
    if (val) {
      await loadExternalLinkInfo();
    } else {
      resetForm();
    }
  },
);

// 监听 editData 变化
watch(
  () => props.editData,
  (val) => {
    if (val && props.show) {
      loadEditData(val);
    }
  },
  { immediate: true },
);

// 加载编辑数据
function loadEditData(data: Eps.ExternalLinkEntity) {
  form.value = {
    ...data,
  };
  // 根据已有的过期时间反推选择的天数
  form.value.selectedDays = calculateDaysFromExpireTime(data.expireTime);

  // 判断限制类型：如果有 expireTime 且有效，则是日期限制；否则是次数限制
  if (data.expireTime && data.expireTime.trim()) {
    limitType.value = 'expireTime';
  } else {
    limitType.value = 'count';
  }

  // 判断是否展示教程：如果这三个字段中任何一个有值，则展示教程
  showGuide.value = !!(data.guideTitle || data.guideCover || data.guideContent);

  // 清除验证错误
  formRef.value?.clearValidate(['selectedDays', 'count']);
}

// 加载外部链接详情
async function loadExternalLinkInfo() {
  // 如果提供了 editData，直接使用
  if (props.editData) {
    loadEditData(props.editData);
    return;
  }

  // 原有逻辑：通过 memberId/groupId/desktopId 加载
  console.log(props);
  if (!props.memberId || !props.groupId || !props.desktopId) {
    resetForm();
    return;
  }

  try {
    loading.value = true;
    // 先通过 list 查询获取外部链接列表
    const data = await service.base.externalLink.list({
      page: 1,
      pageSize: 999,
      // groupId: props.groupId,
      // desktopId: props.desktopId,
    });
    const list = Array.isArray(data) ? data : (data as { list?: Eps.ExternalLinkEntity[] })?.list || [];
    if (list && list.length > 0) {
      // 编辑模式：通过 info 接口获取详情
      // 找出 desktopId groupId memberId 对应的配置
      const currentLink = list.find(
        (item: Eps.ExternalLinkEntity) =>
          item.desktopId === props.desktopId && item.groupId === props.groupId && item.memberId === props.memberId,
      );
      if (currentLink) {
        loadEditData(currentLink);
      } else {
        // 新增模式：没有找到现有配置，重置表单
        form.value = {
          count: 1,
          expireTime: '',
          selectedDays: undefined,
          quantity: 1,
          guideCover: '',
          guideTitle: '',
          guideContent: '',
          chatBackground: '',
        };
        showGuide.value = false;
        formRef.value?.clearValidate();
      }
    } else {
      // 新增模式：列表为空，重置表单
      form.value = {
        count: 1,
        expireTime: '',
        selectedDays: undefined,
        quantity: 1,
        guideCover: '',
        guideTitle: '',
        guideContent: '',
        chatBackground: '',
      };
      showGuide.value = false;
      formRef.value?.clearValidate();
    }
  } catch (error) {
    console.error('Failed to load external link info:', error);
    resetForm();
  } finally {
    loading.value = false;
  }
}

// 重置表单
function resetForm() {
  externalLinkId.value = null;
  showGuide.value = false;
  limitType.value = 'count'; // 重置为默认的次数限制
  form.value = {
    count: 1,
    expireTime: '',
    selectedDays: undefined,
    quantity: 1,
    guideCover: '',
    guideTitle: '',
    guideContent: '',
    chatBackground: '',
  };
  formRef.value?.clearValidate();
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false;
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    // 如果是通过 editData 编辑，不需要检查 memberId/groupId/desktopId
    if (!props.editData && (!props.memberId || !props.groupId || !props.desktopId)) {
      ElMessage.error('Missing required parameters');
      return;
    }

    try {
      loading.value = true;

      const params: {
        desktopId: number;
        groupId: number;
        memberId: number;
        count?: number;
        expireTime?: string;
        quantity?: number;
        guideCover?: string;
        guideTitle?: string;
        guideContent?: string;
        chatBackground?: string;
      } = {
        desktopId: props.editData?.desktopId || props.desktopId!,
        groupId: props.editData?.groupId || props.groupId!,
        memberId: props.editData?.memberId || props.memberId!,
        // 根据限制类型决定提交哪个字段，不提交的字段不包含在参数中
        ...(limitType.value === 'count' ? { count: form.value.count } : { expireTime: form.value.expireTime }),
        // quantity 字段只在新增时添加
        ...(isEditMode.value ? {} : { quantity: form.value.quantity || 1 }),
        // 如果不展示教程，清空这三个字段的值
        guideCover: showGuide.value ? form.value.guideCover || '' : '',
        guideTitle: showGuide.value ? form.value.guideTitle || '' : '',
        guideContent: showGuide.value ? form.value.guideContent || '' : '',
        chatBackground: form.value.chatBackground || '',
      };
      if (isEditMode.value) {
        // 编辑
        await service.base.externalLink.update({
          id: form.value.id,
          ...params,
        });
        ElMessage.success('Updated successfully');
      } else {
        // 新增
        await service.base.externalLink.add(params);
        ElMessage.success('Added successfully');
      }

      emit('success');
      handleClose();
    } catch (error: unknown) {
      ElMessage.error((error as { message?: string })?.message || 'Operation failed');
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style lang="scss">
.external-link-dialog {
  .el-dialog__header {
    text-align: left !important;
  }
  .external-link-form {
    border-radius: 8px;
    padding: 20px;
    background: #fff;
  }
}

.external-link-dialog .el-dialog__body {
  padding: 20px;
}

.upload-add-icon {
  display: flex;
  width: 80px;
  height: 80px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;

  &:hover {
    border-color: #fa9819;
    background-color: #fff7ed;
  }

  .el-icon {
    font-size: 24px;
    color: #8c8c8c;
  }

  &:hover .el-icon {
    color: #fa9819;
  }
}
</style>
