import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStore } from '/@/store';
import { useCool } from '/@/cool';

export const useMemberStore = defineStore('member', () => {
  const { userStore } = useStore();
  const { service } = useCool();

  const memberList = ref<Eps.BaseSysUserEntity[]>([]);
  const memberListAll = ref<Eps.BaseSysUserEntity[]>([]);

  async function refresh() {
    const data = await service.base.sys.user.list({ ownerId: userStore.info?.id });
    memberList.value = data;
  }

  async function refreshAll() {
    memberListAll.value = await service.base.groupMember.allMemberList({});
  }

  return {
    memberList,
    memberListAll,
    refresh,
    refreshAll,
  };
});
