<template>
  <ElDialog
    v-bind="$attrs"
    ref="dialogRef"
    class="chatGroup-dialog"
    :style="{ pointerEvents: isChatGroupDisabled ? 'none' : 'auto' }"
    :modelValue="show"
    :width="dialogWidth"
    body-class="chatGroup-dialog-body"
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :append-to-body="true"
    @close="handleClose"
  >
    <template #header>
      <div class="chatGroup-header">
        <IMdiKeyboardArrowDown class="chatGroup-header-icon" @click="handleClose"></IMdiKeyboardArrowDown>
        <div class="chatGroup-header-options">
          <el-avatar :size="20" :src="activeChatTarget?.avatar" class="chatGroup-header-icon"></el-avatar>
          <el-tooltip :content="activeChatTarget?.name" placement="top" effect="light">
            <div class="chatGroup-header-group__text">{{ activeChatTarget?.name }}</div>
          </el-tooltip>
          <div class="chatGroup-header-group-member-wrap" @click="toggleGroupMembers">
            <IMdiPeople class="chatGroup-header-group__member-icon"></IMdiPeople>
            <div class="chatGroup-header-group__member-text">
              {{ curMemberList.length - 1 < 0 ? 0 : curMemberList.length - 1 }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="chatGroup-body" :id="bodyId">
      <div class="chatGroup-menu-wrap" v-if="isShowGroupMenu">
        <el-collapse expand-icon-position="left" v-model="activeMenus">
          <el-collapse-item title="My Groups" name="groups">
            <div
              class="chatGroup-menu-item"
              :class="[activeChatTarget?.id === item.id ? 'active' : '']"
              v-for="(item, index) in groupList"
              :key="item.id"
              v-show="item.parentType === 0 || item.type === 1"
              @click="toggleGroup(item, index)"
            >
              <el-avatar :size="20" :src="item.avatar" class="chatGroup-menu-item-icon"></el-avatar>
              <div class="chatGroup-menu-item-text">{{ item.name }}</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="chat-area-wrap">
        <div class="chat-area-content">
          <DynamicScroller
            ref="scroller"
            :items="messageList"
            :min-item-size="60"
            keyField="id"
            class="chat-area-content-scroller"
            :key="activeChatTarget?.id"
          >
            <template #default="{ item, index, active }">
              <DynamicScrollerItem
                :item="item"
                :data-active="active"
                :active="active"
                :size-dependencies="[item.content]"
                :data-index="index"
              >
                <div class="chat-msg-item-wrap">
                  <div class="chat-msg-item" :class="item.isSelf ? 'self' : ''">
                    <div class="chat-msg-item-person">
                      <div class="chat-msg-item-person-avatar-wrap">
                        <ChatMemberProfileWrap :member="curMemberMap?.[item.fromId]">
                          <img
                            v-if="curMemberMap?.[item.fromId]?.avatar"
                            :key="curMemberMap?.[item.fromId]?.avatar"
                            class="chat-msg-item-person-avatar"
                            :src="curMemberMap?.[item.fromId]?.avatar"
                          />
                        </ChatMemberProfileWrap>
                      </div>
                    </div>
                    <div class="chat-msg-item-cnt-wrap">
                      <div class="chat-msg-item-cnt" v-if="item.type === 0">
                        <span v-html="item.content" v-if="typeof item.content === 'string'"></span>
                        <div v-else>{{ JSON.stringify(item.content) }}</div>
                      </div>
                      <div v-else-if="item.type === 1" class="chat-msg-state-wrap">
                        <ChatLoading v-if="item.content.isLoaded === false" />
                        <el-image
                          class="chat-msg-item-thumbnail"
                          :src="item.content.path"
                          :preview-src-list="item.previewImgList"
                          show-progress
                          :initial-index="0"
                          preview-teleported
                          fit="contain"
                        />
                      </div>
                      <div
                        v-else-if="item.type === 2"
                        class="chatGroup-video-thumbnail-container chat-msg-state-wrap"
                        @click="openVideoPlayer(item)"
                      >
                        <ChatLoading v-if="item.content.isLoaded === false" />
                        <el-image
                          v-if="item.content.thumbnail"
                          :src="item.content.thumbnail"
                          fit="cover"
                          class="chat-msg-item-thumbnail"
                        />
                        <div v-else class="chat-msg-item-thumbnail-placeholder"></div>
                        <div class="chatGroup-video-play-icon">
                          <IIconParkOutlinePlay class="chatGroup-play-icon" />
                        </div>
                      </div>
                      <div v-else-if="item.type === 3" class="chat-msg-state-wrap">
                        <ChatLoading v-if="item.content.isLoaded === false" />
                        <MsgFile :file="item.content" />
                      </div>
                      <div class="chat-msg-item-cnt" v-else-if="item.content?.code && item.content?.data">
                        <ChatWorkflowErrorMsg
                          v-if="item.content.code && item.content.code !== 10000"
                          :errorMsg="item.content?.msg"
                        />
                        <ChatWorkflowMsg
                          v-else
                          :msgs="msgItems"
                          v-for="(msgItems, index) in item.content?.data"
                          :key="index"
                        />
                      </div>
                      <div class="chat-msg-item-cnt" v-else-if="item.type === 31">
                        <ChatMediaPushMsg :msg="item.content?.[0]" />
                      </div>
                      <div class="chat-msg-item-cnt1" v-else-if="item.type === 'loading'">
                        <motion.div
                          class="chatGroup-loading-container"
                          animate="pulse"
                          :transition="{ staggerChildren: -0.2, staggerDirection: -1 }"
                        >
                          <motion.div class="chatGroup-loading-dot" :variants="dotVariants" />
                          <motion.div class="chatGroup-loading-dot" :variants="dotVariants" />
                          <motion.div class="chatGroup-loading-dot" :variants="dotVariants" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
        <div class="chat-input-wrap" id="chatInputWrap">
          <div class="chat-group-invalid-msg-wrap" v-if="isShowInValid">
            <span class="">Please finish entering all required information before sending</span>
            <div class="chat-group-invalid-msg-close-wrap" @click="isShowInValid = false">
              <IMdiCloseCircle class="chat-group-invalid-msg-close" />
            </div>
          </div>
          <div class="chatGroup-chatImgInputUpload-wrap" v-if="chatImgInputUploadCptInfo.length">
            <ChatFileInputUpload
              v-for="item in chatImgInputUploadCptInfo"
              :key="item.field"
              :field="item.field"
              :type="item.fileType"
              v-model="item.value"
            />
          </div>
          <AtPicker :list="filteredMembers" :show="isShowAtPeron" @select="handleSelectMember" />
          <div class="chat-input-toolbar">
            <el-tooltip content="emoji" placement="top" effect="light">
              <EmojiPicker @select="showEmoji">
                <template #button>
                  <div class="chat-input-toolbar-item">
                    <IMdiEmoticonOutline class="chat-input-toolbar-item-icon" />
                  </div>
                </template>
              </EmojiPicker>
            </el-tooltip>
            <el-tooltip content="image" placement="top" effect="light">
              <cl-upload
                type="file"
                :showFileList="false"
                accept=".jpg,.png,.gif,.jpeg"
                @upload="handleUpload($event, 1)"
                @success="handleUploadedSuccess($event, 1)"
                @progress="handleUploadProgress"
              >
                <div class="chat-input-toolbar-item">
                  <IMdiImageOutline class="chat-input-toolbar-item-icon" />
                </div>
              </cl-upload>
            </el-tooltip>
            <el-tooltip content="video" placement="top" effect="light">
              <cl-upload
                type="file"
                :showFileList="false"
                accept=".mp4"
                @upload="handleUpload($event, 2)"
                @success="handleUploadedSuccess($event, 2)"
              >
                <div class="chat-input-toolbar-item">
                  <IMdiLibraryVideo class="chat-input-toolbar-item-icon" />
                </div>
              </cl-upload>
            </el-tooltip>
            <el-tooltip content="file" placement="top" effect="light">
              <cl-upload
                type="file"
                :showFileList="false"
                @upload="handleUpload($event, 3)"
                @success="handleUploadedSuccess($event, 3)"
                accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.csv,.ppt,.pptx,.md"
              >
                <div class="chat-input-toolbar-item">
                  <IMdiBriefcaseOutline class="chat-input-toolbar-item-icon" />
                </div>
              </cl-upload>
            </el-tooltip>
          </div>
          <div class="chat-textarea-wrap" v-if="activeChatTarget?.id">
            <ChatEditor
              ref="chatEditorRef"
              :parentShow="propShow"
              v-model="chatInputHistory.get(activeChatTarget!.id)!.form.content"
              @valid="handleSendMessageOnValid"
              @enter="handleSendMessageOnEnter"
              :chatImgInputUploadCptInfo="chatImgInputUploadCptInfo"
              @updateChatImgInputUploadCptInfo="updateChatImgInputUploadCptInfo"
            />
          </div>
        </div>
      </div>
      <ChatGroupMembers v-model:show="isShowGroupMembers" />
    </div>
  </ElDialog>
  <!-- Use the new ChatVideo component -->
  <ChatVideo v-model:show="videoDialogVisible" :video="currentVideo" />
</template>

<script setup lang="ts">
import type { JSONContent } from '@tiptap/core';
import type { IEmojiOutput } from '../emoji-picker/EmojiPicker.vue';
import type { TVideoContent } from '../../util/video';
import type { TAtMention } from '/@/store/im.store';
import type { TMembersConfigParam } from '../member-add/types/member-add.type';
import type { TChatGroupFileInputUploadCptInfo } from './types/index.type';
import type { AxiosRequestConfig } from 'axios';
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, ref, toRef, toRefs, watch } from 'vue';
import { useCool } from '/@/cool';
const { service } = useCool();
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import { useImStore } from '/@/store/im.store';
import EmojiPicker from '../emoji-picker/EmojiPicker.vue';
import ChatVideo from '../chat-video/ChatVideo.vue';
import { generateVideoThumbnail, getFirstFrameFromLocalVideo } from '../../util/video';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import ChatLoading from '../chat-loading/ChatLoading.vue';
import MsgFile from '../msg-file/MsgFile.vue';
import AtPicker from '../at-picker/AtPicker.vue';
import ChatEditor from '../chat-editor/ChatEditor.vue';
import { updateChatGroupDisabledSymbol } from './injections/injections';
import { useChatGroupMembersList } from './hooks/useChatGroupMembersList';
import ChatGroupMembers from '../chat-group-members/ChatGroupMembers.vue';
import ChatMemberProfileWrap from '../chat-member-profile-wrap/ChatMemberProfileWrap.vue';
import { ElDialog } from 'element-plus';
import { generateHTML } from '@tiptap/core';
import { ChatInputButtonExtension } from '../chat-editor/extensions/chat-input-button.ext';
import { ChatFormInputExtension } from '../chat-editor/extensions/chat-form-input.ext';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { ChatFlexibleInputExtension } from '../chat-editor/extensions/chat-flexible-input.ext';
import { useChatGroupDom } from './hooks/useChatGroupDom';
import { TAddTaskParams, TWorkflowMsgItem } from '../../types/message.type';
import { TChatInputTimerForm } from '../chat-editor/chat-input-timer-form/types/chat-input-timer-form.type';
import ChatWorkflowMsg from '/@/modules/work/components/chat-workflow-msg-2/ChatWorkflowMsg.vue';
import ChatMediaPushMsg from '../chat-media-push-msg/ChatMediaPushMsg.vue';
import { ChatFormInputMoreExtension } from '../chat-editor/extensions/chat-form-input-more.ext';
import { ChatFileInputExtension } from '/@/modules/work/components/chat-editor/extensions/chat-file-input.ext';
import { ChatSelectInputExtension } from '/@/modules/work/components/chat-editor/extensions/chat-select-input.ext';
import ChatFileInputUpload from '/@/modules/work/components/chat-editor/chat-file-input/ChatFileInputUpload.vue';
import { useBase } from '/$/base';
import { motion } from 'motion-v';
import { urlSignature } from '../../util/liblib-signature';
import ChatWorkflowErrorMsg from '../chat-workflow-error-msg/ChatWorkflowErrorMsg.vue';
import './css/chatGroup.scss';

