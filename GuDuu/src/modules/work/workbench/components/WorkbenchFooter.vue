<template>
  <div class="">
    <!-- 右键菜单 -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleEditDesktop">
        <span>Edit</span>
      </div>
      <div class="context-menu-item" @click="handleCopyDesktop">
        <span>Copy Category</span>
      </div>
      <div class="context-menu-item" @click="handleAddDesktop">
        <span>Add Category Below</span>
      </div>
    </div>

    <!-- 右键菜单遮罩层 -->
    <div v-if="showContextMenu" class="context-menu-overlay" @click="hideContextMenu"></div>
    <div class="footer-wrap" :class="{ 'footer-wrap-live': app.isShowLive }">
      <div v-if="!app.isShowLive" class="contact-info">
        <el-tooltip class="box-item" effect="dark" content="Contact US" placement="top">
          <div class="contact-info-icon" @click="handleContact">
            <img src="../static/img/mail_default.svg" class="default" alt="" />
            <img src="../static/img/mail.svg" class="ishover" alt="" />
          </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="Help Center" placement="top">
          <div class="contact-info-icon">
            <img src="../static/img/question_default.svg" class="default" alt="" />
            <img src="../static/img/question.svg" class="ishover" alt="" />
          </div>
        </el-tooltip>
      </div>
      <div class="contact-dialog" v-if="showContact">
        <div class="contact-dialog-title">
          <div class="params-tab-item">
            <div class="active-line"></div>
            Contact Us
          </div>
          <div class="contact-dialog-title-right">
            <el-button link type="default" @click="showContact = false">
              <IMdiClose />
            </el-button>
          </div>
        </div>
        <div class="contact-content">
          <div class="img-style">
            <img :src="siteStore.info?.cornerQr" alt="" class="w-full" />
          </div>
          <div class="link-style">
            <a target="_blank" :href="siteStore.info?.cornerLink">Lark Link</a>
          </div>
        </div>
        <div class="email-style">
          <div class="mr-2">Email:</div>
          <div class="email-content">{{ siteStore.info?.cornerEmail }}</div>
        </div>
      </div>
      <div class="float-board">
        <div class="arrow-left" @click="handleCarouselLeft" :class="{ disabled: !showArrows }" v-show="showArrows">
          <IMdiChevronLeft />
        </div>
        <div class="arrow-right" @click="handleCarouselRight" :class="{ disabled: !showArrows }" v-show="showArrows">
          <IMdiChevronRight />
        </div>
        <Motion
          as="div"
          class="float-board-list"
          :transition="{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }"
        >
          <Motion
            v-for="(item, index) in visibleDesktops"
            :key="item.id"
            as="div"
            class="float-board-item"
            :class="item.id === desktopStore.defaultDesktop?.id ? 'active' : ''"
            :variants="boardItemVariants"
            initial="hidden"
            animate="visible"
            whilePress="press"
            :transition="{
              type: 'spring',
              delay: 0.1 * index,
            }"
            @click="handleDesktopClick(item)"
            @contextmenu.prevent="item.id !== 999 ? handleRightClick($event, item) : null"
          >
            <img :src="item.avatar" alt="" class="float-board-item-img" />
          </Motion>
        </Motion>
        <div class="board">
          <div class="board-top"></div>
          <div class="board-bottom"></div>
          <Motion
            key="defaultAdd"
            as="div"
            class="float-board-item desktop-add"
            :variants="boardItemVariants"
            initial="hidden"
            animate="visible"
            whilePress="press"
            :transition="{
              type: 'spring',
              delay: 0.3,
            }"
            @click="showDesktopAdd = true"
          >
            <IMdiAdd class="float-board-item-add"></IMdiAdd>
          </Motion>
        </div>
      </div>

      <!-- 重命名对话框 -->
      <el-dialog v-model="showRenameDialog" title="重命名桌面" width="400px" :close-on-click-modal="false">
        <el-form :model="renameForm" label-width="80px">
          <el-form-item label="桌面名称">
            <el-input v-model="renameForm.name" placeholder="请输入桌面名称" maxlength="20" show-word-limit />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showRenameDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </template>
      </el-dialog>
      <div v-if="!app.isShowLive" class="footer">
        <div class="icon-wrap">
          <div class="icon-item" @click="showGroupChat">
            <div class="icon-item-img">
              <img src="../static/img/aibox.svg" alt="" />
            </div>
            <div class="text">AIBox</div>
          </div>
          <div class="icon-item">
            <div class="icon-item-img">
              <img src="../static/img/dao.svg" alt="" />
            </div>
            <div class="text">DAO</div>
          </div>
        </div>
        <div class="icon-wrap">
          <div @click="handleLive" class="icon-item">
            <div class="icon-item-img">
              <img v-if="app.isShowLive" src="../static/img/rotate.svg" alt="" />
              <img v-else src="../static/img/rotate-r.svg" alt="" />
            </div>
            <div class="text">Rotate</div>
          </div>
          <div v-if="false" class="icon-item disabled">
            <div class="icon-item-img">
              <!-- <img src="../static/img/capture.svg" alt="" /> -->
              <img src="../static/img/capture-dis.svg" alt="" />
            </div>
            <div class="text">Capture</div>
          </div>
          <!-- <div class="icon-item disabled" @click="mute = !mute" :class="mute ? 'red' : ''"> -->
          <div v-if="false" class="icon-item disabled">
            <!-- <IMdiMicrophone v-if="!mute" />
          <IMdiMicrophoneOff v-if="mute" /> -->
            <div class="icon-item-img">
              <img src="../static/img/unmute-dis.svg" alt="" />
            </div>
            <div class="text">{{ mute ? 'Mute' : 'Unmute' }}</div>
          </div>
          <div class="icon-item disabled">
            <div class="icon-item-img">
              <img src="../static/img/share-dis.svg" alt="" />
            </div>
            <div class="text">Share</div>
          </div>
        </div>
        <div class="icon-wrap">
          <!-- <div @click="showAuthorization = true" class="icon-item">
          <IMdiLightMemory />
          <div class="text">Auth</div>
        </div> -->
          <div class="icon-item" @click="showPurchaseHistory = true">
            <div class="icon-item-img">
              <img src="../static/img/store.svg" alt="" />
            </div>
            <div class="text">Cart</div>
          </div>
          <div @click="showAuthorization = true" class="icon-item">
            <div class="icon-item-img">
              <img src="../static/img/media.svg" alt="" />
            </div>
            <div class="text">Media</div>
          </div>
          <div class="icon-item" @click="showSetting = true">
            <div class="icon-item-img">
              <img src="../static/img/setting.svg" alt="" />
            </div>
            <div class="text">Settings</div>
          </div>
        </div>
      </div>
      <div v-if="app.isShowLive" class="footer">
        <div class="icon-item" @click="showIM = true">
          <div class="icon-item-img">
            <img src="../static/img/aibox.svg" alt="" />
          </div>
          <div class="text">AIBox</div>
        </div>
        <div class="icon-item">
          <div class="icon-item-img">
            <img src="../static/img/dao.svg" alt="" />
          </div>
          <div class="text">DAO</div>
        </div>
        <div @click="handleLive" class="icon-item">
          <div class="icon-item-img">
            <img v-if="app.isShowLive" src="../static/img/rotate.svg" alt="" />
            <img v-else src="../static/img/rotate-r.svg" alt="" />
          </div>
          <div class="text">Rotate</div>
        </div>

        <div class="icon-item disabled">
          <div class="icon-item-img">
            <img src="../static/img/share-dis.svg" alt="" />
          </div>
          <div class="text">Share</div>
        </div>

        <div class="icon-item" @click="showPurchaseHistory = true">
          <div class="icon-item-img">
            <img src="../static/img/store.svg" alt="" />
          </div>
          <div class="text">Cart</div>
        </div>
        <div @click="showAuthorization = true" class="icon-item">
          <div class="icon-item-img">
            <img src="../static/img/media.svg" alt="" />
          </div>
          <div class="text">Media</div>
        </div>
      </div>
      <SettingComponent v-model:show="showSetting" />
      <ChatGroup v-model:show="showIM" />
      <DesktopAdd v-model:show="showDesktopAdd" width="400" />
      <WorkbenchPurchaseHistory v-model:show="showPurchaseHistory" />
      <Authorization
        :class="app.isShowLive ? 'w-[600px]' : ''"
        :app-infos="appInfos"
        v-model:show="showAuthorization"
      />
      <el-dialog
        v-model="showEditDesktop"
        title="Workspace configuration‌"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        append-to-body
        destroy-on-close
      >
        <el-form label-width="auto" label-position="left" @submit.prevent>
          <el-form-item label="Avatar">
            <cl-upload type="file" v-model="newDesktop.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
              <el-avatar shape="square" :size="50" :src="newDesktop.avatar" />
            </cl-upload>
          </el-form-item>
          <el-form-item label="Name">
            <el-input v-model="newDesktop.name" placeholder="Please enter the name" @keyup.enter.prevent />
          </el-form-item>
          <el-form-item label="Description">
            <el-input
              v-model="newDesktop.remark"
              type="textarea"
              placeholder="Please enter your description (Max 200 characters)"
              maxlength="200"
              show-word-limit
              :rows="5"
            />
          </el-form-item>

          <el-form-item label=" ">
            <el-button class="w-full" type="primary" @click="saveDesktop">Save</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
    <AiBox v-model:show="showIM" boxType="all" />
    <!-- <DesktopAdd v-model:show="showDesktopAdd" width="400" /> -->
    <!-- <WorkbenchPurchaseHistory v-model:show="showPurchaseHistory" />
    <Authorization :app-infos="appInfos" v-model:show="showAuthorization" /> -->
    <!-- <el-dialog
      v-model="showEditDesktop"
      title="Workspace configuration‌"
      width="500"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form label-width="auto" label-position="left" @submit.prevent>
        <el-form-item label="Avatar">
          <cl-upload type="file" v-model="newDesktop.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
            <el-avatar shape="square" :size="50" :src="newDesktop.avatar" />
          </cl-upload>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="newDesktop.name" placeholder="Please enter the name" @keyup.enter.prevent />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="newDesktop.remark"
            type="textarea"
            placeholder="Please enter your description (Max 200 characters)"
            maxlength="200"
            show-word-limit
            :rows="5"
          />
        </el-form-item>

        <el-form-item label=" ">
          <el-button class="w-full" type="primary" @click="saveDesktop">Save</el-button>
        </el-form-item>
      </el-form>
    </el-dialog> -->
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive, onUnmounted, computed, watch, nextTick } from 'vue';
import { Motion } from 'motion-v';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';

