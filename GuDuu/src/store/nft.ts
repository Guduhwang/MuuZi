import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getStargazeClient,
  getUserNFTs,
  getStakedNFTs,
  stakeNFTToDaodao,
  unstakeNFTFromDaodao,
} from '/@/modules/base/composables/cosmos';

export const useNftStore = defineStore('nft', () => {
  const walletAddress = ref('');
  const ownedNfts = ref([]);
  const stakedNfts = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // 连接钱包并加载NFT
  const connectWallet = async () => {
    try {
      isLoading.value = true;
      if (!window.keplr) throw new Error('请安装Keplr钱包');

      await window.keplr.enable('elgafar-1'); // Stargaze测试网
      const accounts = await window.keplr.getOfflineSigner('elgafar-1').getAccounts();
      walletAddress.value = accounts[0].address;

      await loadNfts();
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // 加载NFT数据
  const loadNfts = async () => {
    try {
      isLoading.value = true;
      const client = await getStargazeClient();
      console.log('当前链ID:', await client.getChainId());
      // 并行获取拥有的和已质押的NFT
      const [owned, staked] = await Promise.all([
        getUserNFTs(client, walletAddress.value),
        getStakedNFTs(client, walletAddress.value),
      ]);

      ownedNfts.value = owned;
      stakedNfts.value = staked;
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // 质押NFT
  const stakeNft = async (tokenId) => {
    try {
      isLoading.value = true;
      await stakeNFTToDaodao(walletAddress.value, tokenId, window.keplr);
      await loadNfts(); // 刷新数据
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // 解除质押
  const unstakeNft = async (tokenId) => {
    try {
      isLoading.value = true;
      await unstakeNFTFromDaodao(walletAddress.value, tokenId, window.keplr);
      await loadNfts(); // 刷新数据
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    walletAddress,
    ownedNfts,
    stakedNfts,
    isLoading,
    error,
    connectWallet,
    stakeNft,
    unstakeNft,
    loadNfts,
  };
});
