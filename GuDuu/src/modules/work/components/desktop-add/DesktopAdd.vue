<template>
  <DialogWrap :show="show" @close="handleClosed" title="Add Desktop">
    <el-form label-width="auto" @submit.prevent label-position="top" class="desktopAdd-form">
      <el-form-item label="Avatar">
        <cl-upload type="file" v-model="form.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
          <el-avatar :size="50" :src="form.avatar" v-if="form.avatar" />
          <el-avatar :size="50" v-else>
            <IMdiPlus class="text-2xl" />
          </el-avatar>
        </cl-upload>
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="form.name" @keyup.enter.prevent />
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="form.remark" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit" class="w-full" color="#0c0c0e" :loading="loading">
          Save Desktop
        </el-button>
      </el-form-item>
    </el-form>
  </DialogWrap>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus';
import { ref, defineProps, defineEmits, watch } from 'vue';
import DialogWrap from '../dialog-wrap/DialogWrap.vue';
import { ElNotification } from 'element-plus';
import { useCool } from '/@/cool';
import { useStore } from '/@/store';
import { AVATAR_PREFIX_PATH } from '../../util/const';
const { service } = useCool();
const { userStore, desktopStore } = useStore();

defineOptions({
  name: 'DesktopAdd',
});

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:show']);

const formRef = ref<FormInstance>();
const loading = ref(false);

function handleClosed() {
  emit('update:show', false);
}

function initForm(): Eps.BaseDesktopEntity {
  return {
    id: 0,
    name: '',
    avatar: '',
    remark: '',
    member: [],
  };
}

const form = ref<Eps.BaseDesktopEntity>(initForm());
// 随机头像列表
const randomAvatars = AVATAR_PREFIX_PATH;
// 获取随机头像并上传
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};
const submit = async () => {
  const { id, name, avatar, remark, member } = form.value;
  if (!avatar) {
    ElNotification({
      message: 'Please upload an avatar',
    });
    return;
  }
  if (name === '') {
    ElNotification({
      message: 'Please enter a name',
    });
    return;
  }

  // 如果当前桌面是唯一的桌面，那用户所有的群组，都添加到当前的桌面
  if (!desktopStore.desktopList?.length) {
    const groupList = await service.base.group.list({ userId: userStore.info!.id });
    groupList.forEach((item) => {
      member.push(item.id!);
    });
  }

  loading.value = true;
  await service.base.desktop.add({ name, avatar, remark, member, userId: userStore.info!.id }).catch(() => {
    loading.value = false;
  });
  loading.value = false;

  ElNotification({
    message: 'Saved',
  });
  desktopStore.getDesktopList();
  handleClosed();
};

watch(
  () => props.show,
  async (newVal) => {
    if (!newVal) {
      formRef.value?.resetFields();
      form.value = initForm();
    } else {
      try {
        const uploadedAvatarUrl = await getRandomAvatarAndUpload();
        if (uploadedAvatarUrl) {
          form.value.avatar = uploadedAvatarUrl;
        }
      } catch (error) {
        console.error('Failed to set random avatar:', error);
      }
    }
  },
);
</script>