import SettingComponent from '/@/modules/work/components/Setting.vue';
import Authorization from '/@/modules/work/components/authorization/Authorization.vue';
// import ChatGroup from '/@/modules/work/components/chat-group/ChatGroup.vue';
import AiBox from '/@/modules/work/components/ai-box/index.vue';
import useDesktopStore from '/@/store/desktop';
import DesktopAdd from '/@/modules/work/components/desktop-add/DesktopAdd.vue';
import WorkbenchPurchaseHistory from '/@/modules/work/components/workbench-purchase-history/WorkbenchPurchaseHistory.vue';
import { router, service } from '/@/cool';
import { useBase } from '/$/base';
import { storeToRefs } from 'pinia';
import { useStore } from '/@/store';
const { userStore } = useStore();

import { useSiteStore } from '/@/store/site';
import { useImStore } from '/@/store/im.store';
const siteStore = useSiteStore();

const imStore = useImStore();
// 导入默认桌面图片
import defaultDesktopImg from '../static/img/default_desktop.png';

defineOptions({
  name: 'WorkFooter',
});

const desktopStore = useDesktopStore();
// const { setIsShowEditDesktop } = storeToRefs(desktopStore);
const route = useRoute();

const { info: userInfo } = storeToRefs(userStore);

const showSetting = ref(false);
const showContact = ref(false);
const showIM = ref(false);
const showDesktopAdd = ref(false);
const showPurchaseHistory = ref(false);
const showEditDesktop = ref(false);
const newDesktop = ref(null);
const mute = ref(false);
const showAuthorization = ref(false);
const { app } = useBase();
const boardItemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.85 },
  visible: {
    y: 0,
    opacity: 1,
  },
  hover: {
    scale: 1.1,
  },
  press: {
    scale: 0.95,
  },
};
const appInfos = ref({
  workflow: [] as unknown[],
  widget: [] as unknown[],
  plugin: [] as unknown[],
});

