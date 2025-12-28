import { ref } from 'vue';
import { service } from '/@/cool';
import { useUserStore } from '/@/store/user';
import { useCool } from '/@/cool';

export function useFollow(info: Eps.BaseSysUserEntity) {
  const userStore = useUserStore();
  const { router } = useCool();
  const isFollow = ref(false);
  const followLoading = ref(false);
  async function handleFollow() {
    if (!userStore.info) {
      router.push('/login');
      return;
    }
    followLoading.value = true;
    if (isFollow.value) {
      await service.base.friend.delete({ userId: userStore.info?.id, friendId: info.value.id });
      info.value.fansCount--;
    } else {
      await service.base.friend.add({ userId: userStore.info?.id, friendId: info.value.id });
      info.value.fansCount++;
    }
    isFollow.value = !isFollow.value;
    followLoading.value = false;
  }

  async function getFollowList() {
    if (!userStore.info) {
      return;
    }
    const res = await service.base.friend.list({ userId: userStore.info?.id });
    isFollow.value = res.some((item) => item.friendId === info.value.id);
  }

  return {
    isFollow,
    followLoading,
    handleFollow,
    getFollowList,
  };
}
