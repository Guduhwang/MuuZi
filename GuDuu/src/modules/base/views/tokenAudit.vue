<template>
  <!-- 搜索栏 -->
  <cl-row>
    <!-- 用户选择 -->
    <cl-select
      :options="userOptions"
      prop="userId"
      :placeholder="t('选择用户')"
      :width="240"
      filterable
      remote
      :remote-method="remoteUserSearch"
      v-model="search.userId"
    />

    <!-- 时间范围 -->
    <el-date-picker
      v-model="search.dateRange"
      type="daterange"
      :range-separator="t('至')"
      :start-placeholder="t('开始日期')"
      :end-placeholder="t('结束日期')"
      value-format="YYYY-MM-DD"
      style="margin-left: 10px"
    />

    <!-- 搜索按钮 -->
    <el-button type="primary" style="margin-left: 10px" @click="onSearch">{{ t("搜索") }}</el-button>
  </cl-row>

  <cl-crud ref="Crud">
    <!-- 批量操作按钮 -->
    <cl-row style="margin: 10px 0">
      <el-button type="success" @click="batchSetWithdrawable">{{ t("批量设为可提现") }}</el-button>
    </cl-row>

    <!-- 表格 -->
    <cl-row>
      <cl-table
        ref="Table"
        :columns="columns"
        :data="tableData"
        @selection-change="onSelectionChange"
      />
    </cl-row>

    <!-- 总计 -->
    <cl-row style="margin-top: 10px; font-weight: bold;">
      <span>{{ t("合计 token 数：{count}", { count: totalToken }) }}</span>
    </cl-row>
  </cl-crud>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service } = useCool();
const { t } = useI18n();
const Crud = ref();

// 搜索条件
const search = reactive({
  userId: null,
  dateRange: [],
});

// 用户下拉选项
const userOptions = ref<any[]>([]);
const userLoading = ref(false);

// 表格数据
const tableData = ref<any[]>([]);
const selectedRows = ref<any[]>([]);

// 表格列
const columns = [
  { type: "selection", width: 60 },
  { label: "ID", prop: "id", width: 80 },
  { label: t("使用者"), prop: "operatorName", width: 100 },
  { label: t("收益token数"), prop: "token", width: 100 },
  { label: t("应用名称"), prop: "appName" },
  { label: t("创作者"), prop: "ownerName" },
  { label: t("可提现状态"), prop: "withdrawableStatus" },
  { label: t("创建时间"), prop: "createTime" },
];

// 总 token 数计算
const totalToken = computed(() => tableData.value.reduce((sum, item) => sum + (item.token || 0), 0));

// 远程搜索用户
async function remoteUserSearch(keyword: string) {
  if (!keyword) {
    userOptions.value = [];
    return;
  }
  userLoading.value = true;
  try {
    const list = await service.base.sys.user.list({
      keyWord: keyword,
      page: 1,
      pageSize: 200,
      type: 0,
    });
    userOptions.value = list.map((u: any) => ({ label: `${u.nickName}`, value: u.id }));
  } finally {
    userLoading.value = false;
  }
}

// 搜索按钮触发
async function onSearch() {
  if (!search.userId) {
    ElMessage.warning(t("请先选择用户"));
    return;
  }
  if (!search.dateRange || search.dateRange.length !== 2) {
    ElMessage.warning(t("请先选择时间范围"));
    return;
  }

  await loadTable();
}

// 表格数据加载
async function loadTable() {
  const params: any = {
    userId: search.userId,
    startTime: search.dateRange[0],
    endTime: search.dateRange[1],
  };
  const list = await service.base.tokenLog.auditList(params);
  tableData.value = list;
}

// 表格勾选
function onSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

// 批量设为可提现
async function batchSetWithdrawable() {
  if (!selectedRows.value.length) {
    ElMessage.warning(t("请至少选择一条记录"));
    return;
  }
  const ids = selectedRows.value.map((r) => r.id);
  const userId = search.userId;

  await service.base.tokenLog.batchSetWithdrawable({ ids, userId });
  ElMessage.success(t("操作成功"));
  loadTable();
}
</script>
