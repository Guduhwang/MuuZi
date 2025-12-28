<template>
  <div class="credits-container">
    <div class="topup-history">
      <div class="topup-title">Credit History‌</div>
      <div class="history-list">
        <div class="history-header">
          <!-- <div class="col operatorUser">operatorUser</div> -->
          <div class="col type">Type</div>
          <div class="col credits">Credits</div>
          <div class="col time">Time</div>
        </div>
        <div v-if="historyItems.length > 0" class="history-body">
          <div class="history-row" v-for="item in historyItems" :key="item.id">
            <!-- <div class="col operatorUser">{{ item.operatorName }}</div> -->
            <div class="col type">{{ getCateg(item.type) }}</div>
            <div class="col credits">{{ formatNumber(item.token) }}</div>
            <div class="col time">{{ item.updateTime }}</div>
          </div>
        </div>
        <div v-else class="mt-[24px]">
          <NoData tip="No top-up history‌ yet" />
        </div>
      </div>

      <!-- 分页组件 -->
      <div v-if="total > pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          small
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NoData from '/@/modules/work/components/no-data/NoData.vue';
import { onMounted, ref } from 'vue';
import { formatAmount } from '/@/utils';
import { router, service } from '/@/cool';

const historyItems = ref<Array<{ id: number; operatorName: string; type: number; token: number; updateTime: string }>>(
  [],
);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取token日志
const getTokenLog = async () => {
  const res = await service.base.tokenLog.myList({
    page: currentPage.value,
    pageSize: pageSize.value,
  });
  historyItems.value = res.list;
  total.value = res.pagination.total || 0;
};

// 页面大小改变
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  getTokenLog();
};

// 当前页改变
const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  getTokenLog();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const getCateg = (type: number) => {
  //  0 执行工作流扣除 1创作者收益 2平台扣除 3团员分成 4平台小部件收益 5平台插件收益 8充值
  if (type === 0) {
    return 'Workflow Execution Charge';
  } else if (type === 1) {
    return 'Creator Revenue';
  } else if (type === 2) {
    return 'Platform Fee';
  } else if (type === 3) {
    return 'Team Member Share';
  } else if (type === 4) {
    return 'Widget Revenue';
  } else if (type === 5) {
    return 'Plugin Revenue';
  } else if (type === 8) {
    return 'Top-up';
  }
};

const formatNumber = (num: number) => {
  return num.toFixed(2);
};

onMounted(() => {
  getTokenLog();
});
</script>
<style scoped lang="scss">
.credits-container {
  height: 606px;
  padding: 40px;
  background-color: #fff;
}
.topup-history {
  margin-top: 16px;
  .topup-title {
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
    color: #262626;
  }
  .history-list {
    margin-top: 12px;
    .history-header,
    .history-row {
      padding: 0 20px;
      display: flex;
      align-items: center;
      height: 42px;
      line-height: 42px;
      color: #262626;
      border-radius: 8px;
    }
    .history-header {
      font-weight: 600;
      font-size: 18px;
      background: #f3f3f3;
    }
    .history-body {
      height: 390px;
      background: rgba(248, 248, 248, 1);
      overflow-y: auto;
      // 设置滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(38, 38, 38, 0.1);
        border-radius: 10px;
      }
    }
    .history-row {
      font-size: 16px;
      &:hover {
        background: #fff;
      }
    }
    .col {
      padding: 0 8px;
      box-sizing: border-box;
    }
    .col.operatorUser {
      width: 200px;
      text-align: left;
    }
    .col.type {
      width: 350px;
      text-align: left;
      padding-right: 16px;
    }
    .col.credits {
      width: 200px;
      text-align: right;
      padding-right: 16px;
    }
    .col.time {
      width: 200px;
      text-align: left;
      padding-right: 16px;
    }
  }

  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    padding: 0 20px;
  }
}
</style>
