import { SigningCosmWasmClient, CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { SigningStargateClient, calculateFee, GasPrice } from '@cosmjs/stargate';
import { toBase64, fromBase64 } from '@cosmjs/encoding';

// 配置
const CONFIG = {
  stargaze: {
    chainId: 'elgafar-1',
    rpc: 'https://rpc.elgafar-1.stargaze-apis.com',
    nftContract: 'stars107pt2ae5fr8u7gjl5nw67637892sh9uyztuch8ux9vyhcnv4g2fs0h0p8z',
    gasPrice: GasPrice.fromString('0.025ustars'),
  },
  daodao: {
    chainId: 'uni-6',
    rpc: 'https://juno-testnet-rpc.polkachu.com',
    stakingContract: 'juno1...',
    gasPrice: GasPrice.fromString('0.025ujuno'),
  },
  ibc: {
    sourceChannel: 'channel-123',
    sourcePort: 'wasm.stars107pt2ae5fr8u7gjl5nw67637892sh9uyztuch8ux9vyhcnv4g2fs0h0p8z',
    destChannel: 'channel-456',
    destPort: 'wasm.juno1...',
  },
};

// 获取客户端
export async function getStargazeClient() {
  return CosmWasmClient.connect(CONFIG.stargaze.rpc);
}

// 安全查询合约
async function queryContractSafe(client, contractAddress, query) {
  try {
    return await client.queryContractSmart(contractAddress, query);
  } catch (error) {
    console.warn('标准查询失败，尝试原始查询:', error);
    const raw = await client.queryContractRaw(contractAddress, toBase64(JSON.stringify(query)));
    return JSON.parse(fromBase64(raw));
  }
}

// 处理IPFS URL
function normalizeIpfsUrl(uri) {
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

// 获取第一个有效URL
function getFirstValidUrl(urls) {
  const validUrl = urls.find((url) => url && !url.includes('undefined'));
  return validUrl || '/default-nft.png';
}

// 获取元数据
async function fetchNFTMetadata(tokenUri) {
  if (!tokenUri) return {};
  try {
    const url = normalizeIpfsUrl(tokenUri);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('获取元数据失败:', error);
    return {};
  }
}

// 默认NFT数据
function getFallbackNFTData(tokenId) {
  return {
    tokenId,
    name: `NFT #${tokenId}`,
    image: '/default-nft.png',
    cover: '/default-cover.png',
    collection: 'Unknown',
    description: '',
    attributes: [],
  };
}

export async function getUserNFTs(client, address) {
  try {
    const { tokens } = await client.queryContractSmart(CONFIG.stargaze.nftContract, { tokens: { owner: address } });

    return await Promise.all(
      tokens.map(async (tokenId) => {
        try {
          const fullData = await client.queryContractSmart(CONFIG.stargaze.nftContract, {
            all_nft_info: { token_id: tokenId }, // SG721 可能支持的特殊查询
          });
          console.log('完整NFT数据:', fullData, fullData.info.token_uri);

          const tokenUri = fullData.info.token_uri;
          const res = await fetch('https://ipfs-gw.stargaze-apis.com/' + tokenUri.replace('://', '/'));
          const metadata = await res.json();

          // 4. 返回结构化数据
          return {
            tokenId,
            name: metadata.fields.name,
            image: 'https://ipfs-gw.stargaze-apis.com/' + metadata.image.replace('://', '/'),
            cover: 'https://ipfs-gw.stargaze-apis.com/' + metadata.image.replace('://', '/'),
            data: metadata,
            // 其他字段...
          };
        } catch (error) {
          console.error(`处理NFT ${tokenId}失败:`, error);
          return getFallbackNFTData(tokenId);
        }
      }),
    );
  } catch (error) {
    console.error('获取NFT列表失败:', error);
    return [];
  }
}

// 支持重试的IPFS获取
async function fetchWithRetry(uri, retries = 3) {
  const url = normalizeIpfsUrl(uri);
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`获取失败: ${uri}`);
}

// 获取已质押NFT
export async function getStakedNFTs(client, address) {
  try {
    const { tokens } = await queryContractSafe(client, CONFIG.daodao.stakingContract, {
      staked_nfts: { owner: address },
    });
    return tokens.map((tokenId) => ({
      tokenId,
      name: `质押中的NFT #${tokenId}`,
      image: '/staked-nft.png',
    }));
  } catch (error) {
    console.error('获取质押NFT失败:', error);
    return [];
  }
}

// 质押NFT
export async function stakeNFTToDaodao(sender, tokenId, keplr) {
  try {
    const signer = await SigningStargateClient.connectWithSigner(
      CONFIG.stargaze.rpc,
      keplr.getOfflineSigner(CONFIG.stargaze.chainId),
      { gasPrice: CONFIG.stargaze.gasPrice },
    );

    const msg = {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: {
        sourcePort: CONFIG.ibc.sourcePort,
        sourceChannel: CONFIG.ibc.sourceChannel,
        token: {
          denom: `cw721:${CONFIG.stargaze.nftContract}:${tokenId}`,
          amount: '1',
        },
        sender,
        receiver: sender,
        timeoutTimestamp: (Date.now() + 600 * 1000) * 1000000,
      },
    };

    const fee = calculateFee(300000, CONFIG.stargaze.gasPrice);
    const result = await signer.signAndBroadcast(sender, [msg], fee, 'Stake NFT');
    return result.transactionHash;
  } catch (error) {
    console.error('质押失败:', error);
    throw new Error('质押失败: ' + error.message);
  }
}

// 解除质押
export async function unstakeNFTFromDaodao(sender, tokenId, keplr) {
  try {
    const signer = await SigningCosmWasmClient.connectWithSigner(
      CONFIG.daodao.rpc,
      keplr.getOfflineSigner(CONFIG.daodao.chainId),
      { gasPrice: CONFIG.daodao.gasPrice },
    );

    const msg = {
      unstake: { token_id: tokenId },
    };

    const fee = calculateFee(200000, CONFIG.daodao.gasPrice);
    const result = await signer.execute(sender, CONFIG.daodao.stakingContract, msg, fee, 'Unstake NFT');
    return result.transactionHash;
  } catch (error) {
    console.error('解除质押失败:', error);
    throw new Error('解除质押失败: ' + error.message);
  }
}
