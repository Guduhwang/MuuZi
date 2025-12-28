<template>
  <div class="share-member-page" :class="{ 'is-mobile': isMobile }">
    <div class="share-member-container">
      <!-- 聊天区域头部 -->
      <div class="chat-area-header">
        <div class="title">{{ memberInfo?.name || 'Member' }}</div>
        <div v-if="loading" class="loading-indicator">Loading...</div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-area-content" ref="chatContentRef" :style="chatBackgroundStyle">
        <div v-if="loading && messageList.length === 0" class="loading-wrap">
          <div class="loading-text">Loading member information...</div>
        </div>
        <div v-else-if="error" class="error-wrap">
          <div class="error-text">{{ error }}</div>
        </div>
        <div v-else class="message-list">
          <div v-for="(message, index) in messageList" :key="index" class="chat-msg-item-wrap">
            <div class="chat-msg-item" :class="{ 'is-user': message.isUser }">
              <div class="chat-msg-item-person-2">
                <div class="line"></div>
                <div class="chat-msg-item-person-avatar-wrap">
                  <img v-if="message.isUser" alt="" src="/images/ai-box/ava.png" class="chat-msg-item-person-avatar" />
                  <img v-else-if="memberInfo?.avatar" class="chat-msg-item-person-avatar" :src="memberInfo.avatar" />
                  <div v-else class="chat-msg-item-person-avatar default-avatar">
                    {{ memberInfo?.name?.[0] || 'M' }}
                  </div>
                </div>
              </div>
              <div class="chat-msg-item-cnt-wrap">
                <template v-if="message.isUser">
                  <div class="quote-info">
                    <div class="quote-avatar">
                      <img alt="" :src="memberInfo?.avatar" class="" />
                    </div>
                    <span class="quote-username">{{ memberInfo?.name }}</span>
                    <span class="quote-text">Used</span>
                    <span class="quote-ml" v-if="message.inputTypes">{{ message.inputTypes }}</span>
                    <span class="quote-ml" v-else>Command</span>
                  </div>
                  <!-- <div class="quote-info">
                    <span class="quote-username" v-if="item?.extraInfo?.username">{{ item?.extraInfo?.username }}</span>
                    <span class="quote-text"
                      >{{ item?.extraInfo?.commandTextStr }}
                      <span class="quote-name" v-if="item?.extraInfo?.mentionName"
                        >@ {{ item?.extraInfo?.mentionName }}</span
                      >
                      (fast)</span
                    > -->
                  <!-- <span class="quote-from">-Variations(region) by</span> -->
                  <!-- </div> -->
                </template>
                <div class="msg-info">
                  <div class="platform">
                    <img alt="" src="/svg/check.svg" class="icon-platform-readed" />
                    <div>Web</div>
                  </div>
                  <div class="username2">@{{ message.isUser ? memberInfo?.name : 'User' }}</div>

                  <div class="time" v-if="message.createTime">{{ formatRelativeTime(message.createTime) }}</div>
                </div>
                <div class="chat-msg-item-cnt-2" v-if="!message.isLoading && !message.isGuide">
                  <template v-for="(part, partIndex) in parseMessageContent(message.content)" :key="partIndex">
                    <el-image
                      v-if="part.type === 'image'"
                      :src="part.content"
                      fit="contain"
                      class="message-image"
                      :preview-src-list="getImagePreviewList(message.content)"
                      preview-teleported
                    />
                    <div v-else-if="part.type === 'text' && part.content.trim()" class="message-text-wrapper">
                      <div
                        class="message-text"
                        :class="{ 'is-user': message.isUser }"
                        v-html="formatMessage(part.content)"
                      ></div>
                    </div>
                  </template>
                </div>
                <div v-if="message.isGuide" class="guide-card-item" @click="handleGuideClick(message)">
                  <div class="guide-card-cover">
                    <img v-if="message.guideCover" :src="message.guideCover" />
                    <div v-else class="guide-card-placeholder">Guide</div>
                  </div>
                  <div class="guide-card-info">
                    <div class="guide-card-title">{{ message.guideTitle || 'Guide' }}</div>
                  </div>
                </div>
                <div class="chat-msg-item-cnt-2 2" v-if="message.isLoading">
                  <div class="chatGroup-loading-container">
                    <div class="chatGroup-loading-dot"></div>
                    <div class="chatGroup-loading-dot"></div>
                    <div class="chatGroup-loading-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-wrap-2" v-if="!loading && !error">
        <!-- 底部上传面板 -->
        <div class="bottom-image-upload" v-show="uploadFilePanelShow" ref="targetElement">
          <div class="header">
            <div class="header-left">
              <div class="current-name">{{ showInputList?.[0]?.name }}</div>
              <div>First {{ showInputList?.[0]?.type }} to add to the command</div>
            </div>
            <!-- Prompt 按钮 -->
            <div class="prompts-btn-wrap" v-if="promptsList.length > 0">
              <el-button size="small" @click="showPromptsPanel = true">Prompts</el-button>
            </div>
          </div>
          <div class="content" v-if="uploadList.length">
            <ChatFileInputUpload
              v-for="item in uploadList"
              :key="item.key"
              :field="item.key"
              :type="getFileType(item.type)"
              v-model="item.value"
            />
          </div>

          <div class="bottom">
            <div class="bottom-left">
              <img alt="" :src="memberInfo?.avatar" class="icon-avatar" />
            </div>
            <div class="input-list">
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
                      :class="{ 'input-mobile': isMobile }"
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
                      @keydown.ctrl.enter.exact.prevent="handleSendMessage"
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
            <div class="bottom-right">
              <template v-if="hideInputList.length">
                <el-popover
                  :visible="showOptionalPopover"
                  @update:visible="(val: boolean) => (showOptionalPopover = val)"
                  placement="top-start"
                  title=""
                  :hide-after="0"
                  popper-class="pop-box"
                  popper-style="z-index:99999;background:#000;padding:0;border-radius:10px;"
                >
                  <div class="command-pop" @click.stop>
                    <div
                      class="command-pop-item"
                      v-for="(o, oIndex) in hideInputList"
                      :key="oIndex"
                      @click.stop="clickMoreItem(o)"
                    >
                      {{ o.name }}
                    </div>
                  </div>
                  <template #reference>
                    <div class="command-more" @click.stop="showOptionalPopover = !showOptionalPopover">
                      +{{ hideInputList.length }} optional
                    </div>
                  </template>
                </el-popover>
              </template>
              <div class="send-button-wrap">
                <el-button type="primary" @click="handleSendMessage" :disabled="isSending || pollTimer !== null">
                  Send
                </el-button>
              </div>
            </div>
          </div>
        </div>
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
            <el-button @click="showPromptsPanel = false">Cancel</el-button>
            <el-button type="primary" @click="handleConfirmPrompt" :disabled="!selectedPromptId">Confirm</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 教程弹窗 -->
    <el-dialog
      v-model="guideDialogVisible"
      title="Guide"
      width="1000px"
      :close-on-click-modal="false"
      class="guide-dialog"
    >
      <div class="guide-player-container">
        <div v-if="currentGuideUrl" class="guide-web-player">
          <iframe :src="currentGuideUrl" class="guide-web-element" frameborder="0" allowfullscreen>
            您的浏览器不支持iframe
          </iframe>
        </div>
      </div>
      <template #footer>
        <div class="guide-dialog-footer">
          <el-button @click="guideDialogVisible = false">Close</el-button>
          <el-button type="primary" @click="refreshGuide">Refresh</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Prompt 详情弹窗 -->
    <el-dialog
      v-model="promptDetailVisible"
      title="Prompt Detail"
      width="600px"
      :close-on-click-modal="false"
      class="prompt-detail-dialog"
    >
      <div class="prompt-detail-content" v-if="currentPrompt">
        <div class="prompt-detail-item">
          <div class="prompt-detail-label">Remark:</div>
          <div class="prompt-detail-value">{{ currentPrompt.remark || '-' }}</div>
        </div>
        <div class="prompt-detail-item">
          <div class="prompt-detail-label">Prompt:</div>
          <div class="prompt-detail-value prompt-text">{{ currentPrompt.prompt || '-' }}</div>
        </div>
        <div class="prompt-detail-item" v-if="currentPrompt.example">
          <div class="prompt-detail-label">Example:</div>
          <div class="prompt-detail-value">
            <el-image
              v-if="isImageUrl(currentPrompt.example)"
              :src="currentPrompt.example"
              fit="contain"
              :style="{ maxWidth: '100%', maxHeight: '300px' }"
              :preview-src-list="[currentPrompt.example]"
              preview-teleported
            />
            <el-link v-else :href="currentPrompt.example" target="_blank" type="primary">
              {{ currentPrompt.example }}
            </el-link>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="prompt-detail-footer">
          <el-button @click="promptDetailVisible = false">Close</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 媒体播放弹窗 -->
    <el-dialog
      v-model="mediaPreviewVisible"
      :title="mediaPreviewType === 'video' ? 'Video Preview' : 'Audio Preview'"
      width="800px"
      :close-on-click-modal="false"
      class="media-preview-dialog"
    >
      <div class="media-preview-content">
        <video
          v-if="mediaPreviewType === 'video'"
          :src="currentMediaUrl"
          controls
          style="width: 100%; max-height: 500px"
        ></video>
        <audio v-else-if="mediaPreviewType === 'audio'" :src="currentMediaUrl" controls style="width: 100%"></audio>
      </div>
      <template #footer>
        <div class="media-preview-footer">
          <el-button @click="mediaPreviewVisible = false">Close</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, provide, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCool } from '/@/cool';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import ChatFileInputUpload from '/@/modules/work/components/chat-editor-2/chat-file-input/ChatFileInputUpload.vue';
