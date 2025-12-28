<template>
  <ElDialog
    v-bind="$attrs"
    ref="dialogRef"
    :class="{ 'ai-box-dialog': true, 'mini-chat-box': !isFullScreen, 'ai-box-live-mode': app.isShowLive }"
    :style="{ pointerEvents: isChatGroupDisabled ? 'none' : 'auto' }"
    :modelValue="show"
    :width="dialogWidth"
    body-class="ai-box-dialog-body"
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :append-to-body="true"
    :fullscreen="isFullScreen"
    @close="handleClose"
  >
    <template v-if="isShowGroupMenu"><LeftPanel /></template>
    <div class="chat-group" :class="{ 'chat-group-live-mode': app.isShowLive }" :id="bodyId" v-if="isShowGroupMenu">
      <div class="list">
        <!-- 好友模式：显示好友列表 -->
        <template v-if="isFriendMode">
          <div
            :class="{ item: true, active: activeChatTarget?.friendId === item.friendId }"
            v-for="(item, index) in localFriendList"
            :key="item.friendId || item.id"
          >
            <div
              :class="{ 'item-header': true, active: activeChatTarget?.friendId === item.friendId }"
              @click="handleFriendClick(item)"
            >
              <div class="left">
                <img :src="getIconArrowRight(item.name)" alt="" class="arrow-right" />
                <div class="group-name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </template>
        <!-- 群组模式：显示群组列表 -->
        <template v-else>
          <div
            :class="{ item: true, active: openGroupIds.includes(item.id) }"
            v-for="(item, index) in localGroupList"
            :key="item.id"
          >
            <div
              :class="{ 'item-header': true, active: activeChatTarget?.friendId === item.id }"
              @click="setActiveIds(item, index)"
            >
              <div class="left">
                <img :src="getIconArrowRight(item.name)" alt="" class="arrow-right" />
                <div class="group-name">{{ item.name }}</div>
              </div>
              <img src="/svg/arrow-down.svg" alt="" class="arrow-down" />
            </div>
            <div v-show="openGroupIds.includes(item.id)" class="item-bottom">
              <div class="lines" v-if="getMemberList(item.id).length > 1">
                <div class="line"></div>
              </div>
              <div class="right-list">
                <div class="members" v-for="(k, kIndex) in getMemberList(item.id)" :key="kIndex">
                  <div class="member-item">
                    <img :src="k.avatar" alt="" class="member-avatar" />
                    <div class="member-name">{{ k.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="chat-area-wrap-2">
      <div class="chat-area-header">
        <div class="title">{{ activeChatTarget?.name || '' }}</div>
        <div class="header-tool">
          <img
            :src="getControlWindowImg"
            @mouseenter="onMouseenterControlWindow"
            @mouseleave="onMouseleaveControlWindow"
            class="control-window"
            @click="changeFullScreen"
          />
          <div class="close" @click="handleClose"></div>
        </div>
      </div>
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
              <div class="chat-msg-item-wrap" :class="app.isShowLive ? 'live-mode' : ''">
                <!-- <div class="chat-msg-item" :class="item.isSelf ? 'self' : ''"> -->
                <div class="chat-msg-item">
                  <div class="chat-msg-item-person-2">
                    <div class="line" v-if="item?.extraInfo?.mentionCommand"></div>
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
                    <template v-if="item.isSelf">
                      <div class="quote-info" v-if="item?.extraInfo?.mentionCommand">
                        <img
                          alt=""
                          :src="item?.extraInfo?.mentionAvatar || '/images/ai-box/ava.png'"
                          class="quote-avatar"
                        />
                        <span class="quote-username">{{ item?.extraInfo?.mentionName }}</span>
                        <span class="quote-text">使用了</span>
                        <span class="quote-ml"> {{ item?.extraInfo?.mentionCommand }}</span>
                      </div></template
                    >
                    <template v-else>
                      <div class="quote-info">
                        <img
                          alt=""
                          :src="item?.extraInfo?.userAvatar || '/images/ai-box/ava.png'"
                          class="quote-avatar"
                        />
                        <span class="platform">
                          <img alt="" src="/svg/check.svg" class="icon-platform-readed" />
                          <div>Web</div>
                        </span>
                        <span class="quote-username" v-if="item?.extraInfo?.username">{{
                          item?.extraInfo?.username
                        }}</span>
                        <span class="quote-text"
                          >{{ item?.extraInfo?.commandTextStr }}
                          <span class="quote-name" v-if="item?.extraInfo?.mentionName"
                            >@ {{ item?.extraInfo?.mentionName }}</span
                          >
                          (fast)</span
                        >
                        <!-- <span class="quote-from">-Variations(region) by</span> -->
                      </div>
                      <!-- <div class="quote-type">
                        <div class="quote-status">(已编辑)</div>
                        <img alt="" src="/images/ai-box/icon-img.svg" class="img-demo" /></div
                    > -->
                    </template>
                    <div class="msg-info">
                      <div class="username">{{ item?.fromNickName }}</div>
                      <div class="platform">
                        <img alt="" src="/svg/check.svg" class="icon-platform-readed" />
                        <div>Web</div>
                      </div>
                      <div class="time" v-if="item.createTime">{{ formatRelativeTime(item.createTime) }}</div>
                    </div>
                    <div class="chat-msg-item-cnt-2" v-if="item.type === 0">
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
                    <div class="chat-msg-item-cnt-2" v-else-if="item.content?.code && item.content?.data">
                      <ChatWorkflowErrorMsg
                        v-if="item.content.code && item.content.code !== 10000"
                        :errorMsg="item.content?.msg"
                      />
                      <ChatWorkflowMsg
                        v-else
                        :msgs="msgItems"
                        :is-last-member="index === item.content?.data.length - 1"
                        :shortcut-commands="getShortcutCommandsByFromId(item.fromId)"
                        :group-id="activeChatTarget?.friendId"
                        @shortcut-click="handleShortcutClick"
                        v-for="(msgItems, index) in item.content?.data"
                        :key="index"
                      />
                    </div>
                    <div class="chat-msg-item-cnt-2" v-else-if="item.type === 31">
                      <ChatMediaPushMsg :msg="item.content?.[0]" />
                    </div>
                    <div class="chat-msg-item-cnt-2" v-else-if="item.type === 'loading'">
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
      <div class="chat-input-wrap-2" id="chatInputWrap">
        <div
          class="chat-input-wrap-2-content"
          :class="{ 'live-mode': app.isShowLive }"
          :id="`chatInputWrapContent_${boxType}`"
        >
          <div class="chat-group-invalid-msg-wrap" v-if="showFormError">
            <span class="">Please finish entering all required information before sending</span>
            <div class="chat-group-invalid-msg-close-wrap" @click="showFormError = false">
              <IMdiCloseCircle class="chat-group-invalid-msg-close" />
            </div>
          </div>
          <!-- <div class="chat-group-invalid-msg-wrap" v-if="isShowInValid">
            <span class="">Please finish entering all required information before sending</span>
            <div class="chat-group-invalid-msg-close-wrap" @click="isShowInValid = false">
              <IMdiCloseCircle class="chat-group-invalid-msg-close" />
            </div>
          </div> -->
          <!-- <div class="chatGroup-chatImgInputUpload-wrap-2" v-if="chatImgInputUploadCptInfo.length">
            <ChatFileInputUpload
              v-for="item in chatImgInputUploadCptInfo"
              :key="item.field"
              :field="item.field"
              :type="item.fileType"
              v-model="item.value"
            />
          </div> -->
          <AtPicker :list="filteredMembers" :show="isShowAtPeron" @select="handleSelectMember" />
          <img alt="" src="/svg/add.svg" class="add" @click="openUploadFile" />
          <div class="chat-textarea-wrap-2" v-if="activeChatTarget?.id">
            <ChatEditor
              ref="chatEditorRef"
              :boxType="boxType"
              :parentShow="propShow"
              :showInputList="showInputList"
              v-model="chatInputHistory.get(activeChatTarget!.id)!.form.content"
              @valid="handleSendMessageOnValid"
              @onSubmit="onSubmit"
              @enter="handleSendMessageOnEnter"
              :chatImgInputUploadCptInfo="chatImgInputUploadCptInfo"
              @updateChatImgInputUploadCptInfo="updateChatImgInputUploadCptInfo"
              @updateCurrentMember="updateCurrentMember"
            />
          </div>
          <div class="end-tool" :class="{ 'live-mode': app.isShowLive }">
            <el-tooltip content="emoji" placement="top" effect="light">
              <EmojiPicker @select="showEmoji">
                <template #button>
                  <div :class="['item', 'emo']" alt=""></div>
                </template>
              </EmojiPicker>
            </el-tooltip>
            <el-tooltip content="image" placement="top" effect="light">
              <cl-upload
                multiple
                type="file"
                :showFileList="false"
                accept=".jpg,.png,.gif,.jpeg"
                @upload="handleUpload($event, 1)"
                @success="handleUploadedSuccess($event, 1)"
                @progress="handleUploadProgress"
              >
                <div :class="['item', 'image']" alt=""></div>
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
                <div :class="['item', 'video-select']" alt=""></div>
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
                <div :class="['item', 'file']" alt=""></div>
              </cl-upload>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div
        class="bottom-image-upload"
        :class="{ 'live-mode': app.isShowLive }"
        v-show="uploadFilePanelShow"
        ref="targetElement"
      >
        <div class="header">
          <div class="header-left">
            <div class="current-name">{{ showInputList?.[0]?.name }}</div>
            <div>First {{ showInputList?.[0]?.type }} to add to the command</div>
          </div>
          <!-- Prompt 按钮 -->
          <div class="prompts-btn-wrap" v-if="promptsList.length > 0">
            <el-button size="small" @click="showPromptsPanel = true">Prompts</el-button>
          </div>
          <div class="upload-close" @click="handleCloseBottom"></div>
        </div>
        <div class="content" v-if="uploadList.length">
          <!-- <ChatFileInputUpload
            v-for="item in chatImgInputUploadCptInfo"
            :key="item.field"
            :field="item.field"
            :type="item.fileType"
            v-model="item.value"
          /> -->
          <ChatFileInputUpload
            v-for="item in uploadList"
            :key="item.key"
            :field="item.key"
            :type="item.type.toLocaleLowerCase()"
            v-model="item.value"
          />
        </div>

        <div class="bottom">
          <!-- Prompts 选择面板 -->
          <div class="prompts-panel" v-show="showPromptsPanel" ref="promptsPanelRef">
            <div class="prompts-panel-header">
              <div class="prompts-panel-title">Select Prompt</div>
              <el-icon class="prompts-panel-close" @click="showPromptsPanel = false">
                <Close />
              </el-icon>
            </div>
            <div class="prompts-panel-content">
              <el-radio-group v-model="selectedPromptId" class="prompts-radio-group">
                <el-radio v-for="prompt in promptsList" :key="prompt.id" :label="prompt.id" class="prompt-radio-item">
                  <div class="prompt-radio-content">
                    <div class="prompt-example-wrap">
                      <el-image
                        v-if="prompt.example && isImageUrl(prompt.example)"
                        :src="prompt.example"
                        fit="cover"
                        class="prompt-example-image"
                      />
                      <div
                        v-else-if="prompt.example && isVideoUrl(prompt.example)"
                        class="prompt-example-media"
                        @click.stop="handlePlayMedia(prompt.example!, 'video')"
                      >
                        <el-icon class="play-icon"><VideoPlay /></el-icon>
                      </div>
                      <div
                        v-else-if="prompt.example && isAudioUrl(prompt.example)"
                        class="prompt-example-media"
                        @click.stop="handlePlayMedia(prompt.example!, 'audio')"
                      >
                        <el-icon class="play-icon"><Headset /></el-icon>
                      </div>
                      <div v-else class="prompt-example-placeholder">
                        <el-icon><Document /></el-icon>
                      </div>
                    </div>
                    <div class="prompt-info-wrap">
                      <div class="prompt-remark-text">{{ prompt.remark || 'Prompt' }}</div>
                      <div class="prompt-value-text" :title="prompt.prompt">{{ prompt.prompt || '-' }}</div>
                    </div>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>
            <div class="prompts-panel-footer">
              <el-button size="small" @click="showPromptsPanel = false">Cancel</el-button>
              <el-button size="small" type="primary" @click="handleConfirmPrompt" :disabled="!selectedPromptId"
                >Confirm</el-button
              >
            </div>
          </div>
          <div class="bottom-left">
            <img alt="" :src="curMentionMember?.avatar" class="icon-avatar" />
            <!-- <div class="ml">/blend</div> -->
          </div>
          <div class="input-list">
            <!-- <ChatFormInput v-if="curMentionMember" :curMentionMember="curMentionMember" /> -->
            <el-form
              :model="formData"
              :rules="rules"
              :inline="true"
              :validate-on-rule-change="false"
              ref="myFormRef"
              @submit.prevent
            >
              <el-form-item
                class="item"
                v-for="(i, index) in showInputList"
                :key="index"
                :prop="i.key"
                :class="{ 'item-string': i.type === 'String' }"
              >
                <div class="item-name">{{ i.name }}</div>
                <div class="item-tip" :class="{ 'item-tip-string': i.type === 'String' }">
                  <el-input
                    v-if="i.type !== 'String'"
                    v-model="formData[i.key]"
                    size="default"
                    :disabled="i.type !== 'String'"
                    @keyup.enter.prevent="handleSendMessage"
                  />
                  <span
                    v-else
                    :ref="(el) => setEditableRef(el, i.key)"
                    contenteditable
                    class="editable-input"
                    :data-placeholder="i.required ? '' : 'Optional'"
                    @input="handleEditableInput(i.key, $event)"
                    @keydown.enter.exact.prevent="handleEditableEnter($event)"
                    @keydown.ctrl.enter.exact.prevent="handleSendMessageOnEnter"
                    @blur="handleEditableBlur(i.key, $event)"
                    @focus="handleEditableFocus(i.key, $event)"
                  ></span>
                </div>
                <!-- 非必填项显示关闭按钮 -->
                <div v-if="!i.required" class="item-close" @click.stop="removeOptionalItem(i)">
                  <el-icon><Close /></el-icon>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <template v-if="hideInputList.length">
            <el-popover
              placement="top-start"
              title=""
              trigger="hover"
              popper-class="pop-box"
              popper-style="z-index:99999;background:#000;padding:0;border-radius:10px;"
            >
              <div class="command-pop">
                <div
                  class="command-pop-item"
                  v-for="(o, oIndex) in hideInputList"
                  :key="oIndex"
                  @click="clickMoreItem(o)"
                >
                  {{ o.name }}
                </div>
              </div>
              <template #reference>
                <div class="command-more">+{{ hideInputList.length }} optional</div>
              </template>
            </el-popover>
          </template>
        </div>
      </div>
    </div>
  </ElDialog>
  <!-- Use the new ChatVideo component -->
  <ChatVideo v-model:show="videoDialogVisible" :video="currentVideo" />
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { JSONContent } from '@tiptap/core';
import type { IEmojiOutput } from '../emoji-picker/EmojiPicker.vue';
import type { TVideoContent } from '../../util/video';
import type { TAtMention } from '/@/store/im.store';
import type { TMembersConfigParam } from '../member-add/types/member-add.type';
import type { TChatGroupFileInputUploadCptInfo } from './types/index.type';
import type { AxiosRequestConfig } from 'axios';
import { inject, toRaw } from 'vue';
import { throttle } from 'lodash-es';
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, ref, toRef, toRefs, watch } from 'vue';
import { useCool } from '/@/cool';
const { service } = useCool();
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { useStore } from '/@/store';
import { storeToRefs } from 'pinia';
import { useImStore } from '/@/store/im.store';
import useDesktopStore from '/@/store/desktop';
import LeftPanel from './left-panel.vue';
import ChatGroup from './chat-group.vue';
import RightPanel from './right-panel.vue';
import EmojiPicker from '../emoji-picker/EmojiPicker.vue';
import ChatVideo from '../chat-video/ChatVideo.vue';
import { generateVideoThumbnail, getFirstFrameFromLocalVideo } from '../../util/video';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import ChatLoading from '../chat-loading/ChatLoading.vue';
import MsgFile from '../msg-file/MsgFile.vue';
import AtPicker from '../at-picker/AtPicker.vue';
import ChatEditor from '../chat-editor-2/ChatEditor.vue';
// import ChatFormInput from '../chat-editor-2/chat-form-input/ChatFormInput-2.vue';
import { updateChatGroupDisabledSymbol } from './injections/injections';
import { useChatGroupMembersList } from './hooks/useChatGroupMembersList';
import ChatGroupMembers from '../chat-group-members/ChatGroupMembers.vue';
import ChatMemberProfileWrap from '../chat-member-profile-wrap/ChatMemberProfileWrap.vue';
import { ElDialog, ElMessage } from 'element-plus';
import { generateHTML } from '@tiptap/core';
import { ChatInputButtonExtension } from '../chat-editor-2/extensions/chat-input-button.ext';
import { ChatFormInputExtension } from '../chat-editor-2/extensions/chat-form-input.ext';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { ChatFlexibleInputExtension } from '../chat-editor-2/extensions/chat-flexible-input.ext';
import { useChatGroupDom } from './hooks/useChatGroupDom';
import { TAddTaskParams, TWorkflowMsgItem } from '../../types/message.type';
import { TChatInputTimerForm } from '../chat-editor-2/chat-input-timer-form/types/chat-input-timer-form.type';
// import ChatWorkflowMsg from '/@/modules/work/components/chat-workflow-msg-2/ChatWorkflowMsg.vue';
import ChatWorkflowMsg from '/@/modules/work/components/chat-workflow-msg-2/ChatWorkflowMsg.vue';
import ChatMediaPushMsg from '../chat-media-push-msg/ChatMediaPushMsg.vue';
import { ChatFormInputMoreExtension } from '../chat-editor-2/extensions/chat-form-input-more.ext';
import { ChatFileInputExtension } from '/@/modules/work/components/chat-editor-2/extensions/chat-file-input.ext';
import { ChatSelectInputExtension } from '/@/modules/work/components/chat-editor-2/extensions/chat-select-input.ext';
import ChatFileInputUpload from '/@/modules/work/components/chat-editor-2/chat-file-input/ChatFileInputUpload.vue';
import { useBase } from '/$/base';
import { motion } from 'motion-v';
import { urlSignature } from '../../util/liblib-signature';
import ChatWorkflowErrorMsg from '../chat-workflow-error-msg/ChatWorkflowErrorMsg.vue';
import { Close, VideoPlay, Headset, Document } from '@element-plus/icons-vue';

import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import editor from '/@/modules/base/components/editor';

// 使用必要的插件
dayjs.extend(isToday);
dayjs.extend(isYesterday);
// import './css/aiBox.scss';

const { app } = useBase();

defineOptions({
  name: 'ChatGroup',
});

const props = withDefaults(
  defineProps<{
    show: boolean;
    isShowGroupMenu?: boolean;
    boxType?: string;
  }>(),
  {
    show: false,
    isShowGroupMenu: true,
    boxType: 'one',
  },
);

const emit = defineEmits<{
  'update:show': [boolean];
}>();

const { show: propShow } = toRefs(props);

function formatRelativeTime(dateStr: string) {
  const date = dayjs(dateStr);
  const now = dayjs();

  if (date.isToday()) {
    // 今天：显示时间
    return date.format('HH:mm:ss');
  } else if (date.isYesterday()) {
    // 昨天：显示"昨天 + 时间"
    return `昨天 ${date.format('HH:mm:ss')}`;
  } else if (date.isSame(now, 'year')) {
    // 今年但不是昨天：显示月-日
    return date.format('MM-DD HH:mm:ss');
  } else {
    // 其他年份：显示完整日期
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
}
// 向左图标
const getIconArrowRight = function (name) {
  return name === activeChatTarget?.value?.name ? '/svg/arrow-right-select.svg' : '/svg/arrow-right.svg';
};

// 选中的聊天组ids
const activeIds = ref<number[]>([]);

// 是否全屏
const isFullScreen = ref(false);

const isHoverFullScreen = ref(false);
const isHoverMiniScreen = ref(false);

const curMentionMember = ref(null);
const myFormRef = ref<FormInstance>(null);
const formData = ref({});
const rules = ref({});

// contenteditable span refs
const editableRefs = ref<Record<string, HTMLSpanElement>>({});

// 检测是否为手机端
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '';
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  if (mobileRegex.test(userAgent)) {
    return true;
  }
  if (window.innerWidth <= 768) {
    return true;
  }
  return false;
});

