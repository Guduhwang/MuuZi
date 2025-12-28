<template>
  <div class="">
    <el-dialog
      :model-value="show"
      title="Config Pack"
      width="750"
      @close="handleClose"
      height="500"
      class="liblibPackage-dialog"
      :append-to-body="true"
    >
      <div class="authorization-wrap">
        <div class="auth-list">
          <el-button type="primary" size="small" class="mb-[20px]" @click="handleAdd">Add</el-button>
          <div
            class="text-[#333] text-center text-[16px] font-bold mb-[20px] absolute top-[50%] w-full"
            v-if="!list?.length"
          >
            No data
          </div>
          <el-checkbox-group v-model="checkedPackages">
            <div class="auth-item" v-for="(item, index) in list" :key="item.id">
              <!-- 以后会加回来 -->
              <!-- <el-checkbox :value="item.id" /> -->
              <div class="flex items-center flex-1 overflow-hidden">
                <div class="auth-item-title ml-2 overflow-hidden">
                  <div class="text-[#333] truncate">{{ item.name }}</div>
                  <!-- <div class="text-[12px] text-gray-500">last updated {{ getTimeAgo(item.createTime) }}</div> -->
                </div>
              </div>
              <div class="auth-item-operation">
                <el-button @click="handleDelete(item, index)" type="danger" size="small">Delete</el-button>
                <el-button @click="handleConfig(item, index)" type="primary" size="small">Modify</el-button>
              </div>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      <!-- <template #footer>
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleSelect">Select</el-button>
      </template> -->
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      v-model="showConfig"
      :title="dialogTitle"
      width="700"
      :append-to-body="true"
    >
      <div class="configuration-wrap">
        <div class="configuration-item">
          <el-form :model="form" :rules="rules" label-width="200px" ref="formRef">
            <el-form-item label="Authorized Name" prop="name">
              <el-input class="w-[300px]" v-model="form.name" />
            </el-form-item>
            <el-form-item label="Authorized Description">
              <el-input type="textarea" class="w-[300px]" v-model="form.remark" />
            </el-form-item>
            <el-form-item
              v-for="item in configs"
              :key="item.name"
              class="items-center"
              :label="item.display"
              :prop="'config.' + item.name"
              :rules="rules['config-' + item.name]"
            >
              <el-input class="w-[300px]" v-model="form.config[item.name]" />
            </el-form-item>
          </el-form>
          <el-button class="w-full mt-[20px]" type="primary" @click="handleSave">Save Config Pack</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import type { FormRules } from 'element-plus';
import type { TMembersConfig, TMembersPackConfigItem } from '../member-add/types/member-add.type';
import { computed, nextTick, PropType, ref, watch } from 'vue';
import { getTimeAgo } from '/@/utils';
import { ElMessageBox, FormInstance } from 'element-plus';
import { getUUID } from '/@/utils/crypto';
// import { service } from '/@/cool';
// import { useQuery } from '@tanstack/vue-query';
// import { getConfigPackListQuery } from '../../queries';

defineOptions({
  name: 'LiblibPackage',
});
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array as PropType<TMembersPackConfigItem[]>,
    default: () => [],
  },
  configs: {
    type: Array as PropType<TMembersConfig[]>,
    default: () => [],
  },
  selectedPacks: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});
// 以后启用
// const { data: list, refetch: getList } = useQuery(getConfigPackListQuery);
const list = ref<TMembersPackConfigItem[]>(props.data || []);
watch(
  () => props.show,
  (val) => {
    if (val) {
      // getList();
    }
  },
);

// watch(
//   () => props.selectedPacks,
//   (val) => {
//     checkedPackages.value = val;
//   },
// );

watch(
  () => props.data,
  (val) => {
    list.value = val;
  },
);
const defaultRules: FormRules = {
  name: [{ required: true, message: 'Please input authorized name' }],
  remark: [{ required: true, message: 'Please input authorized description' }],
  type: [{ required: true, message: 'Please select authorized type' }],
};
const form = ref<TMembersPackConfigItem>({
  name: '',
  remark: '',
  config: {},
});

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'select', value: TMembersPackConfigItem[]): void;
}>();
const handleClose = () => {
  emit('update:show', false);
};
const showConfig = ref(false);
const dialogTitle = ref('');