// 走马灯相关状态
const MAX_VISIBLE_DESKTOPS = 5; // 最多显示5个桌面
const carouselStartIndex = ref(0); // 走马灯起始索引
const carouselOffset = ref(0); // 走马灯偏移量

// 默认桌面对象
const defaultDesktopItem = {
  id: 999,
  name: 'Default',
  avatar: defaultDesktopImg,
  member: [],
  sort: 0,
};

// 合并所有桌面（默认桌面 + 用户桌面）
const allDesktops = computed(() => {
  return [defaultDesktopItem, ...(desktopStore.desktopList || [])];
});

// 是否显示箭头
const showArrows = computed(() => {
  return allDesktops.value.length > MAX_VISIBLE_DESKTOPS;
});

// 可见的桌面列表
const visibleDesktops = computed(() => {
  const total = allDesktops.value.length;

  if (total === 0) return [];

  // 当总数小于等于最大可显示数时：
  // 把当前默认桌面移动到返回数组的中间位置，其他桌面在左右分布
  if (total <= MAX_VISIBLE_DESKTOPS) {
    const arr = allDesktops.value.slice(); // 克隆，避免修改源数据
    const currentId = desktopStore.defaultDesktop?.id;
    const currentIndex = arr.findIndex((d) => d.id === currentId);

    // 若找不到当前默认桌面或已经处于中间位置，直接返回克隆数组
    if (currentIndex === -1) return arr;

    const targetIndex = Math.floor(arr.length / 2);
    if (currentIndex === targetIndex) return arr;

    const [item] = arr.splice(currentIndex, 1);
    arr.splice(targetIndex, 0, item);
    return arr;
  }

  // 总数大于最大可显示数，走马灯逻辑
  const result = [];
  for (let i = 0; i < MAX_VISIBLE_DESKTOPS; i++) {
    const index = (carouselStartIndex.value + i) % total;
    result.push(allDesktops.value[index]);
  }

  return result;
});

