<template>
  <cl-crud ref="Crud">
    <cl-row>
      <cl-refresh-btn />
      <cl-flex1 />
      <cl-search ref="Search" />
    </cl-row>

    <cl-row>
      <cl-table ref="Table">
        <template #column-withdrawRemark="{ scope }">
          <el-input
            v-model="scope.row.withdrawRemark"
            size="small"
            :placeholder="t('点击编辑备注')"
            @blur="saveRemark(scope.row)"
            @focus="handleFocus"
            clearable
            style="width: 100%"
          />
        </template>
        <template #column-accountType="{ scope }">
          <el-tag v-if="scope.row.accountType === 2" type="success">{{ t("支付宝") }}</el-tag>
          <el-tag v-else-if="scope.row.accountType === 1" type="warning">{{ t("PayPal") }}</el-tag>
          <span v-else>-</span>
        </template>
      </cl-table>
    </cl-row>

    <cl-row>
      <cl-flex1 />
      <cl-pagination />
    </cl-row>
  </cl-crud>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useCrud, useTable, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service, message } = useCool();
const { t } = useI18n();

// CRUD 初始化
const Crud = useCrud(
  {
    service: service.base.withdraw,
  },
  (app) => {
    app.refresh();
  }
);

// 搜索配置
const Search = useSearch({
  items: [
    {
      label: t("用户名称"),
      prop: "keyWord",
      component: {
        name: "el-input",
        props: { clearable: true, placeholder: t("请输入用户名称") },
      },
    },
    {
      label: t("提现状态"),
      prop: "status",
      component: {
        name: "el-select",
        options: [
          { label: t("待提现"), value: 0 },
          { label: t("提现成功"), value: 1 },
          { label: t("提现失败"), value: 2 },
        ],
        props: { clearable: true, placeholder: t("请选择状态") },
      },
    },
  ],
});

// 表格配置
const Table = useTable({
  columns: [
    { type: "selection" },
    {
      label: t("用户名称"),
      prop: "userName",
      minWidth: 150,
      formatter: (row) => {
        return row.userNickName || row.userName || "-";
      },
    },
    {
      label: t("账号姓名"),
      prop: "accountName",
      minWidth: 150,
      formatter: (row) => {
        return row.accountName || "-";
      },
    },
    {
      label: t("提现账号"),
      prop: "accountNumber",
      minWidth: 200,
      formatter: (row) => {
        return row.accountNumber || "-";
      },
    },
    {
      label: t("提现方式"),
      prop: "accountType",
      minWidth: 120,
    },
    {
      label: t("申请时间"),
      prop: "createTime",
      minWidth: 180,
      component: { name: "cl-date-text" },
    },
    {
      label: t("提现状态"),
      prop: "status",
      minWidth: 120,
      dict: [
        { label: t("待提现"), value: 0 },
        { label: t("提现成功"), value: 1 },
        { label: t("提现失败"), value: 2 },
      ],
    },
    {
      label: t("备注"),
      prop: "withdrawRemark",
      minWidth: 200,
    },
    {
      label: t("操作"),
      type: "op",
      width: 150,
      buttons: [
        {
          label: t("已提现"),
          type: "success",
          size: "small",
          disabled: true,
          show: (row) => row.status === 1,
        },
        {
          label: t("提现失败"),
          type: "danger",
          size: "small",
          disabled: true,
          show: (row) => row.status === 2,
        },
      ],
    },
  ],
  pagination: {
    pageSize: 20,
  },
});

// 处理输入框聚焦
function handleFocus(event: FocusEvent) {
  const target = event.target as HTMLInputElement;
  if (target) {
    target.select();
  }
}

// 保存备注
async function saveRemark(row: any) {
  try {
    await service.base.withdraw.addRemark({
      id: row.id,
      withdrawRemark: row.withdrawRemark || "",
    });
    message.success(t("备注保存成功"));
  } catch (err) {
    console.error("保存备注失败:", err);
    message.error(t("备注保存失败"));
  }
}

// 更新提现状态
async function updateStatus(id: number, status: number) {
  try {
    await service.base.withdraw.updateStatus({ id, status });
    message.success(t("状态更新成功"));
    Crud.value?.refresh();
  } catch (err) {
    console.error("更新状态失败:", err);
    message.error(t("状态更新失败"));
  }
}
</script>
