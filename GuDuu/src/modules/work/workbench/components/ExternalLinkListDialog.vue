<template>
  <el-dialog
    v-model="dialogVisible"
    title="Sales Configuration List"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="external-link-list-wrap">
      <el-table :data="tableData" :style="{ width: '100%' }" v-loading="loading">
        <el-table-column prop="avatar" label="Avatar" width="120">
          <template #default="scope">
            <el-avatar :size="30" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="nickName" label="Name" width="120" />
        <el-table-column prop="code" label="Code" width="150" />
        <el-table-column label="Share Link" width="350">
          <template #default="scope">
            <div class="share-link-cell">
              <span class="share-link-text">{{ getShareLink(scope.row.code) }}</span>
              <el-button size="small" type="primary" link @click="copyShareLink(scope.row.code)"> Copy </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="Count" width="100" />
        <el-table-column prop="usedCount" label="Used Count" width="120" />
        <el-table-column prop="expireTime" label="Expire Time" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.expireTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="Create Time" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="Actions" width="280" fixed="right">
          <template #default="scope">
            <!-- <el-button class="operation-button" size="small" @click="handleEdit(scope.row)">Edit</el-button> -->
            <el-button size="small" plain @click="handleDelete(scope.row)" type="danger">Delete</el-button>
            <el-button size="small" type="primary" @click="handleExport(scope.row)">Export</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <NoData tip="No sales configuration yet" />
        </template>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <!-- 编辑弹窗 -->
    <ExternalLinkDialog v-model:show="showEditDialog" :edit-data="editData" @success="handleEditSuccess" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';
import dayjs from 'dayjs';
import NoData from '/@/modules/work/components/no-data/NoData.vue';
import ExternalLinkDialog from './ExternalLinkDialog.vue';
import { export_json_to_excel } from '/#/excel/utils';

defineOptions({
  name: 'ExternalLinkListDialog',
});

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const { service } = useCool();

const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

// 批次数据类型定义
interface BatchItem {
  id: number;
  code: string;
}

interface BatchData {
  batCode: number | string | bigint;
  nickName: string;
  avatar: string;
  desktopId: number;
  groupId: number;
  memberId: number;
  userId: number;
  count: number;
  usedCount: number;
  expireTime: string | null;
  guideCover: string;
  guideTitle: string;
  guideType: number;
  guideContent: string;
  chatBackground: string;
  createTime: string;
  updateTime: string;
  tenantId: number | null;
  items: BatchItem[];
}

// 表格显示的数据类型（公共信息 + items[0]）
interface TableRowData {
  avatar: string;
  nickName: string;
  code: string;
  count: number;
  usedCount: number;
  expireTime: string | null;
  createTime: string;
  batCode: number | string | bigint;
  // 保存完整的批次数据引用，用于导出
  _batchData?: BatchData;
}

const loading = ref(false);
const tableData = ref<TableRowData[]>([]);
// 存储批次数据，key 为 batCode，value 为完整的批次对象
const batchDataMap = ref<Record<string, BatchData>>({});
const showEditDialog = ref(false);
const editData = ref<Eps.ExternalLinkEntity | undefined>(undefined);

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 监听弹窗打开，加载数据
watch(
  () => props.show,
  async (val) => {
    if (val) {
      await loadData();
    } else {
      tableData.value = [];
      batchDataMap.value = {};
      pagination.value = {
        page: 1,
        pageSize: 20,
        total: 0,
      };
    }
  },
);

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const data = await service.base.externalLink.list({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    //   {
    //   "list": [
    //     {
    //       "batCode": 1765878579099,
    //       "nickName": "张三",
    //       "avatar": "https://example.com/avatar.jpg",
    //       "desktopId": 118,
    //       "groupId": 224,
    //       "memberId": 547,
    //       "userId": 222,
    //       "count": 9,
    //       "usedCount": 0,
    //       "expireTime": null,
    //       "guideCover": "",
    //       "guideTitle": "",
    //       "guideType": 0,
    //       "guideContent": "",
    //       "chatBackground": "https://oss.guduu.co/app%2Fbase%2Fb907ba0770c542108b5d6ca8924e3da9_20251215-105554.jpg",
    //       "createTime": "2025-12-16 17:49:39",
    //       "updateTime": "2025-12-16 17:49:39",
    //       "tenantId": null,
    //       "items": [
    //         {
    //           "id": 1,
    //           "code": "HPR1Wh0sn4"
    //         },
    //         {
    //           "id": 2,
    //           "code": "PI2qeuizRZ"
    //         },
    //         {
    //           "id": 3,
    //           "code": "eA4EQdaV_2"
    //         }
    //       ]
    //     }
    //   ],
    //   "pagination": {
    //     "page": 1,
    //     "pageSize": 20,
    //     "total": 5
    //   }
    // }

    // 处理新的批次数据结构 { list: [...], pagination: {...} }
    if (data && typeof data === 'object' && 'list' in data) {
      const responseData = data as {
        list?: BatchData[];
        pagination?: { page?: number; pageSize?: number; total?: number };
      };
      const batchList = responseData.list || [];
      const displayData: TableRowData[] = [];

      batchList.forEach((batchData) => {
        // 存储批次数据，确保 batCode 转换为字符串
        const batCode = String(batchData.batCode);
        batchDataMap.value[batCode] = batchData;

        // 表格显示 items 中的第一条数据（公共信息 + items[0]）
        if (batchData.items && batchData.items.length > 0) {
          const firstItem = batchData.items[0];
          displayData.push({
            avatar: batchData.avatar,
            nickName: batchData.nickName,
            code: firstItem.code,
            count: batchData.count,
            usedCount: batchData.usedCount,
            expireTime: batchData.expireTime,
            createTime: batchData.createTime,
            batCode: batchData.batCode,
            _batchData: batchData, // 保存完整批次数据引用
          });
        }
      });

      tableData.value = displayData;
      pagination.value.total = responseData.pagination?.total || batchList.length;
    } else if (Array.isArray(data)) {
      // 兼容旧的数据结构（数组）
      tableData.value = data as TableRowData[];
      pagination.value.total = data.length;
    } else {
      tableData.value = [];
      pagination.value.total = 0;
    }
  } catch (error: unknown) {
    console.error('Failed to load external link list:', error);
    ElMessage.error((error as { message?: string })?.message || 'Failed to load data');
  } finally {
    loading.value = false;
  }
}