// 计算桌面列表的偏移量，使其在容器中居中并把高亮桌面放在中间槽位
const desktopListOffset = computed(() => {
  const totalAll = allDesktops.value.length;
  const totalVisible = visibleDesktops.value.length;

  // 每个项宽度与间距（与样式保持一致）
  const itemWidth = 48; // .float-board-item 的宽度
  const gap = 8;

  // 最大可见槽位的总宽（用于居中计算）
  const maxWidth = MAX_VISIBLE_DESKTOPS * itemWidth + (MAX_VISIBLE_DESKTOPS - 1) * gap;

  // 若总桌面数大于等于 MAX_VISIBLE_DESKTOPS，走马灯由 carouselStartIndex 控制，不需要额外偏移
  if (totalAll >= MAX_VISIBLE_DESKTOPS) {
    return 0;
  }

  // 当前默认桌面在 visibleDesktops 中的索引（用于把它移动到中间槽位）
  const currentId = desktopStore.defaultDesktop?.id;
  const currentIndexInVisible = visibleDesktops.value.findIndex((d) => d.id === currentId);

  // 可见项宽度总和
  const totalWidth = totalVisible * itemWidth + (totalVisible - 1) * gap;
  // 基础居中偏移（把整个列表居中到最大槽位）
  const baseCenter = (maxWidth - totalWidth) / 2;

  // 目标中间槽位索引
  const centerSlot = Math.floor(MAX_VISIBLE_DESKTOPS / 2);

  // 如果找不到当前索引，则仅做基础居中
  if (currentIndexInVisible === -1) {
    return baseCenter;
  }

  // 额外偏移：把当前项移动到中间槽位
  const extra = (centerSlot - currentIndexInVisible) * (itemWidth + gap);

  return baseCenter + extra;
});

