<template>
  <el-card style="max-width: 420px; margin: 50px auto">
    <el-button type="primary" @click="connectKeplr" :loading="loading">
      Connect Keplr to Check if Your NFT Is Staked
    </el-button>
    <el-alert v-if="address" type="success" :closable="false" style="margin-top: 20px">
      Wallet Address: {{ address }}<br />
      <span v-if="stackedNFT !== null">NFT is stacked: {{ stackedNFT ? 'Yes' : 'No' }}</span
      ><br />
      <span v-if="!stackedNFT"
        ><a
          style="text-decoration: underline"
          href="https://daodao.zone/dao/stars1w4wacnv7s8jvsnn248q37l5ya8g95qhypwypdhwd2pvc9sykch9qnxqg5q/home"
          target="_blank"
          >Click to stack NFT</a
        ></span
      >
    </el-alert>

    <el-alert v-if="error" type="error" :closable="false" style="margin-top: 20px">
      {{ error }}
    </el-alert>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCool } from '/@/cool';

const { service } = useCool();
const CHAIN_ID = 'stargaze-1'; // 主网

const address = ref('');
const error = ref('');
const loading = ref(false);
const stackedNFT = ref(null);

const connectKeplr = async () => {
  error.value = '';
  address.value = '';
  loading.value = true;
  stackedNFT.value = null;
  try {
    // 检查Keplr是否已安装
    if (!window.keplr) {
      error.value = 'Please install the Keplr wallet plugin first';
      loading.value = false;
      return;
    }

    // 请求授权
    await window.keplr.enable(CHAIN_ID);

    // 获取签名器
    const offlineSigner = window.getOfflineSigner(CHAIN_ID);
    const accounts = await offlineSigner.getAccounts();
    address.value = accounts[0]?.address || '';

    const res = await service.base.sys.user.isNftStacked({ address: address.value });
    stackedNFT.value = res;
  } catch (e: any) {
    error.value = 'Connection failed: ' + (e?.message || e);
  } finally {
    loading.value = false;
  }
};
</script>
