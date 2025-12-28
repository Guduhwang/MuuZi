<template>
  <el-scrollbar height="400px">
  <div class="nft-staking">
    <div v-if="!walletAddress" class="connect-wallet">
      <button @click="connect" :disabled="isLoading">
        {{ isLoading ? "连接中..." : "连接Keplr钱包" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else>
      <div class="wallet-info">
        <p>已连接钱包: {{ walletAddress }}</p>
        <button @click="refresh" :disabled="isLoading">刷新数据</button>
      </div>

      <h2>我的NFT</h2>
      <div v-if="ownedNfts.length === 0" class="empty">
        <p>没有找到NFT</p>
      </div>
      <div v-else class="nft-grid">

        <div
          v-for="nft in ownedNfts"
          :key="nft.tokenId"
          class="nft-card"
          @click="selectNft(nft)"
          :class="{ selected: selectedNft?.tokenId === nft.tokenId }"
        >
          <img :src="nft.image" :alt="nft.name" />
          <h3>{{ nft.name }}</h3>
          <p>ID: {{ nft.tokenId }}</p>
        </div>
      </div>

      <button @click="stake" :disabled="!selectedNft || isLoading" class="action-button">
        质押选中的NFT
      </button>

      <h2>已质押的NFT</h2>
      <div v-if="stakedNfts.length === 0" class="empty">
        <p>没有已质押的NFT</p>
      </div>
      <div v-else class="nft-grid">
        <div
          v-for="nft in stakedNfts"
          :key="nft.tokenId"
          class="nft-card staked"
          @click="selectStakedNft(nft)"
          :class="{ selected: selectedStakedNft?.tokenId === nft.tokenId }"
        >
          <img :src="nft.image" :alt="nft.name" />
          <h3>{{ nft.name }}</h3>
          <p>ID: {{ nft.tokenId }}</p>
        </div>
      </div>

      <button
        @click="unstake"
        :disabled="!selectedStakedNft || isLoading"
        class="action-button unstake"
      >
        解除质押选中的NFT
      </button>
    </div>
  </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useNftStore } from "/@/store/nft";
import { ElNotification, ElMessageBox } from "element-plus";
const nftStore = useNftStore();

const selectedNft = ref(null);
const selectedStakedNft = ref(null);

// 计算属性
const walletAddress = computed(() => nftStore.walletAddress);
const ownedNfts = computed(() => nftStore.ownedNfts);
const stakedNfts = computed(() => nftStore.stakedNfts);
const isLoading = computed(() => nftStore.isLoading);
const error = computed(() => nftStore.error);
const shortAddress = computed(() =>
  walletAddress.value
    ? `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`
    : ""
);

// 方法
const connect = async () => {
  await nftStore.connectWallet();
  if (!error.value) {
    ElNotification({
      message: "钱包连接成功",
    });
  }
};

const refresh = async () => {
  await nftStore.loadNfts();

  ElNotification({
    message: "数据已刷新",
  });
};

const selectNft = (nft) => {
  selectedNft.value = nft;
  selectedStakedNft.value = null;
};

const selectStakedNft = (nft) => {
  selectedStakedNft.value = nft;
  selectedNft.value = null;
};

const stake = async () => {
  if (!selectedNft.value) return;

  try {
    await nftStore.stakeNft(selectedNft.value.tokenId);

    ElNotification({
      message: "质押成功",
    });
    selectedNft.value = null;
  } catch {
    ElNotification({
      message: "质押失败",
    });
  }
};

const unstake = async () => {
  if (!selectedStakedNft.value) return;

  try {
    await nftStore.unstakeNft(selectedStakedNft.value.tokenId);

    ElNotification({
      message: "解除质押成功",
    });
    selectedStakedNft.value = null;
  } catch {
    ElNotification({
      message: "解除质押失败",
    });
  }
};
</script>

<style scoped>
.nft-staking {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.connect-wallet {
  text-align: center;
  margin: 50px 0;
}

.wallet-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.nft-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.nft-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.nft-card.selected {
  border: 2px solid #4caf50;
  background-color: #f8fff8;
}

.nft-card.staked {
  border-color: #ff9800;
}

.nft-card.staked.selected {
  border: 2px solid #ff9800;
  background-color: #fff8f0;
}

.nft-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 0;
}

.action-button {
  background-color: #4caf50;
  color: white;
}

.action-button.unstake {
  background-color: #ff9800;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  margin-top: 10px;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