import type { JSONContent } from '@tiptap/core';
import { chatDialogZIndexSymbol } from '/@/modules/work/components/ai-box/injections/injections';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { View, Close, VideoPlay, Headset, Document } from '@element-plus/icons-vue';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

// 检测是否为手机端
function detectMobile(): boolean {
  // 方法1: 通过 user agent 检测
  const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '';
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  if (mobileRegex.test(userAgent)) {
    return true;
  }
  // 方法2: 通过屏幕宽度检测（小于 768px 认为是手机端）
  if (window.innerWidth <= 768) {
    return true;
  }
  return false;
}

defineOptions({
  name: 'ShareMember',
});

const route = useRoute();
const { service } = useCool();

// 设备检测
const isMobile = ref(detectMobile());

// 路由参数：code
const code = ref<string>((route.params.code as string) || (route.query.code as string) || '');

// 数据
const loading = ref(true);
const error = ref<string>('');
const memberInfo = ref<Eps.ExternalLinkEntity | null>(null);
const messageList = ref<
  Array<{
    content: string;
    isUser: boolean;
    isLoading?: boolean;
    isGuide?: boolean;
    guideTitle?: string;
    guideCover?: string;
    guideContent?: string;
    createTime?: string;
    inputTypes?: string; // 输入类型，如 "input, image"
  }>
>([]);
const isSending = ref(false);
const chatContentRef = ref<HTMLElement | null>(null);
const myFormRef = ref<FormInstance | null>(null);
const targetElement = ref<HTMLElement | null>(null);

// 教程弹窗相关
const guideDialogVisible = ref(false);
const currentGuideUrl = ref<string>('');

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
const promptDetailVisible = ref(false);
const currentPrompt = ref<PromptItem | null>(null);
const showPromptsPanel = ref(false);
const selectedPromptId = ref<number | undefined>(undefined);
const promptsPanelRef = ref<HTMLElement | null>(null);

// 媒体预览相关
const mediaPreviewVisible = ref(false);
const currentMediaUrl = ref<string>('');
const mediaPreviewType = ref<'video' | 'audio'>('video');

// 输入参数相关
const inputParamsList = ref<
  Array<{
    key: string;
    name: string;
    type: string;
    required: number;
    description?: string;
    options?: Array<{ label: string; value: string | number }>;
    value?: string;
  }>
>([]);

// 输入参数类型
type InputParam = {
  key: string;
  name: string;
  type: string;
  required: number;
  description?: string;
  options?: Array<{ label: string; value: string | number }>;
  value?: string;
};

// 显示数组
const showInputList = ref<InputParam[]>([]);
// 隐藏数组
const hideInputList = ref<InputParam[]>([]);
// 上传数组
const uploadList = ref<InputParam[]>([]);
// 表单数据
const formData = ref<Record<string, string>>({});
// 表单验证规则
const rules = ref<FormRules>({});
// 是否显示上传面板
const uploadFilePanelShow = ref(false);
// 是否显示可选参数 popover
const showOptionalPopover = ref(false);
// contenteditable span refs
const editableRefs = ref<Record<string, HTMLSpanElement>>({});

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
  const maxWidth = isMobile.value ? 215 : 400;
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

// 提供 ChatEditor 需要的依赖
// 提供空的成员列表（分享页面不需要成员列表）
const curMemberList = computed(() => []);
provide('curMemberList', curMemberList);