// Prompt 类型定义
type PromptItem = {
  id: number;
  appId: number;
  createTime: string;
  example?: string;
  ownerId: number;
  prompt: string;
  remark: string;
  tenantId: number | null;
  updateTime: string;
  userId: number;
};

// Prompt 相关
const promptsList = ref<PromptItem[]>([]);
const showPromptsPanel = ref(false);
const selectedPromptId = ref<number | undefined>(undefined);
const promptsPanelRef = ref<HTMLElement | null>(null);

function updateCurrentMember(value) {
  console.log('当前用户的配置', value);
  // 分为三组
  curMentionMember.value = value;
  const arrShow = [];
  const arrHide = [];
  const arrUpload = [];
  value.config.params.forEach((i) => {
    if (i.required) {
      arrShow.push(i);
      if (i.type !== 'String') {
        arrUpload.push(i);
      }
    } else {
      arrHide.push(i);
    }
  });
  setHideInputList(arrHide);
  setShowInputList(arrShow);
  setUploadList(arrUpload);
  // 加载 Prompts 列表
  if (value?.prompts && Array.isArray(value.prompts)) {
    promptsList.value = value.prompts;
  } else {
    promptsList.value = [];
  }
  // 修改rules和formData
  // const reauiredList = list.filter((i) => i.required);
  const ruleObj = {};
  const formObj = {};
  if (arrShow.length > 0) {
    arrShow.forEach((i) => {
      if (i.required) {
        ruleObj[i.key] = [
          { required: true, message: i.type === 'String' ? 'Please input' : 'Please attach a file', trigger: 'blur' },
        ];
      }
      formObj[i.key] = '';
    });
  }
  rules.value = ruleObj;
  console.log('ruleObj', ruleObj);
  console.log('formObj', formObj);
  formData.value = formObj;
}

