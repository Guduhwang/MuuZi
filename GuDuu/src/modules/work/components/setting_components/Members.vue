<template>
  <div class="members-wrap">
    <div class="flex items-center justify-between mb-[30px]">
      <div class="title-action">Members</div>
      <el-button round type="warning" @click="handleAddMember">Add</el-button>
    </div>
    <el-table :data="memberList" style="width: 100%" height="350">
      <el-table-column prop="name" label="Name" width="150" />
      <el-table-column prop="avatar" label="Avatar" width="100"
        ><template #default="scope"><el-avatar shape="square" :size="30" :src="scope.row.avatar" /></template
      ></el-table-column>
      <el-table-column prop="type" label="Type" width="100"><template #default="scope">{{ getTypeName(scope.row.type) }}</template></el-table-column
      >
      <el-table-column prop="tokens" label="Tokens" width="100" />
      <el-table-column prop="operate" label="Actions" width="180" fixed="right"
        ><template #default="scope"
          ><el-button class="operation-button" size="small" @click="handleEditMember(scope.row)">Edit</el-button
          ><el-button size="small" plain @click="deleteMember(scope.row)" type="danger">Delete</el-button></template
        ></el-table-column
      >
    </el-table>
    <MemberAdd v-model:show="isShowMemberAdd" :editForm="memberEditForm" />
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElNotification, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';
import { useDict } from '/@/modules/dict';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import MemberAdd from '../member-add/MemberAdd.vue';
import { useMemberAdd } from '../member-add/hooks/useMemberAdd';

const { memberStore, groupStore } = useStore();
const { memberList } = storeToRefs(memberStore);
const { service } = useCool();
const { dict } = useDict();
const memberType = ref(dict.get('memberType').value);

const { isShowMemberAdd, memberEditForm, handleAddMember, handleEditMember } = useMemberAdd();

const deleteMember = async (item: Eps.BaseGroupMemberEntity) => {
  await ElMessageBox.confirm('Are you sure to delete?', 'Tips', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning',
  });
  await service.base.sys.user.delete({ ids: [item.id] });
  const list = await service.base.groupMember.list({ userId: item.id });
  if (list.length > 0) {
    const ids = list.map((item) => item.id);
    await service.base.groupMember.delete({ ids });
    // 删除store里的
    groupStore.deleteGroupMemberByMemberId(item.id!);
  }
  ElNotification({
    message: 'Deleted',
  });
  memberStore.refresh();
};

const getTypeName = (type) => {
  for (let i = 0; i < memberType.value.length; i++) {
    const list = memberType.value[i].children;
    for (let j = 0; j < list.length; j++) {
      if (list[j].value === type) {
        return list[j].name;
      }
    }
  }
};

onMounted(() => {
  memberStore.refresh();
});
</script>
<style lang="scss" scoped>
.members-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
</style>
