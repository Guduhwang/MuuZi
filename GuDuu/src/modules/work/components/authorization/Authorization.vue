<template>
  <div class="">
    <el-dialog
      :model-value="show"
      title="Media"
      :width="app.isShowLive ? '600px' : '1000px'"
      @close="handleClose"
      class="authorization-dialog"
      :append-to-body="true"
    >
      <div class="authorization-wrap">
        <el-tabs v-model="activeTab" class="setting-tabs" :tabPosition="app.isShowLive ? 'top' : 'left'">
          <el-tab-pane label="Credentials" name="Credential">
            <div class="search-wrap panel-wrap">
              <div class="relative">
                <el-form :model="searchForm" inline>
                  <el-form-item label="">
                    <el-input v-model="searchForm.keyword" @blur="handleSearch" icon="Search" placeholder="Search" />
                  </el-form-item>
                  <el-form-item label="">
                    <el-select
                      class="w-[180px]"
                      v-model="searchForm.orderBy"
                      @change="handleSearch"
                      placeholder="Order by"
                    >
                      <el-option label="Update Time" value="updateTime" />
                      <el-option label="Create Time" value="createTime" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="">
                    <div class="filter-wrap">
                      <img src="../../../../assets/imgs/auth/filter.svg" alt="" />
                    </div>
                  </el-form-item>
                </el-form>

                <el-button round type="warning" :icon="Plus" class="btn-pos" @click="handleAdd('widget')"
                  >Add</el-button
                >
              </div>
              <CredentialList
                class=""
                :appInfos="props.appInfos"
                :credentialList="authSavedList"
                @handleDelete="handleDelete"
                @handleConfig="handleConfig"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="false" label="Widget" name="Widget">
            <div class="auth-list">
              <el-button type="primary" size="small" class="mb-[20px]" @click="handleAdd('widget')">Add</el-button>
              <div class="text-[#333] text-center text-[16px] font-bold mb-[20px]" v-if="authSavedList.length === 0">
                No data
              </div>
              <div class="auth-item" v-for="item in authSavedList" :key="item.id">
                <div class="flex items-center">
                  <div class="auth-item-icon mr-[20px]">
                    <img :src="item.avatar" alt="" />
                  </div>
                  <div class="auth-item-title">
                    <div class="text-[#333]">{{ item.name }}</div>
                    <div class="text-[12px] text-gray-500">
                      last updated {{ getTimeAgo(item.createTime) }}
                      <span class="mx-[5px]">|</span>
                      created at {{ getMonth(item.createTime) }}
                    </div>
                  </div>
                </div>
                <div class="auth-item-operation">
                  <el-button @click="handleDelete(item)" type="danger" size="small">Delete</el-button>
                  <el-button @click="handleConfig(item)" type="primary" size="small">Modify</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Other" name="Other">
            <div class="panel-wrap min-h-[460px]">
              <NoData />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      v-model="showConfig"
      :title="dialogTitle"
      width="600"
      :append-to-body="true"
    >
      <div class="configuration-wrap">
        <div class="configuration-item">
          <el-form
            :model="authForm"
            :rules="authRules"
            label-position="top"
            ref="formRef"
            :validate-on-rule-change="false"
          >
            <el-form-item label="Credential Type" prop="parentType">
              <el-radio-group v-model="authForm.parentType" @change="handleParentTypeChange" class="radio-group">
                <el-radio value="1" border>Workflow</el-radio>
                <el-radio value="2" border>Widget</el-radio>
                <el-radio value="3" border>Plugin</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Authorized Name" prop="name">
              <el-input class="w-full" v-model="authForm.name" />
            </el-form-item>
            <el-form-item label="Authorized Description">
              <el-input type="textarea" class="w-full" v-model="authForm.remark" />
            </el-form-item>
            <el-form-item label="Authorized Type" prop="type">
              <el-select class="w-full" @change="handleChange" v-model="authForm.type" placeholder="Please select">
                <el-option v-for="item in authOptions" :key="item.type" :label="item.name" :value="item.type">
                  <div class="flex items-center">
                    <div class="w-[20px] h-[20px] rounded-full overflow-hidden mr-[20px]">
                      <img :src="item.avatar" alt="" class="w-full h-full object-cover" />
                    </div>
                    <div class="">{{ item.name }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              class="items-center"
              :label="item.display"
              v-for="item in currentConfig?.auth"
              :key="item.name"
              :prop="item.name"
              :rules="authRules[item.name]"
            >
              <el-input class="w-full" v-if="item.type == 'input'" v-model="authForm[item.name]" />
              <el-input
                class="w-full"
                v-else-if="item.type == 'password'"
                v-model="authForm[item.name]"
                type="password"
              />
              <el-input
                class="w-full"
                v-else-if="item.type == 'textarea'"
                v-model="authForm[item.name]"
                type="textarea"
              />
            </el-form-item>
          </el-form>
          <el-button class="w-full mt-[20px]" type="primary" @click="handleSave">Save Credential</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { getTimeAgo, getMonth } from '/@/utils';
import { ElMessage, ElMessageBox, FormInstance, FormItemRule } from 'element-plus';
import { service } from '/@/cool';
import { useCredentialManageStore } from '/@/store/credential-manage.store';
import CredentialList from './components/CredentialList.vue';
import { Plus } from '@element-plus/icons-vue';
import NoData from '/@/modules/work/components/no-data/NoData.vue';
import { useBase } from '/$/base';
const credentialManageStore = useCredentialManageStore();
const { app } = useBase();
defineOptions({
  name: 'Authorization',
});
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  appInfos: {
    type: Object,
    default: () => ({}),
  },
});
watch(props.appInfos, (val) => {
  if (val) {
    console.log(val);
    getAuth();
  }
});