function handleCloseBottom() {
  imStore.setUploadFilePanelShow(false);
  // 先清除当前 mention 成员，确保状态重置
  curMentionMember.value = null;
  // 清除编辑器内容（这会清除所有 mention 节点）
  if (chatEditorRef.value) {
    chatEditorRef.value.cleanEditor?.();
  }
  // 清除输入历史
  if (activeChatTarget.value?.id) {
    imStore.updateInputHistoryContent(activeChatTarget.value.id, '');
    imStore.updateInputHistoryMention(activeChatTarget.value.id, []);
  }
  // 重置列表数据
  resetListData();
  // 重置 prompts 相关状态
  showPromptsPanel.value = false;
  selectedPromptId.value = undefined;
  promptsList.value = [];
  // 初始化 editableRefs
  nextTick(() => {
    showInputList.value.forEach((i) => {
      if (i.type === 'String' && editableRefs.value[i.key]) {
        adjustEditableSize(i.key);
      }
    });
  });
}

// 设置光标到内容末尾
function setCursorToEnd(element: HTMLSpanElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false); // false 表示折叠到末尾
  selection?.removeAllRanges();
  selection?.addRange(range);
}

// 设置 contenteditable span ref
function setEditableRef(el: unknown, key: string) {
  if (el && el instanceof HTMLSpanElement) {
    editableRefs.value[key] = el;
    // 确保文本方向从左到右，左对齐
    el.style.direction = 'ltr';
    el.style.textAlign = 'left';
    // 初始化时设置内容和调整尺寸
    nextTick(() => {
      if (formData.value[key]) {
        el.textContent = formData.value[key];
        // 将光标移动到内容末尾
        setCursorToEnd(el);
      } else {
        // 如果没有内容，确保光标在元素内
        el.focus();
      }
      adjustEditableSize(key);
    });
  }
}

// 调整 contenteditable 尺寸
function adjustEditableSize(key: string) {
  const element = editableRefs.value[key];
  if (!element) return;

  // 重置宽度和高度以获取实际内容尺寸
  element.style.width = 'auto';
  element.style.height = 'auto';

  // 创建一个临时元素来测量内容
  const tempDiv = document.createElement('div');
  const styles = window.getComputedStyle(element);
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.whiteSpace = 'pre-wrap';
  tempDiv.style.wordWrap = 'break-word';
  tempDiv.style.width = 'max-content';

  // 根据是否为手机端设置不同的最大宽度
  const maxWidth = isMobile.value ? 250 : 400;
  tempDiv.style.maxWidth = `${maxWidth}px`;

  tempDiv.style.fontSize = styles.fontSize;
  tempDiv.style.fontFamily = styles.fontFamily;
  tempDiv.style.fontWeight = styles.fontWeight;
  tempDiv.style.padding = styles.padding;
  tempDiv.style.border = styles.border;
  tempDiv.style.boxSizing = styles.boxSizing;
  tempDiv.style.lineHeight = styles.lineHeight;

  const text = element.textContent || element.innerText || '';
  tempDiv.textContent = text || element.dataset.placeholder || '';
  document.body.appendChild(tempDiv);

  // 计算宽度和高度
  const minWidth = 120;
  const measuredWidth = Math.max(tempDiv.offsetWidth + 4, minWidth);
  const finalWidth = Math.min(measuredWidth, maxWidth);
  const measuredHeight = Math.max(tempDiv.offsetHeight, 34);

  element.style.width = `${finalWidth}px`;
  element.style.minHeight = `${measuredHeight}px`;
  element.style.height = 'auto';

  document.body.removeChild(tempDiv);
}

// 处理 contenteditable 输入
function handleEditableInput(key: string, event: Event) {
  const element = event.target as HTMLSpanElement;
  if (element) {
    formData.value[key] = element.textContent || element.innerText || '';
    adjustEditableSize(key);
    // 注意：不在这里移动光标，让用户正常输入
  }
}

// 处理 contenteditable Enter 键（允许换行）
function handleEditableEnter(event: KeyboardEvent) {
  // 允许默认行为（换行）
  // 不阻止，让用户可以换行输入
}

// 处理 contenteditable 获得焦点
function handleEditableFocus(key: string, event: FocusEvent) {
  const element = event.target as HTMLSpanElement;
  if (element) {
    // 获得焦点时，将光标移动到内容末尾
    nextTick(() => {
      setCursorToEnd(element);
    });
  }
}

// 处理 contenteditable 失去焦点
function handleEditableBlur(key: string, event: FocusEvent) {
  const element = event.target as HTMLSpanElement;
  if (element) {
    formData.value[key] = element.textContent || element.innerText || '';
  }
}

// 删除非必填项
function removeOptionalItem(item: any) {
  // 先清除表单数据，确保输入框立即清空
  formData.value[item.key] = '';

  // 如果是文件类型，先清空上传项的值
  if (item.type !== 'String') {
    const uploadItem = uploadList.value.find((u) => u.key === item.key);
    if (uploadItem) {
      uploadItem.value = '';
    }
    // 从上传列表中移除
    uploadList.value = uploadList.value.filter((i) => i.key !== item.key);
  }

  // 清除 editableRefs 中的引用
  if (editableRefs.value[item.key]) {
    delete editableRefs.value[item.key];
  }

  // 从显示列表中移除，并清除该项的 value
  const removedItem = showInputList.value.find((i) => i.key === item.key);
  if (removedItem) {
    removedItem.value = '';
  }
  showInputList.value = showInputList.value.filter((i) => i.key !== item.key);

  // 将该项移回隐藏列表
  hideInputList.value.push(item);

  // 清除表单验证错误
  myFormRef.value?.clearValidate(item.key);
}

