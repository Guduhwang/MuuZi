<template>
  <DialogWrap :show="show" @close="handleClosed" :title="title">
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
      <!-- <el-form-item label="工作台显示" v-if="1 === 2">
        <el-switch v-model="form.onBoard" :active-value="1" :inactive-value="0" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="submit" class="w-full" color="#0c0c0e" :loading="loading">
          Save group
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
import { useUpload } from '/@/plugins/upload/hooks';
const { service } = useCool();
const { userStore, groupStore, desktopStore, imStore } = useStore();
import { TAddGroupParams } from '../../types/group.type';
import { AVATAR_PREFIX_PATH } from '../../util/const';

defineOptions({
  name: 'GroupAdd',
});

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  show: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:show']);

const formRef = ref<FormInstance>();
const loading = ref(false);

function handleClosed() {
  emit('update:show', false);
}

function initForm(): TAddGroupParams {
  return {
    id: 0,
    name: '',
    avatar: '',
    remark: '',
    onBoard: 1,
  };
}
const form = ref<TAddGroupParams>(initForm());

const { options, toUpload } = useUpload();

// 随机头像列表
const randomAvatars = AVATAR_PREFIX_PATH;

// 获取随机头像并上传
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};
const submit = async () => {
  const name = form.value.name.trim();
  if (!name) {
    ElNotification({
      message: 'Please enter a name',
    });
    return;
  }
  const params = { ...form.value, userId: userStore.info?.id };
  loading.value = true;
  if (form.value.id === 0) {
    const res = await service.base.group.add({
      ...params,
      position: props.position,
    });
    params.id = res.id;
    // 把自己添加到群中
    await service.base.groupMember
      .add({
        userId: userStore.info!.id,
        groupId: res.id,
        isOwner: 1,
      })
      .catch(() => {
        loading.value = false;
      });
    // 添加群为自己的好友
    await service.base.friend.add({ friendId: res.id, userId: userStore.info!.id, type: 1 }).catch(() => {
      loading.value = false;
    });
    // add to default desktop
    desktopStore.addGroupToDefaultDesktop(res.id);
    groupStore.setGroup(params);
    // 刷新群列表
    // todo 以后应该改成直接修改群列表，不用请求接口
    imStore.refreshFriendList();
    loading.value = false;
  } else {
    await service.base.group.update(params).catch(() => {
      loading.value = false;
    });
    loading.value = false;
  }

  ElNotification({
    message: 'success',
  });
  groupStore.refresh();
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