// 点击左箭头 - 向左滚动并切换到上一个桌面
const handleCarouselLeft = () => {
  const total = allDesktops.value.length;
  if (total === 0) return;

  // 设置标志位，避免 watch 重复处理
  isArrowSwitching.value = true;

  // 找到当前桌面的索引
  const currentDesktop = desktopStore.defaultDesktop;
  const currentIndex = allDesktops.value.findIndex((d) => d.id === currentDesktop?.id);

  // 计算上一个桌面的索引（循环）
  const prevIndex = (currentIndex - 1 + total) % total;
  const prevDesktop = allDesktops.value[prevIndex];

  // 更新走马灯起始索引
  carouselStartIndex.value = (carouselStartIndex.value - 1 + total) % total;

  // 添加动画效果
  carouselOffset.value = 100;
  setTimeout(() => {
    carouselOffset.value = 0;
  }, 50);

  // 切换到上一个桌面
  desktopStore.setDefaultDesktop(prevDesktop);
};

// 点击右箭头 - 向右滚动并切换到下一个桌面
const handleCarouselRight = () => {
  const total = allDesktops.value.length;
  if (total === 0) return;

  // 设置标志位，避免 watch 重复处理
  isArrowSwitching.value = true;

  // 找到当前桌面的索引
  const currentDesktop = desktopStore.defaultDesktop;
  const currentIndex = allDesktops.value.findIndex((d) => d.id === currentDesktop?.id);

  // 计算下一个桌面的索引（循环）
  const nextIndex = (currentIndex + 1) % total;
  const nextDesktop = allDesktops.value[nextIndex];

  // 更新走马灯起始索引
  carouselStartIndex.value = (carouselStartIndex.value + 1) % total;

  // 添加动画效果
  carouselOffset.value = -100;
  setTimeout(() => {
    carouselOffset.value = 0;
  }, 50);

  // 切换到下一个桌面
  desktopStore.setDefaultDesktop(nextDesktop);
};

// 点击桌面项
const handleDesktopClick = (item: { id: number; name: string; avatar: string }) => {
  desktopStore.setDefaultDesktop(item);

  // 如果当前桌面不在中间位置，调整走马灯使其居中
  if (showArrows.value) {
    centerCurrentDesktop();
  }
};

// 将当前选中的桌面居中显示
const centerCurrentDesktop = () => {
  const currentDesktop = desktopStore.defaultDesktop;
  if (!currentDesktop) return;

  const total = allDesktops.value.length;
  const currentIndex = allDesktops.value.findIndex((d) => d.id === currentDesktop.id);

  if (currentIndex === -1) return;

  // 计算居中位置（第2个位置，索引为2）
  const centerPosition = Math.floor(MAX_VISIBLE_DESKTOPS / 2);
  let newStartIndex = currentIndex - centerPosition;

  // 确保索引在有效范围内
  if (newStartIndex < 0) {
    newStartIndex = total + newStartIndex;
  }

  carouselStartIndex.value = newStartIndex % total;
};