function openUploadFile() {
  if (showInputList.value.length === 0) return;
  imStore.setUploadFilePanelShow(true);
}
// const isHoverClose = ref(false);

// const hoverFullScreenWindowImage = '/svg/full-window-hover.svg';
// const normalFullScreenWindowImage = '/svg/full-window.svg';
// const hoverMiniScreenWindowImage = '/svg/mini-window-hover.svg';
// const normalMiniScreenWindowImage = '/svg/mini-window.svg';
// const hoverCloseImage = '/svg/mini-window-hover.svg';
// const normalCloseImage = '/svg/mini-window.svg';

function setActiveIds(item, index) {
  console.log('activeIds', activeIds.value, item.id);
  if (activeIds.value.includes(item.id)) {
    // 如果点击的是已展开的群组，则收起它（清空所有）
    activeIds.value = [];
  } else {
    console.log('我来设置值了');
    // 如果点击的是未展开的群组，先关闭所有其他群组，然后只展开这个群组
    activeIds.value = [item.id];

    // 安全地清理编辑器
    if (chatEditorRef.value) {
      try {
        chatEditorRef.value.cleanEditor?.();
      } catch (e) {
        // 忽略清理错误，组件可能正在销毁或重建
        console.warn('Error cleaning editor:', e);
      }
    }

    imStore.setUploadFilePanelShow(false);
    // 应该是根据当前的群来重新设置
    toggleGroup(item, index);
    setShowInputList([]);
    setHideInputList([]);
    setUploadList([]);
  }

  imStore.setOpenGroupIds(activeIds.value);
}

watch(
  activeIds,
  async () => {
    await nextTick(); // 等待DOM更新
  },
  { deep: true },
);

// 窗口图标
const dialogWidth = computed(() => {
  return app.isShowLive ? '600px' : 'max(500px, 65vw)';
});
// 显示窗口控制按钮
const getControlWindowImg = computed(() => {
  if (isFullScreen.value) {
    return isHoverFullScreen.value ? '/svg/mini-window-hover.svg' : '/svg/mini-window.svg';
  } else {
    return isHoverMiniScreen.value ? '/svg/full-window-hover.svg' : '/svg/full-window.svg';
  }
});

// 窗口控制移入事件
function onMouseenterControlWindow() {
  console.log('移入');
  if (isFullScreen.value) {
    isHoverFullScreen.value = true;
  } else {
    isHoverMiniScreen.value = true;
  }
}

// 窗口控制移出事件
function onMouseleaveControlWindow() {
  console.log('移出');
  if (isFullScreen.value) {
    isHoverFullScreen.value = false;
  } else {
    isHoverMiniScreen.value = false;
  }
}

// 控制全屏
function changeFullScreen() {
  isFullScreen.value = !isFullScreen.value;
}

const bodyId = ref('chatGroupBody' + new Date().getTime() + Math.random() * 1000);

useChatGroupDom({ show: propShow, bodyId: bodyId.value });

const imStore = useImStore();

const { socketStore, userStore, eventStore, groupStore } = useStore();
const desktopStore = useDesktopStore();

// 本地当前桌面状态（独立于 desktopStore，避免影响桌面）
// 使用与 desktopStore 相同的类型（从 desktopStore 获取的实际类型）
const localCurrentDesktop = ref<Required<Eps.DesktopEntity> | null>(null);
// 本地群组列表状态（独立于 groupStore，避免影响桌面）
const localGroupList = ref<Eps.FriendEntity[]>([]);
// 本地群成员映射（独立于 groupStore）
const localGroupMemberMap = ref<Record<number, Eps.GroupMemberEntity[]>>({});
// 是否为好友模式
const isFriendMode = ref(false);
// 本地好友列表
const localFriendList = ref<Eps.FriendEntity[]>([]);

// 从 groupStore 获取 groupMemberMap 的引用
const { groupMemberMap } = storeToRefs(groupStore);

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
  console.log('getHTMLFromTipJson', content);
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
  openGroupIds,
  uploadFilePanelShow,
  activeIndex: activeGroupIndex,
  friendList: groupList,
  messageHistory,
  chatInputHistory,
} = storeToRefs(imStore);
const activeMenus = ref(['groups']);

const messageList = computed(() => {
  if (activeChatTarget.value) {
    const list = messageHistory.value[activeChatTarget.value.friendId] || [];
    console.log('最开始的list', toRaw(list));
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
    console.log('聊天数组', list);
    return list;
  } else {
    return [];
  }
});

// 显示数组
const showInputList = ref<any[]>([]);
// 隐藏数组
const hideInputList = ref<any[]>([]);

// 上传数组
const uploadList = ref<any[]>([]);

function setShowInputList(list) {
  showInputList.value = list;
}
function setHideInputList(list) {
  hideInputList.value = list;
}

function setUploadList(list) {
  console.log('来设置uploadList的值', list);
  uploadList.value = list;
}

function clickMoreItem(item) {
  console.log('点击了more里面的item', item);
  hideInputList.value = hideInputList.value.filter((i) => i.key !== item.key);
  if (item.type !== 'String') {
    // updateChatImgInputUploadCptInfo({ field: item.key, value: '', fileType: item.type.toLowerCase() }, 'add');\
    uploadList.value = uploadList.value.concat([item]);
  }
  showInputList.value = showInputList.value.concat([item]);
}
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
  console.log('更新图片组件', field);
  if (type === 'add') {
    chatImgInputUploadCptInfo.value.push({ field, value, fileType: fileType });
  } else {
    chatImgInputUploadCptInfo.value = chatImgInputUploadCptInfo.value.filter((item) => item.field !== field);
    if (chatImgInputUploadCptInfo.value.length) {
    }
  }
}

// watch(
//   () => chatImgInputUploadCptInfo,
//   (newVal, oldVal) => {
//     console.log('数组变化:', newVal);
//     const obj = {};
//     newVal.value.forEach((i, index) => {
//       const name = i.field;
//       obj[name] = i.value;
//     });
//     showInputList.value = showInputList.value.map((i) => ({
//       ...i,
//       value: obj[i.key] || i.value,
//     }));
//     formData.value = {
//       ...formData.value,
//       ...obj,
//     };
//   },
//   { deep: true },
// );
const targetElement = ref(null);
const isListening = ref(false);

const addListener = () => {
  if (targetElement.value && !isListening.value) {
    setTimeout(() => {
      targetElement.value.addEventListener('keydown', handleKeyDown);
      targetElement.value.setAttribute('tabindex', '0'); // 使元素可聚焦
      isListening.value = true;
      console.log('已添加回车键监听');
    }, 1000);
  }
};

const removeListener = () => {
  if (targetElement.value && isListening.value) {
    targetElement.value.removeEventListener('keydown', handleKeyDown);
    isListening.value = false;
    console.log('已移除回车键监听');
  }
};
watch(
  uploadFilePanelShow,
  (newVal) => {
    console.log('面板值', newVal);
    if (newVal) {
      addListener();
    } else {
      removeListener();
    }
  },
  { deep: true },
);
watch(
  () => uploadList,
  (newVal, oldVal) => {
    console.log('uploadList数组变化:', newVal);
    const obj = {};
    newVal.value.forEach((i, index) => {
      obj[i.key] = i.value;
    });
    showInputList.value = showInputList.value.map((i) => ({
      ...i,
      value: obj[i.key] || i.value,
    }));
    formData.value = {
      ...formData.value,
      ...obj,
    };
  },
  { deep: true },
);

watch(
  () => formData,
  (newVal, oldVal) => {
    console.log('表单数据变化', newVal);
    // 对数组进行赋值
    showInputList.value = showInputList.value.map((i) => ({
      ...i,
      value: newVal.value[i.key],
    }));
  },
  { deep: true },
);

// 监听 showInputList 变化，自动聚焦第一个可用的输入框
watch(
  () => showInputList.value,
  async (newVal, oldVal) => {
    // 当输入框列表从空变为有值，或者新增了输入框时
    if (newVal.length > 0 && newVal.length !== oldVal?.length) {
      await nextTick();
      // 找到第一个 type === 'String' 的输入框（可输入的）
      const firstStringInput = newVal.find((item) => item.type === 'String');
      if (firstStringInput && myFormRef.value) {
        // 通过遍历 showInputList 找到第一个 String 类型的索引
        let stringInputIndex = -1;
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i].type === 'String') {
            stringInputIndex = i;
            break;
          }
        }

        if (stringInputIndex >= 0) {
          // 找到对应的 el-form-item 元素
          const formItems = myFormRef.value.$el?.querySelectorAll('.el-form-item');
          if (formItems && formItems[stringInputIndex]) {
            const inputElement = formItems[stringInputIndex].querySelector('input');
            if (inputElement) {
              inputElement.focus();
              inputElement.select();
            }
          }
        }
      }
    }
  },
  { immediate: false },
);

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
const filteredMembers = ref<Eps.GroupMemberEntity[]>([]);

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
  // 根据是否为好友模式决定 toType：好友聊天为 0，群组聊天为 1
  const toType = isFriendMode.value ? 0 : activeChatTarget.value!.type || 1;
  return {
    // 临时id todo 看看接口能否改成string
    id: parseInt(uid!) || activeChatTarget.value!.id! + new Date().getTime() + Math.random() * 100000,
    fromId: fromId || userStore.info?.id,
    toId: toId || activeChatTarget.value!.friendId!,
    content,
    // 0 文本消息
    type: type || 0,
    at: chatInputHistory.value.get(activeChatTarget.value!.id)?.atMentions.map((mention) => mention.userId) || [],
    toType: toType,
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
    const commandList = [];
    const contentText = [];
    showInputList.value.forEach((i) => {
      commandList.push(i.name);
      contentText.push(i.value);
    });
    const commandNameList = showInputList.value.map((i) => i.name);
    const newMsg = {
      ...message,
      extraInfo: {
        mentionAvatar: curMentionMember?.value?.avatar,
        mentionName: curMentionMember?.value?.name,
        mentionCommand: commandNameList.join(','),
        commandTextStr: contentText.join('\n\r'),
        username: userStore?.info?.nickName,
        userAvatar: userStore?.info?.avatar,
      },
    };
    if (sendType === 'local') {
      socketStore.sendMessageToLocal(newMsg);
    } else if (sendType === 'server') {
      socketStore.sendMessageToServer(newMsg);
    } else {
      console.log('发本地+服务器之前的参数', newMsg);
      // const newMsg = {
      //   ...message,
      //   extraInfo: {
      //     a: 1,
      //     b: 2,
      //     c: 3,
      //   },
      // };
      socketStore.sendMessage(newMsg);
    }
    console.log(newMsg);
    // showInputList.value = [];
    // hideInputList.value = [];
    // 只有是输入框发送消息时，才清空输入框和@提及记录
    if (!msg) {
      imStore.updateInputHistoryContent(activeChatTarget.value!.id, '');
      imStore.updateInputHistoryMention(activeChatTarget.value!.id, []);
    }
    scrollToBottom();
    return newMsg;
  }
};