// 使用更精确的类型定义
const authRules = ref<Record<string, FormItemRule[]>>({
  parentType: [{ required: true, message: 'Please select credential type' }],
  name: [{ required: true, message: 'Please input authorized name' }],
  remark: [{ required: true, message: 'Please input authorized description' }],
  type: [{ required: true, message: 'Please select authorized type' }],
});
const authForm = ref<Config>({
  parentType: 1,
} as Config);
const authOptions = ref<Config[]>([]);
type Auth = {
  name: string;
  display: string;
  type: string;
  value: string;
};
interface Config {
  id: number;
  auth: Array<Auth>;
  name: string;
  createTime: string;
  updateTime: string;
  avatar: string;
  parentType: number;
  type: number;
  config?: Record<string, unknown>;
  userId?: number;
  tenantId?: number;
  isDefault?: number;
  remark?: string;
  [key: string]: unknown; // 使用 unknown 替代 any
}
const searchForm = ref({
  keyword: '',
  orderBy: 'updateTime',
});
const authSavedList = ref<Config[]>([]);
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();
const handleClose = () => {
  emit('update:show', false);
};
const showConfig = ref(false);
const currentConfig = ref<Config | null>(null);
const activeTab = ref('Credential');
const dialogTitle = ref('');

// 修改 handleChange 函数，清除校验状态
const handleChange = (value: number) => {
  const item = authOptions.value.find((item) => item.type === Number(value));
  if (item) {
    currentConfig.value = item;

    // 清除之前的动态校验规则
    Object.keys(authRules.value).forEach((key) => {
      if (key !== 'name' && key !== 'remark' && key !== 'type') {
        delete authRules.value[key];
      }
    });

    // 清除动态字段的值
    // if (authForm.value) {
    //   Object.keys(authForm.value).forEach((key) => {
    //     if (key !== 'name' && key !== 'remark' && key !== 'type' && key !== 'id') {
    //       delete authForm.value[key];
    //     }
    //   });
    // }

    // 清除表单校验状态
    nextTick(() => {
      formRef.value?.clearValidate();
      // formRef.value?.resetFields();
    });

    if (item.auth.length > 0) {
      for (const key in item.auth) {
        authRules.value[item.auth[key].name] = [{ required: true, message: `Please input ${item.auth[key].name}` }];
      }
    }
  }
};

const handleParentTypeChange = (value: string) => {
  const key = value === '1' ? 'workflow' : value === '2' ? 'widget' : 'plugin';
  authOptions.value = props.appInfos[key];
  authForm.value.type = authOptions.value[0].type;
  handleChange(authForm.value.type);
};

const handleConfig = (item: Config) => {
  dialogTitle.value = 'Modify Credential';
  showConfig.value = true;
  const key = item.parentType === 1 ? 'workflow' : item.parentType === 2 ? 'widget' : 'plugin';
  authOptions.value = props.appInfos[key];

  delete authForm.value.config;
  const itemObj = authOptions.value.find((i) => i.type === Number(item.type));
  if (itemObj) {
    currentConfig.value = itemObj;
    if (itemObj.auth.length > 0) {
      for (const key in itemObj.auth) {
        authRules.value[itemObj.auth[key].name] = [
          { required: true, message: `Please input ${itemObj.auth[key].name}` },
        ];
      }
    }
  }
  authForm.value = {
    ...item,
    ...item.config,
    parentType: item.parentType || 1, // 确保 parentType 是字符串
  };
};

// 修改 getAuth 函数中的类型问题
const getAuth = async () => {
  const res = await service.base.auth.list(searchForm.value);
  if (res.length > 0) {
    // 应用进行分类
    const workflow: Config[] = [];
    const plugin: Config[] = [];
    const widget: Config[] = [];
    res.forEach((item) => {
      if (item.parentType === 1) {
        // 获取应用图标
        const app = (props.appInfos as Record<string, Config[]>).workflow?.find(
          (app: Config) => app.type === item.type,
        );
        item.avatar = app?.avatar;
        workflow.push(item);
      } else if (item.parentType === 2) {
        // 获取应用图标
        const app = (props.appInfos as Record<string, Config[]>).widget?.find((app: Config) => app.type === item.type);
        item.avatar = app?.avatar;
        widget.push(item);
      } else if (item.parentType === 3) {
        // 获取应用图标
        const app = (props.appInfos as Record<string, Config[]>).plugin?.find((app: Config) => app.type === item.type);
        item.avatar = app?.avatar;
        plugin.push(item);
      }
    });

    authSavedList.value = [...workflow, ...widget, ...plugin];
  }
  console.log(authSavedList);
};