// 提供 dialogZIndex（分享页面不需要 dialog，提供一个默认值）
const dialogZIndex = ref(2000);
provide(chatDialogZIndexSymbol, dialogZIndex);

// 聊天背景样式
const chatBackgroundStyle = computed(() => {
  const chatBg = memberInfo.value?.linkInfo?.chatBackground;
  if (chatBg) {
    return {
      backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.9), rgba(245, 245, 245, 0.75)), url(${chatBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative' as const,
    };
  }
  return {};
});

// 轮询相关
let pollTimer: number | null = null;
const pollInterval = 5000; // 2秒轮询一次
const maxPollAttempts = 60; // 最多轮询30次（1分钟）
let pollAttempts = 0;

// 加载 member 信息
async function loadMemberInfo() {
  if (!code.value) {
    error.value = 'Invalid share code';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    // 调用接口获取 member 信息
    // 注意：根据实际接口，可能需要传递 code 或其他参数
    const info = await service.base.externalLink.memberInfoByCode({ code: code.value });
    memberInfo.value = info;
    // 加载 Prompts 列表
    if (info?.prompts && Array.isArray(info.prompts)) {
      promptsList.value = info.prompts;
    } else {
      promptsList.value = [];
    }
    // 初始化输入参数列表
    if (info?.config?.params && Array.isArray(info.config.params)) {
      inputParamsList.value = info.config.params.map(
        (param: {
          key?: string;
          name?: string;
          type?: string;
          required?: number;
          description?: string;
          options?: Array<{ label: string; value: string | number }>;
        }) => ({
          key: param.key || '',
          name: param.name || '',
          type: param.type || 'String',
          required: param.required || 0,
          description: param.description || '',
          options: param.options || [],
          value: '',
        }),
      );
      // 更新当前成员配置
      updateCurrentMember();
    } else {
      inputParamsList.value = [];
    }

    // 检查是否有教程信息
    if (info?.linkInfo?.guideTitle || info?.linkInfo?.guideCover || info?.linkInfo?.guideContent) {
      messageList.value.push({
        content: '',
        isUser: false,
        isGuide: true,
        guideTitle: info.linkInfo.guideTitle || '',
        guideCover: info.linkInfo.guideCover || '',
        guideContent: info.linkInfo.guideContent || '',
        createTime: new Date().toISOString(),
      });
      scrollToBottom();
    }
  } catch (err: unknown) {
    console.error('Failed to load member info:', err);
    error.value =
      (err as { message?: string })?.message || 'Failed to load member information. Please check the share link.';
  } finally {
    loading.value = false;
  }
}

// 发送消息
async function handleSendMessage() {
  // 验证表单
  if (!myFormRef.value) return;

  try {
    await myFormRef.value.validate();
  } catch {
    return;
  }

  // 如果正在发送或正在轮询结果，不允许发送
  if (isSending.value || pollTimer !== null) return;

  // 构建参数对象
  const params: Record<string, string> = {};
  showInputList.value.forEach((item) => {
    if (item.type === 'String') {
      params[item.name] = formData.value[item.key] || '';
    } else {
      // 文件类型，从 uploadList 中获取值
      const uploadItem = uploadList.value.find((u) => u.key === item.key);
      params[item.name] = uploadItem?.value || '';
    }
  });

  // 构建用户消息显示内容
  const userMessage = showInputList.value
    .map((item) => {
      if (item.type === 'String') {
        return `${formData.value[item.key] || ''}`;
      } else {
        console.log('uploadList', uploadList.value);
        const uploadItem = uploadList.value.find((u) => u.key === item.key);
        return `${uploadItem?.value ? uploadItem.value : ''}`;
      }
    })
    .join('\n');

  // 构建输入类型字符串（去重并格式化）
  const inputTypesSet = new Set<string>();
  showInputList.value.forEach((item) => {
    if (item.type === 'String') {
      inputTypesSet.add('input');
    } else {
      // 将类型转换为小写，如 "Image" -> "image"
      const typeLower = item.type.toLowerCase();
      inputTypesSet.add(typeLower);
    }
  });
  const inputTypes = Array.from(inputTypesSet).join(', ');

  // 添加用户消息
  messageList.value.push({
    content: userMessage,
    isUser: true,
    createTime: new Date().toISOString(),
    inputTypes: inputTypes || undefined,
  });

  // 添加加载中的 AI 消息
  const loadingMessageIndex = messageList.value.length;
  messageList.value.push({
    content: '',
    isUser: false,
    isLoading: true,
    createTime: new Date().toISOString(),
  });

  // 立即清空输入内容，恢复到刚进入页面的状态
  clearInputs();

  scrollToBottom();

  try {
    isSending.value = true;

    // 调用发送消息的接口
    const result = await sendMessageToAI(params);
    // 消息发送成功后会返回一个logId,轮训结果的时候要传参数logId
    const logId = result.logId;

    // 开始轮询查询结果
    startPolling(loadingMessageIndex, logId);
  } catch (err: unknown) {
    console.error('Failed to send message:', err);
    // 移除加载中的消息
    messageList.value.splice(loadingMessageIndex, 1);
    messageList.value.push({
      content: 'Sorry, failed to send message. Please try again.',
      isUser: false,
      createTime: new Date().toISOString(),
    });
    ElMessage.error((err as { message?: string })?.message || 'Failed to send message');
  } finally {
    isSending.value = false;
  }
}

// Base64 编码函数（支持 Unicode 字符）
function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// 发送消息到 AI
async function sendMessageToAI(params: Record<string, string>) {
  // 将 params 对象转换为 JSON 字符串，然后进行 base64 编码
  const paramsJson = JSON.stringify(params);
  const paramsBase64 = base64Encode(paramsJson);

  return await service.base.message.runWorkflow({
    groupId: memberInfo.value?.linkInfo?.groupId,
    memberId: memberInfo.value?.linkInfo?.memberId,
    params: paramsBase64,
    externalLinkCode: code.value,
  });
}

