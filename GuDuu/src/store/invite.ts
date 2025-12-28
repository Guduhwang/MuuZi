import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStore } from '/@/store';
import { useCool } from '/@/cool';

export const useInviteStore = defineStore('invite', () => {
  const { userStore } = useStore();
  const { service } = useCool();

  const inviteList = ref<any>(null);

  async function refresh() {
    const data = await service.base.sys.user.invitedList();
    inviteList.value = data;
  }

  return {
    inviteList,
    refresh,
  };
});
