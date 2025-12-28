<template>
  <ElDialog
    :modelValue="show"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <template #header>
      <div class="">
        <div class="balance-dialog-title mb-[24px]">Account Balance</div>
        <div class="balance-dialog-info">
          <div class="w-1/2 flex items-center">
            <div class="info-item mr-[16px]">
              <div class="info-item-value">
                ≈ 0
                <span class="info-item-value-unit">USD</span>
              </div>
              <div class="info-item-title">≈ 0 USD pending</div>
            </div>
            <el-button type="primary">Withdraw</el-button>
          </div>
          <div class="balance-dialog-info-right">
            <div class="">Asset Breakdown</div>
            <div class="balance-list">
              <div class="">
                <div class="font-semibold">0</div>
                <div class="text-[#999]">≈ 0 USD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="shadow-2xl p-[16px] rounded-lg">
      <div class="balance-dialog-title text-[#333] mb-[16px]">Transaction History</div>
      <cl-crud ref="Crud">
        <cl-row class="flex justify-between">
          <cl-search ref="Search" />
          <el-button type="primary">Export</el-button>
        </cl-row>
        <div class="mb-[16px]">
          <div class="text-[#333] font-semibold mb-[16px]">0 Results</div>
          <el-alert title="Info alert" type="info" show-icon>
            <template #title>
              <div class="flex items-center">
                <!-- <IMdiHelpCircle /> -->
                <div class="">
                  To check the breakdown of your Commission income, please go to
                  <el-button @click="emit('openCommissionDialog')" type="primary" link>Commission</el-button>.
                </div>
              </div>
            </template>
          </el-alert>
        </div>
        <cl-table ref="Table" />
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
import { useBase } from '/$/base';

const { service } = useCool();
const { app } = useBase();

const width = app.isShowLive ? '700px' : '60%';

const Table = useTable({
  autoHeight: false,
  columns: [
    {
      label: 'Date',
      prop: 'date',
      minWidth: 120,
    },
    {
      label: 'Type',
      prop: 'type',
      minWidth: 120,
    },
    {
      label: 'Asset',
      prop: 'asset',
      minWidth: 120,
    },
    {
      label: 'InboundAmount',
      prop: 'inboundAmount',
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
    {
      label: 'Type',
      prop: 'type',
      labelWidth: '100%',
      component: {
        name: 'el-select',
        props: {
          clearable: true,
          onChange(status) {
            Crud.value?.refresh({ status, page: 1 });
          },
        },
      },
      options: [
        {
          label: 'All',
          value: '',
        },
      ],
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