// 开始轮询查询结果
function startPolling(messageIndex: number, logId: string) {
  pollAttempts = 0;

  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = window.setInterval(async () => {
    pollAttempts++;

    if (pollAttempts > maxPollAttempts) {
      // 超时，停止轮询
      stopPolling();
      messageList.value[messageIndex] = {
        content: 'Request timeout. Please try again.',
        isUser: false,
        isLoading: false,
        createTime: new Date().toISOString(),
      };
      scrollToBottom();
      isSending.value = false; // 超时后重置发送状态
      return;
    }

    try {
      // TODO: 调用查询结果的接口（暂时还没有）
      const result = await service.base.externalLink.workflowLogInfo({ logId: logId });
      console.log('result', result);
      //       {
      //     "id": 816,
      //     "createTime": "2025-12-05 17:50:25",
      //     "updateTime": "2025-12-05 17:50:25",
      //     "tenantId": null,
      //     "groupId": 224,
      //     "memberId": 547,
      //     "appId": 547,
      //     "parentType": 1,
      //     "type": 14,
      //     "userId": 222,
      //     "ownerId": 222,
      //     "startTime": 1764928225,
      //     "endTime": 1764928229,
      //     "duration": 4,
      //     "savedTime": 0,
      //     "result": {
      //         "code": 10000,
      //         "data": [
      //             [
      //                 {
      //                     "key": "f6779039-fc86-4935-aa09-b6b688675f2b",
      //                     "name": "output",
      //                     "type": "String",
      //                     "content": "你提供的"hellow"拼写有误，正确的应该是"hello" ，"hello"翻译成中文是"你好；喂" 。 ",
      //                     "required": 1,
      //                     "description": ""
      //                 }
      //             ]
      //         ]
      //     },
      //     "externalLinkCode": "HXidPnjzvP"
      // }

      // 判断工作流是否完成（有 result 表示已完成）
      if (result && result.result && result.result.code === 10000) {
        // 提取 content
        let content = '';
        if (
          result.result &&
          result.result.code === 10000 &&
          Array.isArray(result.result.data) &&
          result.result.data.length > 0 &&
          Array.isArray(result.result.data[0]) &&
          result.result.data[0].length > 0 &&
          result.result.data[0][0]?.content
        ) {
          // 从 result.result.data[0][0].content 提取内容
          content = result.result.data[0][0].content;
        } else if (result.result && result.result.code !== 10000) {
          // 如果 code 不是 10000，表示有错误
          content = `Error: Workflow execution failed (code: ${result.result.code})`;
        } else {
          // 如果没有找到 content，使用默认消息
          content = 'Workflow completed, but no content found.';
        }

        stopPolling();
        messageList.value[messageIndex] = {
          content,
          isUser: false,
          isLoading: false,
          createTime: new Date().toISOString(),
        };
        scrollToBottom();
        return;
      } else if (result && result.result && result.result.code && result.result.code !== 10000) {
        console.log('result', result);
        stopPolling();
        messageList.value[messageIndex] = {
          content: result.result.msg,
          isUser: false,
          isLoading: false,
          createTime: new Date().toISOString(),
        };
      }
    } catch (err: unknown) {
      console.error('Failed to check result:', err);
      // 继续轮询，不中断
    }
  }, pollInterval);
}

// 停止轮询
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  pollAttempts = 0;
  // 轮询结束后，重置发送状态
  isSending.value = false;
}

// 检查 AI 结果（模拟接口，实际应该调用真实接口）
async function checkAIResult(): Promise<string | null> {
  // TODO: 替换为实际接口调用
  // return await service.base.externalLink.getResult({ code: code.value });

  // 模拟：第3次轮询时返回结果
  if (pollAttempts >= 3) {
    return `This is a simulated AI response. In the actual implementation, this will be replaced with the real AI response from the API.`;
  }
  return null;
}

// 解析消息内容，区分图片和文本
function parseMessageContent(content: string): Array<{ type: 'image' | 'text'; content: string }> {
  if (!content) return [];

  // 按换行符分割内容
  const parts = content.split('\n').filter((part) => part.trim());
  const result: Array<{ type: 'image' | 'text'; content: string }> = [];

  parts.forEach((part) => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return;

    // 判断是否为图片URL
    if (isImageUrl(trimmedPart)) {
      result.push({ type: 'image', content: trimmedPart });
    } else {
      // 文本内容，合并连续的文本
      const lastItem = result[result.length - 1];
      if (lastItem && lastItem.type === 'text') {
        lastItem.content += (lastItem.content ? '\n' : '') + trimmedPart;
      } else {
        result.push({ type: 'text', content: trimmedPart });
      }
    }
  });

  return result;
}

// 获取所有图片URL用于预览
function getImagePreviewList(content: string): string[] {
  if (!content) return [];
  const parts = content.split('\n').filter((part) => part.trim());
  return parts.filter((part) => isImageUrl(part.trim()));
}

// 格式化消息内容（支持换行等）
function formatMessage(content: string): string {
  if (!content) return '';
  // 将换行符转换为 <br>
  return content.replace(/\n/g, '<br>');
}

// 格式化相对时间
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

// 监听 uploadList 变化，同步到 formData
watch(
  () => uploadList.value,
  (newVal) => {
    newVal.forEach((item) => {
      formData.value[item.key] = item.value || '';
    });
  },
  { deep: true },
);

// 监听 formData 变化，同步到 showInputList
watch(
  () => formData.value,
  (newVal) => {
    showInputList.value = showInputList.value.map((i) => ({
      ...i,
      value: newVal[i.key],
    }));
  },
  { deep: true },
);

// 回车键监听
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    handleSendMessage();
  }
};

// 监听上传面板显示状态，添加/移除回车键监听
watch(
  () => uploadFilePanelShow.value,
  (newVal) => {
    nextTick(() => {
      if (newVal && targetElement.value) {
        targetElement.value.addEventListener('keydown', handleKeyDown);
        targetElement.value.setAttribute('tabindex', '0');
      } else if (targetElement.value) {
        targetElement.value.removeEventListener('keydown', handleKeyDown);
      }
    });
  },
);

// 设置显示列表
function setShowInputList(list: InputParam[]) {
  showInputList.value = list;
}

// 设置隐藏列表
function setHideInputList(list: InputParam[]) {
  hideInputList.value = list;
}

// 设置上传列表
function setUploadList(list: InputParam[]) {
  uploadList.value = list;
}

// 获取文件类型
function getFileType(type: string): 'image' | 'video' | 'audio' | 'file' {
  const lowerType = type.toLowerCase();
  if (lowerType === 'image' || lowerType === 'video' || lowerType === 'audio' || lowerType === 'file') {
    return lowerType as 'image' | 'video' | 'audio' | 'file';
  }
  return 'file';
}