const rules = computed(() => {
  if (props.configs) {
    return props.configs.reduce((acc, item) => {
      acc['config-' + item.name] = [{ required: true, message: `Please input ${item.name}` }];
      return acc;
    }, defaultRules as FormRules);
  } else {
    return defaultRules;
  }
});
const isEdit = ref(false);
const editIndex = ref<number | null>();
const handleConfig = (item: TMembersPackConfigItem, index: number) => {
  dialogTitle.value = 'Modify Config Pack';
  isEdit.value = true;
  editIndex.value = index;
  showConfig.value = true;
  form.value = {
    // appId: item.appId,
    id: item.id,
    name: item.name,
    remark: item.remark,
    config: item.config,
  };
};
const checkedPackages = ref<number[]>([]);
const formRef = ref<FormInstance>();

const handleSelect = () => {
  // if (checkedPackages.value.length) {
  //   const map = checkedPackages.value.reduce<Record<number, 1>>((pre, cur) => {
  //     pre[cur] = 1;
  //     return pre;
  //   }, {});
  //   const data: TMembersPackConfigItem[] = [];
  //   list.value?.forEach((item) => {
  //     if (map[item.id]) {
  //       data.push({ ...item } as TMembersPackConfigItem);
  //     }
  //   });
  //   emit('select', data);
  // }
  handleClose();
};
const handleSave = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      const config = JSON.parse(JSON.stringify(form.value));
      if (!isEdit.value) {
        emit('select', [
          ...(props.data || []),
          {
            ...config,
            id: getUUID(),
          },
        ]);
        // 以后会改成保存配置包的形式
        // service.base.appConfig
        //   .add({
        //     name: form.value.name,
        //     remark: form.value.remark,
        //     appId: 7001,
        //     config: config,
        //   })
        //   .then(() => {
        //     ElMessage.success('Create success');
        //     showConfig.value = false;
        //     getList();
        //   });
      } else {
        emit(
          'select',
          props.data.map((item, index) => {
            if (index === editIndex.value) {
              return config;
            }
            return item;
          }),
        );
        // service.base.appConfig
        //   .update({
        //     id: form.value.id,
        //     name: form.value.name,
        //     remark: form.value.remark,
        //     appId: form.value.appId,
        //     config: config,
        //   })
        //   .then(() => {
        //     ElMessage.success('Modify success');
        //     showConfig.value = false;
        //     getList();
        //   });
      }
      showConfig.value = false;
    }
  });
};
const handleAdd = () => {
  dialogTitle.value = 'Create new Config Pack';
  isEdit.value = false;
  showConfig.value = true;
  nextTick(() => {
    form.value = { name: '', remark: '', config: {} };
    formRef.value?.resetFields();
  });
};
const handleDelete = (item: TMembersPackConfigItem, index: number) => {
  // ElMessageBox.confirm('Are you sure you want to delete this config pack?', 'Warning', {
  //   confirmButtonText: 'OK',
  //   cancelButtonText: 'Cancel',
  //   type: 'warning',
  // })
  //   .then(() => {
  //     // service.base.appConfig.delete({ id: item.id }).then(() => {
  //     //   ElMessage.success('Delete success');
  //     //   getList();
  //     // });
  //   })
  //   .catch(() => {});
  emit(
    'select',
    props.data.filter((_, i) => i !== index),
  );
};
</script>
<style lang="scss">
.liblibPackage-dialog {
  .el-checkbox-group {
    font-size: unset;
    line-height: unset;
  }
}
</style>
<style lang="scss" scoped>
.configuration-item {
  background-color: #fff;
  padding: 40px;
  border-radius: 5px;
  // border: 1px solid #e5e5e5;
}
.auth-list {
  position: relative;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;

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
</style>