// 记录通过快捷键触发的待合并消息信息（key: loadingMessageId, value: 快捷键信息）
const pendingShortcutMessages = ref<
  Map<
    number,
    {
      groupId: number;
      memberId: number;
      shortcutName: string;
      params: Record<string, string | number | boolean>;
      memberName: string;
      memberAvatar: string;
    }
  >
>(new Map());

// 记录链式调用的状态（key: firstMemberId + groupId, value: 链式调用信息）
const pendingChainCalls = ref<
  Map<
    string,
    {
      groupId: number;
      firstMemberId: number;
      secondMemberId: number;
      secondMemberMappings: Record<string, string>;
      shortcutName: string;
      firstMemberName: string;
      firstMemberAvatar: string;
      secondMemberName: string;
      secondMemberAvatar: string;
    }
  >
>(new Map());

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
  shortcutInfo,
}: {
  memberId: number;
  configPackIndex?: number;
  params: Record<string, string | number | boolean>;
  headers?: AxiosRequestConfig['headers'];
  shortcutInfo?: {
    shortcutName: string;
    memberName: string;
    memberAvatar: string;
  };
}) {
  // 工作流类型，直接调用工作流
  const groupId = activeChatTarget.value!.friendId;
  const loadingMessageId = sendLoadingMessage(groupId, memberId);
  debugger;
  // 如果是快捷键触发的，记录快捷键信息，等待回复消息时合并
  if (shortcutInfo) {
    pendingShortcutMessages.value.set(loadingMessageId, {
      groupId,
      memberId,
      shortcutName: shortcutInfo.shortcutName,
      params,
      memberName: shortcutInfo.memberName,
      memberAvatar: shortcutInfo.memberAvatar,
    });
  }
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
      console.log('工作流返回的', res);
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
      // 如果出错，清除待合并的快捷键信息
      pendingShortcutMessages.value.delete(loadingMessageId);
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

// 是否显示错误信息
const showFormError = ref(false);
async function onSubmit() {
  let valid = true;
  if (!myFormRef.value) {
    valid = false;
    return { valid };
  }

  // 检查 curMentionMember 是否存在
  if (!curMentionMember.value) {
    console.warn('curMentionMember is null, cannot submit');
    showFormError.value = true;
    return { valid: false };
  }

  await myFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!');
      const contentList = showInputList.value.map((i) => {
        return {
          type: i.type === 'String' ? 'chatFlexibleInput' : 'chatFileInput',
          attrs: {
            field: i.name,
            fileType: i.type.toLowerCase(),
            maxWidth: 200,
            placeholder: 'Please attach a file',
            readonly: true,
            valid: true,
            param: i,
            type: 'chatFormInputItem',
            value: i.value,
          },
        };
      });
      // 组装要发送的值
      const sendMsg = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mention',
                attrs: {
                  ...curMentionMember.value,
                  id: curMentionMember.value.userId,
                  mentionSuggestionChar: '@',
                  label: curMentionMember.value.name,
                  params: curMentionMember.value.config?.params || [],
                  timerFormData: null,
                },
              },
            ].concat(contentList),
          },
        ],
      };
      console.log('组装的值', sendMsg);
      handleSendMessageOnEnter(sendMsg);
      showFormError.value = false;
      valid = true;
    } else {
      console.log('error submit!', fields);
      showFormError.value = true;
      valid = false;
    }
  });
  return {
    valid,
  };
  // showFormError.value = !val;
}

