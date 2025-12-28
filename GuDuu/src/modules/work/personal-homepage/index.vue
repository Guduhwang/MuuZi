<script setup lang="ts">
import { computed, onMounted, onUnmounted, Ref, ref, toRef, watch } from 'vue';
import { useCool } from '/@/cool';
import ShareList from '../components/ShareList.vue';
import Head from '../components/layout/head/Head.vue';
import { getKMNumber } from '/@/utils';
import { useUserStore } from '/@/store/user';
import { useFollow } from '../hooks/useFollow';
import { useDefaultBg } from '../hooks/useDefaultBg';
import DefaultAvatar from '../components/default-avatar/DefaultAvatar.vue';
import { usePublishDialogStore } from '../components/publish-dialog/store/usePublishDialogStore';
import PublishParentDialog from '../components/publish-dialog/PublishParentDialog.vue';
import { ElMessage, ElMessageBox, TabPaneName } from 'element-plus';
import { Plus, Star, User, Edit, Delete, Download, Brush } from '@element-plus/icons-vue';
import type { TTotalMetrics } from '../types/user.type';
import { formatAmount } from '/@/utils';
import PersonalHomepageTeam from './components/PersonalHomepageTeam.vue';
import PersonalHomepageMetrics from './components/PersonalHomepageMetrics.vue';
import { useGroupStore } from '/@/store/group.store';
import MobileTip from '../components/mobile-tip/MobileTip.vue';
import { useBase } from '/$/base';
import { watchImmediate } from '@vueuse/core';
import PublishDialog from '../components/publish-dialog/PublishDialog.vue';
import Upload from '/@/plugins/upload/components/upload.vue';
import { setPersonalHomepageSEO } from '/@/utils/seo';
import { getIdentity } from '/@/utils';
import lefttopBg from '/@/assets/imgs/personal/lefttop_bg.svg';
import itemBottomBg from '/@/assets/imgs/personal/item_bottom.png';
import { useStore } from '/@/store';

const { app } = useBase();

const { service, router } = useCool();
const { userStore, groupStore, siteStore } = useStore();
const { defaultBg } = useDefaultBg();
const loadingFlag = ref(false);
const props = defineProps<{
  name: string;
}>();

// 是否是自己的主页
const isSelf = computed(() => props.name === userStore.info?.name);

// 判断是否有team权限
const isJoinTeam = computed(() => {
  if (
    userStore.info?.roleIds?.includes(6) ||
    userStore.info?.roleIds?.includes(7) ||
    userStore.info?.roleIds?.includes(8)
  ) {
    return true;
  }
  return false;
  // if (memberList.value.length) {
  //   const me = memberList.value.find((item) => item.userId === userStore.info?.id);
  //   if (me) {
  //     return true;
  //   }
  //   return false;
  // }
});
const memberList = ref<Eps.GroupMemberEntity[]>([]);
const info = ref<Eps.BaseSysUserEntity>({});

// 扩展 GoodsInfoEntity 类型，添加 groupInfo 和 workflowInfo 属性
type WorkflowInfoItem = {
  id?: string | number;
  avatar?: string;
  [key: string]: unknown;
};

type GroupInfoType = {
  group?: {
    avatar?: string;
    [key: string]: unknown;
  };
  members?: WorkflowInfoItem[];
  [key: string]: unknown;
};

// workflowInfo 可能是对象（有 avatar）或数组（用于 v-for）
type WorkflowInfoType =
  | {
      avatar?: string;
      [key: string]: unknown;
    }
  | WorkflowInfoItem[];

type GoodsInfoWithGroup = Eps.GoodsInfoEntity & {
  groupInfo?: GroupInfoType;
  workflowInfo?: WorkflowInfoType;
  backgroundColor?: string; // 主题颜色
};

// 扩展 OrderInfoEntity 类型，让 goods 字段包含 groupInfo 和 workflowInfo
type OrderInfoWithGroupInfo = Omit<Eps.OrderInfoEntity, 'goods'> & {
  goods: GoodsInfoWithGroup;
};

const works = ref<GoodsInfoWithGroup[]>([]);
const orderList = ref<OrderInfoWithGroupInfo[]>([]);
const soldOrderList = ref<Eps.OrderInfoEntity[]>([]);
const productStatus = ref(true);
const tabName = ref('personal');
const selectedCategory = ref('');
const totalMetrics = ref<TTotalMetrics>({
  totalViews: 0,
  totalPurchases: 0,
  totalEarned: 0,
  totalTokens: 0,
});