// 检查参数并显示购买历史
const checkAndShowPurchaseHistory = () => {
  if (route.query.type === 'order') {
    showPurchaseHistory.value = true;
    router.replace({ path: '/workbench' });
  }
};

// 右键菜单相关状态
const showContextMenu = ref(false);
const contextMenuPosition = reactive({ x: 0, y: 0 });
const currentDesktop = ref(null);

// 重命名相关状态
const showRenameDialog = ref(false);
const renameForm = reactive({
  name: '',
});

// 处理右键点击
const handleRightClick = (event: MouseEvent, item: any) => {
  event.preventDefault();
  currentDesktop.value = item;
  // 计算菜单位置
  contextMenuPosition.x = event.clientX;
  contextMenuPosition.y = event.clientY;

  // 确保菜单不超出视窗
  const menuWidth = 150;
  const menuHeight = 200;

  if (contextMenuPosition.x + menuWidth > window.innerWidth) {
    contextMenuPosition.x = window.innerWidth - menuWidth - 10;
  }

  if (contextMenuPosition.y + menuHeight > window.innerHeight) {
    contextMenuPosition.y = window.innerHeight - menuHeight - 10;
  }

  showContextMenu.value = true;
};

// 隐藏右键菜单
const hideContextMenu = () => {
  showContextMenu.value = false;
  currentDesktop.value = null;
};

// 处理编辑桌面
const handleEditDesktop = () => {
  debugger;
  // 打开编辑桌面信息弹窗
  newDesktop.value = currentDesktop.value;
  showEditDesktop.value = true;
  hideContextMenu();
};
const saveDesktop = async () => {
  const { id, name, avatar, remark, member } = newDesktop.value;
  if (avatar === '') {
    ElNotification({
      message: 'Please upload the avatar',
    });
    return;
  }
  if (name === '') {
    ElNotification({
      message: 'Please enter the name',
    });
    return;
  }

  if (newDesktop.value.id === 0) {
    await service.base.desktop.add({ name, avatar, remark, member, userId: userInfo.value.id });
  } else {
    await service.base.desktop.update({ id, name, avatar, remark });
  }
  ElNotification({
    message: 'Save success',
  });
  showEditDesktop.value = false;
  desktopStore.refresh();
};
// 处理复制桌面
const handleCopyDesktop = () => {
  hideContextMenu();
  if (currentDesktop.value) {
    renameForm.name = currentDesktop.value.name || '';
    delete currentDesktop.value.id;
    showEditDesktop.value = true;
  }
};

// 确认复制
const confirmCopy = async () => {
  if (!renameForm.name.trim()) {
    ElMessage.warning('请输入桌面名称');
    return;
  }

  try {
    // 这里调用重命名API
    // await service.base.desktop.update({
    //   id: currentDesktop.value.id,
    //   name: renameForm.name.trim()
    // });

    ElMessage.success('重命名成功');
    showRenameDialog.value = false;

    // 刷新桌面列表
    // await desktopStore.getDesktopList();
  } catch (error) {
    ElMessage.error('重命名失败');
  }
};

// 处理添加桌面
const handleAddDesktop = () => {
  hideContextMenu();
  showDesktopAdd.value = true;
};

// 监听键盘事件，ESC键关闭右键菜单
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showContextMenu.value) {
    hideContextMenu();
  }
};

// 监听桌面列表变化，自动居中当前桌面
watch(
  () => desktopStore.desktopList,
  () => {
    // 当桌面列表变化时，重新计算居中位置
    if (showArrows.value) {
      centerCurrentDesktop();
    }
  },
  { deep: true },
);

// 是否正在通过箭头切换（避免重复调整位置）
const isArrowSwitching = ref(false);

