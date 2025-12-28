<template>
  <span>
    <ul class="chatWorkflowMsg-list" :class="{ dark: isDark }">
      <li class="chatWorkflowMsg-item" v-for="item in list" :key="item.name">
        <div class="chatWorkflowMsg-item-msg-wrap">
          <span class="chatWorkflowMsg-item-msg-name">{{ item.name }}: </span>
          <span v-if="item.type === 'Image'" class="chatWorkflowMsg-item-msg-img-list">
            <div v-for="imgSrc in item.content" :key="imgSrc">
              <!-- 只有只有一张的时候才显示链接，多张的话，显示组合图 -->
              <el-link
                v-if="(item.content as string[]).length === 1"
                :href="imgSrc"
                target="_blank"
                type="primary"
                class="chatWorkflowMsg-item-msg-img-link"
                >{{ imgSrc }}</el-link
              >
              <br />
              <el-image
                class="chatWorkflowMsg-item-msg-img"
                :src="imgSrc"
                lazy
                :zoom-rate="1.2"
                :max-scale="5"
                :min-scale="0.2"
                :preview-src-list="[imgSrc]"
                hide-on-click-modal
                preview-teleported
                :initial-index="4"
              />
            </div>
          </span>
          <span v-else-if="item.type === 'Video'" class="chatWorkflowMsg-item-msg-img-list">
            <div v-for="video in item.content" :key="video">
              <el-link
                v-if="(item.content as string[]).length === 1 && video?.path"
                :href="video?.path"
                target="_blank"
                type="primary"
                class="chatWorkflowMsg-item-msg-img-link"
              >
                {{ video?.path }}
              </el-link>
              <br />
              <div
                class="chatGroup-video-thumbnail-container chat-msg-state-wrap"
                @click="openVideoPlayer(video)"
                style="width: fit-content"
              >
                <el-image v-if="video?.thumbnail" :src="video?.thumbnail" fit="cover" class="chat-msg-item-thumbnail" />
                <div v-else class="chat-msg-item-thumbnail-placeholder"></div>
                <div class="chatGroup-video-play-icon">
                  <IIconParkOutlinePlay class="chatGroup-play-icon" />
                </div>
              </div>
            </div>
          </span>
          <span v-else-if="item.type === 'Html'" class="chatWorkflowMsg-item-msg-html">
            <span v-html="item.content"></span>
            <div
              v-if="item.content"
              class="chatWorkflowMsg-item-msg-html-btn"
              @click="handleCopyHtml(item.content as string)"
            >
              Copy
            </div>
          </span>
          <span v-else-if="item.type === 'File'">
            <MsgFileN8n v-for="(file, index) in item.content" :key="index" :file="file"></MsgFileN8n>
          </span>
          <span v-else-if="item.type === 'Link'">
            <el-link
              :href="item.content as string"
              target="_blank"
              type="primary"
              class="chatWorkflowMsg-item-msg-img-link"
              >{{ item.content }}</el-link
            >
          </span>
          <span class="chatWorkflowMsg-item-msg-cnt" v-else v-html="item.content"></span>
        </div>
        <div v-if="item.type === 'Image'">
          <div class="chatWorkflowMsg-item-msg-img-tool">
            <div class="item" v-for="k in tools" :key="k.key">
              <img alt="" class="svg" :src="k.src" />
              <div class="name">{{ k.name }}</div>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <ChatVideo v-if="videoDialogVisible" v-model:show="videoDialogVisible" :video="currentVideo" isShowUrl></ChatVideo>
  </span>
</template>

<script setup lang="ts">
import type { TWorkflowMsgItem } from '/@/modules/work/types/message.type';
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import ChatVideo from '../chat-video/ChatVideo.vue';
import MsgFileN8n from '../msg-file-n8n/MsgFileN8n.vue';

defineOptions({
  name: 'ChatWorkflowMsg',
});

const props = withDefaults(
  defineProps<{
    isDark?: boolean;
    msgs: TWorkflowMsgItem[];
  }>(),
  {
    isDark: false,
  },
);

