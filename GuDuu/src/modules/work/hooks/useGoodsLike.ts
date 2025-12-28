import { ref } from 'vue';
import { service } from '/@/cool';
import { useUserStore } from '/@/store/user';

export function useGoodsLike(info: Eps.GoodsInfoEntity) {
  const userStore = useUserStore();
  const isLike = ref(false);
  const likeLoading = ref(false);
  async function handleLike() {
    likeLoading.value = true;
    if (isLike.value) {
      info.value.likeCount--;
    } else {
      info.value.likeCount++;
    }
    isLike.value = !isLike.value;
    await service.goods.like.like({ id: info.value.id });
    likeLoading.value = false;
  }

  async function getLikeState() {
    const res = await service.goods.like.liked({ id: info.value.id });
    isLike.value = res;
  }

  return {
    isLike,
    likeLoading,
    handleLike,
    getLikeState,
  };
}
