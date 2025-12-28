<template>
  <div class="metrics-info" :class="{ 'live-mode-metrics': isShowLive }">
    <div class="metrics-info-wrap">
      <div class="metrics-info-item">
        <div class="metrics-info-item-value">{{ totalMetrics.totalViews }}</div>
        <div class="metrics-info-item-title">Total Views</div>
      </div>
      <div class="metrics-info-item-line"></div>
      <div class="metrics-info-item">
        <div class="metrics-info-item-value">{{ totalMetrics.totalPurchases }}</div>
        <div class="metrics-info-item-title">Total Purchases</div>
      </div>
      <div class="metrics-info-item-line"></div>
      <div class="metrics-info-item">
        <div class="metrics-info-item-value">{{ totalMetrics.totalTokens }}</div>
        <div class="metrics-info-item-title">Total Tokens</div>
      </div>
      <div class="metrics-info-item-line"></div>
      <div class="metrics-info-item">
        <div class="metrics-info-item-value">${{ formatAmount(totalMetrics.totalEarned) }}</div>
        <div class="metrics-info-item-title">Total Earned</div>
      </div>
      <div class="btn-wrap">
        <el-button class="w-[320px] h-[40px]" disabled v-if="!isShowLive" type="primary">Claim Rewards</el-button>
        <el-button class="w-[100px] h-[40px]" disabled v-else type="primary">Claim Rewards</el-button>
      </div>
    </div>
    <div class="metrics-commission-table">
      <div class="personalHomepage-team-item commission-details">
        <div class="item-head">
          <div class="item-head-title">
            <div class="item-head-title-text">Commission Details</div>
          </div>
        </div>
        <div class="">
          <cl-crud ref="Crud">
            <cl-table ref="Table" :border="false">
              <!-- Purchases 列插槽 -->
              <template #column-goods="{ scope }">
                <div class="purchases-cell">
                  <div class="purchases-img">
                    <img
                      v-if="scope.row.goods.workflowId && scope.row.goods.workflowInfo"
                      :src="(scope.row.goods.workflowInfo as { avatar?: string }).avatar"
                      alt=""
                    />
                    <img
                      v-else-if="
                        scope.row.goods.groupId && scope.row.goods.groupInfo && scope.row.goods.groupInfo.group
                      "
                      :src="scope.row.goods.groupInfo.group.avatar"
                      alt=""
                    />
                    <img v-else :src="scope.row.goods.mainPic" alt="" />
                  </div>
                  <div class="purchases-title">{{ scope.row.goods.title }}</div>
                </div>
              </template>
              <!-- Buyer 列插槽 -->
              <template #column-buyer="{ scope }">
                <div class="buyer-cell">
                  <div class="buyer-avatar">
                    <img v-if="scope.row.buyer?.avatar" :src="scope.row.buyer.avatar" alt="" />
                    <DefaultAvatar v-else />
                  </div>
                  <div class="buyer-name">{{ scope.row.buyer?.name || '-' }}</div>
                </div>
              </template>
            </cl-table>
            <cl-row>
              <cl-flex1 />
              <cl-pagination />
            </cl-row>
          </cl-crud>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
import { onMounted, ref, watch } from 'vue';
import { useCool } from '/@/cool';
import DefaultAvatar from '../../components/default-avatar/DefaultAvatar.vue';
import { formatAmount } from '/@/utils';
import type { TTotalMetrics } from '../../types/user.type';
import './css/metrics.scss';

const props = defineProps<{
  totalMetrics: TTotalMetrics;
  soldOrderList: Eps.OrderInfoEntity[];
  isShowLive: boolean;
}>();

const { service } = useCool();

// 扩展 GoodsInfoEntity 类型，添加 groupInfo 和 workflowInfo 属性
type WorkflowInfoItem = {
  id?: string | number;
  avatar?: string;
  token?: number;
  tokens?: number;
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

type WorkflowInfoType =
  | {
      avatar?: string;
      token?: number;
      tokens?: number;
      [key: string]: unknown;
    }
  | WorkflowInfoItem[];

type GoodsInfoWithGroup = Eps.GoodsInfoEntity & {
  groupInfo?: GroupInfoType;
  workflowInfo?: WorkflowInfoType;
  backgroundColor?: string;
};

// 扩展 OrderInfoEntity 类型，让 goods 字段包含 groupInfo 和 workflowInfo
type OrderInfoWithGroupInfo = Omit<Eps.OrderInfoEntity, 'goods'> & {
  goods: GoodsInfoWithGroup;
};

// 处理订单数据，查询 goods 的 groupInfo 和 workflowInfo
const processedOrderList = ref<OrderInfoWithGroupInfo[]>([]);

// 计算单个商品的 Token 总数
function getItemTokens(item: GoodsInfoWithGroup): number {
  // 如果有 workflowInfo，获取 workflowInfo.token
  if (item.workflowId && item.workflowInfo) {
    const workflowInfo = item.workflowInfo as { token?: number; tokens?: number; [key: string]: unknown };
    return Number(workflowInfo.token || workflowInfo.tokens || 0);
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

// 格式化时间
function formatTime(time: string | number | Date | undefined): string {
  if (!time) return '-';
  const date = new Date(time);
  return date
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');
}

// 处理订单列表数据
async function processOrderList() {
  if (!props.soldOrderList?.length) {
    processedOrderList.value = [];
    return;
  }

  const ordersWithInfo = await Promise.all(
    props.soldOrderList.map(async (item: Eps.OrderInfoEntity) => {
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

  processedOrderList.value = ordersWithInfo;
}

// cl-crud 配置
const Crud = useCrud(
  {
    service: {
      page: async (params: { page?: number; size?: number }) => {
        await processOrderList();
        return {
          list: processedOrderList.value,
          pagination: {
            total: processedOrderList.value.length,
            page: params.page || 1,
            size: params.size || 10,
          },
        };
      },
    },
  },
  (app) => {
    app.refresh();
  },
);

// cl-table 配置
const Table = useTable({
  autoHeight: false,
  columns: [
    {
      label: 'Purchases',
      prop: 'goods',
      minWidth: 300,
    },
    {
      label: 'Time',
      prop: 'createTime',
      minWidth: 320,
      formatter(row: OrderInfoWithGroupInfo) {
        return formatTime(row.createTime);
      },
    },
    {
      label: 'Buyer',
      prop: 'buyer',
      minWidth: 300,
    },
    {
      label: 'Tokens',
      prop: 'tokens',
      minWidth: 240,
      align: 'right',
      formatter(row: OrderInfoWithGroupInfo) {
        const tokens = getItemTokens(row.goods);
        return tokens > 0 ? tokens.toLocaleString() : '0';
      },
    },
    {
      label: 'Commission',
      prop: 'commission',
      minWidth: 240,
      align: 'right',
      formatter(row: OrderInfoWithGroupInfo) {
        // 佣金可能是 payAmount 或其他字段，根据实际数据结构调整
        const commission = row.payAmount || row.goods.price || 0;
        return `$${formatAmount(commission)}`;
      },
    },
  ],
});

// 监听 soldOrderList 变化
watch(
  () => props.soldOrderList,
  () => {
    processOrderList().then(() => {
      Crud.value?.refresh();
    });
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  processOrderList();
});
</script>