const handleSearch = () => {
  getAuth();
};

const refreshAuth = () => {
  credentialManageStore.query();
  // 有credentialType表示传过来过信息
  if (credentialManageStore.credentialType || credentialManageStore.credentialType === 0) {
    // 关闭后，清理传递来的凭证信息
    credentialManageStore.setCredentialType(undefined);
    credentialManageStore.setCredentialParentType('');
  }
};
const formRef = ref<FormInstance>();
const handleSave = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      const config = JSON.parse(JSON.stringify(authForm.value));
      delete config.type;
      delete config.name;
      delete config.remark;
      delete config.id;
      console.log(authForm.value);
      if (dialogTitle.value === 'Create new Credential') {
        service.base.auth
          .add({
            name: authForm.value.name,
            remark: authForm.value.remark,
            type: authForm.value.type,
            parentType: currentConfig.value?.parentType,
            config: config,
          })
          .then((res) => {
            ElMessage.success('Create success');
            showConfig.value = false;
            getAuth().then(() => {
              refreshAuth();
            });
          });
      } else {
        delete config.avatar;
        delete config.createTime;
        delete config.isDefault;
        delete config.parentType;
        delete config.tenantId;
        delete config.updateTime;
        delete config.userId;
        service.base.auth
          .update({
            id: authForm.value.id,
            auth: {
              name: authForm.value.name,
              remark: authForm.value.remark,
              type: authForm.value.type,
              parentType: currentConfig.value?.parentType,
              config: config,
            },
          })
          .then((res) => {
            ElMessage.success('Modify success');
            showConfig.value = false;
            getAuth().then(() => {
              refreshAuth();
            });
          });
      }
    }
  });
};
const handleAdd = (type: string) => {
  dialogTitle.value = 'Create new Credential';
  showConfig.value = true;
  nextTick(() => {
    authForm.value = {
      parentType: '1', // 确保 parentType 被设置
    } as Config;
    currentConfig.value = null;
    formRef.value?.resetFields();
  });
  authOptions.value = props.appInfos.workflow;
};
const handleDelete = (item: Config) => {
  ElMessageBox.confirm('Are you sure you want to delete this authorization?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      service.base.auth.delete({ id: item.id }).then((res) => {
        ElMessage.success('Delete success');
        getAuth();
        refreshAuth();
      });
    })
    .catch(() => {});
  console.log(item);
};

watch(
  () => credentialManageStore.isShowCredentialManage,
  (val: boolean) => {
    if (val) {
      const cType = credentialManageStore.credentialType;

      // ✅ 这里改成 props.appInfos
      const appInfos = props.appInfos as Record<string, Config[]>;

      if (cType !== undefined && cType !== null) {
        // 有传入 credentialType，按 type 查找所属 parent
        const findIn = (arr?: Config[]) => (arr ? arr.find((i: Config) => i.type === Number(cType)) : undefined);

        const workflowMatch = findIn(appInfos.workflow);
        const widgetMatch = findIn(appInfos.widget);
        const pluginMatch = findIn(appInfos.plugin);

        let parentKey: 'workflow' | 'widget' | 'plugin' = 'workflow';
        if (workflowMatch) parentKey = 'workflow';
        else if (widgetMatch) parentKey = 'widget';
        else if (pluginMatch) parentKey = 'plugin';

        // 设置 parentType
        authForm.value.parentType = parentKey === 'workflow' ? '1' : parentKey === 'widget' ? '2' : '3';

        // 设置 options
        authOptions.value = appInfos[parentKey] ?? [];

        // 设置 type 并触发
        nextTick(() => {
          authForm.value.type = Number(cType);
          handleChange(authForm.value.type);
        });
      }
    }
    showConfig.value = val;
  },
);

watch(
  () => showConfig.value,
  (val: boolean) => {
    credentialManageStore.setIsShowCredentialManage(val);
  },
);
onMounted(() => {
  getAuth();
});
</script>
<style lang="scss" scoped>
.btn-pos {
  position: absolute;
  right: 0;
  top: 0;
}
.panel-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  max-height: 500px;
  overflow-y: auto;
  .filter-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
    img {
      width: 16px;
      height: 16px;
    }
  }
}
.configuration-item {
  background-color: #fff;
  padding: 40px;
  border-radius: 5px;
  // border: 1px solid #e5e5e5;
}
.auth-list {
  .auth-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #e5e5e5;
    margin-bottom: 10px;
    .auth-item-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
    }
  }
}
.radio-group {
  width: 100%;
  display: flex;
  gap: 10px;
  :deep(.el-radio) {
    flex: 1;
    margin-right: 0 !important;
  }
}
:deep(.el-input__inner),
:deep(.el-select__wrapper) {
  height: 40px;
  line-height: 40px;
}
.configuration-wrap {
  max-height: 500px;
  overflow-y: auto;
}
</style>
