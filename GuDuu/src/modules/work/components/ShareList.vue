<script setup lang="ts">
import { ref, watch, h, onMounted, onUnmounted } from 'vue';
import type { TShareLink, TMeta } from '../types/user.type';
import IMdiLinkVariant from '~icons/mdi/link-variant';
import IMdiTwitter from '~icons/mdi/twitter';
import IMdiDiscord from '~icons/mdi/discord';
import IMdiTelegram from '~icons/mdi/telegram';
import IMdiFacebook from '~icons/mdi/facebook';
import IMdiWechat from '~icons/mdi/wechat';
import IMdiSinaWeibo from '~icons/mdi/sina-weibo';
import IIconParkOutlineNewLark from '~icons/icon-park-outline/new-lark';
import { service } from '/@/cool';
import { useUserStore } from '/@/store/user';
import { ElMessage } from 'element-plus';
const userStore = useUserStore();
const props = defineProps<{
  isSelf: boolean;
  shareLink?: TShareLink;
  metaList?: TMeta[];
}>();

const map = ref<TShareLink>({
  link: '',
  twitter: '',
  discord: '',
  telegram: '',
  facebook: '',
  wechat: '',
  weibo: '',
  lark: '',
});
watch(
  () => props.shareLink,
  (val) => {
    if (val) {
      console.log(val);
      map.value = val;
    }
  },
);
watch(
  () => props.metaList,
  (val) => {
    if (val) {
      handleShareMeta(val);
    }
  },
);
const iconMap = {
  link: {
    icon: IMdiLinkVariant,
    placeholder: 'Add Website Link',
  },
  twitter: {
    icon: IMdiTwitter,
    placeholder: 'Add Twitter Link',
  },
  discord: {
    icon: IMdiDiscord,
    placeholder: 'Add Discord Link',
  },
  telegram: {
    icon: IMdiTelegram,
    placeholder: 'Add Telegram Link',
  },
  facebook: {
    icon: IMdiFacebook,
    placeholder: 'Add Facebook Link',
  },
  wechat: {
    icon: IMdiWechat,
    placeholder: 'Add Wechat Link',
  },
  weibo: {
    icon: IMdiSinaWeibo,
    placeholder: 'Add Weibo Link',
  },
  lark: {
    icon: IIconParkOutlineNewLark,
    placeholder: 'Add Lark Link',
  },
};
const shareLinks = ref({
  link: {
    icon: IMdiLinkVariant,
    placeholder: 'Add Website Link',
  },
  twitter: {
    icon: IMdiTwitter,
    placeholder: 'Add Twitter Link',
  },
});

onMounted(() => {
  map.value = props.shareLink || {
    link: '',
    twitter: '',
    discord: '',
    telegram: '',
    facebook: '',
    wechat: '',
    weibo: '',
    lark: '',
  };
  if (props.metaList) {
    handleShareMeta(props.metaList);
  }
  // socialShare('.social-share', shareConfig.value);
});
const handleShareEdit = async () => {
  await service.base.sys.user.update({ id: userStore.info?.id, shareLink: map.value });
};

const handleShareOpen = (key: keyof TShareLink) => {
  window.open(`${props.shareLink?.[key]}`, '_blank');
};
const handleShareJump = (key: keyof TShareLink) => {
  // 获取当前页面url
  const url = window.location.href;
  if (key === 'twitter') {
    // 获取metaList中的推特账号
    const twitter = props.metaList?.find((item) => item.name === 'twitter:site')?.content;
    // 获取metaList中的content
    const content = props.metaList?.find((item) => item.name === 'twitter:description')?.content;
    if (twitter) {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${content}${twitter}`, '_blank');
    }
    return;
  }
  if (key === 'link') {
    // 实现复制当前页面url
    window.open(url, '_blank');
    // navigator.clipboard.writeText(url);
    // ElMessage.success('复制成功');
    return;
  }

  // window.open(map.value[key], '_blank');
};
const handleShareMeta = (metaList: TMeta[]) => {
  metaList.map((item) => {
    const meta = document.createElement('meta');
    meta.name = item.name;
    meta.content = item.content;
    document.head.appendChild(meta);
  });
};
// 页面关闭后删除meta
const handleRemoveMeta = (metaList: TMeta[]) => {
  metaList.forEach((item) => {
    const meta = document.querySelector(`meta[name="${item.name}"]`);
    if (meta) {
      document.head.removeChild(meta);
    }
  });
};

onUnmounted(() => {
  if (props.metaList) {
    handleRemoveMeta(props.metaList);
  }
});
</script>
<template>
  <div v-if="props.isSelf" class="share-wrap">
    <div class="share-edit-item" v-for="(_, key) in map" :key="key">
      <template v-if="key !== 'wechat' && key !== 'weibo'">
        <component :is="iconMap[key].icon" />
        <el-input
          v-model="map[key]"
          size="default"
          class="share-edit-input"
          :placeholder="iconMap[key].placeholder"
          @change="handleShareEdit"
        />
      </template>
    </div>
  </div>
  <div class="share-wrap" data-initialized="true" v-else-if="props.shareLink">
    <a
      class="share-item icon-weibo"
      @click="handleShareOpen(key)"
      v-show="props.shareLink?.[key]"
      v-for="(_, key) in props.shareLink"
      :key="key"
    >
      <component :is="iconMap[key].icon" />
    </a>
  </div>
  <div class="share-wrap" data-initialized="true" v-else>
    <a
      class="share-item icon-weibo"
      @click="handleShareJump(key)"
      v-show="shareLinks?.[key]"
      v-for="(_, key) in shareLinks"
      :key="key"
    >
      <component :is="iconMap[key].icon" />
    </a>
  </div>
</template>

<style lang="scss" scoped>
.share-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.share-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  font-size: 14px;
  color: #000000e5;
  cursor: pointer;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}

.share-edit-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-edit-input {
  :deep(.el-input__inner) {
    color: #262626;
  }

  :deep(.el-input__wrapper) {
    box-shadow: none;

    &:has(.el-input__inner:hover) {
      box-shadow: 0 0 0 1px #ddd;
    }

    &:has(.el-input__inner:focus) {
      box-shadow: 0 0 0 2px var(--el-color-primary);
    }
  }
}
</style>