// 获取当前主页的memberlist
async function getMemberList() {
  const resTeam = await service.base.groupMember.teamsByUserId({ userId: info.value.id });
  if (resTeam?.length) {
    const res = await service.base.groupMember.memberList({
      groupIds: [resTeam[0].id],
    });
    memberList.value = res[0].members;
  }
}
// 获取个人商品信息
// async function getWorks() {
//   const res = await service.goods.info.list({ ownerId: info.value.id });
//   if (res?.length) {
//     // 判断每一条的isPinned，如果true 排在最前边
//     const pinnedWorks = res.filter((item) => item.isPinned);
//     const normalWorks = res.filter((item) => !item.isPinned);
//     works.value = [...pinnedWorks, ...normalWorks];
//   }
// }
// 获取他人商品列表
async function getOtherWorks() {
  loadingFlag.value = true;
  const res = await service.goods.info.openList({ userId: info.value.id });
  if (res?.length) {
    // 循环查询每一条查询商品包含的工作流相关信息 如果groupId 有值则接口传groupId 查group信息保存到goodsInfo的groupInfo中
    // 如果workflowId 有值则接口传workflowId 查workflow信息保存到goodsInfo的workflowInfo中
    // 使用 Promise.all 并行处理所有异步请求，提高性能
    const worksWithInfo = await Promise.all(
      res.map(async (item: Eps.GoodsInfoEntity) => {
        const workItem: GoodsInfoWithGroup = { ...item };

        // 并行请求 groupInfo 和 workflowInfo
        const [groupRes, workflowRes] = await Promise.all([
          item.groupId
            ? service.base.groupMember.memberDetail({ groupId: item.groupId }).catch(() => null)
            : Promise.resolve(null),
          item.workflowId
            ? service.base.groupMember.memberDetail({ memberId: item.workflowId }).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (groupRes) {
          workItem.groupInfo = groupRes;
        }
        if (workflowRes) {
          workItem.workflowInfo = workflowRes;
        }

        return workItem;
      }),
    );

    // 判断每一条的isPinned，如果true 排在最前边
    const pinnedWorks = worksWithInfo.filter((item) => item.isPinned);
    const normalWorks = worksWithInfo.filter((item) => !item.isPinned);
    works.value = [...pinnedWorks, ...normalWorks];
    console.log(works);
  }
  loadingFlag.value = false;
}
// 获取订单列表
async function getOrders() {
  const res = await service.goods.order.myOrders({
    page: 1,
    pageSize: 10,
  });
  if (res?.list?.length) {
    // 筛选orderlist 如果payAmount大于0 则 payStatus为1 显示 如果payAmount等于0 则显示
    const filteredList = res.list.filter((item: Eps.OrderInfoEntity) => {
      if (item.payAmount > 0) {
        return item.payStatus === 1;
      } else {
        return item.payStatus === 0;
      }
    });

    // 循环查询每一条订单的商品包含的工作流相关信息
    // 如果goods.groupId 有值则接口传groupId 查group信息保存到goods.groupInfo中
    // 如果goods.workflowId 有值则接口传workflowId 查workflow信息保存到goods.workflowInfo中
    // 使用 Promise.all 并行处理所有异步请求，提高性能
    const ordersWithInfo = await Promise.all(
      filteredList.map(async (item: Eps.OrderInfoEntity) => {
        const orderItem: OrderInfoWithGroupInfo = {
          ...item,
          goods: { ...item.goods } as GoodsInfoWithGroup,
        };

        // 并行请求 groupInfo 和 workflowInfo
        const [groupRes, workflowRes] = await Promise.all([
          item.goods.groupId
            ? service.base.groupMember.memberDetail({ groupId: item.goods.groupId }).catch(() => null)
            : Promise.resolve(null),
          item.goods.workflowId
            ? service.base.groupMember.memberDetail({ memberId: item.goods.workflowId }).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (groupRes) {
          orderItem.goods.groupInfo = groupRes;
        }
        if (workflowRes) {
          orderItem.goods.workflowInfo = workflowRes;
        }

        return orderItem;
      }),
    );

    orderList.value = ordersWithInfo;
  }
}
// 获取个人信息
async function getUserInfo() {
  if (isSelf.value) {
    // info = toRef(userStore, 'info') as Ref<Eps.BaseSysUserEntity>;
    info.value = { ...userStore.info } as Eps.BaseSysUserEntity;
  } else {
    const res = await service.base.sys.user.openDetail({ name: props.name });
    if (res) {
      info.value = res;
      // 保存到 localstorage;
      localStorage.setItem('userInfo', JSON.stringify(info.value));
    }
  }
  groupStore.invitationShortUrl = info.value.invitationShortUrl || '';
}

function handleTabChange(tabName: TabPaneName) {
  if (tabName === 'personal') {
    getOtherWorks();
  } else if (tabName === 'team') {
    console.log('team');
  } else if (tabName === 'orders') {
    getOrders();
  } else if (tabName === 'metrics') {
    getTotalMetrics();
  }
}
function getTotalMetrics() {
  getTotalView();
  getTotalSold();
  // getTotalRevenue();
  getTotalTokens();
  getMySoldOrders();
}
// 获取总浏览量
async function getTotalView() {
  const res = await service.goods.info.totalView({
    userId: info.value.id,
  });
  if (res) {
    totalMetrics.value.totalViews = Number(res);
  }
}
// 获取总购买量
async function getTotalSold() {
  const res = await service.goods.info.totalSold({
    userId: info.value.id,
  });
  if (res) {
    totalMetrics.value.totalPurchases = Number(res);
  }
}
// 获取总收入
async function getTotalRevenue() {
  const res = await service.goods.info.totalRevenue({
    userId: info.value.id,
  });
  if (res) {
    totalMetrics.value.totalEarned = res;
  }
}
// 获取总tokens
async function getTotalTokens() {
  const res = await service.goods.info.totalEarnedTokens({
    userId: info.value.id,
  });
  if (res) {
    totalMetrics.value.totalTokens = Number(res);
  }
}
// 获取我卖出的订单列表
async function getMySoldOrders() {
  const res = await service.goods.order.mySoldOrders({
    page: 1,
    pageSize: 10,
  });
  if (res?.list?.length) {
    soldOrderList.value = res.list;
  }
}
const { isFollow, followLoading, handleFollow, getFollowList } = useFollow(info);

// 获取商品的头像列表（用于显示在卡片上）
function getItemAvatars(item: Eps.GoodsInfoEntity) {
  // 这里可以根据实际需求返回头像数组，暂时返回空数组
  // 如果需要显示用户头像，可以从 item 中获取相关信息
  return [];
}

onMounted(async () => {
  loadingFinished.value = false;
  await getUserInfo();

  loadingFinished.value = true;
  getOtherWorks();
  if (userStore.info) {
    getMemberList();
  }
  getFollowList();
  // 获取url参数
  const query = router.currentRoute.value.query;
  if (query.tab) {
    tabName.value = query.tab as string;
    handleTabChange(tabName.value);
  }

  // 设置个人主页SEO
  if (info.value.nickName) {
    setPersonalHomepageSEO(info.value.nickName, info.value.remark);
  }

  if (info.value.serviceCode) {
    // 创建一个临时的 div 来解析 HTML
    const temp = document.createElement('div');
    temp.innerHTML = info.value.serviceCode;

    // 获取所有的 script 标签
    const scripts = Array.from(temp.getElementsByTagName('script'));

    // 按顺序加载脚本
    for (const oldScript of scripts) {
      await new Promise((resolve, reject) => {
        const newScript = document.createElement('script');

        // 复制 script 标签的属性
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // 设置加载完成的处理函数
        newScript.onload = resolve;
        newScript.onerror = reject;

        // 如果是外部脚本，需要先设置 src
        if (oldScript.src) {
          newScript.src = oldScript.src;
        }

        // 如果是内联脚本，直接设置内容
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }

        // 插入新的 script 标签
        document.body.appendChild(newScript);

        // 如果是内联脚本，直接解析完成
        if (!oldScript.src) {
          resolve(undefined);
        }
      }).catch((err) => {
        console.error('Script load error:', err);
      });
    }
  }
});

function handleEdit(item: Eps.GoodsInfoEntity) {
  editGoodsInfo.value = item;
  isEditPublish.value = true;
}
function handleDelete(id: number | undefined) {
  if (!id) {
    return;
  }
  ElMessageBox.confirm('Are you sure to delete this?', 'Tips', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
  }).then(async () => {
    await service.goods.info.remove({ id });
    getOtherWorks();
  });
}
function handleDownload(item: Eps.GoodsInfoEntity) {
  // 下载功能，可以根据实际需求实现
  if (item.mainPic) {
    const link = document.createElement('a');
    link.href = item.mainPic;
    link.download = item.title || 'download';
    link.click();
  }
}
async function handleListed(id: number | undefined) {
  if (!id) {
    return;
  }
  await service.goods.info.restore({ id });
  getRemovedWorks();
}

// 主题颜色列表（根据设计图的10个颜色）
const themeColors = [
  '#FFFFFF', // 白色
  '#FF6B6B', // 珊瑚红
  '#FA9819', // 橙色（默认）
  '#FFD93D', // 黄色
  '#6BCB77', // 绿色
  '#4D96FF', // 浅蓝色
  '#9B59B6', // 浅紫色
  '#6C5CE7', // 紫色
  '#FF6B9D', // 粉色
  '#B3B3B3', // 浅灰色
];

// 当前显示主题选择器的商品ID
const showThemePickerFor = ref<number | null>(null);

// 获取主题颜色（如果没有则返回默认颜色）
function getThemeColor(item: GoodsInfoWithGroup): string {
  return item.backgroundColor || '#FA9819';
}

// 计算单个商品的 Token 总数
function getItemTokens(item: GoodsInfoWithGroup): number {
  // 如果有 workflowInfo，获取 workflowInfo.token
  if (item.workflowId && item.workflowInfo) {
    const workflowInfo = item.workflowInfo as { token?: number; [key: string]: unknown };
    return Number(workflowInfo.token || 0);
  }

  // 如果有 groupInfo，累加 members 的 token
  if (item.groupId && item.groupInfo && item.groupInfo.members) {
    return item.groupInfo.members.reduce((total, member) => {
      const memberToken =
        (member as { token?: number; tokens?: number; [key: string]: unknown }).token ||
        (member as { token?: number; tokens?: number; [key: string]: unknown }).tokens ||
        0;
      return total + Number(memberToken);
    }, 0);
  }

  return 0;
}

// 判断是否显示 Token 标识
function shouldShowToken(item: GoodsInfoWithGroup): boolean {
  return getItemTokens(item) > 0;
}

// 获取 SVG 背景图片 URL（根据主题颜色动态生成）
function getSvgBackgroundUrl(color: string): string {
  const encodedColor = encodeURIComponent(color);
  return `url("data:image/svg+xml,%3Csvg width='40' height='35' viewBox='0 0 40 35' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M39.1035 21.5957C39.0852 21.8862 39.1035 22.1587 39.1035 22.4492V27.0264C39.1035 27.5712 39.0854 28.0801 39.0488 28.5342C39.0122 28.9883 38.9574 29.4246 38.8477 29.8242C38.7379 30.2601 38.5909 30.6596 38.3896 31.041C38.1884 31.4224 37.9319 31.8038 37.6025 32.167C37.3281 32.4757 36.9987 32.7842 36.6328 33.0566C36.3858 33.2474 36.1183 33.418 35.8302 33.5758C35.7822 33.6021 35.7336 33.628 35.6844 33.6536C35.6352 33.6792 35.5855 33.7045 35.5352 33.7295C35.1692 33.8929 34.7665 34.0381 34.3457 34.1289C33.9432 34.2197 33.5221 34.2559 33.083 34.2559H10.7773C10.3383 34.2558 9.91711 34.2015 9.51465 34.1289C9.09413 34.0381 8.69188 33.8928 8.32617 33.7295C7.92361 33.5479 7.55691 33.3109 7.22754 33.0566C6.86173 32.7661 6.53219 32.4757 6.25781 32.167C5.9285 31.8038 5.67196 31.4406 5.4707 31.041C5.26949 30.6597 5.12344 30.26 5.01367 29.8242C4.92218 29.4246 4.8491 28.9883 4.8125 28.5342C4.77592 28.0801 4.77611 27.5712 4.75781 27.0264V22.123C4.75781 21.6145 4.684 21.142 4.57422 20.7061C4.44613 20.252 4.26327 19.8519 4.02539 19.5068C3.98902 19.4706 3.97096 19.4161 3.93457 19.3799C3.9189 19.3643 3.90331 19.3486 3.88896 19.3331C3.88633 19.3303 3.88358 19.3276 3.88105 19.3247C3.87477 19.3176 3.86891 19.3105 3.86348 19.3034C3.85531 19.2928 3.84819 19.2822 3.84277 19.2715C3.34879 18.7993 2.76338 18.417 2.12305 18.1445C1.50091 17.8902 0.823007 17.7451 0.109375 17.7451H0V16.4922H0.109375C0.841152 16.4922 1.55498 16.3466 2.19531 16.0742C2.85405 15.8018 3.4581 15.3836 3.95215 14.875L3.98926 14.8213L4.04395 14.748C4.29999 14.4031 4.48299 13.9855 4.59277 13.5498C4.70256 13.1139 4.77538 12.6414 4.77539 12.1328V7.22852C4.77539 6.68365 4.79446 6.17476 4.83105 5.7207C4.86765 5.2668 4.92249 4.83109 5.03223 4.43164C5.14198 3.99586 5.28808 3.59617 5.48926 3.21484C5.69054 2.83341 5.947 2.45116 6.27637 2.08789C6.55079 1.77921 6.88024 1.47061 7.24609 1.19824C7.57539 0.944016 7.9413 0.726126 8.34375 0.526367C8.70965 0.362926 9.11243 0.217774 9.5332 0.126953C9.93574 0.036141 10.3568 4.2074e-06 10.7959 0H33.1035C36.4172 0 39.1035 2.68629 39.1035 6V21.5957ZM10.8691 4.63086C10.6313 4.66718 10.43 4.73987 10.2471 4.8125C10.0824 4.90332 9.93596 4.99493 9.82617 5.12207C9.71649 5.24914 9.62518 5.39427 9.57031 5.55762C9.51544 5.73917 9.47855 5.93882 9.47852 6.1748C9.46022 6.95559 9.45996 7.06508 9.45996 7.57324V8.2998C9.45996 8.89855 9.47848 9.44338 9.47852 9.57129C9.47852 9.98905 9.47877 10.3348 9.49707 10.6436C9.49708 10.9521 9.51463 11.2244 9.51465 11.4785V11.5518C9.51466 11.7878 9.5332 12.0241 9.5332 12.2783C9.5332 12.805 9.51556 13.3317 9.44238 13.8584C9.3692 14.3488 9.27696 14.8208 9.1123 15.293V15.3115C9.00252 15.6566 8.85606 15.9837 8.69141 16.3105C8.54506 16.601 8.38089 16.8737 8.17969 17.1279C8.38086 17.4003 8.54508 17.673 8.69141 17.9453C8.85607 18.2722 9.00253 18.5993 9.1123 18.9443C9.25866 19.3984 9.3692 19.8886 9.44238 20.3789C9.51557 20.9056 9.5332 21.4323 9.5332 21.959C9.5332 22.2132 9.51466 22.4313 9.51465 22.6855V22.7588C9.47807 23.8845 9.47852 23.9573 9.47852 25.0469V26.5908C9.47852 27.0812 9.47877 27.5903 9.49707 28.0625C9.49711 28.2984 9.53304 28.4982 9.58789 28.6797C9.64278 28.8613 9.73496 29.0063 9.84473 29.1152C9.95452 29.2424 10.1009 29.3522 10.2656 29.4248C10.4485 29.5155 10.6503 29.5701 10.9062 29.6064H33.0283C33.2661 29.5701 33.4857 29.4974 33.6504 29.4248C33.8151 29.334 33.9615 29.2424 34.0713 29.1152C34.181 28.9882 34.2723 28.843 34.3271 28.6797C34.382 28.4981 34.4189 28.2985 34.4189 28.0625C34.421 25.0703 34.4216 13.0978 34.4217 6.12767C34.4218 5.29923 33.7502 4.63086 32.9217 4.63086H10.8691Z' fill='${encodedColor}'/%3E%3C/svg%3E")`;
}

// 获取图标 SVG URL（根据主题颜色动态生成）
function getIconSvgUrl(iconName: string, color: string): string {
  const encodedColor = encodeURIComponent(color);

  // 根据不同的图标返回对应的 SVG data URL
  const iconSvgs: Record<string, string> = {
    n8n: `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.3585 4C14.2733 4.0003 15 4.7837 15 5.72936C14.9999 6.67493 14.2732 7.45738 13.3585 7.45767C12.6453 7.45744 12.047 6.9801 11.8185 6.32261H10.3375C10.0992 6.32261 9.88453 6.50667 9.84243 6.77412L9.7834 7.14687C9.73226 7.47214 9.59505 7.76407 9.40021 7.99948C9.59531 8.23499 9.73222 8.52759 9.7834 8.85313L9.84243 9.22588C9.88453 9.49333 10.0992 9.67739 10.3375 9.67739H10.3893C10.6178 9.01967 11.2169 8.54233 11.9303 8.54233C12.8449 8.54275 13.5707 9.32513 13.5708 10.2706C13.5708 11.2162 12.845 11.9996 11.9303 12C11.2168 12 10.6177 11.5217 10.3893 10.8639H10.3375C9.52803 10.8639 8.84896 10.2455 8.71875 9.41803L8.65971 9.04528C8.61769 8.77806 8.40266 8.59415 8.16467 8.59378H7.75455C7.52599 9.25111 6.92758 9.72859 6.21453 9.72884C5.5013 9.72884 4.90319 9.25118 4.67451 8.59378H4.18257C3.95405 9.25107 3.35552 9.72847 2.64255 9.72884C1.72755 9.72884 1 8.94532 1 7.99948C1.00026 7.05386 1.72771 6.27116 2.64255 6.27116C3.35553 6.27153 3.95406 6.74892 4.18257 7.40622H4.67451C4.90318 6.7488 5.50128 6.27116 6.21453 6.27116C6.92759 6.27141 7.526 6.74887 7.75455 7.40622H8.16467C8.40266 7.40585 8.61769 7.22194 8.65971 6.95472L8.71875 6.58197C8.84896 5.75455 9.52803 5.13611 10.3375 5.13611H11.8185C12.0469 4.47842 12.6452 4.00023 13.3585 4ZM11.9303 9.72884C11.6616 9.72884 11.4281 9.96243 11.428 10.2706C11.428 10.5789 11.6616 10.8124 11.9303 10.8124C12.1987 10.812 12.4326 10.5786 12.4326 10.2706C12.4325 9.96271 12.1987 9.72926 11.9303 9.72884ZM2.64255 7.45767C2.37396 7.45767 2.14051 7.69142 2.14026 7.99948C2.14026 8.30778 2.37381 8.54233 2.64255 8.54233C2.91094 8.54185 3.14484 8.30746 3.14484 7.99948C3.14459 7.69174 2.91079 7.45815 2.64255 7.45767ZM6.21453 7.45767C5.94594 7.45767 5.71249 7.69142 5.71224 7.99948C5.71224 8.30778 5.94579 8.54233 6.21453 8.54233C6.48303 8.54201 6.71682 8.30757 6.71682 7.99948C6.71657 7.69163 6.48289 7.45799 6.21453 7.45767ZM13.3585 5.18756C13.09 5.18785 12.8562 5.42126 12.8562 5.72936C12.8563 6.03735 13.09 6.27087 13.3585 6.27116C13.6269 6.27086 13.8617 6.03735 13.8618 5.72936C13.8618 5.42126 13.627 5.18786 13.3585 5.18756Z' fill='${encodedColor}'/%3E%3C/svg%3E`,
    make: `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1344_1220' style='mask-type:luminance' maskUnits='userSpaceOnUse' x='11' y='3' width='4' height='10'%3E%3Cpath d='M11.6897 3.11719H14.0095C14.1857 3.11719 14.3325 3.27261 14.3325 3.45911V12.5356C14.3325 12.7221 14.1857 12.8775 14.0095 12.8775H11.6897C11.5135 12.8775 11.3667 12.7221 11.3667 12.5356V3.45911C11.3667 3.27261 11.5135 3.11719 11.6897 3.11719Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1344_1220)'%3E%3Cpath d='M8.38623 4.28515L13.9801 2.09375L17.3277 11.6986L11.7338 13.8745L8.38623 4.28515Z' fill='${encodedColor}'/%3E%3C/g%3E%3Cmask id='mask1_1344_1220' style='mask-type:luminance' maskUnits='userSpaceOnUse' x='1' y='3' width='7' height='10'%3E%3Cpath d='M4.87797 3.22556L1.03125 11.3384C0.957838 11.5094 1.01657 11.7114 1.17807 11.7891L3.24825 12.8926C3.40975 12.9703 3.60062 12.9081 3.67403 12.7372L7.52075 4.62433C7.59416 4.45337 7.53543 4.25133 7.37393 4.17362L5.31843 3.07015C5.27438 3.03906 5.23034 3.03906 5.17161 3.03906C5.05415 3.03906 4.9367 3.11677 4.87797 3.22556Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask1_1344_1220)'%3E%3Cpath d='M-2.46387 4.6107L6.56565 0.476562L11.029 11.418L1.9995 15.5522L-2.46387 4.6107Z' fill='${encodedColor}'/%3E%3C/g%3E%3Cmask id='mask2_1344_1220' style='mask-type:luminance' maskUnits='userSpaceOnUse' x='6' y='3' width='6' height='10'%3E%3Cpath d='M8.12301 3.26553L6.47861 12.1088C6.44925 12.2953 6.55202 12.4663 6.72821 12.5129L9.00394 12.9947C9.18012 13.0258 9.34163 12.917 9.38567 12.7305L11.0301 3.8872C11.0594 3.7007 10.9567 3.52974 10.7805 3.48311L8.50475 3.00131C8.49006 3.00131 8.4607 3.00131 8.44602 3.00131C8.28451 2.98577 8.15237 3.11011 8.12301 3.26553Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask2_1344_1220)'%3E%3Cpath d='M3.36572 4.17262L10.5159 1.39062L14.1277 11.8192L6.99221 14.6012L3.36572 4.17262Z' fill='${encodedColor}'/%3E%3C/g%3E%3C/svg%3E`,
    coze: `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.954 6.77819C3.95374 6.2822 4.05816 5.79101 4.26131 5.3327C4.46446 4.87438 4.76235 4.4579 5.13797 4.10705C5.51359 3.7562 5.95958 3.47785 6.45047 3.2879C6.94136 3.09795 7.46754 3.00012 7.99894 3H8.00194C10.2359 3 12.0469 4.69309 12.0469 6.77819V8.36115H13.0179C14.1328 8.36115 14.3838 9.81997 13.3254 10.1476L12.0474 10.5442V11.2284C12.0474 11.3833 12.0051 11.5357 11.9243 11.671C11.8435 11.8063 11.7269 11.9201 11.5858 12.0016C11.4446 12.083 11.2834 12.1294 11.1176 12.1364C10.9518 12.1434 10.7868 12.1106 10.6384 12.0413L9.92841 11.7114C9.89491 11.6974 9.85391 11.7114 9.84341 11.7445C9.26992 13.4185 6.73096 13.4185 6.15697 11.7445C6.15409 11.7369 6.14954 11.73 6.14361 11.7242C6.13767 11.7183 6.13049 11.7137 6.12252 11.7106C6.11455 11.7075 6.10597 11.7061 6.09735 11.7063C6.08873 11.7065 6.08025 11.7084 6.07247 11.7119L5.36248 12.0413C4.71749 12.3447 3.954 11.9051 3.954 11.2284V10.5442L2.67552 10.1476C1.61454 9.8223 1.86853 8.36115 2.98301 8.36115H3.954V6.77819ZM6.23947 7.99761C6.1355 7.99761 6.0358 8.03616 5.96228 8.10477C5.88877 8.17338 5.84747 8.26644 5.84747 8.36348V9.09522C5.84747 9.19226 5.88877 9.28532 5.96228 9.35394C6.0358 9.42255 6.1355 9.4611 6.23947 9.4611C6.34343 9.4611 6.44313 9.42255 6.51665 9.35394C6.59016 9.28532 6.63146 9.19226 6.63146 9.09522V8.36348C6.63146 8.26644 6.59016 8.17338 6.51665 8.10477C6.44313 8.03616 6.34343 7.99761 6.23947 7.99761ZM9.76191 8.36115C9.65795 8.36115 9.55824 8.39969 9.48473 8.46831C9.41122 8.53692 9.36992 8.62998 9.36992 8.72702C9.36992 8.82405 9.41122 8.91712 9.48473 8.98573C9.55824 9.05434 9.65795 9.09289 9.76191 9.09289C9.86588 9.09289 9.96558 9.05434 10.0391 8.98573C10.1126 8.91712 10.1539 8.82405 10.1539 8.72702C10.1539 8.62998 10.1126 8.53692 10.0391 8.46831C9.96558 8.39969 9.86588 8.36115 9.76191 8.36115ZM6.66896 9.95484C6.68864 9.99919 6.71753 10.0395 6.75396 10.0734C6.9173 10.2262 7.11135 10.3475 7.32499 10.4302C7.53862 10.513 7.76764 10.5555 7.99894 10.5555C8.23024 10.5555 8.45926 10.513 8.67289 10.4302C8.88653 10.3475 9.08057 10.2262 9.24392 10.0734C9.28026 10.0395 9.3091 9.99924 9.32878 9.95495C9.34846 9.91066 9.3586 9.86318 9.35863 9.81523C9.35865 9.76728 9.34855 9.7198 9.32892 9.67549C9.30928 9.63118 9.28048 9.59092 9.24417 9.557C9.20786 9.52308 9.16475 9.49616 9.11729 9.47779C9.06984 9.45942 9.01897 9.44996 8.9676 9.44994C8.91623 9.44991 8.86535 9.45934 8.81788 9.47767C8.77041 9.496 8.72727 9.52287 8.69093 9.55676C8.50738 9.72784 8.25858 9.82392 7.99919 9.82392C7.7398 9.82392 7.491 9.72784 7.30745 9.55676C7.26209 9.51395 7.20607 9.4823 7.14439 9.46465C7.08271 9.44701 7.0173 9.44392 6.95403 9.45567C6.89076 9.46742 6.8316 9.49363 6.78185 9.53196C6.73209 9.57029 6.69331 9.61954 6.66896 9.6753C6.64916 9.71966 6.63896 9.76724 6.63896 9.8153C6.63896 9.86336 6.64916 9.91094 6.66896 9.9553V9.95484Z' fill='${encodedColor}'/%3E%3C/svg%3E`,
    comfy: `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.46635 3.00241C8.48315 3.00238 8.49996 3.00235 8.51676 3.00232C8.56277 3.00224 8.60877 3.00222 8.65478 3.00221C8.70447 3.00219 8.75415 3.00212 8.80384 3.00205C8.9124 3.00191 9.02096 3.00185 9.12952 3.00181C9.19734 3.00178 9.26517 3.00174 9.333 3.0017C9.52092 3.00157 9.70884 3.00147 9.89676 3.00144C9.90878 3.00144 9.92079 3.00143 9.93318 3.00143C9.95124 3.00143 9.95124 3.00143 9.96968 3.00143C9.99408 3.00142 10.0185 3.00142 10.0429 3.00141C10.055 3.00141 10.0671 3.00141 10.0796 3.00141C10.2757 3.00137 10.4719 3.00119 10.6681 3.00096C10.8696 3.00072 11.0712 3.0006 11.2727 3.00059C11.3858 3.00058 11.4989 3.00052 11.612 3.00034C11.7083 3.00019 11.8046 3.00014 11.9009 3.00022C11.95 3.00026 11.9991 3.00025 12.0482 3.00011C12.0932 2.99998 12.1383 3 12.1833 3.00012C12.1995 3.00014 12.2157 3.00011 12.2319 3.00002C12.4591 2.99887 12.6496 3.05205 12.8166 3.19972C12.9473 3.32704 12.9963 3.48292 12.9988 3.65562C12.9991 3.66551 12.9995 3.6754 13 3.68559C13.0024 3.89462 12.9101 4.10572 12.8477 4.3044C12.8279 4.36755 12.8082 4.43073 12.7884 4.49391C12.7808 4.5184 12.7731 4.5429 12.7654 4.56739C12.7323 4.67328 12.6996 4.77927 12.6671 4.88533C12.6598 4.90898 12.6526 4.93262 12.6453 4.95627C12.6176 5.04649 12.6176 5.04649 12.5901 5.13675C12.4985 5.43687 12.4123 5.69809 12.1789 5.92949C12.1697 5.93892 12.1605 5.94835 12.151 5.95807C11.9591 6.14983 11.7012 6.27774 11.4267 6.32755C11.4179 6.32923 11.4091 6.33092 11.4001 6.33265C11.3526 6.33887 11.3062 6.33918 11.2583 6.33938C11.2477 6.33947 11.2372 6.33955 11.2263 6.33964C11.1905 6.3399 11.1547 6.3401 11.1189 6.3403C11.0928 6.34047 11.0667 6.34065 11.0407 6.34084C10.9836 6.34123 10.9265 6.34159 10.8694 6.34192C10.8086 6.34228 10.7478 6.34268 10.687 6.34312C10.2912 6.34596 9.89541 6.3477 9.49963 6.34835C9.41687 6.34849 9.33411 6.34867 9.25135 6.34889C9.23967 6.34892 9.22799 6.34895 9.21595 6.34898C9.1688 6.3491 9.12164 6.34923 9.07449 6.34936C8.93383 6.34974 8.79317 6.34998 8.6525 6.34996C8.56312 6.34996 8.47373 6.35014 8.38434 6.35046C8.33216 6.35063 8.27998 6.35073 8.2278 6.3506C8.17956 6.35049 8.13133 6.3506 8.08309 6.3509C8.06559 6.35096 8.04808 6.35095 8.03058 6.35083C7.92439 6.35022 7.83562 6.35435 7.75189 6.42304C7.71108 6.4635 7.69202 6.5067 7.67544 6.55951C7.67284 6.56731 7.67023 6.5751 7.66755 6.58313C7.65953 6.60735 7.65179 6.63163 7.6441 6.65594C7.63938 6.67062 7.63465 6.6853 7.62992 6.69998C7.61553 6.74505 7.60164 6.79024 7.58778 6.83545C7.58255 6.85241 7.57731 6.86936 7.57207 6.88632C7.56098 6.92227 7.5499 6.95822 7.53885 6.99418C7.52125 7.0514 7.5036 7.10861 7.48594 7.16582C7.46781 7.22457 7.44968 7.28332 7.43157 7.34207C7.37924 7.51178 7.32667 7.68143 7.27397 7.85104C7.2673 7.87252 7.26063 7.894 7.25395 7.91548C7.1993 8.09146 7.14454 8.2674 7.08971 8.44333C7.08687 8.45245 7.08403 8.46156 7.0811 8.47095C7.05593 8.55173 7.03075 8.63252 7.00555 8.7133C7.00295 8.72162 7.00036 8.72995 6.99768 8.73853C6.99252 8.75509 6.98735 8.77164 6.98218 8.7882C6.96973 8.82812 6.95729 8.86805 6.94491 8.90799C6.92385 8.97584 6.90271 9.04367 6.88086 9.1113C6.87173 9.13959 6.86271 9.16792 6.85369 9.19625C6.84753 9.21546 6.84122 9.23463 6.8349 9.2538C6.80459 9.34936 6.78811 9.43105 6.83761 9.52228C6.87684 9.58708 6.92507 9.61398 6.99779 9.64134C7.03468 9.64962 7.06876 9.65252 7.10664 9.65246C7.12332 9.65247 7.12332 9.65247 7.14033 9.65248C7.15248 9.65244 7.16462 9.6524 7.17714 9.65236C7.1901 9.65235 7.20305 9.65235 7.2164 9.65234C7.25234 9.65231 7.28827 9.65224 7.32421 9.65216C7.36298 9.65207 7.40175 9.65205 7.44053 9.65202C7.50773 9.65195 7.57493 9.65185 7.64214 9.65174C7.73947 9.65157 7.83681 9.65147 7.93415 9.6514C8.0923 9.65128 8.25045 9.65113 8.40861 9.65095C8.41807 9.65094 8.42754 9.65093 8.43729 9.65092C8.57144 9.65076 8.70558 9.65058 8.83973 9.65038C8.85388 9.65036 8.85388 9.65036 8.86832 9.65034C8.87774 9.65032 8.88716 9.65031 8.89687 9.6503C9.0543 9.65007 9.21174 9.64991 9.36917 9.64983C9.46618 9.64977 9.56319 9.64964 9.66019 9.64944C9.72678 9.6493 9.79336 9.64924 9.85994 9.64923C9.89829 9.64922 9.93663 9.64918 9.97498 9.64905C10.2613 9.64814 10.5148 9.65308 10.7353 9.84756C10.868 9.97371 10.9267 10.1395 10.9307 10.3143C10.929 10.4289 10.9045 10.5373 10.8699 10.6467C10.8662 10.659 10.8624 10.6712 10.8585 10.6838C10.8482 10.7173 10.8377 10.7507 10.8273 10.7841C10.8162 10.8197 10.8052 10.8553 10.7941 10.8909C10.7751 10.9524 10.756 11.0138 10.7369 11.0753C10.7075 11.1696 10.6783 11.2639 10.6491 11.3582C10.5341 11.7303 10.5341 11.7303 10.4806 11.9018C10.468 11.9423 10.4554 11.9829 10.4429 12.0234C10.3934 12.1827 10.3934 12.1827 10.3539 12.2573C10.3499 12.265 10.3459 12.2727 10.3418 12.2806C10.2802 12.3958 10.197 12.4941 10.1022 12.5869C10.0938 12.5956 10.0854 12.6043 10.0767 12.6132C9.85904 12.8293 9.5294 12.987 9.2096 12.9959C9.16632 12.9963 9.12305 12.9964 9.07976 12.9964C9.06295 12.9964 9.04613 12.9965 9.02932 12.9965C8.98323 12.9966 8.93714 12.9967 8.89105 12.9967C8.84129 12.9967 8.79153 12.9968 8.74177 12.9969C8.62167 12.9971 8.50157 12.9972 8.38146 12.9973C8.32484 12.9973 8.26822 12.9974 8.2116 12.9974C8.02328 12.9976 7.83496 12.9977 7.64664 12.9978C7.59781 12.9978 7.54898 12.9979 7.50015 12.9979C7.48195 12.9979 7.48195 12.9979 7.46337 12.9979C7.26686 12.998 7.07035 12.9982 6.87384 12.9986C6.67189 12.9989 6.46994 12.9991 6.26799 12.9991C6.15468 12.9991 6.04137 12.9992 5.92806 12.9995C5.83155 12.9997 5.73504 12.9998 5.63852 12.9997C5.58934 12.9996 5.54016 12.9996 5.49097 12.9998C5.44582 13 5.40068 13 5.35553 12.9998C5.33932 12.9998 5.3231 12.9998 5.30689 13C5.0782 13.0015 4.88909 12.9439 4.71854 12.7964C4.58874 12.6719 4.53831 12.5041 4.53568 12.3338C4.53553 12.3266 4.53538 12.3193 4.53523 12.3119C4.53639 12.1869 4.57768 12.0623 4.61486 11.9434C4.61905 11.9298 4.62323 11.9162 4.62741 11.9026C4.63619 11.8742 4.645 11.8457 4.65385 11.8172C4.6676 11.773 4.68124 11.7287 4.69485 11.6845C4.73003 11.5702 4.76527 11.4559 4.80136 11.3419C4.81153 11.3097 4.8216 11.2775 4.83166 11.2453C4.83807 11.225 4.84466 11.2047 4.85125 11.1844C4.88083 11.0898 4.90067 10.9974 4.85106 10.9059C4.80543 10.8421 4.74507 10.8063 4.6668 10.7857C4.63291 10.7818 4.59948 10.7817 4.56536 10.7819C4.55557 10.7819 4.54579 10.7818 4.53571 10.7818C4.5146 10.7817 4.49348 10.7816 4.47236 10.7817C4.43879 10.7817 4.40523 10.7816 4.37167 10.7814C4.3003 10.781 4.22893 10.7809 4.15756 10.7808C4.07504 10.7806 3.99252 10.7804 3.91001 10.78C3.8772 10.7798 3.84439 10.7799 3.81158 10.7799C3.60923 10.7794 3.42348 10.7554 3.25761 10.6365C3.24587 10.6283 3.24587 10.6283 3.2339 10.6199C3.10201 10.5195 3.02402 10.3654 3.00332 10.2086C3.00137 10.1773 3.00088 10.146 3.00068 10.1147C3.00046 10.1067 3.00024 10.0987 3.00001 10.0905C2.99911 9.95517 3.04451 9.82335 3.08527 9.69483C3.09026 9.67892 3.09525 9.663 3.10023 9.64708C3.11086 9.61313 3.12153 9.57919 3.13224 9.54526C3.14935 9.49104 3.16636 9.43679 3.18336 9.38253C3.20106 9.32603 3.21877 9.26953 3.2365 9.21303C3.29335 9.03192 3.34958 8.85065 3.40569 8.66934C3.42589 8.60407 3.44612 8.53881 3.46634 8.47354C3.47384 8.44933 3.48134 8.42511 3.48884 8.4009C3.55022 8.20279 3.61174 8.00473 3.67327 7.80667C3.67554 7.79936 3.67781 7.79205 3.68015 7.78452C3.69904 7.72369 3.69904 7.72369 3.70762 7.69609C3.74433 7.5779 3.78102 7.45969 3.81769 7.34149C3.84296 7.26002 3.86825 7.17856 3.8936 7.09711C3.90049 7.07496 3.90738 7.0528 3.91427 7.03065C3.91889 7.01581 3.9235 7.00097 3.92812 6.98613C3.95801 6.89004 3.98774 6.79392 4.01731 6.69775C4.03842 6.62908 4.05961 6.56044 4.08084 6.49181C4.09353 6.4508 4.10618 6.40978 4.11872 6.36873C4.13043 6.3304 4.14225 6.2921 4.15415 6.25383C4.15846 6.2399 4.16273 6.22597 4.16696 6.21202C4.27612 5.85204 4.51172 5.55983 4.85864 5.37323C5.04118 5.27864 5.23675 5.21975 5.44614 5.22025C5.45777 5.2202 5.4694 5.22015 5.48138 5.22009C5.50642 5.21999 5.53145 5.21993 5.55649 5.21992C5.59619 5.21988 5.63588 5.21971 5.67558 5.21951C5.77411 5.21903 5.87265 5.21871 5.97118 5.2185C6.05461 5.21832 6.13804 5.21803 6.22147 5.21757C6.24773 5.21745 6.27399 5.21739 6.30026 5.21739C6.33702 5.21739 6.37377 5.21721 6.41053 5.21699C6.42126 5.21703 6.43199 5.21708 6.44305 5.21712C6.53312 5.21627 6.62325 5.20266 6.69573 5.14877C6.76111 5.08584 6.78329 4.99483 6.80794 4.91283C6.8119 4.89994 6.81588 4.88706 6.81986 4.87418C6.82832 4.84676 6.83671 4.81932 6.84504 4.79186C6.85818 4.74853 6.87153 4.70526 6.8849 4.66199C6.92438 4.53403 6.9634 4.40595 7.00183 4.2777C7.01655 4.22864 7.03142 4.17961 7.04629 4.13058C7.0564 4.09704 7.06628 4.06345 7.07615 4.02985C7.18346 3.67167 7.38558 3.3977 7.71827 3.19288C7.72685 3.18745 7.73543 3.18203 7.74426 3.17644C7.96167 3.04552 8.21257 3.00225 8.46635 3.00241Z' fill='${encodedColor}'/%3E%3C/svg%3E`,
  };

  return iconSvgs[iconName] || '';
}

// 处理主题切换
function handleThemeChange(item: GoodsInfoWithGroup, event?: MouseEvent) {
  if (!item.id) return;

  // 如果已经显示，则关闭
  if (showThemePickerFor.value === item.id) {
    showThemePickerFor.value = null;
    return;
  }

  showThemePickerFor.value = item.id;
}

// 选择主题颜色
async function selectThemeColor(item: GoodsInfoWithGroup, color: string) {
  if (!item.id) return;

  try {
    // 更新商品的主题颜色
    await service.goods.info.update({
      id: item.id,
      backgroundColor: color,
    });

    // 更新本地数据 - works
    const workItem = works.value.find((w) => w.id === item.id);
    if (workItem) {
      workItem.backgroundColor = color;
    }

    // 更新本地数据 - removedWorks
    const removedItem = removedWorks.value.find((w) => w.id === item.id);
    if (removedItem) {
      removedItem.backgroundColor = color;
    }

    ElMessage.success('Theme updated successfully');
    showThemePickerFor.value = null;
  } catch (error) {
    console.error('Failed to update theme:', error);
    ElMessage.error('Failed to update theme');
  }
}

// 点击外部关闭主题选择器
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.theme-picker') && !target.closest('.theme-btn')) {
    showThemePickerFor.value = null;
  }
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
// 获取已下架商品列表
async function getRemovedWorks() {
  loadingFlag.value = true;
  const res = await service.goods.info.removedList({ page: 1, pageSize: 999 });
  if (res?.list?.length) {
    // 循环查询每一条查询商品包含的工作流相关信息 如果groupId 有值则接口传groupId 查group信息保存到goodsInfo的groupInfo中
    // 如果workflowId 有值则接口传workflowId 查workflow信息保存到goodsInfo的workflowInfo中
    // 使用 Promise.all 并行处理所有异步请求，提高性能
    const worksWithInfo = await Promise.all(
      res.list.map(async (item: Eps.GoodsInfoEntity) => {
        const workItem: GoodsInfoWithGroup = { ...item };

        // 并行请求 groupInfo 和 workflowInfo
        const [groupRes, workflowRes] = await Promise.all([
          item.groupId
            ? service.base.groupMember.memberDetail({ groupId: item.groupId }).catch(() => null)
            : Promise.resolve(null),
          item.workflowId
            ? service.base.groupMember.memberDetail({ memberId: item.workflowId }).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (groupRes) {
          workItem.groupInfo = groupRes;
        }
        if (workflowRes) {
          workItem.workflowInfo = workflowRes;
        }

        return workItem;
      }),
    );

    removedWorks.value = worksWithInfo;
  }
  loadingFlag.value = false;
}
function handleToDetail(id: number) {
  // 对id进行base64加密
  router.push(`/goods/${btoa(id.toString())}`);
}

async function handleDescriptionChange(value: string) {
  await service.base.sys.user.update({ id: info.value.id, remark: value });
}

const onUploaded = (res: Upload.Item) => {
  const url = res.url;
  service.base.sys.user.update({ id: userStore.info?.id, cover: url });
  info.value.cover = url;
};

const publishDialogStore = usePublishDialogStore();
watch(
  [() => publishDialogStore.hasNew],
  ([hasNew]) => {
    if (hasNew) {
      getOtherWorks();
      publishDialogStore.setHasNew(false);
    }
  },
  {
    immediate: true,
  },
);
const isShowPublish = ref(false);
const isEditPublish = ref(false);
const editGoodsInfo = ref<Eps.GoodsInfoEntity>({});
const removedWorks = ref<GoodsInfoWithGroup[]>([]);
const isEditCopyright = ref(false);
function handleOpenThis() {
  router.push({
    path: '/workbench',
    query: {
      type: 'order',
    },
  });
}
const loadingFinished = ref(false);
function handleProductStatusChange(value: boolean) {
  if (value === true) {
    getOtherWorks();
  } else if (value === false) {
    getRemovedWorks();
  }
}
function handleEditCopyright() {
  isEditCopyright.value = true;
}
function handleCreateCopyright() {
  window.open('https://creativecommons.org/chooser/', '_blank');
}

function handleSaveCopyright() {
  if (info.value.copyright) {
    service.base.sys.user.update({ id: info.value.id, copyright: info.value.copyright });
    isEditCopyright.value = false;
    getUserInfo();
  } else {
    ElMessage.error('Please enter the copyright');
  }
}
</script>
<template>
  <div v-if="loadingFinished" class="wrap" :class="{ 'live-mode-wrap': app.isShowLive }">
    <Head></Head>
    <div class="head-bg" :class="{ 'head-bg-live': app.isShowLive }">
      <img
        :key="info.cover"
        :src="info.cover || defaultBg"
        class="w-full h-full object-cover absolute top-0 left-0"
        alt=""
      />
      <div class="head-avatar-wrap">
        <div class="head-avatar-img-wrap">
          <img :src="info.avatar" alt="" class="head-avatar-img" v-if="info.avatar" />
          <DefaultAvatar v-else />
        </div>
      </div>
      <div class="head-site-name-wrap">
        <!-- 显示网站名称 siteStore.info.siteName -->
        <img :src="siteStore.info?.siteLightLogo" alt="" />
      </div>
      <div class="head-edit-btn-wrap" v-if="isSelf">
        <cl-upload accept=".jpeg,.jpg,.png,.gif" @success="onUploaded" :showFileList="false" :limit="1" preventDefault>
          <img src="../../../assets/imgs/personal/pen.svg" alt="" />
        </cl-upload>
      </div>
    </div>
    <div class="content-wrap">
      <div class="lefttop-bg">
        <img :src="lefttopBg" alt="" />
      </div>
      <div class="content-left">
        <h1 class="info-name relative flex items-center">
          {{ info.nickName }}
          <el-tooltip class="box-item" effect="dark" content="Verified Creator." placement="top-start">
            <div v-if="info.email?.includes('lgpdao@gmail.com')" class="authentication-style ml-2 cursor-pointer">
              <IMdiCheckboxMarkedCircle class="text-[#f87171]"></IMdiCheckboxMarkedCircle>
            </div>
          </el-tooltip>
        </h1>
        <div class="info-domain mb-[25px]" v-if="info.name">{{ info.name }}</div>

        <div class="info-follow-btn-wrap" v-if="!isSelf">
          <el-button
            :type="isFollow ? 'default' : 'primary'"
            class="w-[96px]"
            @click="handleFollow"
            :loading="followLoading"
          >
            {{ isFollow ? 'Following' : 'Follow' }}
          </el-button>
        </div>
        <template v-if="isSelf">
          <el-input
            v-model="info.remark"
            class="text-[13px] edit-input"
            placeholder="Add a description"
            @change="handleDescriptionChange"
          />
        </template>
        <template v-else>
          <div v-if="info.remark" class="text-[13px] mt-[16px]">
            <span>{{ info.remark }}</span>
          </div>
        </template>
        <div class="info-follow-wrap my-[16px]">
          <div class="w-[50%]">
            <span class="val-text">{{ getKMNumber(info.followCount ?? 0) }}</span
            >Followers
          </div>
          <div class="w-[50%]">
            <span class="val-text">{{ getKMNumber(info.fansCount ?? 0) }}</span
            >Following
          </div>
        </div>
        <div class="info-line"></div>
        <ShareList :is-self="isSelf" :share-link="info.shareLink" />
        <div class="license-wrap">
          <div v-if="isSelf" class="license-btn-wrap">
            <el-button type="warning" class="w-full" plain round @click="handleCreateCopyright"
              >Set CC License</el-button
            >
          </div>
          <el-input v-if="isSelf && isEditCopyright" v-model="info.copyright" type="textarea" :rows="5" />
          <div v-else class="license-content" v-html="info.copyright"></div>
          <div v-if="isSelf && info.copyright" class="license-btn-wrap">
            <el-button type="warning" plain round @click="handleEditCopyright">Edit</el-button>
            <el-button type="warning" plain round v-if="isEditCopyright" @click="handleSaveCopyright">Save</el-button>
          </div>
        </div>
      </div>
      <div class="content-right">
        <el-tabs v-model="tabName" class="personal-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="My Listings" name="personal"></el-tab-pane>
          <el-tab-pane v-if="isSelf" label="My Purchases" name="orders"></el-tab-pane>
          <!-- 判断是否登录 -->
          <el-tab-pane
            v-if="userStore.info && (userStore.info?.roleIds?.includes(7) || userStore.info?.roleIds?.includes(6))"
            label="My Team"
            name="team"
          ></el-tab-pane>
          <el-tab-pane v-if="isSelf" label="My Earnings" name="metrics"></el-tab-pane>
        </el-tabs>
        <div class="right-content">
          <div class="cnt-list-wrap" :class="{ 'no-border': tabName === 'team' || tabName === 'metrics' }">
            <div v-if="tabName === 'personal'" class="cnt-list-header">
              <div class="cnt-list-header-left">
                <!-- <el-select
                  v-model="selectedCategory"
                  placeholder="All listings-Category"
                  class="cnt-list-category-select"
                  clearable
                >
                  <el-option label="All listings" value="all" />
                </el-select> -->
              </div>
              <div class="cnt-list-header-center" v-if="isSelf">
                <el-radio-group v-model="productStatus" @change="(val) => handleProductStatusChange(val as boolean)">
                  <el-radio-button :value="true">Now listing</el-radio-button>
                  <el-radio-button :value="false">Removed</el-radio-button>
                </el-radio-group>
              </div>
              <div
                class="cnt-list-header-right"
                v-if="isSelf && getIdentity(userStore.info?.roleIds ?? []) !== 'level_0'"
              >
                <el-button type="warning" round class="cnt-list-add-btn" @click="isShowPublish = true">
                  <el-icon><Plus /></el-icon>
                  <span>Add</span>
                </el-button>
              </div>
            </div>
            <template v-if="tabName === 'personal'">
              <div class="cnt-list" v-loading="loadingFlag">
                <template v-if="productStatus">
                  <div class="cnt-list-item-wrap" v-for="item in works" :key="item.id">
                    <div class="cnt-list-item" @click="handleToDetail(item.id!)">
                      <!-- Hover 时显示的操作工具栏 -->
                      <div v-if="isSelf" class="cnt-item-actions">
                        <div class="action-btn" @click.stop="handleDelete(item.id)">
                          <img src="../../../assets/imgs/personal/down.svg" alt="" />
                        </div>
                        <div class="action-btn" @click.stop="handleEdit(item)">
                          <img src="../../../assets/imgs/personal/edit.svg" alt="" />
                        </div>
                        <div class="action-btn theme-btn" @click.stop="handleThemeChange(item, $event)">
                          <img src="../../../assets/imgs/personal/theme.svg" alt="" />
                          <!-- 主题颜色选择器 -->
                          <div v-if="showThemePickerFor === item.id" class="theme-picker">
                            <div class="theme-colors-grid">
                              <div
                                v-for="(color, index) in themeColors"
                                :key="index"
                                class="theme-color-item"
                                :class="{ active: getThemeColor(item) === color }"
                                :style="{ backgroundColor: color }"
                                @click.stop="selectThemeColor(item, color)"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="item-img-wrap">
                        <img
                          v-if="item.workflowId && item.workflowInfo"
                          :src="(item.workflowInfo as { avatar?: string }).avatar"
                          class="cnt-item-img 1"
                        />
                        <img
                          v-else-if="item.groupId && item.groupInfo && item.groupInfo.group"
                          :src="item.groupInfo.group.avatar"
                          class="cnt-item-img"
                        />
                        <img v-else :src="item.mainPic" class="cnt-item-img 3" />
                      </div>
                      <div class="cnt-item-img-mask">
                        <div class="mask-line">
                          <div class="line-left" :style="{ background: getThemeColor(item) }"></div>
                          <div class="line-right" :style="{ background: getThemeColor(item) }"></div>
                          <div
                            class="num-style"
                            :style="{
                              backgroundImage: getSvgBackgroundUrl(getThemeColor(item)),
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center center',
                            }"
                          ></div>

                          <div class="num-bg" :style="{ color: getThemeColor(item) }">
                            <!-- 工作流数量，如果item.workflowId && item.workflowInfo 固定是1 如果是item.groupId &&
                            item.groupInfo 显示item.groupInfo.members.length 如果都没有显示0 -->
                            <div v-if="item.workflowId && item.workflowInfo">1</div>
                            <div v-else-if="item.groupId && item.groupInfo && item.groupInfo.members">
                              {{ item.groupInfo.members.length }}
                            </div>
                            <div v-else>0</div>
                          </div>
                          <div
                            v-if="item.workflowId && item.workflowInfo"
                            class="members-style"
                            :style="{ '--theme-color': getThemeColor(item) }"
                          >
                            <div class="member-item">
                              <img :src="(item.workflowInfo as { avatar?: string }).avatar" />
                            </div>
                          </div>
                          <div
                            v-else-if="item.groupId && item.groupInfo && item.groupInfo.members"
                            class="members-style"
                            :style="{ '--theme-color': getThemeColor(item) }"
                          >
                            <div class="member-item" v-for="member in item.groupInfo.members" :key="member.id">
                              <img :src="member.avatar" />
                            </div>
                          </div>
                        </div>
                        <div class="icon-list">
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('n8n', getThemeColor(item))" alt="" />
                          </div>
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('make', getThemeColor(item))" alt="" />
                          </div>
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('coze', getThemeColor(item))" alt="" />
                          </div>
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('comfy', getThemeColor(item))" alt="" />
                          </div>
                        </div>
                        <div class="mask-title">{{ item.title }}</div>
                        <div class="line-style"></div>
                        <div class="mask-description" v-html="item.content"></div>
                        <!-- 价格和 Token 按钮 -->
                        <div class="price-token-btn">
                          <span class="price-text">${{ formatAmount(item.price || 0) }}</span>
                          <span v-if="shouldShowToken(item)" class="token-text">+Token</span>
                        </div>
                      </div>
                    </div>
                    <div class="item-bottom-bg">
                      <img :src="itemBottomBg" alt="" />
                    </div>
                    <!-- 喜欢和使用数据（悬浮显示） -->
                    <div class="item-stats">
                      <div class="stat-item">
                        <div class="stat-icon">
                          <img src="../../../assets/imgs/personal/like.svg" alt="" />
                        </div>
                        <span class="stat-value">{{ item.likeCount ?? 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <div class="stat-icon">
                          <img src="../../../assets/imgs/personal/user.svg" alt="" />
                        </div>
                        <span class="stat-value">{{ item.useCount ?? 0 }}</span>
                      </div>
                    </div>
                    <div v-if="false" class="cnt-list-item-info-wrap">
                      <div class="cnt-list-item-info">
                        <div class="name">{{ item.title }}</div>
                        <div class="cnt-item-description" v-if="item.subTitle">{{ item.subTitle }}</div>
                        <div class="cnt-item-price">
                          <span v-if="item.price">${{ formatAmount(item.price) }}</span>
                          <span v-else>$0</span>
                          <span v-if="item.price" class="cnt-item-token">+Token</span>
                        </div>
                      </div>
                      <div class="cnt-list-item-follow-wrap">
                        <span class="flex items-center">
                          <el-icon class="mr-[4px]"><Star /></el-icon>{{ item.likeCount ?? 0 }}
                        </span>
                        <span class="flex items-center mr-[4px]">
                          <el-icon class="mr-[4px]"><User /></el-icon>{{ item.useCount ?? 0 }}
                        </span>
                        <span v-if="isSelf" @click.stop="handleEdit(item)" class="flex items-center cursor-pointer">
                          <el-icon class="mr-[4px]"><Edit /></el-icon>
                        </span>
                        <span
                          v-if="isSelf"
                          @click.stop="handleDelete(item.id)"
                          class="flex items-center cursor-pointer"
                        >
                          <el-icon class="mr-[4px]"><Delete /></el-icon>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="!works.length && isSelf" class="empty-wrap">
                    <div class="empty-icon-wrapper">
                      <img src="../../../assets/imgs/personal/no_product.svg" alt="" />
                    </div>
                    <p class="empty-text">No products yet</p>
                    <el-button type="primary" class="empty-btn" @click="isShowPublish = true">Add now</el-button>
                  </div>
                  <div v-if="!works.length && !isSelf" class="empty-wrap">
                    <div class="empty-icon-wrapper">
                      <img src="../../../assets/imgs/personal/no_product.svg" alt="" />
                    </div>
                    <p class="empty-text">No products yet</p>
                  </div>
                </template>
                <template v-else-if="!productStatus">
                  <div class="cnt-list-item-wrap" v-for="item in removedWorks" :key="item.id">
                    <div class="cnt-list-item" @click="handleToDetail(item.id!)">
                      <!-- Hover 时显示的操作工具栏 -->
                      <div v-if="isSelf" class="cnt-item-actions">
                        <div class="action-btn" @click.stop="handleListed(item.id)">
                          <img src="../../../assets/imgs/personal/upload.svg" alt="" />
                        </div>
                        <div class="action-btn" @click.stop="handleEdit(item)">
                          <img src="../../../assets/imgs/personal/edit.svg" alt="" />
                        </div>
                        <div class="action-btn theme-btn" @click.stop="handleThemeChange(item, $event)">
                          <img src="../../../assets/imgs/personal/theme.svg" alt="" />
                          <!-- 主题颜色选择器 -->
                          <div v-if="showThemePickerFor === item.id" class="theme-picker">
                            <div class="theme-colors-grid">
                              <div
                                v-for="(color, index) in themeColors"
                                :key="index"
                                class="theme-color-item"
                                :class="{ active: getThemeColor(item) === color }"
                                :style="{ backgroundColor: color }"
                                @click.stop="selectThemeColor(item, color)"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="item-img-wrap">
                        <img
                          v-if="item.workflowId && item.workflowInfo"
                          :src="(item.workflowInfo as { avatar?: string }).avatar"
                          class="cnt-item-img 1"
                        />
                        <img
                          v-else-if="item.groupId && item.groupInfo && item.groupInfo.group"
                          :src="item.groupInfo.group.avatar"
                          class="cnt-item-img"
                        />
                        <img v-else :src="item.mainPic" class="cnt-item-img 3" />
                      </div>
                      <div class="cnt-item-img-mask">
                        <div class="mask-line">
                          <div class="line-left" :style="{ background: getThemeColor(item) }"></div>
                          <div class="line-right" :style="{ background: getThemeColor(item) }"></div>
                          <div
                            class="num-style"
                            :style="{
                              backgroundImage: getSvgBackgroundUrl(getThemeColor(item)),
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center center',
                            }"
                          ></div>

                          <div class="num-bg" :style="{ color: getThemeColor(item) }">
                            <!-- 工作流数量，如果item.workflowId && item.workflowInfo 固定是1 如果是item.groupId &&
                            item.groupInfo 显示item.groupInfo.members.length 如果都没有显示0 -->
                            <div v-if="item.workflowId && item.workflowInfo">1</div>
                            <div v-else-if="item.groupId && item.groupInfo && item.groupInfo.members">
                              {{ item.groupInfo.members.length }}
                            </div>
                            <div v-else>0</div>
                          </div>
                          <div
                            v-if="item.workflowId && item.workflowInfo"
                            class="members-style"
                            :style="{ '--theme-color': getThemeColor(item) }"
                          >
                            <div class="member-item">
                              <img :src="(item.workflowInfo as { avatar?: string }).avatar" />
                            </div>
                          </div>
                          <div
                            v-else-if="item.groupId && item.groupInfo && item.groupInfo.members"
                            class="members-style"
                            :style="{ '--theme-color': getThemeColor(item) }"
                          >
                            <div class="member-item" v-for="member in item.groupInfo.members" :key="member.id">
                              <img :src="member.avatar" />
                            </div>
                          </div>
                        </div>
                        <div class="icon-list">
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('n8n', getThemeColor(item))" alt="" />
                          </div>
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('make', getThemeColor(item))" alt="" />
                          </div>
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('coze', getThemeColor(item))" alt="" />
                          </div>
                          <div class="icon-item">
                            <img :src="getIconSvgUrl('comfy', getThemeColor(item))" alt="" />
                          </div>
                        </div>
                        <div class="mask-title">{{ item.title }}</div>
                        <div class="line-style"></div>
                        <div class="mask-description" v-html="item.content"></div>
                        <!-- 价格和 Token 按钮 -->
                        <div class="price-token-btn">
                          <span class="price-text">${{ formatAmount(item.price || 0) }}</span>
                          <span v-if="shouldShowToken(item)" class="token-text">+Token</span>
                        </div>
                      </div>
                    </div>
                    <div class="item-bottom-bg">
                      <img :src="itemBottomBg" alt="" />
                    </div>
                    <!-- 喜欢和使用数据（悬浮显示） -->
                    <div class="item-stats">
                      <div class="stat-item">
                        <div class="stat-icon">
                          <img src="../../../assets/imgs/personal/like.svg" alt="" />
                        </div>
                        <span class="stat-value">{{ item.likeCount ?? 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <div class="stat-icon">
                          <img src="../../../assets/imgs/personal/user.svg" alt="" />
                        </div>
                        <span class="stat-value">{{ item.useCount ?? 0 }}</span>
                      </div>
                    </div>
                    <div v-if="false" class="cnt-list-item-info-wrap">
                      <div class="cnt-list-item-info">
                        <div class="name">{{ item.title }}</div>
                        <div class="cnt-item-description" v-if="item.subTitle">{{ item.subTitle }}</div>
                        <div class="cnt-item-price">
                          <span v-if="item.price">${{ formatAmount(item.price) }}</span>
                          <span v-else>$0</span>
                          <span v-if="item.price" class="cnt-item-token">+Token</span>
                        </div>
                      </div>
                      <div class="cnt-list-item-follow-wrap">
                        <span class="flex items-center">
                          <el-icon class="mr-[4px]"><Star /></el-icon>{{ item.likeCount ?? 0 }}
                        </span>
                        <span class="flex items-center mr-[4px]">
                          <el-icon class="mr-[4px]"><User /></el-icon>{{ item.useCount ?? 0 }}
                        </span>
                        <span
                          v-if="isSelf"
                          @click.stop="handleListed(item.id)"
                          class="flex items-center cursor-pointer"
                        >
                          <IMdiLightUpload class="mr-[4px]"></IMdiLightUpload>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="!removedWorks.length && isSelf" class="empty-wrap">
                    <div class="empty-icon-wrapper">
                      <img src="../../../assets/imgs/personal/no_product.svg" alt="" />
                    </div>
                    <p class="empty-text">No products yet</p>
                  </div>
                </template>
              </div>
            </template>

            <PersonalHomepageTeam v-if="tabName === 'team'" />
            <div v-if="tabName === 'orders'" class="cnt-list" v-loading="loadingFlag">
              <div class="cnt-list-item-wrap" v-for="item in orderList" :key="item.id">
                <div class="cnt-list-item" @click="handleToDetail(item.goods.id!)">
                  <div class="item-img-wrap">
                    <img
                      v-if="item.goods.workflowId && item.goods.workflowInfo"
                      :src="(item.goods.workflowInfo as { avatar?: string }).avatar"
                      class="cnt-item-img 1"
                    />
                    <img
                      v-else-if="item.goods.groupId && item.goods.groupInfo && item.goods.groupInfo.group"
                      :src="item.goods.groupInfo.group.avatar"
                      class="cnt-item-img"
                    />
                    <img v-else :src="item.goods.mainPic" class="cnt-item-img 3" />
                  </div>
                  <div class="cnt-item-img-mask">
                    <div class="mask-line">
                      <div class="line-left" :style="{ background: getThemeColor(item.goods) }"></div>
                      <div class="line-right" :style="{ background: getThemeColor(item.goods) }"></div>
                      <div
                        class="num-style"
                        :style="{
                          backgroundImage: getSvgBackgroundUrl(getThemeColor(item.goods)),
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center center',
                        }"
                      ></div>

                      <div class="num-bg" :style="{ color: getThemeColor(item.goods) }">
                        <!-- 工作流数量，如果item.goods.workflowId && item.goods.workflowInfo 固定是1 如果是item.goods.groupId &&
                            item.goods.groupInfo 显示item.goods.groupInfo.members.length 如果都没有显示0 -->
                        <div v-if="item.goods.workflowId && item.goods.workflowInfo">1</div>
                        <div v-else-if="item.goods.groupId && item.goods.groupInfo && item.goods.groupInfo.members">
                          {{ item.goods.groupInfo.members.length }}
                        </div>
                        <div v-else>0</div>
                      </div>
                      <div
                        v-if="item.goods.workflowId && item.goods.workflowInfo"
                        class="members-style"
                        :style="{ '--theme-color': getThemeColor(item.goods) }"
                      >
                        <div class="member-item">
                          <img :src="(item.goods.workflowInfo as { avatar?: string }).avatar" />
                        </div>
                      </div>
                      <div
                        v-else-if="item.goods.groupId && item.goods.groupInfo && item.goods.groupInfo.members"
                        class="members-style"
                        :style="{ '--theme-color': getThemeColor(item.goods) }"
                      >
                        <div class="member-item" v-for="member in item.goods.groupInfo.members" :key="member.id">
                          <img :src="member.avatar" />
                        </div>
                      </div>
                    </div>
                    <div class="icon-list">
                      <div class="icon-item">
                        <img :src="getIconSvgUrl('n8n', getThemeColor(item.goods))" alt="" />
                      </div>
                      <div class="icon-item">
                        <img :src="getIconSvgUrl('make', getThemeColor(item.goods))" alt="" />
                      </div>
                      <div class="icon-item">
                        <img :src="getIconSvgUrl('coze', getThemeColor(item.goods))" alt="" />
                      </div>
                      <div class="icon-item">
                        <img :src="getIconSvgUrl('comfy', getThemeColor(item.goods))" alt="" />
                      </div>
                    </div>
                    <div class="mask-title">{{ item.goods.title }}</div>
                    <div class="line-style"></div>
                    <div class="mask-description" v-html="item.goods.content"></div>
                    <!-- 价格和 Token 按钮 -->
                    <div class="price-token-btn">
                      <span class="price-text">${{ formatAmount(item.goods.price || 0) }}</span>
                      <span v-if="shouldShowToken(item.goods)" class="token-text">+Token</span>
                    </div>
                  </div>
                </div>
                <div class="item-bottom-bg">
                  <img :src="itemBottomBg" alt="" />
                </div>
                <!-- 喜欢和使用数据（悬浮显示） -->
                <div class="item-stats">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <img src="../../../assets/imgs/personal/like.svg" alt="" />
                    </div>
                    <span class="stat-value">{{ item.goods.likeCount ?? 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">
                      <img src="../../../assets/imgs/personal/user.svg" alt="" />
                    </div>
                    <span class="stat-value">{{ item.goods.useCount ?? 0 }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!orderList.length" class="empty-wrap">
                <div class="empty-icon-wrapper">
                  <img src="../../../assets/imgs/personal/no_product.svg" alt="" />
                </div>
                <p class="empty-text">No orders yet</p>
              </div>
            </div>
            <PersonalHomepageMetrics
              v-if="tabName === 'metrics'"
              :total-metrics="totalMetrics"
              :sold-order-list="soldOrderList"
              :is-show-live="app.isShowLive"
            />
          </div>
        </div>
      </div>
    </div>

    <MobileTip />
    <PublishParentDialog v-model:show="isShowPublish"></PublishParentDialog>
    <PublishDialog v-model:show="isEditPublish" type="" :goodsInfo="editGoodsInfo" submitType="edit"></PublishDialog>
  </div>
</template>
<style scoped lang="scss">
.live-mode-wrap {
  width: 800px;
  margin: 0 auto;
  .tabs-wrap {
    padding-left: 204px;
  }
  .cnt-info-wrap {
    width: 120px;
  }
}
.wrap {
  // --el-color-primary: #409eff;
  --text-color: #000000e5;

  padding-top: 0px;

  color: var(--text-color);

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  :deep(.head-wrap) {
    background: rgba(0, 0, 0, 0) !important;
    border-bottom: none !important;
    .mid-logo-wrap {
      display: none;
    }
    .brand-wrap.br {
      border-right: none !important;
    }
    .el-menu {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .el-sub-menu__title {
      color: #fff !important;
    }
    .el-sub-menu__title:hover {
      background: rgba(0, 0, 0, 0);
    }
    .search-input .el-input__wrapper {
      border-radius: 20px;
      border: 0.5px solid rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(5px);
      background: rgba(0, 0, 0, 0.1);

      .el-input__inner {
        color: #fff;
        &::placeholder {
          color: #fff;
          opacity: 1;
        }
      }
    }
    .el-input__prefix {
      .el-icon.el-input__icon {
        color: #fff !important;
      }
    }
  }
}

.head-bg {
  position: relative;
  height: 260px;
  width: 100%;
  background-color: var(--color-bg);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding-left: 26px;
}
.head-bg-live {
  height: 114px !important;
  & > img {
    height: 114px !important;
  }
}
.head-avatar-wrap {
  border-radius: 100%;
  border: 4px solid var(--color-bg);
  position: absolute;
  left: 152px;
  bottom: 35px;
  z-index: 5;
}

.head-avatar-img-wrap {
  width: 88px;
  height: 88px;
  background: #fff;
  padding: 4px;
  border-radius: 100%;
}

.head-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 100%;
}
.content-wrap {
  position: absolute;
  width: 100%;
  background: #fff;
  left: 0px;
  top: 240px;
  padding: 0 0 0px 40px;
  border-radius: 0 24px 0 0;
  display: flex;
  gap: 80px;
  z-index: 2;
  .lefttop-bg {
    width: 450px;
    height: 200px;
    position: absolute;
    top: -60px;
    left: 0;
    z-index: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .content-left {
    width: 320px;
    z-index: 9;
  }
  .content-right {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
}
:deep(.personal-tabs) {
  padding: 20px 20px 0;
  margin-top: 0;
  position: relative;

  .el-tabs__header {
    margin: 0;
  }

  .el-tabs__nav-wrap {
    &::after {
      display: none;
    }
  }

  .el-tabs__nav {
    padding-left: 0;
    position: relative;
  }

  .el-tabs__item {
    font-size: 18px;
    font-weight: 400;
    line-height: 28px;
    color: #999999;
    padding: 0px;
    height: 40px;
    position: relative;
    margin-right: 30px;

    &.is-active {
      font-weight: 700;
      color: #262626;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 20px;
        width: 80%;
        height: 14px;
        background: #fa9819;
        opacity: 0.5;
        border-radius: 0;
        z-index: -1;
      }
    }
  }

  .el-tabs__active-bar {
    display: none;
  }
}
.tabs-wrap {
  display: flex;
  flex: 1;
  padding-left: 324px;
  box-shadow: 0 0 0 1px #d1d5db;
  height: 48px;
  margin-bottom: 16px;

  :deep(.el-tabs__content) {
    display: none;
  }
}

.cnt-wrap {
  display: flex;
  width: 100%;
}

.cnt-info-wrap {
  width: 250px;
  margin: 32px 50px 32px 32px;
  flex: 0 0 auto;
}
.right-content {
  padding-right: 40px;
  overflow-y: auto;
  max-height: calc(100vh - 299px);
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.cnt-list-wrap {
  flex-grow: 1;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 24px;
  position: relative;
  min-height: 360px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  &.no-border {
    border: none;
  }
}

.cnt-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 16px 20px;
  position: relative;
  border-bottom: 2px dashed #e6e6e6;
}

.cnt-list-header-left {
  display: flex;
  align-items: center;
}

.cnt-list-category-select {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 6px 10px 6px 4px;
    background: rgba(245, 245, 245, 0.8);
    border: 1px solid #e6e6e6;
    box-shadow: none;

    .el-input__inner {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: #595959;
      padding: 0;
    }
  }
}

.cnt-list-header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 18px;

  :deep(.el-radio-group) {
    background: rgba(245, 245, 245, 0.8);
    border-radius: 24px;
    padding: 4px;
    display: flex;
    gap: 2px;
  }

  :deep(.el-radio-button) {
    .el-radio-button__inner {
      border-radius: 24px;
      border: none;
      padding: 0px 12px;
      height: 28px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 12px;
      line-height: 28px;
      background: transparent;
      color: #999999;
      transition: all 0.3s;
    }

    &.is-active .el-radio-button__inner {
      background: #262626;
      color: #ffffff;
    }
  }
}

.cnt-list-header-right {
  display: flex;
  align-items: center;
}

.cnt-list-add-btn {
  background: #fa9819;
  border: none;
  border-radius: 24px;
  height: 32px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;

  &:hover {
    background: #fa9819;
    opacity: 0.9;
  }
}

.cnt-list-divider {
  height: 2px;
  background: #e6e6e6;
  margin: 0 4px;
}

.cnt-list {
  display: flex;
  flex-wrap: wrap;
  // justify-content: center;
  gap: 20px 10px;
  width: 100%;
  padding: 20px 10px;
}

.cnt-list-item-wrap {
  // 宽高比 226 346
  aspect-ratio: 226 / 346;
  // width: calc(25% - 8px);
  width: 226px;
  padding: 0 4px 60px 12px;
  position: relative;
  .item-img-wrap {
    height: 190px;
    border-radius: 13px 13px 0 0;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .item-bottom-bg {
    position: absolute;
    bottom: 40px;
    left: 0;
    width: 200px;
    height: 60px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  // 喜欢和使用数据（悬浮显示）
  .item-stats {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    // display: flex;
    display: none;
    align-items: center;
    justify-content: center;
    gap: 4px;
    z-index: 15;
    transition: opacity 0.3s ease;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 4px;
      height: 24px;
      overflow: hidden;

      .stat-icon {
        width: 20px;
        height: 20px;
        font-size: 20px;
        color: #737373;
        flex-shrink: 0;
      }

      .stat-value {
        font-weight: 500;
        font-size: 12px;
        line-height: 20px;
        color: #737373;
        text-align: center;
        white-space: nowrap;
      }
    }
  }

  // 悬浮时显示统计数据
  &:hover .item-stats {
    display: flex;
  }
}

.cnt-list-item {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 20px;
  border-right: 3px solid #3d3d3d;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.15);
  cursor: pointer;
  // overflow: hidden;

  // Hover 时显示的操作工具栏
  .cnt-item-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: none;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    padding: 4px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50px;
    z-index: 10;
    transition: opacity 0.3s ease;

    .action-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.6);
      }

      :deep(.el-icon) {
        font-size: 16px;
        color: #ffffff;
      }
    }
  }

  &:hover .cnt-item-actions {
    display: flex;
  }

  // 主题选择器样式
  .theme-btn {
    position: relative;
  }

  .theme-picker {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: rgba(38, 38, 38, 0.95);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    min-width: 200px;

    .theme-colors-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      padding: 6px 8px;

      .theme-color-item {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        border: 2px solid transparent;

        &:hover {
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }

        &.active {
          border: 2px solid #ffffff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .cnt-item-img-mask {
    position: relative;
    height: 132px;
    background: #3d3d3d;
    padding: 24px 12px 0 26px;
    display: flex;
    border-radius: 0 0 19px 20px;
    flex-direction: column;
    align-items: flex-end;
    .icon-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      position: absolute;
      left: 26px;
      top: 23px;
      z-index: 5;

      .icon-item {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
    .mask-title {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
      color: #fff;
      text-overflow: ellipsis;
      font-size: 12px;
      font-weight: 500;
      line-height: 16px; /* 133.333% */
      height: 32px;
      width: 144px;
      margin-bottom: 16px;
    }
    .line-style {
      width: 40px;
      height: 1px;
      background: #fff;
      margin-bottom: 6px;
    }
    .mask-description {
      width: 144px;
      height: 30px;
      text-align: right;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
      color: #999;
      text-align: right;
      text-overflow: ellipsis;
      font-size: 8px;
      font-weight: 300;
      line-height: 10px; /* 133.333% */
      margin-bottom: 8px;
    }

    // 价格和 Token 按钮
    .price-token-btn {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -29px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 70px;
      padding: 4px 16px;
      width: fit-content;
      z-index: 5;

      .price-text {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 18px;
        line-height: 28px;
        color: #262626;
      }

      .token-text {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #262626;
      }
    }
    .mask-line {
      position: absolute;
      width: 100%;
      left: 0px;
      top: -2px;
      display: flex;
      align-items: center;
      .line-left {
        width: 16px;
        height: 1.26px;
        background: #fa9819;
      }
      .line-right {
        flex-grow: 1;
        height: 5px;
        background: #fa9819;
      }
      .num-style {
        background: url(/src/assets/imgs/personal/Intersect.svg) no-repeat center center;
        width: 39.104px;
        height: 34.256px;
        position: absolute;
        left: 12px;
        top: -13.9px;
        font-weight: 700;
        font-size: 18px;
        line-height: 27px;
        padding: 4px 4px 4px 8px;
        color: #fa9819;
        z-index: 2;
      }
      .num-bg {
        position: absolute;
        left: 20px;
        top: -11px;
        background: #3d3d3d;
        padding-left: 9px;
        border-radius: 4px;
        width: 26px;
        height: 24px;
        line-height: 27px;
        color: #fa9819;
        font-weight: 700;
        z-index: 1;
      }
      .members-style {
        position: absolute;
        right: 10px;
        width: 120px;
        display: flex;
        justify-content: end;
        gap: 6px;
        .member-item {
          width: 28px;
          height: 28px;
          border: 3px solid var(--theme-color, #fa9819);
          border-radius: 50%;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
}

.cnt-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-name {
  color: #262626;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  justify-content: center;
}

.info-p {
  font-size: 13px;
  line-height: 24px;
}

.info-domain {
  font-size: 12px;
  line-height: 20px;
  color: #737373;
  display: block;
  text-align: center;
}

.info-follow-wrap {
  display: flex;
  align-items: center;
  line-height: 24px;
  font-size: 12px;
  gap: 10px;
  .val-text {
    font-size: 18px;
    line-height: 28px;
    color: #262626;
    font-weight: 700;
    margin-right: 8px;
  }
}

.info-follow-btn-wrap {
  width: 100%;

  :deep(.el-button) {
    font-size: 12px;
  }
}

.info-web-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}

.info-web-item {
  font-weight: 400;
  cursor: pointer;
  color: #007be5;
  font-size: 13px;
}

.cnt-list-item-info-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 8px;
  gap: 10px;
}

.cnt-list-item-info {
  flex: 1;
  min-width: 0;

  .name {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #ffffff;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cnt-item-description {
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    font-size: 8px;
    line-height: 10px;
    color: #999999;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  .cnt-item-price {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 4px;

    .cnt-item-token {
      font-size: 8px;
      color: #999999;
    }
  }

  .author {
    font-size: 11px;
    line-height: 16px;
    color: #00000080;
  }
}

.cnt-list-item-follow-wrap {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 11px;
  color: #00000080;
  flex-shrink: 0;
}

.edit-input {
  margin-left: -11px;

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

.empty-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 60px 20px;
  min-height: 300px;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.empty-icon {
  font-size: 80px;
  color: #999999;
}

.empty-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #999999;
  text-align: center;
  margin: 0;
  margin-bottom: 20px;
}

.empty-btn {
  background: #fa9819;
  border: none;
  border-radius: 8px;
  height: 40px;
  padding: 7px 20px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  cursor: pointer;
  min-width: 200px;

  &:hover {
    background: #fa9819;
    opacity: 0.9;
  }
}
.head-site-name-wrap {
  width: 180px;
  height: 40px;
  position: absolute;
  bottom: 50px;
  right: 60px;
  font-size: 40px;
  color: #fff;
  z-index: 1;
  display: flex;
  img {
    width: 100%;
    height: 100%;
  }
}
.head-edit-btn-wrap {
  position: absolute;
  width: 40px;
  height: 40px;
  bottom: 50px;
  right: 10px;
  z-index: 1;
  cursor: pointer;
}
.order-list {
  width: 100%;
  .order-list-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 13px;
    padding: 16px;
    &:hover {
      box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.19);
    }
    .order-list-item-info {
      display: flex;
      .img-wrap {
        width: 100px;
        height: 100px;
        border-radius: 13px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .info-wrap {
        margin-left: 16px;
      }
    }
    .order-list-item-operator {
      width: auto;
    }
  }
}
.authentication-style {
  // position: absolute;
  // right: -20px;
  // top: 0px;
  color: #007be5;
}
.license-content {
  display: flex;
  align-items: center; // 改为 flex-start 而不是 center
  flex-wrap: wrap;
  margin: 16px 0;
  font-size: 14px;
  white-space: pre-wrap; // 保留空格和换行
  :deep(a) {
    color: #007be5;
  }
}
</style>
