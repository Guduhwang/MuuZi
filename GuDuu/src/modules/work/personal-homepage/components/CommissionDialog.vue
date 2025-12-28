<template>
  <ElDialog
    :modelValue="show"
    width="60%"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <template #header>
      <div class="">
        <div class="balance-dialog-title mb-[16px]">Commissions</div>
        <div class="balance-dialog-info">
          <el-tabs v-model="activeName" class="demo-tabs">
            <el-tab-pane label="Platform commission" name="first"></el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </template>

    <div class="shadow-2xl p-[16px] rounded-lg">
      <cl-crud ref="Crud">
        <cl-row class="flex justify-between">
          <cl-search ref="Search" />
          <el-button type="primary">Export</el-button>
        </cl-row>
        <div class="mb-[16px]">
          <div class="text-[#333] font-semibold mb-[16px] text-[16px]">Overview</div>
          <cl-table ref="OverviewTable" />
        </div>
        <div class="mb-[16px]">
          <div class="text-[#333] font-semibold mb-[16px] text-[16px] flex items-center">
            Commission Details
            <div class="text-[12px] font-normal text-[#999] ml-[16px]">0 Results</div>
          </div>
          <cl-table ref="DetailsTable" />
        </div>
      </cl-crud>
    </div>
    <template #footer>
      <el-button @click="emit('update:show', false)">Close</el-button>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCrud, useTable, useUpsert, useSearch } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const activeName = ref('first');

const OverviewTable = useTable({
  autoHeight: false,
  columns: [
    {
      label: 'Source Type',
      prop: 'sourceType',
      minWidth: 120,
    },
    {
      label: 'My Commissions',
      prop: 'myCommissions',
      minWidth: 120,
    },
    {
      label: 'Trading Volume(Taker)',
      prop: 'tradingVolumeTaker',
      minWidth: 120,
    },
    {
      label: 'Trading Volume(Maker)',
      prop: 'tradingVolumeMaker',
      minWidth: 120,
    },
    {
      label: 'OutboundAmount',
      prop: 'outboundAmount',
      minWidth: 120,
    },
  ],
});
const Crud = useCrud({
  service: service.base.sys.menu,
  async onRefresh(params, { next }) {
    const res = await next(params);
    return res;
  },
});
const Search = useSearch({
  inline: true,
  items: [
    {
      label: 'Commission Status',
      prop: 'commissionStatus',
      component: {
        name: 'cl-select-button',
        props: {
          small: true,
        },
        options: [
          {
            label: 'Settled',
            value: 1,
          },
          {
            label: 'Pending',
            value: 0,
          },
        ],
      },
    },
    {
      label: 'Coin',
      prop: 'coin',
      component: {
        name: 'el-select',
        props: {
          clearable: true,
          onChange(status) {
            Crud.value?.refresh({ status, page: 1 });
          },
        },
        options: [
          {
            label: 'All',
            value: '',
          },
        ],
      },
    },
    {
      label: 'Date Range',
      prop: 'daterange',
      component: {
        name: 'el-date-picker',
        props: {
          clearable: true,
          type: 'daterange',
          valueFormat: 'YYYY-MM-DD',
          startPlaceholder: 'Start Date',
          endPlaceholder: 'End Date',
        },
      },
    },
  ],
});
const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'openCommissionDialog'): void;
}>();

defineOptions({
  name: 'BalanceDialog',
});
</script>

<style scoped lang="scss">
.balance-dialog-title {
  font-size: 26px;
  font-weight: 600;
}
.balance-dialog-info {
  display: flex;
  justify-content: space-between;
}
</style>
