<template>
  <div class="teams-wrap">
    <div v-if="noTeam">
      <el-button type="primary" @click="isShowSubscription = true">PRO Member</el-button>
    </div>
    <el-collapse v-model="activeName" accordion @change="changeTeam">
      <el-collapse-item :title="item.name" v-for="(item, index) in teamList" :key="index" :name="item.id">
        <div v-if="activeItem === item.id">
          <el-scrollbar height="400px">
            <p>
              Invitation code: <span>{{ getInvitationCode() }}</span>
            </p>

            <el-form label-width="auto" @submit.prevent style="width: 300px" v-if="isManager()">
              <el-divider />
              <el-form-item label="Avatar">
                <cl-upload type="file" v-model="activeTeam.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
                  <el-avatar :size="50" :src="activeTeam.avatar" />
                </cl-upload>
              </el-form-item>
              <el-form-item label="Name">
                <el-input v-model="activeTeam.name" />
              </el-form-item>
              <el-form-item label="Revenue Share">
                <el-input-number v-model="activeTeam.allocationRatio" />
              </el-form-item>
              <el-form-item label="Reward pool">
                <el-input-number v-model="activeTeam.rewardPool" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateTeam()">Save</el-button>
              </el-form-item>
              <el-divider />
            </el-form>

            <el-table :data="teamMember" style="width: 100%">
              <el-table-column prop="name" label="Name" width="180" />
              <el-table-column prop="avatar" label="Avatar" width="100"
                ><template #default="scope"><el-avatar :size="30" :src="scope.row.avatar" /></template
              ></el-table-column>
              <el-table-column prop="" label="Title"
                ><template #default="scope"> {{ getTitleName(scope.row.isOwner) }}</template>
              </el-table-column>
              <el-table-column prop="" label="Actions" v-if="isManager()"
                ><template #default="scope">
                  <el-button
                    v-if="scope.row.isOwner === 13"
                    class="operation-button"
                    @click="setMemberRole(scope.row.userId, 12, scope.row.groupId)"
                    >Set to assistant manager</el-button
                  >
                  <el-button
                    v-if="scope.row.isOwner === 12"
                    class="operation-button"
                    @click="setMemberRole(scope.row.userId, 13, scope.row.groupId)"
                    >Set to team member</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
      </el-collapse-item>
    </el-collapse>
    <SubscriptionDialog v-model:show="isShowSubscription" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCool } from '/@/cool';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import SubscriptionDialog from '/@/modules/work/components/subscription-dialog/SubscriptionDialog.vue';
const { userStore } = useStore();
const { info: userInfo } = storeToRefs(userStore);

const { service } = useCool();
const activeItem = ref(null);
const activeTeam = ref(null);
const teamList = ref([]);
const teamMember = ref([]);
const noTeam = ref(false);
const isShowSubscription = ref(false);
const changeTeam = async (e) => {
  if (e) {
    activeItem.value = e;
    activeTeam.value = teamList.value.find((item) => item.id === e);
    await getTeamMember();
  }
};

const getTeamList = async () => {
  teamList.value = await service.base.groupMember.teams();
  if (teamList.value.length > 0) {
    activeItem.value = teamList.value[0].id;
  }
};

const getTeamMember = async () => {
  const res = await service.base.groupMember.memberList({
    groupIds: [activeItem.value],
  });
  teamMember.value = res[0].members;
};

const getTitleName = (type) => {
  if (type === 11) {
    return 'Team Leader';
  }
  if (type === 12) {
    return 'Assistant Manager';
  }
  if (type === 13) {
    return 'Team Member';
  }
};

const setMemberRole = async (userId, isOwner, groupId) => {
  await service.base.groupMember.setTeamMemberRole({ userId, isOwner, groupId });
  await getTeamMember();
};

const getInvitationCode = () => {
  if (teamMember.value.length === 0) {
    return '';
  }
  const me = teamMember.value.find((item) => item.userId === userInfo.value?.id);

  return btoa(`team_${activeItem.value}_${me.level1}_${me.level2}_${me.level3}`);
};

const isManager = () => {
  if (teamMember.value.length === 0) {
    return false;
  }

  const manager = teamMember.value.find((item) => item.isOwner === 11);

  if (manager.userId === userInfo.value.id) {
    return true;
  }
  return false;
};

const updateTeam = async () => {
  await service.base.group.update({ ...activeTeam.value });
  await getTeamList();
};

onMounted(async () => {
  // 角色判断
  if (
    userInfo.value?.roleIds?.includes(6) ||
    userInfo.value?.roleIds?.includes(7) ||
    userInfo.value?.roleIds?.includes(8)
  ) {
    getTeamList();
  } else {
    noTeam.value = true;
  }
});
</script>
<style lang="scss" scoped>
.teams-wrap {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
</style>