function handleCopyHtml(html: string) {
  /* 复制 html到剪切板*/
  window.navigator.clipboard.writeText(html);
  ElMessage.success('Copied');
}

// todo 逻辑应该抽离
// Video player related
const videoDialogVisible = ref(false);
const currentVideo = ref<Eps.BaseMessageEntity | null>(null);

const tools = ref([
  {
    key: 0,
    name: 'Upscale(Subtle)',
    src: '/svg/full-screen.svg',
  },
  {
    key: 1,
    name: 'Upscale(Creative)',
    src: '/svg/full-screen.svg',
  },
  {
    key: 2,
    name: 'Vary(Subtle)',
    src: '/svg/painting.svg',
  },
  {
    key: 3,
    name: 'Vary(Strong)',
    src: '/svg/painting.svg',
  },
  {
    key: 4,
    name: 'Vary(Region)',
    src: '/svg/edit.svg',
  },
  {
    key: 5,
    name: 'Zoom Out 2x',
    src: '/svg/search.svg',
  },
  {
    key: 6,
    name: 'Zoom Out 1.5x',
    src: '/svg/search.svg',
  },
  {
    key: 7,
    name: 'Custom Zoom',
    src: '/svg/search.svg',
  },
  {
    key: 8,
    name: 'Animate(High motion)',
    src: '/svg/video.svg',
  },
  {
    key: 9,
    name: 'Animate(Low motion)',
    src: '/svg/video.svg',
  },
]);

const openVideoPlayer = (videoItem: Eps.BaseMessageEntity) => {
  if (videoItem.path) {
    currentVideo.value = {
      content: videoItem,
    };
    videoDialogVisible.value = true;
  }
};

const list = computed(() => {
  let msgs = props.msgs;
  if (!Array.isArray(msgs)) {
    msgs = [msgs];
  }
  return msgs.map((item) => {
    // 媒体类型如果老数据为非数组，则转为数据，以后重构话，这个代码可以去掉
    if (item.type === 'Image' || item.type === 'Video' || item.type === 'File' || item.type === 'Audio') {
      if (!Array.isArray(item.content)) {
        item.content = [item.content];
      }
    }
    return item;
  });
});
</script>
<style lang="scss" scoped>
.chatWorkflowMsg-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;

  &.dark {
    .chatWorkflowMsg-item-msg-name {
      color: #fff;
    }
  }
}

.chatWorkflowMsg-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chatWorkflowMsg-item-msg-wrap {
  font-size: 12px;
}

.chatWorkflowMsg-item-msg-name {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: rgba(38, 38, 38, 1) !important;
  // background: #5147ff;
  background-color: rgba(250, 152, 25, 0.3);
  border-radius: 4px;
  padding-inline: 8px;
  margin-bottom: 4px;
  margin-right: 4px;
}

.chatWorkflowMsg-item-msg-cnt {
  white-space: pre-wrap;
}

// .chatWorkflowMsg-item-msg-img {
//   width: 120px;
//   height: 120px;
//   border-radius: 4px;
//   margin-top: 4px;
// }

.chatWorkflowMsg-item-msg-img {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  margin-top: 4px;
}

.chatWorkflowMsg-item-msg-img-tool {
  display: flex;
  flex-wrap: wrap;
  .item {
    font-size: 14px;
    color: #262626;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid #cccccc;
    background-color: #e6e6e6;
    margin-right: 6px;
    font-weight: 500;
    margin-top: 10px;
    cursor: pointer;
    &:hover {
      background-color: #cccccc;
    }
    .svg {
      width: 14px;
      height: 14px;
      margin-right: 10px;
    }
  }
}

.chatWorkflowMsg-item-msg-img-link {
  display: inline;
  font-size: 12px;

  .el-link__inner {
    text-decoration: underline;
  }
}

.chatWorkflowMsg-item-msg-html {
  position: relative;
}

.chatWorkflowMsg-item-msg-html-btn {
  position: absolute;
  top: 10px;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  padding-inline: 8px;
  border-radius: 4px;
  border: 1px solid #676565;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #f3f3f3;
  }
}

.chatWorkflowMsg-item-msg-img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
