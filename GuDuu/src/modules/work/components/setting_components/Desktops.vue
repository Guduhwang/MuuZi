<template>
  <div class="desktops-wrap">
    <div class="flex items-center justify-between mb-[30px]">
      <div class="title-action">Workspace</div>
      <el-button round type="warning" @click="addDesktop">Add</el-button>
    </div>

    <el-table :data="desktopList" style="width: 100%" id="desktopSettingTable" max-height="350">
      <el-table-column prop="name" label="Name" width="180">
        <template #default="scope">
          <div class="desktops-drag-wrap" :data-sort="scope.row.sort" :data-index="scope.$index">
            <IMdiDragVertical class="desktops-drag-icon text-[#fa9819]"></IMdiDragVertical>
            {{ scope.row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="avatar" label="Avatar" width="120">
        <template #default="scope"><el-avatar :size="30" shape="square" :src="scope.row.avatar" /></template>
      </el-table-column>
      <el-table-column prop="remark" label="Description" width="160" />
      <el-table-column prop="operate" label="Actions">
        <template #default="scope">
          <el-button class="operation-button" size="small" @click="editDesktop(scope.row)">Edit</el-button>
          <el-button v-if="desktopList.length > 1" size="small" plain @click="deleteDesktop(scope.row)" type="danger">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="showAddDesktop"
      title="Workspace configuration‌"
      width="500"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form label-width="auto" label-position="left" @submit.prevent>
        <el-form-item label="Avatar">
          <cl-upload type="file" v-model="newDesktop.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
            <el-avatar shape="square" :size="50" :src="newDesktop.avatar" />
          </cl-upload>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="newDesktop.name" placeholder="Please enter the name" @keyup.enter.prevent />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="newDesktop.remark"
            type="textarea"
            placeholder="Please enter your description (Max 200 characters)"
            maxlength="200"
            show-word-limit
            :rows="5"
          />
        </el-form-item>

        <el-form-item label=" ">
          <el-button class="w-full" type="primary" @click="saveDesktop">Save</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import type { SortableEvent } from 'sortablejs';
import type { Ref } from 'vue';
import Sortable from 'sortablejs';
import { ref, watch, nextTick, inject, onBeforeUnmount } from 'vue';
import { ElNotification, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import { AVATAR_PREFIX_PATH } from '/@/modules/work/util/const';
const { userStore, desktopStore } = useStore();
const { info: userInfo } = storeToRefs(userStore);
const { desktopList, isShowEditDesktop } = storeToRefs(desktopStore);

const settingShow = inject<Ref<boolean>>('settingShow')!;

const { service } = useCool();
const showAddDesktop = ref(false);
const newDesktop = ref(null);
const sortIns = ref<Sortable | null>(null);
let sortChanged = false;

const addDesktop = async () => {
  newDesktop.value = { id: 0, name: '', avatar: '', remark: '', member: [] };
  newDesktop.value.avatar = await getRandomAvatarAndUpload();
  showAddDesktop.value = true;
};

const saveDesktop = async () => {
  const { id, name, avatar, remark, member } = newDesktop.value;
  if (avatar === '') {
    ElNotification({
      message: 'Please upload the avatar',
    });
    return;
  }
  if (name === '') {
    ElNotification({
      message: 'Please enter the name',
    });
    return;
  }

  if (newDesktop.value.id === 0) {
    await service.base.desktop.add({ name, avatar, remark, member, userId: userInfo.value.id });
  } else {
    await service.base.desktop.update({ id, name, avatar, remark });
  }
  ElNotification({
    message: 'Save success',
  });
  showAddDesktop.value = false;
  desktopStore.refresh();
};

const editDesktop = (item) => {
  debugger;
  newDesktop.value = item;
  showAddDesktop.value = true;
};

watch(
  () => isShowEditDesktop.value,
  (val) => {
    if (val) {
      /* 当前对话框的新增，也受到凭证store的isShowCredentialManage的控制 */
      editDesktop(desktopStore.editDesktop);
      showAddDesktop.value = val;
    }
  },
  {
    immediate: true,
  },
);
const deleteDesktop = async (item) => {
  await ElMessageBox.confirm('Are you sure to delete?', 'Tips', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning',
  });
  await service.base.desktop.delete({ id: item.id });
  ElNotification({
    message: 'Deleted',
  });
  desktopStore.refresh();
};
// 随机头像列表
const randomAvatars = AVATAR_PREFIX_PATH;

// 获取随机头像并上传
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};
function initDrag() {
  sortIns.value = new Sortable(document.querySelector('#desktopSettingTable .el-table__body tbody')!, {
    animation: 150,
    onEnd: function (evt: SortableEvent) {
      sortChanged = true;
    },
  });
}

watch(
  () => desktopList.value,
  (val) => {
    if (val.length) {
      nextTick(() => {
        initDrag();
      });
    }
  },
  {
    immediate: true,
  },
);
function updateSort() {
  // 如果发生了排序，则更新排序 [0].getAttribute('data-index');
  const changedList: { id: number; sort: number }[] = [];
  document.querySelectorAll('.desktops-drag-wrap').forEach((v, index) => {
    const oldSort = parseInt(v.getAttribute('data-sort')!);
    const itemIndex = parseInt(v.getAttribute('data-index')!);
    const desktop = desktopList.value[itemIndex];
    if (oldSort !== index) {
      changedList.push({
        id: desktop.id!,
        sort: index,
      });
    }
  });
  if (changedList.length) {
    // 调用后端接口更新数据 TODO
    service.base.desktop.update(changedList).then(() => {
      sortChanged = false;
      desktopStore.updateSort(changedList);
    });
  }
}

watch(
  () => settingShow.value,
  (val) => {
    if (!val && sortChanged) {
      updateSort();
    }
  },
);

onBeforeUnmount(() => {
  updateSort();
  sortIns.value?.destroy();
});
</script>
<style lang="scss" scoped>
.desktops-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
.title-action {
  font-size: 20px;
  font-weight: 600;
  border-left: 4px solid #fa9819;
  padding-left: 10px;
}
.desktops-drag-wrap {
  display: flex;
  align-items: center;
}

.desktops-drag-icon {
  position: relative;
  left: -10px;
  font-size: 24px;
  cursor: pointer;
}
</style>