// 更新当前成员配置
function updateCurrentMember() {
  if (!memberInfo.value?.config?.params) return;

  const arrShow: InputParam[] = [];
  const arrHide: InputParam[] = [];
  const arrUpload: InputParam[] = [];

  inputParamsList.value.forEach((i) => {
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

  // 修改rules和formData
  const ruleObj: FormRules = {};
  const formObj: Record<string, string> = {};

  if (arrShow.length > 0) {
    arrShow.forEach((i) => {
      if (i.required) {
        ruleObj[i.key] = [
          {
            required: true,
            message: i.type === 'String' ? 'Please input' : 'Please attach a file',
            trigger: 'blur',
          },
        ];
      }
      formObj[i.key] = '';
    });
  }

  rules.value = ruleObj;
  formData.value = formObj;

  // 如果有必填项，显示上传面板
  if (arrShow.length > 0) {
    uploadFilePanelShow.value = true;
  }
}

// 点击更多项
function clickMoreItem(item: InputParam) {
  hideInputList.value = hideInputList.value.filter((i) => i.key !== item.key);
  if (item.type !== 'String') {
    uploadList.value = uploadList.value.concat([item]);
  }
  showInputList.value = showInputList.value.concat([item]);

  // 更新表单验证规则和表单数据
  if (item.required) {
    rules.value[item.key] = [
      {
        required: true,
        message: item.type === 'String' ? 'Please input' : 'Please attach a file',
        trigger: 'blur',
      },
    ];
  }
  formData.value[item.key] = '';

  // 关闭 popover - 使用 setTimeout 确保在事件处理完成后关闭
  setTimeout(() => {
    showOptionalPopover.value = false;
  }, 10);
}

// 删除可选输入项
function removeOptionalItem(item: InputParam) {
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

  // 从显示列表中移除，并清除该项的 value
  const removedItem = showInputList.value.find((i) => i.key === item.key);
  if (removedItem) {
    removedItem.value = '';
  }
  showInputList.value = showInputList.value.filter((i) => i.key !== item.key);

  // 重置 item 的 value，确保下次添加时是空的
  item.value = '';

  // 添加到隐藏列表
  hideInputList.value = hideInputList.value.concat([item]);

  // 在 nextTick 中删除表单数据和验证规则，确保 UI 先更新
  nextTick(() => {
    // 删除表单数据
    delete formData.value[item.key];

    // 清除表单验证规则
    if (rules.value[item.key]) {
      delete rules.value[item.key];
    }

    // 清除表单验证状态
    if (myFormRef.value) {
      myFormRef.value.clearValidate(item.key);
    }
  });
}

// 清空输入内容
function clearInputs() {
  // 先清除表单验证状态，避免显示必填提示
  if (myFormRef.value) {
    myFormRef.value.clearValidate();
  }

  // 重置 inputParamsList 中所有 item 的 value
  inputParamsList.value.forEach((item) => {
    item.value = '';
  });

  // 恢复到初始状态：只显示必填项，非必填项回到隐藏列表
  // 这会重新设置 showInputList、hideInputList、uploadList、formData 和 rules
  updateCurrentMember();

  // 清空所有 contenteditable 元素的内容
  nextTick(() => {
    // 再次清除验证状态，确保不会显示必填提示
    if (myFormRef.value) {
      myFormRef.value.clearValidate();
    }

    // 手动清空所有 contenteditable 元素的内容
    // 遍历所有 editableRefs，清空内容
    Object.keys(editableRefs.value).forEach((key) => {
      const element = editableRefs.value[key];
      if (element) {
        element.textContent = '';
        // 重置尺寸
        adjustEditableSize(key);
      }
    });

    // 确保新显示列表中的 contenteditable 元素也被清空
    showInputList.value.forEach((item) => {
      if (item.type === 'String') {
        const element = editableRefs.value[item.key];
        if (element && element.textContent) {
          element.textContent = '';
          adjustEditableSize(item.key);
        }
      }
    });
  });
}

// 处理教程卡片点击
function handleGuideClick(message: { guideContent?: string }) {
  if (message.guideContent) {
    currentGuideUrl.value = message.guideContent;
    guideDialogVisible.value = true;
  }
}

// 刷新教程页面
function refreshGuide() {
  if (currentGuideUrl.value) {
    const iframe = document.querySelector('.guide-web-element') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = currentGuideUrl.value;
    }
  }
}

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

// 点击 Prompt 备注，填充到输入参数
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

// 显示 Prompt 详情
function handlePromptDetail(prompt: PromptItem) {
  currentPrompt.value = prompt;
  promptDetailVisible.value = true;
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

// 播放媒体
function handlePlayMedia(url: string, type: 'video' | 'audio') {
  currentMediaUrl.value = url;
  mediaPreviewType.value = type;
  mediaPreviewVisible.value = true;
}

// 滚动到底部
function scrollToBottom() {
  // 使用双重 nextTick 和 setTimeout 确保 DOM 完全更新后再滚动
  nextTick(() => {
    setTimeout(() => {
      if (chatContentRef.value) {
        chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
      }
    }, 0);
  });
}

// 监听消息列表变化，自动滚动到底部
watch(
  () => messageList.value,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// 监听 code 变化
watch(
  () => route.params.code || route.query.code,
  (newCode) => {
    if (newCode && newCode !== code.value) {
      code.value = newCode as string;
      messageList.value = [];
      loadMemberInfo();
    }
  },
);

// 监听窗口大小变化，动态更新设备类型
function handleResize() {
  isMobile.value = detectMobile();
}

// 组件挂载时加载数据
onMounted(() => {
  loadMemberInfo();
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onUnmounted(() => {
  stopPolling();
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.share-member-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  padding: 20px;
  :deep(.el-form-item__content) {
    min-height: 30px !important;
  }
  // 手机端样式
  &.is-mobile {
    padding: 0;
    background: #ffffff;

    .share-member-container {
      max-width: 100%;
      max-height: 100%;
      border-radius: 0;
      box-shadow: none;
    }

    .chat-area-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      .title {
        font-size: 18px;
      }
    }

    .chat-area-content {
      padding: 16px;
    }

    .chat-msg-item {
      max-width: 100%;

      .chat-msg-item-person-avatar-wrap {
        .chat-msg-item-person-avatar {
          width: 32px;
          height: 32px;
          font-size: 14px;
        }
      }

      // 用户消息时，给头像添加 padding，避免正方形图标被圆形切割
      &.is-user {
        .chat-msg-item-person-avatar-wrap {
          padding: 10px;
          box-sizing: border-box;
          border-radius: 100%;
          background-color: #fff;

          .chat-msg-item-person-avatar {
            width: 100%;
            height: 100%;
            border-radius: 0 !important;
          }
        }
      }

      .chat-msg-item-cnt-wrap {
        .chat-msg-item-cnt {
          padding: 10px 14px;
          font-size: 14px;
        }
      }
    }

    .chat-input-wrap-2 {
      position: relative;
      padding: 16px 12px 12px 12px;

      .param-selector-wrap {
        margin-bottom: 8px;
      }

      .chat-input-wrap-2-content {
        min-height: 48px;
        padding: 0 12px;
        border-radius: 12px;
      }
    }

    .bottom-image-upload {
      border-radius: 12px;

      .header {
        padding: 6px 12px;
        font-size: 12px;

        .current-name {
          font-size: 14px;
        }
      }

      .content {
        padding: 12px;
      }

      .bottom {
        padding: 12px 12px 0 12px;
        flex-wrap: wrap;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;

        .bottom-left {
          padding-bottom: 12px;
          padding-top: 2px;
          flex-shrink: 0;

          .icon-avatar {
            width: 28px;
            height: 28px;
            margin-right: 12px;
          }
        }

        .input-list {
          min-height: 48px;
          height: auto;
          flex-wrap: wrap;
          overflow: visible;
          flex: 1;
          min-width: 0;
          padding: 0px !important;
          .el-form {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            width: 100%;
          }

          .item {
            height: 36px;
            margin-right: 8px;
            margin-bottom: 16px;
            flex-shrink: 0;
            max-width: 200px;
            min-width: 0;
            position: relative;
            display: flex;
            align-items: stretch;

            &.item-string {
              height: auto;
              min-height: 36px;
              max-width: none;
              flex: 1 1 auto;
            }

            // 当内部的 editable-input 获得焦点时，整个 item 的边框都变色
            &:has(.editable-input:focus) {
              .item-name {
                border-color: #fa9819;
              }

              .item-tip-string {
                border-color: #fa9819;
              }
            }

            .item-name {
              height: 100%;
              min-height: 32px;
              font-size: 12px;
              padding: 8px 8px 0;
              white-space: nowrap;
              flex-shrink: 0;
              display: flex;
              background-color: rgba(230, 230, 230, 1);
              border-radius: 8px 0 0 8px;
              border: 1px solid #dcdfe6;
              border-right: none;
              transition: border-color 0.2s ease;
              // align-items: center;
            }

            .item-tip {
              font-size: 12px;
              flex: 1;
              min-width: 0;
              max-width: 150px;

              .el-input {
                width: 100%;
                min-width: 0;
                max-width: 100%;
              }

              &.item-tip-string {
                max-width: none;
                min-width: 120px;
                flex: 0 0 auto;
                max-height: 120px;
                overflow-y: auto;
                overflow-x: hidden;
                border: 1px solid #dcdfe6;
                border-left: none;
                border-radius: 0 8px 8px 0;
                background-color: #fff;
                box-sizing: border-box;
                transition: border-color 0.2s ease;
                // 隐藏滚动条但保持滚动功能
                scrollbar-width: none; // Firefox
                -ms-overflow-style: none; // IE/Edge

                &::-webkit-scrollbar {
                  display: none; // Chrome/Safari/Edge
                }
              }

              .editable-input {
                display: inline-block;
                min-width: 120px;
                max-width: 400px;
                width: auto;
                min-height: 32px;
                padding: 4px 12px;
                border: none;
                border-radius: 0;
                font-size: 14px;
                font-family: inherit;
                line-height: 20px;
                outline: none;
                background-color: transparent;
                box-sizing: border-box;
                word-wrap: break-word;
                white-space: pre-wrap;
                overflow-wrap: break-word;
                text-align: left;
                text-indent: 0;
                transition: width 0.2s ease;

                &:empty:before {
                  content: attr(data-placeholder);
                  color: #c0c4cc;
                }

                &:not(:empty) {
                  color: #606266;
                }
              }
            }

            .item-close {
              position: absolute;
              top: -2px;
              right: -6px;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background-color: rgba(245, 108, 108, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 10;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

              .el-icon {
                color: #fff;
                font-size: 10px;
              }

              &:active {
                background-color: rgba(245, 108, 108, 1);
                transform: scale(0.95);
              }
            }
          }
        }

        .bottom-right {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-top: 8px;
        }

        .command-more {
          font-size: 12px;
          padding-bottom: 8px;
          margin-left: 0;
          width: 100%;
        }

        .send-button-wrap {
          padding-bottom: 12px;
          margin-left: 0;
          width: 100%;
          position: relative;

          .el-button {
            padding: 8px 16px;
            font-size: 14px;
            width: 100%;
          }
        }
      }
    }

    .guide-card-item {
      max-width: 100%;

      .guide-card-cover {
        height: 150px;
      }

      .guide-card-info {
        padding: 10px;

        .guide-card-title {
          font-size: 13px;
        }
      }
    }
  }
}

.share-member-container {
  width: 100%;
  max-width: 800px;
  height: 100%;
  max-height: 800px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chat-area-header {
  padding: 20px;
  background: #262626;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 20px;
    font-weight: 700;
  }

  .loading-indicator {
    font-size: 14px;
    opacity: 0.8;
  }
}

.chat-area-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
  position: relative;

  // 背景图片遮罩层已通过 backgroundImage 的 linear-gradient 实现，不再使用 ::before

  // 确保内容在遮罩层之上
  > * {
    position: relative;
    z-index: 1;
  }

  .loading-wrap,
  .error-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 200px;

    .loading-text,
    .error-text {
      font-size: 16px;
      color: #666;
    }

    .error-text {
      color: #f56c6c;
    }
  }

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.chat-msg-item-wrap {
  display: flex;
  width: 100%;
}

.chat-msg-item {
  display: flex;
  gap: 4px;
  max-width: 100%;
  align-items: flex-start;
  .line {
    width: 22px;
    height: 12px;
    opacity: 1;
    top: 11px;
    left: 22px;
    border-radius: 4px 0 0 0;
    border-width: 2px 0 0 2px;
    border-color: rgba(179, 179, 179, 1);
    border-style: solid;
    margin-left: 18px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .chat-msg-item-person-2 {
    margin-right: 4px;
    width: 44px;
  }

  .chat-msg-item-person-avatar-wrap {
    width: 44px;
    height: 44px;
    border-radius: 100%;
    background-color: #e1e0e1;
    cursor: pointer;
    flex-shrink: 0;

    .chat-msg-item-person-avatar {
      width: 100%;
      height: 100%;
      border-radius: 100%;
      object-fit: cover;

      &.default-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #262626;
        color: #fff;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }

  // 用户消息时，给头像添加 padding，避免正方形图标被圆形切割
  &.is-user {
    .chat-msg-item-person-avatar-wrap {
      padding: 10px;
      box-sizing: border-box;
      border-radius: 100%;
      background-color: #fff;

      .chat-msg-item-person-avatar {
        width: 100%;
        height: 100%;
        border-radius: 0 !important;
      }
    }
  }

  .chat-msg-item-cnt-wrap {
    flex: 1;
    min-width: 0;

    .quote-info {
      display: flex;
      flex-wrap: wrap;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: rgba(38, 38, 38, 1);
      margin-bottom: 4px;

      .quote-avatar {
        width: 24px;
        height: 24px;
        border-radius: 100%;
        overflow: hidden;
        margin-right: 5px;
        img {
          width: 100%;
          height: 100%;
        }
      }

      .quote-username {
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        color: rgba(250, 152, 25, 1);
        margin-right: 4px;
      }

      .quote-text {
        font-weight: 500;
        font-size: 12px;
        line-height: 20px;
        color: rgba(38, 38, 38, 1);
        word-break: break-all;
      }

      .quote-ml {
        height: 20px;
        border-radius: 4px;
        padding: 0 4px;
        background: rgb(243, 222, 195);
        color: rgb(228, 131, 5);
        margin-left: 4px;
      }
    }

    .msg-info {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      .username {
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: rgba(250, 152, 25, 1);
        margin-right: 4px;
      }
      .username2 {
        height: 20px;
        opacity: 1;
        border-radius: 4px;
        gap: 4px;
        padding-right: 4px;
        padding-left: 4px;
        background: rgba(250, 152, 25, 0.3);
        font-weight: 600;
        font-style: Semi Bold;
        font-size: 14px;
        line-height: 22px;
        letter-spacing: 0%;
        vertical-align: middle;
        color: rgb(38, 38, 38);
      }

      .platform {
        display: flex;
        align-items: center;
        width: 53px;
        height: 20px;
        opacity: 1;
        border-radius: 4px;
        gap: 4px;
        padding: 0 4px;
        background: #fa9819;
        font-weight: 600;
        font-style: Semi Bold;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0%;
        vertical-align: middle;
        color: rgba(255, 255, 255, 1);
        margin-right: 4px;
        .icon-platform-readed {
          width: 12px;
          height: 8px;
        }
      }

      .time {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        color: rgba(115, 115, 115, 1);
        margin-left: 4px;
      }
    }

    .chat-msg-item-cnt-2 {
      width: 100%;
      font-weight: 600;
      font-size: 14px;
      line-height: 22px;
      color: rgba(38, 38, 38, 1);
      word-wrap: break-word;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .message-image {
        max-width: 200px;
        // max-height: 200px;
        width: auto;
        height: auto;
        border-radius: 8px;
        cursor: pointer;
        display: block;
      }

      > span {
        display: block;
      }

      .message-text-wrapper {
        position: relative;
        width: 100%;

        .message-text {
          word-wrap: break-word;
          position: relative;

          // 只有用户消息才应用三行限制
          &.is-user {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .chatGroup-loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      padding: 12px 0;
    }

    .chatGroup-loading-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #454647;
      animation: loading-dot 1.4s infinite ease-in-out;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }

    .guide-card-item {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 300px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .guide-card-cover {
        position: relative;
        width: 100%;
        height: 180px;
        overflow: hidden;
        background: #f5f5f5;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .guide-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }

      .guide-card-info {
        padding: 12px;
        display: flex;
        flex-direction: column;
      }

      .guide-card-title {
        font-size: 14px;
        font-weight: 500;
        color: #262626;
        line-height: 20px;
        max-height: calc(20px * 2);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        white-space: normal;
      }
    }
  }
}
@keyframes loading-dot {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input-wrap-2 {
  width: 100%;
  padding: 24px 16px 16px 16px;
  position: relative;

  .param-selector-wrap {
    margin-bottom: 12px;
    display: flex;
    justify-content: flex-start;
  }

  .chat-input-wrap-2-content {
    width: 100%;
    min-height: 64px;
    background-color: #fff;
    border: 1px solid rgba(230, 230, 230, 1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    padding: 0 16px;
  }
}

.chat-textarea-wrap-2 {
  flex: 1;
  min-height: 32px;
}

.bottom-image-upload {
  position: relative;
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(230, 230, 230, 1);
  background-color: rgba(255, 255, 255, 1);
  z-index: 2;

  .header {
    width: 100%;
    min-height: 42px;
    gap: 10px;
    padding: 8px 16px;
    border-bottom: 0.5px solid rgba(230, 230, 230, 1);
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
    align-items: center;
    justify-content: space-between;
    position: relative;
    flex-wrap: wrap;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
      margin-bottom: 2px;

      .current-name {
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        color: rgba(38, 38, 38, 1);
        margin-right: 10px;
      }
    }

    .prompts-btn-wrap {
      display: flex;
      align-items: center;
    }
  }

  .content {
    padding: 16px;
    overflow-y: auto;
    display: flex;

    .chatImgInputUpload-wrap {
      width: 120px;
      height: 120px;

      .cl-upload__list {
        width: 120px;
        height: 120px;

        .cl-upload__item {
          width: 117px;
          height: 117px;
        }
      }

      .el-image {
        width: 117px;
        height: 117px;
      }

      .el-icon--upload {
        width: 28px;
        height: 28px;
        margin: 12px auto 8px auto;
      }

      .el-upload__text {
        font-size: 11px;
        line-height: 16px;
      }
    }
  }

  .bottom {
    display: flex;
    align-items: flex-start;
    padding: 16px 16px 0 16px;

    .bottom-left {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      padding-bottom: 16px;

      .icon-avatar {
        width: 32px;
        height: 32px;
        margin-right: 16px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }

    .input-list {
      min-height: 60px;
      height: auto;
      flex: 1;
      overflow: visible;
      padding-top: 4px;
      // padding-bottom: 16px;

      .el-form {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
      }

      .el-form-item {
        margin-bottom: 0;

        :deep(.el-input__wrapper) {
          border-radius: 0 8px 8px 0;
        }
      }

      .item {
        // height: 32px;
        border-radius: 8px;
        line-height: 32px;
        display: flex;
        text-align: left;
        flex-shrink: 0;
        margin-right: 8px;
        margin-bottom: 20px;
        max-width: 200px;
        position: relative;
        align-items: stretch;

        &.item-string {
          height: auto;
          min-height: 32px;
          max-width: none;
          flex: 1 1 auto;
        }

        // 当内部的 editable-input 获得焦点时，整个 item 的边框都变色
        &:has(.editable-input:focus) {
          .item-name {
            border-color: #fa9819;
          }

          .item-tip-string {
            border-color: #fa9819;
          }
        }

        .item-name {
          width: 76px;
          padding: 6px 10px 0;
          line-height: 20px;
          height: 100%;
          min-height: 32px;
          font-weight: 600;
          font-size: 14px;
          background-color: rgba(230, 230, 230, 1);
          border-radius: 8px 0 0 8px;
          border: 1px solid rgba(230, 230, 230, 1);
          border-right: none;
          display: flex;
          transition: border-color 0.2s ease;
          // align-items: center;
        }

        .item-tip {
          width: 108px;
          line-height: 32px;
          font-weight: 400;
          font-size: 14px;
          .el-input {
            border-radius: 0 8px 8px 0;
          }

          &.item-tip-string {
            width: auto;
            min-width: 120px;
            flex: 0 0 auto;
            line-height: normal;
            max-height: 150px;
            overflow-y: auto;
            overflow-x: hidden;
            border: 1px solid rgba(230, 230, 230, 1);
            border-left: none;
            border-radius: 0 8px 8px 0;
            background-color: #fff;
            box-sizing: border-box;
            transition: border-color 0.2s ease;
            // 隐藏滚动条但保持滚动功能
            scrollbar-width: none; // Firefox
            -ms-overflow-style: none; // IE/Edge

            &::-webkit-scrollbar {
              display: none; // Chrome/Safari/Edge
            }
          }

          .editable-input {
            display: inline-block;
            min-width: 120px;
            max-width: 400px;
            width: auto;
            min-height: 32px;
            padding: 5px 12px;
            border: none;
            border-radius: 0;
            font-size: 14px;
            font-family: inherit;
            line-height: 20px;
            outline: none;
            background-color: transparent;
            box-sizing: border-box;
            word-wrap: break-word;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            text-align: left;
            text-indent: 0;
            transition: width 0.2s ease;

            &:empty:before {
              content: attr(data-placeholder);
              color: #c0c4cc;
            }

            &:not(:empty) {
              color: #606266;
            }
          }
        }

        .item-close {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: rgba(245, 108, 108, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;

          .el-icon {
            color: #fff;
            font-size: 12px;
          }

          &:hover {
            background-color: rgba(245, 108, 108, 1);
            transform: scale(1.1);
          }
        }
      }
    }

    .bottom-right {
      display: flex;
      align-items: flex-start;
      flex-shrink: 0;
    }

    .command-more {
      flex-shrink: 0;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: rgba(115, 115, 115, 1);
      margin-left: 10px;
      padding-bottom: 16px;
      cursor: pointer;
    }

    .send-button-wrap {
      flex-shrink: 0;
      padding-bottom: 16px;
      margin-left: 16px;
      position: sticky;
      bottom: 0;
      align-self: flex-start;
      z-index: 10;
      background-color: rgba(255, 255, 255, 1);
    }
  }
}

.command-pop {
  padding: 8px 0;

  .command-pop-item {
    padding: 8px 16px;
    cursor: pointer;
    color: #fff;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

// 教程弹窗样式
.guide-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.guide-player-container {
  display: flex;
  flex-direction: column;
  height: 530px;
}

.guide-web-player {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  .guide-web-element {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  }
}

.guide-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Prompt 详情弹窗样式
.prompt-detail-dialog {
  .prompt-detail-content {
    padding: 20px 0;

    .prompt-detail-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .prompt-detail-label {
        font-weight: 600;
        font-size: 14px;
        color: rgba(38, 38, 38, 1);
        margin-bottom: 8px;
      }

      .prompt-detail-value {
        font-size: 14px;
        color: rgba(115, 115, 115, 1);
        word-break: break-word;

        &.prompt-text {
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }
    }
  }

  .prompt-detail-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// Prompts 选择面板样式
.prompts-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  border-radius: 16px;
  border: 1px solid rgba(230, 230, 230, 1);
  background-color: rgba(255, 255, 255, 1);
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .prompts-panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(230, 230, 230, 1);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .prompts-panel-title {
      font-weight: 600;
      font-size: 16px;
      color: rgba(38, 38, 38, 1);
    }

    .prompts-panel-close {
      font-size: 20px;
      color: rgba(115, 115, 115, 1);
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: rgba(38, 38, 38, 1);
      }
    }
  }

  .prompts-panel-content {
    padding: 12px;
    overflow-y: auto;
    flex: 1;
    max-height: 400px;

    .prompts-radio-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .prompt-radio-item {
        width: 100%;
        margin: 0;
        height: auto;
        padding: 0;

        :deep(.el-radio__input) {
          margin-right: 8px;
        }

        :deep(.el-radio__label) {
          padding: 0;
          width: calc(100% - 30px);
        }

        .prompt-radio-content {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          border: 1px solid rgba(230, 230, 230, 1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: rgba(250, 152, 25, 0.5);
            background: rgba(250, 152, 25, 0.05);
          }
        }

        &.is-checked .prompt-radio-content {
          border-color: rgba(250, 152, 25, 1);
          background: rgba(250, 152, 25, 0.1);
        }

        .prompt-example-wrap {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(245, 245, 245, 1);
          display: flex;
          align-items: center;
          justify-content: center;

          .prompt-example-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }

          .prompt-example-media {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(250, 152, 25, 0.1);
            cursor: pointer;
            transition: background 0.2s ease;

            &:hover {
              background: rgba(250, 152, 25, 0.2);
            }

            .play-icon {
              font-size: 14px;
              color: rgba(250, 152, 25, 1);
            }
          }

          .prompt-example-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(115, 115, 115, 1);

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .prompt-info-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;

          .prompt-remark-text {
            font-weight: 600;
            font-size: 12px;
            color: rgba(38, 38, 38, 1);
            line-height: 16px;
          }

          .prompt-value-text {
            font-size: 11px;
            color: rgba(115, 115, 115, 1);
            line-height: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-word;
          }
        }
      }
    }
  }

  .prompts-panel-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(230, 230, 230, 1);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// Web 端：一行显示两个
@media (min-width: 769px) {
  .prompts-panel-content {
    .prompts-radio-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
  }
}

// 手机端：一行显示一个
@media (max-width: 768px) {
  .prompts-panel {
    max-height: 50vh;
  }

  .prompts-panel-content {
    .prompts-radio-group {
      display: flex;
      flex-direction: column;
    }
  }
}

// 媒体预览弹窗样式
.media-preview-dialog {
  .media-preview-content {
    padding: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .media-preview-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
.input-mobile {
  height: 36px;
}
</style>