function handleSendMessageOnEnter(val: string | JSONContent) {
  console.log('handleSendMessageOnEnter', val);
  imStore.updateInputHistoryContent(activeChatTarget.value!.id, val);
  if (typeof val !== 'string') {
    // 调用工作流
    const rootContents = val.content;
    rootContents?.forEach(async (rootContent) => {
      if (rootContent.content) {
        // 目前节点只有两层，以后如果发现是无限嵌套，改成递归
        for (let i = 0; i < rootContent.content.length; i++) {
          // debugger;
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
            if (node.attrs?.type === 7001) {
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
  console.log('清空');
  chatEditorRef?.value?.cleanEditor();
  resetListData();
}

const resetListData = () => {
  setUploadList([]);
  setShowInputList([]);
  setHideInputList([]);
  // uploadList.value = uploadList.value.map((i) => ({ ...i, value: '' }));
  // showInputList.value = showInputList.value.map((i) => ({ ...i, value: '' }));
  formData.value = {};
  if (curMentionMember.value?.config?.params) {
    curMentionMember.value.config.params.forEach((i) => {
      i.value = '';
    });
  }
  // 清除所有 editableRefs 的内容
  Object.keys(editableRefs.value).forEach((key) => {
    const element = editableRefs.value[key];
    if (element) {
      element.textContent = '';
      adjustEditableSize(key);
    }
  });
};

// 判断是否为图片 URL
function isImageUrl(url: string): boolean {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();

  // 移除查询参数和锚点，只检查路径部分
  const urlWithoutQuery = lowerUrl.split('?')[0].split('#')[0];

  // 检查是否以图片扩展名结尾
  return imageExtensions.some((ext) => urlWithoutQuery.endsWith(ext));
}

// 判断是否为视频 URL
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext)) || lowerUrl.includes('video');
}

// 判断是否为音频 URL
function isAudioUrl(url: string): boolean {
  if (!url) return false;
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'];
  const lowerUrl = url.toLowerCase();
  return audioExtensions.some((ext) => lowerUrl.includes(ext)) || lowerUrl.includes('audio');
}

// 点击 Prompt，填充到输入框
function handlePromptClick(prompt: { prompt: string }) {
  if (!prompt.prompt) {
    ElMessage.warning('Prompt content is empty');
    return;
  }

  // 找到第一个 String 类型的输入框
  const firstStringInput = showInputList.value.find((item) => item.type === 'String');
  if (firstStringInput) {
    // 填充到第一个 String 输入框
    formData.value[firstStringInput.key] = prompt.prompt;
  } else {
    ElMessage.warning('No text input field available');
  }
}

// 确认选择 Prompt
function handleConfirmPrompt() {
  if (!selectedPromptId.value) {
    ElMessage.warning('Please select a prompt');
    return;
  }

  const selectedPrompt = promptsList.value.find((p) => p.id === selectedPromptId.value);
  if (selectedPrompt) {
    // 将 Prompt 的值填充到输入框
    handlePromptClick(selectedPrompt);
    // 关闭面板
    showPromptsPanel.value = false;
    // 清空选择
    selectedPromptId.value = undefined;
  }
}

// 播放媒体（视频/音频预览功能，如果需要的话可以后续实现）
function handlePlayMedia(url: string, type: 'video' | 'audio') {
  // 这里可以添加媒体预览功能，暂时先不实现
  console.log('Play media:', url, type);
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

const isShow = ref(false);

// 获取群组列表（根据当前桌面的 member 获取对应的群组）
async function fetchGroupList() {
  try {
    let data: Eps.FriendEntity[] = [];

    // 如果有当前桌面
    if (localCurrentDesktop.value) {
      // 如果桌面有群组ID列表，则获取对应群组
      if (localCurrentDesktop.value.member && localCurrentDesktop.value.member.length > 0) {
        data = (await service.base.group.list({
          ids: localCurrentDesktop.value.member,
        })) as Eps.FriendEntity[];
      }
      // 如果桌面没有群组（member 为空或不存在），data 保持为空数组，清空显示
    } else {
      // 如果没有桌面，获取所有群组
      data = (await service.base.group.list({ userId: userStore.info?.id })) as Eps.FriendEntity[];
    }

    localGroupList.value = data;
  } catch (error) {
    console.error('获取群组列表失败:', error);
    // 出错时也清空列表
    localGroupList.value = [];
  }
}

// 设置当前桌面（由 left-panel 调用）
async function setCurrentDesktop(desktop: Required<Eps.DesktopEntity>) {
  // 切换到群组模式
  isFriendMode.value = false;
  localCurrentDesktop.value = desktop;
  // 保存桌面状态
  sessionStorage.setItem('aiBox_lastDesktopId', String(desktop.id));

  // 先清理编辑器引用，避免访问已销毁的组件
  if (chatEditorRef.value) {
    try {
      chatEditorRef.value.cleanEditor?.();
    } catch (e) {
      // 忽略清理错误，组件可能正在销毁
      console.warn('Error cleaning editor during desktop switch:', e);
    }
  }

  // 先清空当前的 activeChatTarget，确保消息列表清空
  // activeChatTarget 是通过 storeToRefs 获取的，可以直接使用 .value
  activeChatTarget.value = null;
  activeIds.value = [];
  imStore.setOpenGroupIds([]);

  // 清空输入列表
  setShowInputList([]);
  setHideInputList([]);
  setUploadList([]);
  formData.value = {};
  curMentionMember.value = null;

  // 等待组件完全销毁
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));

  // 切换桌面后，重新获取对应桌面的群组列表
  await fetchGroupList();

  // 等待群组列表更新后，如果有群组，选中第一个群组并获取消息
  await nextTick();
  if (localGroupList.value && localGroupList.value.length > 0) {
    const firstItem = localGroupList.value[0];
    if (firstItem) {
      // 先设置激活的群组
      imStore.setActiveChatTargetGroupById(firstItem.id);
      // 确保成员列表已加载，@ 功能需要成员列表
      await getGroupMemberList(firstItem.id, true);
      // 同时从 groupStore 获取，确保数据同步
      await groupStore.getGroupMember([firstItem.id]);
      // 等待成员列表加载完成后再设置 activeIds
      await nextTick();
      setActiveIds(firstItem, 0);
      // 保存群组状态
      sessionStorage.setItem('aiBox_lastGroupId', String(firstItem.id));
    }
  }
  // 如果没有群组，activeChatTarget 保持为 null，消息列表会自动显示为空
}

// 切换到好友模式
async function switchToFriendMode() {
  isFriendMode.value = true;
  // 清空当前桌面状态
  localCurrentDesktop.value = null;
  // 清空群组列表
  localGroupList.value = [];
  activeIds.value = [];
  imStore.setOpenGroupIds([]);
  // 清空当前聊天目标
  activeChatTarget.value = null;
  // 清空输入列表
  setShowInputList([]);
  setHideInputList([]);
  setUploadList([]);
  formData.value = {};
  curMentionMember.value = null;
  // 清理编辑器
  if (chatEditorRef.value) {
    try {
      chatEditorRef.value.cleanEditor?.();
    } catch (e) {
      console.warn('Error cleaning editor during friend mode switch:', e);
    }
  }
  // 获取好友列表
  await fetchFriendList();
  // 等待好友列表加载完成
  await nextTick();
  // 如果有好友，选中第一个好友并获取消息
  if (localFriendList.value && localFriendList.value.length > 0) {
    const firstFriend = localFriendList.value[0];
    if (firstFriend) {
      await handleFriendClick(firstFriend);
    }
  }
}

// 获取好友列表
async function fetchFriendList() {
  try {
    const data = (await service.base.friend.list({
      userId: userStore.info?.id,
    })) as Eps.FriendEntity[];
    localFriendList.value = data || [];
  } catch (error) {
    console.error('获取好友列表失败:', error);
    localFriendList.value = [];
  }
}

// 点击好友进行聊天
async function handleFriendClick(friend: Eps.FriendEntity) {
  // 设置激活的好友
  // 需要将好友添加到 friendList 中，然后设置激活
  // 好友的 friendId 可能是 friend.friendId 或 friend.id
  const friendId = friend.friendId || friend.id;
  const friendIndex = imStore.friendList.findIndex((f) => f.friendId === friendId || f.id === friendId);
  if (friendIndex !== -1) {
    // 如果好友已在列表中，直接激活
    imStore.setActiveChatTarget(friendIndex);
  } else {
    // 如果好友不在列表中，先添加到列表
    // 确保好友对象有正确的结构，friendId 和 id 都需要设置
    const friendToAdd = {
      ...friend,
      id: friendId,
      friendId: friendId,
      type: 0, // 好友聊天的 type 为 0
      status: friend.status || 1,
    };
    imStore.addFriendByGroup(friendToAdd as any);
    // 然后激活最后一个（刚添加的）
    imStore.setActiveChatTarget(imStore.friendList.length - 1);
  }
  // 等待激活完成
  await nextTick();
  // 获取消息列表
  getMessageList();
}

// 暴露给 left-panel 使用
provide('setCurrentDesktop', setCurrentDesktop);
// 暴露当前桌面状态给 left-panel 使用
provide('localCurrentDesktop', localCurrentDesktop);
// 暴露切换好友模式的方法给 left-panel 使用
provide('switchToFriendMode', switchToFriendMode);
// 暴露好友模式状态给 left-panel 使用
provide('isFriendMode', isFriendMode);

// 保存关闭时的状态
function saveClosedState() {
  if (localCurrentDesktop.value?.id) {
    sessionStorage.setItem('aiBox_lastDesktopId', String(localCurrentDesktop.value.id));
  }
  if (activeChatTarget.value?.id) {
    sessionStorage.setItem('aiBox_lastGroupId', String(activeChatTarget.value.id));
  }
  // 保存展开的群组ID列表（使用 activeIds，因为它是本地状态）
  if (activeIds.value && activeIds.value.length > 0) {
    sessionStorage.setItem('aiBox_lastOpenGroupIds', JSON.stringify(activeIds.value));
  } else {
    // 即使为空数组也保存，以便恢复时知道没有展开的群组
    sessionStorage.setItem('aiBox_lastOpenGroupIds', JSON.stringify([]));
  }
}

// 恢复关闭时的状态
function restoreClosedState() {
  const lastDesktopId = sessionStorage.getItem('aiBox_lastDesktopId');
  const lastGroupId = sessionStorage.getItem('aiBox_lastGroupId');
  const lastOpenGroupIdsStr = sessionStorage.getItem('aiBox_lastOpenGroupIds');
  let lastOpenGroupIds: number[] = [];
  if (lastOpenGroupIdsStr) {
    try {
      lastOpenGroupIds = JSON.parse(lastOpenGroupIdsStr);
    } catch (e) {
      console.error('Failed to parse lastOpenGroupIds', e);
    }
  }
  return { lastDesktopId, lastGroupId, lastOpenGroupIds };
}

async function init() {
  if (localGroupList.value && localGroupList.value.length > 0) {
    // 尝试恢复上次的状态
    const { lastGroupId, lastOpenGroupIds } = restoreClosedState();

    let targetItem = null;
    let targetIndex = 0;

    if (lastGroupId) {
      const foundIndex = localGroupList.value.findIndex((item) => String(item.id) === lastGroupId);
      if (foundIndex !== -1) {
        targetItem = localGroupList.value[foundIndex];
        targetIndex = foundIndex;
      }
    }

    // 如果没有找到上次的群组，使用第一个群组
    if (!targetItem) {
      targetItem = localGroupList.value[0];
      targetIndex = 0;
    }

    if (targetItem && targetItem.id) {
      // 先设置激活的群组
      imStore.setActiveChatTargetGroupById(targetItem.id);
      // 确保成员列表已加载，@ 功能需要成员列表
      await getGroupMemberList(targetItem.id, true);
      // 同时从 groupStore 获取，确保数据同步
      await groupStore.getGroupMember([targetItem.id]);
      // 等待成员列表加载完成
      await nextTick();
      // 只展开选中的群组（每次只能展开一个）
      activeIds.value = [targetItem.id];
      imStore.setOpenGroupIds(activeIds.value);
      await nextTick();
      // 设置激活的群组
      toggleGroup(targetItem, targetIndex);
    }
  }
}

const handleEnterKey = throttle(async () => {
  // console.log('uploadFilePanelShow999', uploadFilePanelShow.value);
  const { valid } = await onSubmit();
  console.log('valid111', valid);
  if (valid) {
    imStore.setUploadFilePanelShow(false);
  }
}, 1000);

const handleUpArrow = () => {
  console.log('向上按键');
};

const handleDownArrow = () => {
  console.log('向下按键');
};

const handleKeyDown = (event) => {
  // 处理按键逻辑
  console.log('event', event);
  // 阻止默认行为（如表单提交、页面滚动等）
  // event.preventDefault(); // 按需取消注释

  switch (event.key) {
    case 'Enter':
      handleEnterKey(event);
      break;
    // case 'ArrowUp':
    //   handleUpArrow(event);
    //   break;
    // case 'ArrowDown':
    //   handleDownArrow(event);
    //   break;
    default:
      // 其他按键不做处理
      break;
  }
};

// 处理服务端返回的新消息，用于将快捷键信息合并到回复消息中
function handleNewServerMessage(payload: unknown) {
  const message = payload as Required<Eps.BaseMessageEntity>;
  // 只处理当前激活群组的消息
  if (!activeChatTarget.value || message.toId !== activeChatTarget.value.friendId) {
    return;
  }

  // 检查是否是链式调用的第一个 member 的消息
  const chainKey = `${message.fromId}_${message.toId}`;
  const chainCall = pendingChainCalls.value.get(chainKey);

  if (chainCall) {
    // 这是链式调用的第一个 member 的消息
    // 需要从消息中提取输出参数，然后调用第二个 member
    try {
      // 尝试从消息中提取输出参数
      // 工作流消息（type 12）的 content 结构: { code: number, data: TWorkflowMsgItem[], msg: string }
      // 输出参数可能不在消息中，需要从 runWorkflow 接口的返回值中获取
      // 但是，由于 runWorkflow 接口不会返回消息信息，我们需要从 member 的配置中获取输出参数
      // 然后从消息中提取对应的值

      // 找到第一个 member
      const firstMember = curMemberList.value.find((m) => m.userId === chainCall.firstMemberId);
      if (!firstMember) {
        console.error('First member not found for chain call');
        pendingChainCalls.value.delete(chainKey);
        return;
      }
      debugger;
      // 获取第一个 member 的输出参数配置
      const outputParams = firstMember.config.outputParams as TMembersConfigParam[];

      // 从消息中提取输出参数值
      // 如果消息是工作流消息（type 12），尝试从 content.data 中提取
      // 否则，可能需要从其他地方获取
      let firstMemberOutputs: Array<{ name: string; content: unknown }> = [];

      // 检查是否是工作流消息（type 12 或 type 14，或者其他类型，只要 content 有 code 字段）
      if (message.content && typeof message.content === 'object' && 'code' in message.content) {
        // 工作流消息，尝试从 content 中提取输出参数
        const contents = message.content.data[0];

        // 如果 content 中有 outputParams 字段，直接使用
        if (contents?.length > 0) {
          firstMemberOutputs = contents;
        } else {
          // 如果没有 outputParams，尝试从 runWorkflow 接口的返回值中获取
          // 但 runWorkflow 接口不会返回消息信息，所以需要其他方式
          // 或者尝试从 content.data 中提取（如果 data 包含输出参数）
          console.warn('Output parameters not found in message content.outputParams, message type:', message.type);
          console.log('Message content structure:', contents);
        }
      }

      // 如果无法从消息中提取输出参数，尝试调用 runWorkflow 接口获取
      // 但是，由于 runWorkflow 接口不会返回消息信息，我们需要使用其他方式
      // 暂时先尝试从消息中提取，如果失败，则记录错误
      if (firstMemberOutputs.length === 0) {
        console.warn('Could not extract output parameters from message, chain call may fail');
        // 清除链式调用状态
        pendingChainCalls.value.delete(chainKey);
        return;
      }

      // 根据 secondMemberMappings 映射参数
      // secondMemberMappings 格式: {input: "output"}，即第二个member的输入参数名 -> 第一个member的输出参数名
      const secondMemberParams: Record<string, string | number | boolean> = {};
      Object.entries(chainCall.secondMemberMappings).forEach(([inputParamName, outputParamName]) => {
        // 从第一个member的输出中获取对应的值
        const output = firstMemberOutputs.find((item) => item.name === outputParamName);
        debugger;
        if (output?.content) {
          secondMemberParams[inputParamName] = output.content;
        } else {
          console.warn(`Parameter not found in first member output: ${outputParamName}`);
        }
      });

      console.log('Second member input parameters', secondMemberParams);

      // 调用第二个member的工作流
      const secondLoadingMessageId = sendLoadingMessage(chainCall.groupId, chainCall.secondMemberId);

      // 记录第二个member的快捷键信息
      pendingShortcutMessages.value.set(secondLoadingMessageId, {
        groupId: chainCall.groupId,
        memberId: chainCall.secondMemberId,
        shortcutName: chainCall.shortcutName,
        params: secondMemberParams,
        memberName: chainCall.secondMemberName,
        memberAvatar: chainCall.secondMemberAvatar,
      });

      // 调用第二个member的工作流
      const paramsJson = JSON.stringify(secondMemberParams);
      const paramsBase64 = base64Encode(paramsJson);
      service.base.message
        .runWorkflow({
          groupId: chainCall.groupId,
          memberId: chainCall.secondMemberId,
          params: paramsBase64,
        })
        .catch((error) => {
          console.error('Second member workflow call failed', error);
          // 清除loading状态
          imStore.delLoadingTarget({ groupId: chainCall.groupId, memberId: chainCall.secondMemberId });
          // 清除快捷键信息
          pendingShortcutMessages.value.delete(secondLoadingMessageId);
          ElMessage.error('Second member workflow call failed');
        });

      // 清除链式调用状态
      pendingChainCalls.value.delete(chainKey);
    } catch (error) {
      console.error('Failed to process chain call', error);
      // 清除链式调用状态
      pendingChainCalls.value.delete(chainKey);
      ElMessage.error('Failed to process chain call');
    }
  }

  // 查找是否有对应的待合并快捷键上下文
  // 通过 groupId + memberId 匹配，找到对应的快捷键信息
  const shortcutInfo = Array.from(pendingShortcutMessages.value.values()).find(
    (ctx) => ctx.groupId === message.toId && ctx.memberId === message.fromId,
  );

  if (shortcutInfo) {
    // 找到对应的快捷键信息，合并到 extraInfo 中
    const paramsText = Object.entries(shortcutInfo.params)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join('\n');

    // 更新消息历史中的消息对象的 extraInfo
    // 需要在消息历史中找到对应的消息并更新
    const groupId = String(message.toId);
    const messageList = imStore.getMessageHistoryById(groupId, message.toType);
    const messageIndex = messageList.findIndex((msg) => msg.id === message.id);

    if (messageIndex !== -1) {
      // 更新消息历史中的消息对象
      messageList[messageIndex].extraInfo = {
        ...(messageList[messageIndex].extraInfo || {}),
        username: userStore.info?.nickName,
        userAvatar: userStore.info?.avatar,
        mentionName: shortcutInfo.memberName,
        mentionAvatar: shortcutInfo.memberAvatar,
        mentionCommand: shortcutInfo.shortcutName,
        commandTextStr: paramsText,
      };

      // 触发响应式更新
      imStore.updateMessageHistoryById(groupId, [...messageList]);
    }

    // 清除已处理的快捷键信息
    // 需要找到对应的 loadingMessageId 来删除
    for (const [loadingMessageId, ctx] of pendingShortcutMessages.value.entries()) {
      if (ctx.groupId === shortcutInfo.groupId && ctx.memberId === shortcutInfo.memberId) {
        pendingShortcutMessages.value.delete(loadingMessageId);
        break;
      }
    }
  }
}

onMounted(() => {
  eventStore.on('newMessage', scrollToBottom);
  eventStore.on('newMessage', handleNewServerMessage);
  // window.addEventListener('keydown', handleKeyDown);
  // init() 现在在 watch props.show 中调用
});

onUnmounted(() => {
  eventStore.off('newMessage', scrollToBottom);
  eventStore.off('newMessage', handleNewServerMessage);
  // window.removeEventListener('keydown', handleKeyDown);
});

function getMessageList() {
  if (activeChatTarget.value) {
    // 可以直接判断messageList，但是那样本函数就会在messageList执行完后才执行，没必要
    if (!messageHistory.value[activeChatTarget.value.friendId]?.length) {
      // 根据是否为好友模式决定 toType：好友聊天为 0，群组聊天为 1
      const toType = isFriendMode.value ? 0 : 1;
      imStore.refreshMessageHistoryItem(String(activeChatTarget.value.friendId), toType).then(() => {
        scrollToBottom();
      });
    } else {
      scrollToBottom();
    }
  }
}

// 当前聊天窗口的群成员列表（使用本地状态，排除当前用户）
const curMemberList = computed(() => {
  const members = localGroupMemberMap.value[activeChatTarget.value?.friendId] || [];
  console.log('ai-box curMemberList - activeChatTarget.value?.friendId:', activeChatTarget.value?.friendId);
  console.log('ai-box curMemberList - localGroupMemberMap.value:', localGroupMemberMap.value);
  console.log('ai-box curMemberList - members:', members);
  // 排除当前用户，与 ChatEditor 中的逻辑保持一致
  const filtered = members.filter((member) => member.userId !== userStore.info?.id);
  console.log('ai-box curMemberList - filtered:', filtered);
  return filtered;
});

// 监听 groupStore 中的 groupMemberMap 变化，同步更新 localGroupMemberMap
// 注意：这个 watch 必须放在 activeChatTarget 定义之后
watch(
  () => groupMemberMap.value,
  (newMap) => {
    // 当 groupStore 中的成员列表更新时，同步更新本地映射
    // 只更新当前激活的群组，避免不必要的更新
    if (activeChatTarget.value?.friendId) {
      const groupId = activeChatTarget.value.friendId;
      if (newMap[groupId] && newMap[groupId].length > 0) {
        // 使用深拷贝确保响应式更新，并强制触发 Vue 的响应式系统
        localGroupMemberMap.value[groupId] = JSON.parse(JSON.stringify(newMap[groupId]));
      }
    } else {
      // 如果没有激活的群组，更新所有群组
      Object.keys(newMap).forEach((groupId) => {
        const groupIdNum = Number(groupId);
        if (newMap[groupIdNum] && newMap[groupIdNum].length > 0) {
          localGroupMemberMap.value[groupIdNum] = JSON.parse(JSON.stringify(newMap[groupIdNum]));
        }
      });
    }
  },
  { deep: true, immediate: true },
);

// 同时监听 activeChatTarget 的变化，当切换群组时也同步更新成员列表
watch(
  () => activeChatTarget.value?.friendId,
  (groupId) => {
    if (groupId && groupMemberMap.value[groupId]) {
      // 切换群组时，同步更新当前群组的成员列表
      localGroupMemberMap.value[groupId] = JSON.parse(JSON.stringify(groupMemberMap.value[groupId]));
    }
  },
  { immediate: true },
);

const curMemberMap = computed(() => {
  return curMemberList.value.reduce(
    (acc, member) => {
      acc[member.userId] = member;
      return acc;
    },
    {} as Record<number, Eps.GroupMemberEntity>,
  );
});

// 根据消息的 fromId 获取对应成员的最新快捷键列表
// 这样即使历史消息中的成员数据是旧的，也能获取到最新的快捷键
function getShortcutCommandsByFromId(fromId?: number): unknown[] {
  if (!fromId) {
    return [];
  }

  // 从当前最新的成员列表中查找对应的成员
  const member = curMemberList.value.find((m) => m.userId === fromId);
  if (member && member.shortcutCommands?.list) {
    return member.shortcutCommands.list;
  }

  return [];
}

provide('curMemberList', curMemberList);

const memberList = ref<any>([]);
/**
 * 获取群成员列表（使用本地状态）
 */
async function getGroupMemberList(groupId: number, forceRefresh = false): Promise<void> {
  // 如果已有数据且不是强制刷新，则不重新获取
  if (localGroupMemberMap.value[groupId] && !forceRefresh) {
    return Promise.resolve();
  }
  return service.base.groupMember
    .memberList({ groupIds: [groupId], pageSize: import.meta.env.VITE_MAX_GROUP_NUMBER * 1, page: 1 })
    .then((groupMemberList) => {
      if (groupMemberList?.[0]?.members) {
        localGroupMemberMap.value[groupId] = groupMemberList[0].members;
      }
    });
}

function getMemberList(groupId: number) {
  const list = localGroupMemberMap.value[groupId!];
  memberList.value = list || [];
  const result = list ? list.filter((i) => i.userId !== userStore.info.id) : [];
  return result;
}

const toggleGroup = async (gp: Eps.FriendEntity, index: number) => {
  // 设置激活的群组
  // imStore.setActiveChatTarget(index);
  imStore.setActiveChatTargetGroupById(gp.id);
  // 保存群组状态
  sessionStorage.setItem('aiBox_lastGroupId', String(gp.id));
  // imStore.setActiveGroup(0);
  getMessageList();
  // getGroupMemberList(gp.friendId!);
  // 确保成员列表已加载，@ 功能需要成员列表
  await getGroupMemberList(gp.id!, true);
  // 同时从 groupStore 获取，确保数据同步
  if (gp.id) {
    await groupStore.getGroupMember([gp.id]);
  }
};

watch(
  () => props.show,
  async (val) => {
    if (val) {
      // 每次打开弹窗时，先获取桌面列表并设置当前桌面
      await desktopStore.getDesktopList();

      // 尝试恢复上次的桌面状态
      const { lastDesktopId } = restoreClosedState();
      let targetDesktop = null;

      if (desktopStore.desktopList?.length > 0) {
        // 优先使用上次保存的桌面
        if (lastDesktopId) {
          targetDesktop = desktopStore.desktopList.find((item) => String(item.id) === lastDesktopId);
        }

        // 如果上次的桌面不存在，尝试使用默认桌面
        if (!targetDesktop && desktopStore.defaultDesktop) {
          targetDesktop = desktopStore.desktopList.find((item) => item.id === desktopStore.defaultDesktop?.id);
        }

        // 如果还是没有，使用第一个桌面
        if (!targetDesktop) {
          targetDesktop = desktopStore.desktopList[0];
        }

        localCurrentDesktop.value = targetDesktop;
      }

      // 获取对应桌面的群组列表
      await fetchGroupList();
      await nextTick();
      // 初始化选中群组（会尝试恢复上次的群组）
      await init();
      // 等待群组设置完成
      await nextTick();
      getMessageList();
      if (activeChatTarget.value) {
        // 确保成员列表已加载，@ 功能需要成员列表
        await getGroupMemberList(activeChatTarget.value.friendId!, true);
        // 打开弹窗时，刷新当前群组的成员列表，确保获取最新的快捷键数据
        await groupStore.getGroupMember([activeChatTarget.value.friendId]);
      }
    } else {
      // 关闭弹窗时保存当前状态
      saveClosedState();
      // 关闭弹窗时清空本地数据，确保下次打开时获取最新数据
      localGroupList.value = [];
      localGroupMemberMap.value = {};
      localCurrentDesktop.value = null;
      // 重置好友模式
      isFriendMode.value = false;
      localFriendList.value = [];
    }
  },
);

//---------------------------------------------群组 end-------------------------------

//---------------------------------------------群成员浮动 start-------------------------------

const { isShowGroupMembers, toggleGroupMembers } = useChatGroupMembersList();

//---------------------------------------------群成员浮动 end-------------------------------
// 处理选择成员
function handleSelectMember(member: Eps.GroupMemberEntity) {
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

// 处理快捷键点击
function handleShortcutClick(shortcut: {
  name: string;
  type: string;
  userId?: number;
  firstMemberId: number;
  secondMemberId?: number | null;
  firstMemberParams: Record<string, string | number | boolean>;
  secondMemberMappings?: Record<string, string>;
}) {
  // 处理 sendFixedMessage 类型
  if (shortcut.type === 'sendFixedMessage') {
    // 根据 firstMemberId 找到对应的 member（firstMemberId 对应的是 memberList 中的 id，不是 userId）
    const member = curMemberList.value.find((m) => m.id === shortcut.firstMemberId);
    if (!member) {
      ElMessage.error('Member not found');
      return;
    }

    // 组装参数对象，用于调用工作流
    const runWorkflowParams: Record<string, string | number | boolean> = {};
    Object.entries(shortcut.firstMemberParams).forEach(([paramName, paramValue]) => {
      runWorkflowParams[paramName] = paramValue;
    });

    // 直接调用工作流，不创建"发送"消息
    // 等待后台返回回复消息后，会将快捷键信息合并到 extraInfo 中
    runWorkflow({
      memberId: member.userId,
      params: runWorkflowParams,
      shortcutInfo: {
        shortcutName: shortcut.name || '',
        memberName: member.name || '',
        memberAvatar: member.avatar || '',
      },
    });
  }
  // 处理 sendFixedMessageWithChain 类型
  else if (shortcut.type === 'sendFixedMessageWithChain') {
    // 根据 firstMemberId 找到第一个 member
    const firstMember = curMemberList.value.find((m) => m.id === shortcut.firstMemberId);
    if (!firstMember) {
      ElMessage.error('First member not found');
      return;
    }

    // 根据 secondMemberId 找到第二个 member
    if (!shortcut.secondMemberId) {
      ElMessage.error('Second member not configured');
      return;
    }
    const secondMember = curMemberList.value.find((m) => m.id === shortcut.secondMemberId);
    if (!secondMember) {
      ElMessage.error('Second member not found');
      return;
    }

    // 检查 secondMemberMappings 是否存在
    if (!shortcut.secondMemberMappings || Object.keys(shortcut.secondMemberMappings).length === 0) {
      ElMessage.error('Parameter mapping not configured');
      return;
    }

    // 组装第一个member的参数
    const firstMemberParams: Record<string, string | number | boolean> = {};
    Object.entries(shortcut.firstMemberParams).forEach(([paramName, paramValue]) => {
      firstMemberParams[paramName] = paramValue;
    });

    // 调用第一个member的工作流
    const groupId = activeChatTarget.value!.friendId;
    const firstLoadingMessageId = sendLoadingMessage(groupId, firstMember.userId);

    // 记录第一个member的快捷键信息
    pendingShortcutMessages.value.set(firstLoadingMessageId, {
      groupId,
      memberId: firstMember.userId,
      shortcutName: shortcut.name || '',
      params: firstMemberParams,
      memberName: firstMember.name || '',
      memberAvatar: firstMember.avatar || '',
    });

    // 记录链式调用状态，等待第一个 member 的消息返回后再触发第二个 member
    const chainKey = `${firstMember.userId}_${groupId}`;
    pendingChainCalls.value.set(chainKey, {
      groupId,
      firstMemberId: firstMember.userId,
      secondMemberId: secondMember.userId,
      secondMemberMappings: shortcut.secondMemberMappings,
      shortcutName: shortcut.name || '',
      firstMemberName: firstMember.name || '',
      firstMemberAvatar: firstMember.avatar || '',
      secondMemberName: secondMember.name || '',
      secondMemberAvatar: secondMember.avatar || '',
    });

    // 调用第一个member的工作流（不等待返回结果，等待 WebSocket 消息）
    // 将 params 对象转换为 JSON 字符串，然后进行 base64 编码
    const firstparamsJson = JSON.stringify(firstMemberParams);
    const firstparamsBase64 = base64Encode(firstparamsJson);
    service.base.message
      .runWorkflow({
        groupId,
        memberId: firstMember.userId,
        params: firstparamsBase64,
      })
      .catch((error) => {
        console.error('First member workflow call failed', error);
        // 清除loading状态
        imStore.delLoadingTarget({ groupId, memberId: firstMember.userId });
        // 清除快捷键信息
        pendingShortcutMessages.value.delete(firstLoadingMessageId);
        // 清除链式调用状态
        pendingChainCalls.value.delete(chainKey);
        ElMessage.error('First member workflow call failed');
      });
  }
}
</script>

<style lang="scss" scoped>
@import './css/aiBox.scss';
</style>