// 监听当前选中的桌面变化
watch(
  () => desktopStore.defaultDesktop,
  () => {
    // 如果是通过箭头切换，不需要重新居中（已经在箭头函数中处理了）
    if (isArrowSwitching.value) {
      isArrowSwitching.value = false;
      return;
    }

    // 当选中的桌面变化时，重新计算居中位置
    if (showArrows.value) {
      centerCurrentDesktop();
    }
  },
);
function showGroupChat() {
  imStore.refreshFriendList();
  showIM.value = true;
}
onMounted(() => {
  // 组件挂载后立即检查参数
  checkAndShowPurchaseHistory();
  getAppList();

  // 初始化走马灯，使当前桌面居中
  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    setTimeout(() => {
      centerCurrentDesktop();
    }, 200);
  });

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 获取所有应用列表
const getAppList = async () => {
  const res = await service.base.app.all();
  console.log(res);
  let list: unknown[] = [];
  // 对象遍历
  for (const key in res) {
    const item = res[key];
    list = list.concat(item);
  }
  console.log(list);
  // 应用进行分类
  appInfos.value.workflow = list.filter((item) => item.parentType === 1);
  appInfos.value.widget = list.filter((item) => item.parentType === 2);
  appInfos.value.plugin = list.filter((item) => item.parentType === 3);
  console.log(appInfos.value);
};

const handleLive = () => {
  app.setShowLive(!app.isShowLive);
  // 刷新页面
  // window.location.reload();
};

