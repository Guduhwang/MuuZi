import { ref } from 'vue';
import { service } from '/@/cool';
import { useUserStore } from '/@/store/user';

export function useGoodsFavorite(info: Eps.GoodsInfoEntity) {
  const userStore = useUserStore();
  const isFavorite = ref(false);
  const favoriteLoading = ref(false);
  async function handleFavorite() {
    favoriteLoading.value = true;
    if (isFavorite.value) {
      info.value.likeCount--;
    } else {
      info.value.likeCount++;
    }
    isFavorite.value = !isFavorite.value;
    if (isFavorite.value) {
      await service.goods.favorite.addFavorite({ id: info.value.id });
    } else {
      await service.goods.favorite.cancelFavorite({ id: info.value.id });
    }
    favoriteLoading.value = false;
  }

  async function getFavoriteState() {
    const res = await service.goods.like.liked({ id: info.value.id });
    isFavorite.value = res;
  }

  return {
    isFavorite,
    favoriteLoading,
    handleFavorite,
    getFavoriteState,
  };
}
