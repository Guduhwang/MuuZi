<template>
  <div class="personal-wrap">
    <el-form class="detail-form" v-if="userInfo !== null" label-width="80px" label-position="top">
      <el-form-item v-if="isShowEdit" label="">
        <div class="avatar-upload-container">
          <cl-upload type="file" v-model="formData.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
            <el-avatar :size="50" :src="formData.avatar" v-if="formData.avatar" />
            <el-avatar :size="50" v-else>
              <IMdiPlus class="text-2xl" />
            </el-avatar>
          </cl-upload>
        </div>
      </el-form-item>
      <el-form-item v-else label=""><el-avatar :size="50" :src="userInfo.avatar" /></el-form-item>
      <el-form-item label="Nickname">
        <el-input v-model="formData.nickName" v-if="isShowEdit" />
        <span v-else>{{ userInfo.nickName }}</span>
      </el-form-item>
      <el-form-item label="Email">
        {{ userInfo.email }}
      </el-form-item>
      <!-- <el-form-item label="Invite Code">{{ userInfo.key }}</el-form-item>
    <el-form-item label="Follow Count">{{ userInfo.followCount }}</el-form-item>
    <el-form-item label="Fans Count">{{ userInfo.fansCount }}</el-form-item> -->
      <el-form-item label="Password">
        <el-input type="password" v-model="formData.password" v-if="isShowEdit" />
        <span v-else>********</span>
      </el-form-item>
      <el-form-item v-if="isShowEdit" label="Repeat Password">
        <el-input type="password" v-model="formData.password2" />
      </el-form-item>

      <el-form-item label="Invite Code">{{ userInfo.key }}</el-form-item>
      <el-button round plain type="primary" class="" @click="handleSubmit" :loading="loading">{{
        isShowEdit ? 'Save' : 'Edit'
      }}</el-button>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import { ElMessage, ElNotification } from 'element-plus';
import { useCool } from '/@/cool';

const { service } = useCool();
const { userStore } = useStore();
const { info: userInfo } = storeToRefs(userStore);
const isShowEdit = ref(false);
const loading = ref(false);

const formData = ref({
  ...userInfo.value,
  password2: '',
});
async function handleSubmit() {
  console.log(userInfo.value);
  if (isShowEdit.value) {
    if (formData.value.password === '') {
      ElNotification({
        message: 'Please enter a password',
      });
      return;
    }
    if (formData.value.password !== formData.value.password2) {
      ElNotification({
        message: 'The two passwords are inconsistent',
      });
      return;
    }
    loading.value = true;

    try {
      // 提交修改
      const res = await service.base.comm.personUpdate(formData.value);

      // 清空密码字段
      // formData.value.password = '';
      formData.value.password2 = '';

      ElMessage.success('Modify success');

      // 等待用户信息更新完成
      await userStore.get();

      // 更新表单数据
      formData.value = {
        ...userInfo.value,
        password2: '',
      };
    } catch (error) {
      console.error('Update failed:', error);
      ElMessage.error('Update failed, please try again');
    } finally {
      loading.value = false;
      isShowEdit.value = false;
    }
  } else {
    formData.value = {
      ...userInfo.value,
      password2: '',
    };
    isShowEdit.value = true;
  }
}
</script>
<style lang="scss" scoped>
.personal-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
</style>
