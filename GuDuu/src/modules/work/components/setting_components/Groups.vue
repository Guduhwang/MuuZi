<template>
  <div class="groups-wrap">
    <div class="flex items-center justify-between mb-[30px]">
      <div class="title-action">Groups</div>
      <el-button round type="warning" @click="addGroup">Add</el-button>
    </div>
    <el-table :data="allGroupList" style="width: 100%" height="350">
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="avatar" label="Avatar"
        ><template #default="scope"><el-avatar shape="square" :size="30" :src="scope.row.avatar" /></template
      ></el-table-column>
      <el-table-column prop="onBoard" label="Visible in Workspace">
        <template #default="scope">{{ scope.row.onBoard ? 'Yes' : 'No' }}</template>
      </el-table-column>
      <el-table-column prop="operate" label="Actions" fixed="right" width="270">
        <template #default="scope">
          <el-space>
            <el-button class="operation-button" size="small" @click="editGroup(scope.row)">Edit</el-button>
            <el-dropdown>
              <span class="el-dropdown-link">
                <el-button class="operation-button" size="small">Add to Desktop</el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="(item, index) in desktopList"
                    :key="index"
                    @click="addToDesktop(scope.row.id, item.id)"
                    >{{ item.name }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" plain @click="deleteGroup(scope.row)" type="danger">Delete</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="showAddGroup"
      title="Group"
      width="500"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-wrap">
        <el-form label-width="auto" @submit.prevent>
          <el-form-item label="Avatar">
            <cl-upload type="file" v-model="newGroup.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
              <el-avatar shape="square" :size="50" :src="newGroup.avatar" />
            </cl-upload>
          </el-form-item>
          <el-form-item label="Name">
            <el-input v-model="newGroup.name" placeholder="Please enter the name" @keyup.enter.prevent />
          </el-form-item>
          <el-form-item label="Description">
            <el-input
              v-model="newGroup.remark"
              type="textarea"
              placeholder="Please enter your description (Max 200 characters)"
              maxlength="200"
              show-word-limit
              :rows="5"
            />
          </el-form-item>
          <el-form-item label="Visible in Workspace" v-if="1 === 2">
            <el-switch v-model="newGroup.onBoard" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label=" ">
            <el-button class="w-full" type="primary" @click="saveGroup">Save</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElNotification, ElMessageBox } from 'element-plus';
import { useStore } from '/@/store';
import { useCool } from '/@/cool';
import { storeToRefs } from 'pinia';
import { TGroupItem } from '../../types/group.type';
import { AVATAR_PREFIX_PATH } from '/@/modules/work/util/const';
const { groupStore, desktopStore, userStore } = useStore();
const { info: userInfo } = storeToRefs(userStore);
const { allGroupList } = storeToRefs(groupStore);
const { desktopList } = storeToRefs(desktopStore);

const { service } = useCool();
const newGroup = ref<TGroupItem | null>(null);
const showAddGroup = ref(false);
const addGroup = async () => {
  newGroup.value = {
    id: 0,
    name: '',
    avatar: '',
    remark: '',
    onBoard: 1,
    userId: userInfo.value?.id,
  };
  newGroup.value.avatar = await getRandomAvatarAndUpload();
  showAddGroup.value = true;
};

const randomAvatars = AVATAR_PREFIX_PATH;
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};
const editGroup = (item: TGroupItem) => {
  newGroup.value = item;
  showAddGroup.value = true;
};

const deleteGroup = async (item: TGroupItem) => {
  await ElMessageBox.confirm('Are you sure you want to delete this group?', 'Warning', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning',
  });
  // TODO 下面删除群有好几个逻辑，应该放后端，以后优化
  const groupId = item.id;
  await service.base.group.delete({ id: groupId });
  // 清空群内的成员
  const list = await service.base.groupMember.list({ groupId });
  if (list.length > 0) {
    const ids = list.map((item) => item.id);
    await service.base.groupMember.delete({ ids });
  }
  // 清空好友关系
  const friendList = await service.base.friend.list({ friendId: groupId });
  if (friendList.length > 0) {
    const ids = friendList.map((item) => item.id);
    await service.base.friend.delete({ ids });
  }
  ElNotification({
    message: 'Deleted',
  });
  // 清理store
  groupStore.delGroupById(groupId);
};

const saveGroup = async () => {
  if (newGroup.value?.name === '') {
    ElNotification({
      message: 'Please enter the name',
    });
    return;
  }
  if (newGroup.value?.id === 0) {
    const res = await service.base.group.add({ ...newGroup.value });
    // 把自己添加到群中
    await service.base.groupMember.add({
      userId: userInfo.value?.id,
      groupId: res.id!,
      isOwner: 1,
    });
    // 添加群为自己的好友
    await service.base.friend.add({
      friendId: res.id!,
      userId: userInfo.value?.id,
      type: 1,
    });
  } else {
    await service.base.group.update({ ...newGroup.value! });
  }

  ElNotification({
    message: 'Save success',
  });
  groupStore.refreshAllGroupList();
  showAddGroup.value = false;
};

const addToDesktop = async (groupId: number, desktopId: number) => {
  await desktopStore.addGroupToDesktop(groupId, desktopId);
  ElNotification({
    message: 'Added',
  });
};
onMounted(() => {
  groupStore.refreshAllGroupList();
});
</script>
<style lang="scss" scoped>
.groups-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
.title-action {
  padding-left: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  border-left: 4px solid #fa9819;
}
</style>