const handleContact = () => {
  showContact.value = !showContact.value;
};
</script>
<style lang="scss" scoped>
.footer-wrap {
  position: fixed;
  width: 1180px;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  // left: 0;
  // right: 0;
  z-index: 10;
  color: var(--theme-font-color);
  padding: 10px;
  padding-top: 1px;
  padding-left: 0px;
  padding-right: 0px;
  // background: #fff;
}
.footer-wrap-live {
  width: 600px;
}
.contact-info {
  display: flex;

  gap: 10px;
  font-weight: 600;
  position: absolute;
  top: -60px;
  right: 0px;
  width: 98px;
  height: 44px;
  .contact-info-icon {
    width: 44px;
    height: 44px;
    position: relative;
    border-radius: 50%;
    background: #fff;
    z-index: 10;
    border: 1px solid #e6e6e6;
    cursor: pointer;
    padding: 10px;
    img {
      // width: 24px;
      // height: 24px;
    }
    .default {
      display: block;
    }
    .ishover {
      display: none;
    }
    &:hover {
      .ishover {
        display: block;
      }
      .default {
        display: none;
      }
    }
  }
}
.contact-dialog {
  position: fixed;
  bottom: 110px;
  right: 70px;
  width: 284px;
  border-radius: 20px;
  border: 1px solid #e6e6e6;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
  background: #fff;
  z-index: 10;
  padding: 16px 20px;
  .contact-dialog-title {
    font-family: 'Google Sans Code';
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .contact-content {
    display: flex;
    padding: 10px 10px 12px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    border: 1px solid var(--90, #e6e6e6);
    background: var(--, #f5f5f5);
    .img-style {
      width: 100%;
      padding: 5px;
      background: #fff;
      img {
      }
    }
    .link-style {
      width: 100%;
      color: var(--15, #262626);
      text-align: center;
      /* Intel/标题加粗 */
      // font-family: Inter;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 28px;
    }
  }
  .email-style {
    display: flex;
    margin-top: 16px;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 28px;
    color: var(--15, #262626);
    .email-content {
      color: #fa9819;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
.params-tab-item {
  font-family: 'Google Sans Code';
  font-size: 24px;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  height: 32px;
  width: 144px;
  line-height: 32px;
  color: #262626;
  position: relative;
  z-index: 1;
  .active-line {
    z-index: -1;
    position: absolute;
    left: 0px;
    top: 16px;
    width: 160px;
    height: 18px;
    opacity: 0.5;
    background: var(--color-theme);
  }
}
.footer {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--theme-border-radius);
  height: 60px;
  padding-inline: 10px;
  border: 1px solid var(--theme-border-color);
  box-shadow: 0 0 2px var(--theme-border-color);
}

.icon-wrap {
  display: flex;
  align-items: center;
  flex: 1;

  &:nth-of-type(1) {
    justify-content: flex-start;
  }
  &:nth-of-type(2) {
    justify-content: center;
  }
  &:nth-of-type(3) {
    justify-content: flex-end;
  }
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-inline: 12px;
  font-size: 12px;
  width: 64px;
  height: 52px;
  border-radius: 16px;
  cursor: pointer;
  &.active {
    color: var(--el-color-primary);
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .text {
    color: #262626;
    font-family: 'Google Sans Code';
    line-height: 18px;
    font-size: 12px;
    font-weight: 500;
  }

  &:hover {
    background: #f5f5f5;
    border-radius: 8px;
  }
}

.operate {
  text-align: center;

  user-select: none;
  cursor: pointer;
  width: 80px;

  .icon {
    font-size: 20px;
  }
  .text {
    font-size: 12px;
  }
}

.operate.red {
  color: rgb(239, 83, 80);
}

.float-board {
  position: absolute;
  bottom: 80px;
  z-index: 10;
  left: 50%;
  transform: translateX(-50%);
  min-width: 120px;
  max-width: 500px;
  margin-inline: auto;
}

// 箭头样式
.arrow-left,
.arrow-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--theme-border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover:not(.disabled) {
    background: var(--el-color-primary);
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.arrow-left {
  left: -40px;
}

.arrow-right {
  right: -40px;
}

.board {
  width: 100%;
  margin-top: -21px;
  position: relative;
}

.board-top {
  width: 100%;
  height: 16px;
  // background: #47444c;
  background: #eeeeee;
  border-radius: 4px 4px 2px 2px;
  transform-origin: center bottom;
  transform: perspective(10px) rotateX(4deg);
}

.board-bottom {
  position: relative;
  width: 100%;
  height: 10px;
  // background: #201f22;
  background: #e6e6e6;
  border-radius: 10px;
  top: -2.5px;
}

.float-board-list {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-inline: 20px;

  // 使用伪元素实现一行居中，多行靠左的效果
  &::before {
    content: '';
    flex: 1;
    min-width: 0;
  }

  &::after {
    content: '';
    flex: 1;
    min-width: 0;
  }

  // 当内容超过容器宽度时，移除伪元素，实现靠左对齐
  &:has(> :nth-child(n + 7))::before,
  &:has(> :nth-child(n + 7))::after {
    display: none;
  }
}

.float-board-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 1px 4px,
    rgba(0, 0, 0, 0.08) 0px 6px 10px 4px;
  // border: 0.03125rem solid rgba(0, 0, 0, 0.05);
  background: #fff;
  border-radius: 6px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }
  &.active {
    // position: relative;
    width: 64px;
    height: 64px;
    border-radius: 10px;
    border: 2px solid #fff;
    z-index: 100;
  }
}

.float-board-item-add {
  font-size: 24px;
  color: #7f7f7f;
}

.float-board-item-img {
  border-radius: 6px;
  background: #fff;
  transition: transform 0.2s ease-in-out;
}
.desktop-add {
  width: 40px;
  height: 40px;
  position: absolute;
  bottom: -12px;
  left: calc(50% - 20px);
  z-index: 100;
  background: rgba(255, 255, 255, 1);
  border-radius: 100%;
  border: 2px solid #fff;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: #262626;
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 150px;
  font-size: 14px;
}

.context-menu-item {
  color: #fff;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;

  &:hover {
    background-color: #fa9819;
  }

  &.danger {
    color: #f56c6c;

    &:hover {
      background-color: #fef0f0;
    }
  }
}

.context-menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.context-menu-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 4px 0;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: transparent;
}
</style>