const { app } = useBase();

defineOptions({
  name: 'ChatGroup',
});

const props = withDefaults(
  defineProps<{
    show: boolean;
    isShowGroupMenu?: boolean;
  }>(),
  {
    show: false,
    isShowGroupMenu: true,
  },
);

const emit = defineEmits<{
  'update:show': [boolean];
}>();

const { show: propShow } = toRefs(props);
// 计算弹窗宽度
const dialogWidth = computed(() => {
  return app.isShowLive ? '520px' : 'max(500px, 65vw)';
});

const bodyId = ref('chatGroupBody' + new Date().getTime() + Math.random() * 1000);

useChatGroupDom({ show: propShow, bodyId: bodyId.value });

const imStore = useImStore();

const { socketStore, userStore, eventStore, groupStore } = useStore();

const dotVariants = {
  pulse: {
    scale: [1, 1.5, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const chatEditorRef = ref<InstanceType<typeof ChatEditor> | null>(null);
function getHTMLFromTipJson(content: JSONContent) {
  const html = generateHTML(content, [
    StarterKit,
    ChatInputButtonExtension,
    Mention,
    ChatFormInputExtension,
    ChatFlexibleInputExtension,
    ChatFormInputMoreExtension,
    ChatFileInputExtension,
    ChatSelectInputExtension,
  ]);
  return html;
}

// Whether to disable chat dialog
const isChatGroupDisabled = ref(false);
provide(updateChatGroupDisabledSymbol, (value: boolean) => {
  isChatGroupDisabled.value = value;
});

const scroller = ref<{ scrollToBottom?: () => void } | null>(null);

const showEmoji = (emoji: IEmojiOutput) => {
  const groupId = activeChatTarget.value!.id;
  // todo 历史记录功能暂时不可用
  // imStore.updateInputHistoryContent(groupId, chatInputHistory.value.get(groupId)?.form.content + emoji.native);
  // 利用chatEditorRef来插入表情(emoji.native)
  chatEditorRef.value?.editor?.commands.insertContent(emoji.native);
  chatEditorRef.value?.editor?.commands.focus();
};
const {
  activeChatTarget,
  activeIndex: activeGroupIndex,
  friendList: groupList,
  messageHistory,
  chatInputHistory,
} = storeToRefs(imStore);

const activeMenus = ref(['groups']);

const messageList = computed(() => {
  if (activeChatTarget.value) {
    const list = messageHistory.value[activeChatTarget.value.friendId] || [];
    if (list.length) {
      list.forEach((element: Eps.BaseMessageEntity, index) => {
        if (userStore.info?.id === element.fromId) {
          // 避免在渲染中处理
          element.isSelf = true;
          element.avatar = userStore.info?.avatar;
        }
        if (element.type === 0) {
          // 富文本转换
          if (element.content?.type === 'doc') {
            element.content = getHTMLFromTipJson(element.content);
          }
        } else if (
          (element.type === 1 || element.type === 2 || element.type === 3) &&
          typeof element.content === 'string'
        ) {
          element.content = JSON.parse(element.content);
          if (element.type === 1) {
            element.previewImgList = [(element.content as any).path];
          } else if (element.type === 2) {
            // If video doesn't have a thumbnail, generate one
            // todo as unknown以后去掉，因为content类型应该是json
            const videoContent = element.content as unknown as TVideoContent;
            if (videoContent.path && !videoContent.thumbnail) {
              generateVideoThumbnail(videoContent.path).then((thumbnail) => {
                if (thumbnail) {
                  videoContent.thumbnail = thumbnail;
                }
              });
            }
          }
        } else if (element.type === 12) {
          if (element.content.code === 10000) {
            element.content.data.forEach((msg: TWorkflowMsgItem) => {
              if (msg.type === 'Video') {
                // 说明只有视频链接
                if (typeof msg.content === 'string') {
                  msg.content = {
                    path: msg.content,
                    thumbnail: '',
                  };
                  generateVideoThumbnail(msg.content.path).then((thumbnail) => {
                    if (thumbnail) {
                      msg.content.thumbnail = thumbnail;
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
    return list;
  } else {
    return [];
  }
});

// Video player related
const videoDialogVisible = ref(false);
const currentVideo = ref<Eps.BaseMessageEntity | null>(null);

const openVideoPlayer = (videoItem: Eps.BaseMessageEntity) => {
  if (videoItem.content.path) {
    currentVideo.value = videoItem;
    videoDialogVisible.value = true;
  }
};

const handleClose = () => {
  emit('update:show', false);
};

// ----------------------------- 图片组件 start -----------------------------------------------------------------
const chatImgInputUploadCptInfo = ref<TChatGroupFileInputUploadCptInfo[]>([]);
// provide(chatGroupImgInputUploadCptInfoSymbol, chatImgInputUploadCptInfo);

function updateChatImgInputUploadCptInfo(
  {
    field,
    value,
    fileType,
  }: {
    field: string;
    value: string;
    fileType: 'image' | 'video' | 'audio' | 'file';
  },
  type: 'add' | 'del' = 'add',
) {
  if (type === 'add') {
    chatImgInputUploadCptInfo.value.push({ field, value, fileType: fileType });
  } else {
    chatImgInputUploadCptInfo.value = chatImgInputUploadCptInfo.value.filter((item) => item.field !== field);
  }
}

// provide(updateChatImgInputUploadCptInfoSymbol, updateChatImgInputUploadCptInfo);
// ----------------------------- 图片组件 end -----------------------------------------------------------------

//---------------------------------------------发送消息 start-------------------------------

const uploading = ref(false);
const uploadingProgress = ref(0);
const uploadingFiles = new Map<string, Eps.BaseMessageEntity>();
const isShowAtPeron = ref(false);

// 是否正在选择mention，在此过程中，直接回车是不允许发送消息的
const isSelectingMention = ref(false);

// 添加过滤后的成员列表
const filteredMembers = ref<Eps.BaseGroupMemberEntity[]>([]);

// 更新@提及记录
function updateAtMentions(content: string) {
  const mentions: TAtMention[] = [];
  let currentIndex = 0;

  while (currentIndex < content.length) {
    const atIndex = content.indexOf('@', currentIndex);
    if (atIndex === -1) break;

    const textAfterAt = content.slice(atIndex + 1);
    const spaceIndex = textAfterAt.indexOf(' ');
    const endIndex = spaceIndex !== -1 ? atIndex + 1 + spaceIndex : content.length;
    const mentionText = content.slice(atIndex + 1, endIndex);

    // 查找对应的成员
    const member = curMemberList.value.find((m) => m.nickName === mentionText);
    if (member) {
      // 获取下一个@的位置
      const nextAtIndex = content.indexOf('@', endIndex);
      // 获取当前@到下一个@之间的内容，如果没有下一个@则获取到字符串末尾
      const contentBetweenMentions =
        nextAtIndex !== -1 ? content.slice(endIndex, nextAtIndex).trim() : content.slice(endIndex).trim();

      mentions.push({
        userId: member.userId,
        nickName: member.nickName,
        content: contentBetweenMentions,
        startIndex: atIndex,
        endIndex: endIndex,
      });
    }

    currentIndex = endIndex;
  }

  imStore.updateInputHistoryMention(activeChatTarget.value!.id, mentions);
}

// 点击外部区域隐藏AtPicker
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // 如果点击的不是输入框和AtPicker区域
  if (!target.closest('.chat-text-area') && !target.closest('.atPicker-wrap')) {
    isShowAtPeron.value = false;
    document.removeEventListener('click', handleClickOutside);
  }
}

/**
 * 失去焦点的时候，自动保存输入框的内容，和@提及记录
 *  */
function handleMessageBlur() {
  isSelectingMention.value = false;
}

function genMessageEntity({
  content,
  type,
  uid,
  fromId,
  toId,
  avatar,
}: {
  content: string | Eps.BaseMessageEntity;
  type?: number;
  uid?: string;
  fromId?: number;
  toId?: number;
  avatar?: string;
}): Required<Eps.BaseMessageEntity> {
  return {
    // 临时id todo 看看接口能否改成string
    id: parseInt(uid!) || activeChatTarget.value!.id! + new Date().getTime() + Math.random() * 100000,
    fromId: fromId || userStore.info?.id,
    toId: toId || activeChatTarget.value!.friendId!,
    content,
    // 0 文本消息
    type: type || 0,
    at: chatInputHistory.value.get(activeChatTarget.value!.id)?.atMentions.map((mention) => mention.userId) || [],
    toType: activeChatTarget.value!.type!,
    avatar,
  };
}

const handleSendMessage = (
  {
    msg,
    type,
    messageEntity,
    sendType = 'all',
  }:
    | {
        msg?: string | Eps.BaseMessageEntity;
        type?: number;
        sendType?: 'local' | 'server' | 'all';
        messageEntity?: Eps.BaseMessageEntity;
      }
    | undefined = {
    type: 0,
    sendType: 'all',
  },
) => {
  isSelectingMention.value = false;
  const content = msg || chatInputHistory.value.get(activeChatTarget.value!.id)?.form.content || '';
  if ((content || messageEntity) && (activeGroupIndex.value || activeGroupIndex.value === 0)) {
    // 移动群到最前面
    if (imStore.friendList[0].id === activeChatTarget.value!.id) {
      // splice会移动数组元素，性能会低
      const newGroupList = [
        groupList.value[activeGroupIndex.value],
        ...groupList.value.slice(0, activeGroupIndex.value),
        ...groupList.value.slice(activeGroupIndex.value + 1),
      ];

      imStore.setFriendList(newGroupList);
      imStore.setActiveChatTarget(0);
    }

    let message = messageEntity;
    if (!message) {
      message = genMessageEntity({ content, type });
      // 添加@提及信息
      if (type === 0) {
        message.at = chatInputHistory.value
          .get(activeChatTarget.value!.id)
          ?.atMentions.map((mention) => mention.userId);
      }
    }
    // 文件消息可以先不发送到服务器，以显示文件状态
    if (sendType === 'local') {
      socketStore.sendMessageToLocal(message);
    } else if (sendType === 'server') {
      socketStore.sendMessageToServer(message);
    } else {
      socketStore.sendMessage(message);
    }
    console.log(message);

    // 只有是输入框发送消息时，才清空输入框和@提及记录
    if (!msg) {
      imStore.updateInputHistoryContent(activeChatTarget.value!.id, '');
      imStore.updateInputHistoryMention(activeChatTarget.value!.id, []);
    }
    scrollToBottom();
    return message;
  }
};

function sendLoadingMessage(groupId: number, memberId: number) {
  /* 发送loading消息 */
  // 放到下一个队列开始的时候插入，避免在发送消息之前插入
  const id = parseInt(new Date().getTime().toString() + Math.random() * 100000);
  setTimeout(() => {
    const message: Eps.BaseMessageEntity = {
      id,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      fromId: memberId,
      toId: groupId,
      toType: 1,
      type: 'loading',
      content: null,
    };
    imStore.updateLoadingTarget({
      groupId,
      memberId,
      avatar: '',
      id,
    });
    socketStore.sendMessageToLocal(message);
  });
  return id;
}
// Base64 编码函数（支持 Unicode 字符）
function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
function runWorkflow({
  memberId,
  params,
  headers,
  configPackIndex,
}: {
  memberId: number;
  configPackIndex?: number;
  params: Record<string, string | number | boolean>;
  headers?: AxiosRequestConfig['headers'];
}) {
  // 工作流类型，直接调用工作流
  const groupId = activeChatTarget.value!.friendId;
  sendLoadingMessage(groupId, memberId);
  // 将 params 对象转换为 JSON 字符串，然后进行 base64 编码
  const paramsJson = JSON.stringify(params);
  const paramsBase64 = base64Encode(paramsJson);
  return service.base.message
    .runWorkflow(
      {
        groupId,
        memberId,
        configPackIndex,
        params: paramsBase64,
      },
      headers,
    )
    .then((res) => {
      // 目前是是字符串才是算成功
      if (typeof res === 'string') {
        const json = JSON.parse(res);
        // 获取返回的参数
        const member = curMemberList.value.find((item) => item.userId === memberId);
        if (member) {
          const content = [];
          const outputParams = member.config.outputParams as TMembersConfigParam[];
          outputParams.forEach((v) => {
            if (json[v.name]) {
              content.push({
                name: v.name,
                type: v.type,
                value: json[v.name],
              });
            }
          });
          // handleSendMessage({
          //   type: 1,
          //   messageEntity: genMessageEntity({
          //     content,
          //     fromId: memberId,
          //     avatar: member.avatar,
          //   }),
          // });
        }
      } else {
        // if (res.error?.msg) {
        //   ElMessage.error(res.error.msg);
        // }
      }
    })
    .catch(() => {
      imStore.delLoadingTarget({ groupId, memberId });
    });
}

function runTimeWorkflow(
  memberId: number,
  timeWorkflowForm: TChatInputTimerForm,
  workFlowForm: Record<string, string | number | boolean>,
) {
  const groupId = activeChatTarget.value!.friendId;
  sendLoadingMessage(groupId, memberId);
  // 定时任务类型，通过定时任务接口调用工作流
  const params: TAddTaskParams = {
    groupId,
    memberId: memberId,
    execute: {
      type: timeWorkflowForm.type,
      config: timeWorkflowForm.config,
      params: workFlowForm,
    },
  };
  service.base.message.addTask(params).catch(() => {
    imStore.delLoadingTarget({ groupId, memberId });
  });
}

function runMediaPublish(memberId: number, originParams: { text: string; imagePath?: string[] }) {
  const groupId = activeChatTarget.value!.friendId;
  sendLoadingMessage(groupId, memberId);
  const params = {
    ...originParams,
    imagePath: originParams.imagePath?.length ? originParams.imagePath : undefined,
  };
  service.base.message
    .runMediaPublish({
      groupId,
      memberId: memberId,
      params,
    })
    .catch(() => {
      imStore.delLoadingTarget({ groupId, memberId });
    });
}

// 是否显示错误信息
const isShowInValid = ref(false);
function handleSendMessageOnValid(val: boolean) {
  isShowInValid.value = !val;
}

function handleSendMessageOnEnter(val: string | JSONContent) {
  imStore.updateInputHistoryContent(activeChatTarget.value!.id, val);
  if (typeof val !== 'string') {
    // 调用工作流
    const rootContents = val.content;
    rootContents?.forEach(async (rootContent) => {
      if (rootContent.content) {
        // 目前节点只有两层，以后如果发现是无限嵌套，改成递归
        for (let i = 0; i < rootContent.content.length; i++) {
          const node = rootContent.content[i];
          if (node.type === 'mention') {
            const memberId = node.attrs?.id;
            // 查找当前mention节点和下一个mention节点之间的节点，用来获取参数
            let nextMentionNodeIndex = rootContent.content.findIndex((v, index) => v.type === 'mention' && index > i);
            if (nextMentionNodeIndex === -1) {
              nextMentionNodeIndex = rootContent.content.length - 1;
            }
            // TODO 以后这个代码应该去掉，后端自动把配置放入header
            let header;
            // TODO 获取header类型的参数，自动放到body中，以后这里要去掉，body类型应作为额外header，由后端发送
            const headerParams: Record<string, unknown> = {};
            node.attrs?.params?.forEach((param) => {
              if (param.type === 'Header') {
                headerParams[param.name] = param.value;
              }
            });
            // libLib配置包的
            let configPackIndex;
            if (node.attrs?.parentType === 3) {
              // 只针对liblib来配置，liblib类型只有一个chatSelectInput
              const selectItem = rootContent.content.find((v) => v.type === 'chatSelectInput');
              if (selectItem) {
                // 应该用id,以后会改
                configPackIndex = selectItem.attrs?.index;
              }
            }
            // 小部件的 liblib类型
            // todo以后也得删除
            if (node.attrs?.parentType === 2 && node.attrs?.type === 53) {
              const res = urlSignature(node.attrs.config.api, node.attrs.config.secretKey);
              if (res) {
                const { signature, timestamp, signatureNonce } = res;
                headerParams['signature'] = signature;
                headerParams['timestamp'] = timestamp;
                headerParams['signatureNonce'] = signatureNonce;
                headerParams['accessKey'] = node.attrs.config.accessKey;
              }
              // 把获取状态的签名也送过去，只能持续5分钟，以后应该放在后端做定时任务处理
              const statusRes = urlSignature(node.attrs.config.statusApi, node.attrs.config.secretKey);
              if (statusRes) {
                const { signature, timestamp, signatureNonce } = statusRes;
                headerParams['statusSignature'] = signature;
                headerParams['statusTimestamp'] = timestamp;
                headerParams['statusSignatureNonce'] = signatureNonce;
              }
            }
            // n8n节点里的liblib TODO 这是临时代码，仅为了联通，以后得去掉
            if (node.attrs?.parentType === 1 && node.attrs?.type === 12) {
              // 用headerParams来判断,TODO 临时代码，以后应该后端处理
              if (headerParams.accessKey && headerParams.secretKey && headerParams.api && headerParams.statusApi) {
                const res = urlSignature(headerParams.api as string, headerParams.secretKey as string);
                if (res) {
                  const { signature, timestamp, signatureNonce } = res;
                  headerParams['signature'] = signature;
                  headerParams['timestamp'] = timestamp;
                  headerParams['signatureNonce'] = signatureNonce;
                  headerParams['accessKey'] = headerParams.accessKey;
                }
                // 把获取状态的签名也送过去，只能持续5分钟，以后应该放在后端做定时任务处理
                const statusRes = urlSignature(headerParams.statusApi as string, headerParams.secretKey as string);
                if (statusRes) {
                  const { signature, timestamp, signatureNonce } = statusRes;
                  headerParams['statusSignature'] = signature;
                  headerParams['statusTimestamp'] = timestamp;
                  headerParams['statusSignatureNonce'] = signatureNonce;
                }
              }
            }
            //如果是reddit类型，以后这个代码应该去掉，由后端自动把配置放入header
            if (node.attrs?.parentType === 5 && (node.attrs?.type === 54 || node.attrs?.type === 55)) {
              header = {
                clientId: node.attrs.config.clientId,
                clientSecret: node.attrs.config.clientSecret,
                username: node.attrs.config.username,
                password: node.attrs.config.password,
              };
            }
            let timeWorkflowForm: TChatInputTimerForm = {
              type: '',
              config: {},
            };
            let isTimeWorkflow = false;
            // 定时任务类型，通过定时任务接口调用工作流
            if (node.attrs?.timerFormData) {
              // 定时任务类型只会出现一次，且会出现在其他节点之前
              isTimeWorkflow = true;
              timeWorkflowForm = node.attrs?.timerFormData;
            }
            // 媒体推送节点的话，从text节点查找文字
            const isMediaPush = node.attrs?.parentType === 3 && node.attrs?.type === 31;
            if (isMediaPush) {
              // 目前来看是从text节点查找文字
              // 以后如果增加各种富文本节点的话，估计会有不同
              const textArr = [];
              const imagePath = [];
              for (let j = i + 1; j < nextMentionNodeIndex + 1; j++) {
                const paramsNode = rootContent.content[j];
                if (paramsNode.type === 'text') {
                  // 从text节点查找文字
                  textArr.push(paramsNode.text);
                } else if (paramsNode.type === 'chatFileInput' && paramsNode.attrs?.value) {
                  // 如果是图片节点
                  imagePath.push(paramsNode.attrs.value);
                }
              }
              runMediaPublish(memberId, {
                text: textArr.join('').trim(),
                imagePath,
              });
            } else {
              // 查找节点间的参数，查找结束，修改上层循环的i，双层循环等于单层
              const workFlowForm = {};
              for (let j = i + 1; j < nextMentionNodeIndex + 1; j++) {
                const paramsNode = rootContent.content[j];
                // TODO 暂时保留chatInputButton chatFormInput
                if (paramsNode.type === 'chatInputButton' || paramsNode.type === 'chatFormInput') {
                  Object.assign(workFlowForm, paramsNode.attrs?.form);
                }
                // 可编辑表单组件的单组件
                if (paramsNode.attrs?.type === 'chatFormInputItem') {
                  Object.assign(workFlowForm, {
                    [paramsNode.attrs.field]: paramsNode.attrs.value,
                  });
                }
              }
              if (isTimeWorkflow) {
                runTimeWorkflow(memberId, timeWorkflowForm, { ...workFlowForm, ...headerParams });
              } else {
                let runWorkflowParams = { ...headerParams, ...(header || {}) };
                // 如果有configPackIndex，则不传workFlowForm了
                if (!(configPackIndex || configPackIndex === 0)) {
                  runWorkflowParams = {
                    ...runWorkflowParams,
                    ...workFlowForm,
                  };
                }
                runWorkflow({
                  memberId,
                  configPackIndex,
                  params: runWorkflowParams,
                });
              }
            }
            i = nextMentionNodeIndex;
          }
        }
        // 清空所有的图片组件
        chatImgInputUploadCptInfo.value = [];
      }
    });
  }
  handleSendMessage({});
}

const handleUploadProgress = (evt: Upload.IPreloadItem) => {
  uploading.value = true;
  uploadingProgress.value = evt.progress;
};

const handleUpload = async (doc: Required<Upload.IPreloadItem>, type: number) => {
  // 获取到本地文件后，即开始展示消息和进度
  const content = { name: doc.name, path: doc.preload, isLoaded: false };
  if (type === 2 && doc.file) {
    const thumbnail = await getFirstFrameFromLocalVideo(doc.file);
    if (thumbnail) {
      content.thumbnail = thumbnail;
    }
  }
  // uid能保证上传前和上传后id一致
  const messageEntity = reactive(genMessageEntity({ content, type, uid: doc.uid }));
  handleSendMessage({ msg: content, type, sendType: 'local', messageEntity });
  uploadingFiles.set(doc.uid, messageEntity);
};

const handleUploadedSuccess = async (res: Required<Upload.IPreloadItem>, type: number) => {
  uploading.value = false;
  const message = uploadingFiles.get(res.uid);
  message.content!.isLoaded = true;
  if (type === 2) {
    message.content.path = res.url;
  }
  handleSendMessage({
    type,
    sendType: 'server',
    messageEntity: {
      ...message,
      content: { ...message.content, name: res.name, path: res.url },
    },
  });
  if (message) {
    // const trueMessage = imStore.getMessageByMsgEntity(message);
    // if (trueMessage) {
    //   trueMessage.isLoaded = true;
    // }
    uploadingFiles.delete(res.uid);
  }
};

//---------------------------------------------发送消息 end-------------------------------

//---------------------------------------------群组 start-------------------------------
function scrollToBottom() {
  nextTick(() => {
    if (scroller.value && typeof scroller.value.scrollToBottom === 'function') {
      scroller.value.scrollToBottom();
    }
  });
}

onMounted(() => {
  eventStore.on('newMessage', scrollToBottom);
});

onUnmounted(() => {
  eventStore.off('newMessage');
});

function getMessageList() {
  if (activeChatTarget.value) {
    // 可以直接判断messageList，但是那样本函数就会在messageList执行完后才执行，没必要
    if (!messageHistory.value[activeChatTarget.value.friendId]?.length) {
      imStore.refreshMessageHistoryItem(activeChatTarget.value.friendId, activeChatTarget.value.type).then(() => {
        scrollToBottom();
      });
    } else {
      scrollToBottom();
    }
  }
}

const groupMemberMap = toRef(groupStore, 'groupMemberMap');
// 当前聊天窗口的群成员列表
const curMemberList = computed(() => groupMemberMap.value[activeChatTarget.value?.friendId] || []);

const curMemberMap = computed(() => {
  return curMemberList.value.reduce(
    (acc, member) => {
      acc[member.userId] = member;
      return acc;
    },
    {} as Record<number, Eps.BaseGroupMemberEntity>,
  );
});

provide('curMemberList', curMemberList);
/**
 * 获取群成员列表
 */
function getGroupMemberList(groupId: number) {
  if (groupMemberMap.value[groupId]) {
    return;
  }
  // service.base.groupMember
  //   .memberList({ groupIds: [groupId], pageSize: import.meta.env.VITE_MAX_GROUP_NUMBER * 1, page: 1 })
  //   .then((groupMemberList) => {
  //     groupMemberMap.value[groupId] = groupMemberList[0]?.members;
  //   });
  groupStore.getGroupMember([groupId]);
}

const toggleGroup = async (gp: Eps.BaseFriendEntity, index: number) => {
  // 设置激活的群组
  imStore.setActiveChatTarget(index);
  // imStore.setActiveGroup(0);
  getMessageList();
  getGroupMemberList(gp.friendId!);
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      nextTick(() => {
        getMessageList();
        if (activeChatTarget.value) {
          getGroupMemberList(activeChatTarget.value.friendId!);
        }
      });
    }
  },
);

//---------------------------------------------群组 end-------------------------------

//---------------------------------------------群成员浮动 start-------------------------------

const { isShowGroupMembers, toggleGroupMembers } = useChatGroupMembersList();

//---------------------------------------------群成员浮动 end-------------------------------
// 处理选择成员
function handleSelectMember(member: Eps.BaseGroupMemberEntity) {
  const content = chatInputHistory.value.get(activeChatTarget.value!.id)!.form.content;
  if (!content) {
    imStore.updateInputHistoryContent(activeChatTarget.value!.id, '');
  }
  const groupId = activeChatTarget.value!.id;
  const lastAtIndex = content.lastIndexOf('@');

  if (lastAtIndex !== -1) {
    // 找到@后面的内容直到下一个空格或字符串结束
    const textAfterAt = content.slice(lastAtIndex + 1);
    const spaceIndex = textAfterAt.indexOf(' ');
    const endIndex = spaceIndex !== -1 ? lastAtIndex + 1 + spaceIndex : content.length;

    // 替换@后面的内容为选中的成员昵称，保留后面的内容
    const newContent = content.substring(0, lastAtIndex) + `@${member.nickName} ` + content.substring(endIndex);
    imStore.updateInputHistoryContent(groupId, newContent);

    // 更新@提及记录
    updateAtMentions(newContent);
  }

  // 隐藏选择框
  isShowAtPeron.value = false;
  document.removeEventListener('click', handleClickOutside);
  // 设置正在选择mention中
  isSelectingMention.value = true;
}
</script>