// 格式化时间
function formatTime(time: string | Date | null | undefined): string {
  if (!time) return '-';
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false;
}

// 分页大小变化
function handleSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  loadData();
}

// 页码变化
function handlePageChange(page: number) {
  pagination.value.page = page;
  loadData();
}

// 编辑
function handleEdit(row: TableRowData) {
  // 从批次数据中获取完整信息用于编辑
  const batCode = String(row.batCode);
  const batchData = batchDataMap.value[batCode] || row._batchData;

  if (batchData && batchData.items && batchData.items.length > 0) {
    // 使用第一条 item 的数据进行编辑
    const firstItem = batchData.items[0];
    editData.value = {
      id: firstItem.id,
      code: firstItem.code,
      batCode: batchData.batCode,
      count: batchData.count,
      usedCount: batchData.usedCount,
      expireTime: batchData.expireTime,
      guideCover: batchData.guideCover,
      guideTitle: batchData.guideTitle,
      guideType: batchData.guideType,
      guideContent: batchData.guideContent,
      chatBackground: batchData.chatBackground,
      createTime: batchData.createTime,
      updateTime: batchData.updateTime,
    } as Eps.ExternalLinkEntity;
    showEditDialog.value = true;
  } else {
    ElMessage.warning('Cannot edit: batch data not found');
  }
}

// 编辑成功回调
function handleEditSuccess() {
  showEditDialog.value = false;
  editData.value = undefined;
  loadData();
}

// 删除
async function handleDelete(row: TableRowData) {
  try {
    await ElMessageBox.confirm('Are you sure to delete this configuration?', 'Tips', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });

    // 从批次数据中获取第一条 item 的 id 进行删除
    const batCode = String(row.batCode);
    const batchData = batchDataMap.value[batCode] || row._batchData;

    if (batchData && batchData.items && batchData.items.length > 0) {
      const firstItem = batchData.items[0];
      await service.base.externalLink.delete({ id: firstItem.id });
      ElMessage.success('Deleted successfully');
      await loadData();
    } else {
      ElMessage.warning('Cannot delete: batch data not found');
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error((error as { message?: string })?.message || 'Failed to delete');
    }
  }
}

// 获取分享链接
function getShareLink(code: string | undefined): string {
  if (!code) return '';
  const origin = window.location.origin;
  return `${origin}/share/${code}`;
}

// 复制分享链接
async function copyShareLink(code: string | undefined) {
  if (!code) return;
  const link = getShareLink(code);
  try {
    await navigator.clipboard.writeText(link);
    ElMessage.success('Link copied to clipboard');
  } catch (err: unknown) {
    ElMessage.error('Failed to copy link');
  }
}

// 导出批次数据到 Excel
function handleExport(row: TableRowData) {
  // 优先使用行数据中保存的批次数据引用
  let batchData: BatchData | undefined = row._batchData;

  // 如果没有引用，则从 batchDataMap 中查找
  if (!batchData) {
    const batCode = String(row.batCode);
    batchData = batchDataMap.value[batCode];
  }

  if (!batchData || !batchData.items || batchData.items.length === 0) {
    ElMessage.warning('No data to export');
    return;
  }

  try {
    // 准备表头
    const header = ['Name', 'Code', 'Share Link', 'Count', 'Used Count', 'Expire Time', 'Create Time'];

    // 准备数据：公共信息 + 每个 item 的组合
    const exportData = batchData.items.map((item: BatchItem) => [
      batchData.nickName || '', // Name
      item.code || '', // Code
      getShareLink(item.code), // Share Link
      batchData.count || 0, // Count
      batchData.usedCount || 0, // Used Count
      formatTime(batchData.expireTime), // Expire Time
      formatTime(batchData.createTime), // Create Time
    ]);

    // 导出 Excel
    const batCode = String(batchData.batCode);
    export_json_to_excel({
      header,
      data: exportData,
      filename: `external-link-batch-${batCode}`,
      autoWidth: true,
      bookType: 'xlsx',
    });

    ElMessage.success(`Exported ${batchData.items.length} items successfully`);
  } catch (error: unknown) {
    console.error('Failed to export data:', error);
    ElMessage.error((error as { message?: string })?.message || 'Failed to export data');
  }
}
</script>

<style lang="scss" scoped>
.external-link-list-wrap {
  min-height: 300px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.share-link-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .share-link-text {
    flex: 1;
    word-break: break-all;
    color: #409eff;
    font-size: 12px;
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
