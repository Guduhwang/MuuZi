<template>
  <cl-crud ref="Crud">
    <cl-row>
      <!-- 刷新按钮 -->
      <cl-refresh-btn />
      <!-- 新增按钮 -->
      <cl-add-btn />
      <!-- 删除按钮 -->
      <cl-multi-delete-btn />
      <cl-flex1 />
      <!-- 条件搜索 -->
      <cl-search ref="Search" />
    </cl-row>

    <cl-row>
      <!-- 数据表格 -->
      <cl-table ref="Table" />
    </cl-row>

    <cl-row>
      <cl-flex1 />
      <!-- 分页控件 -->
      <cl-pagination />
    </cl-row>

    <!-- 新增、编辑 -->
    <cl-upsert ref="Upsert" />
  </cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
  name: "base-vip",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service } = useCool();
const { t } = useI18n();

const vipType = [
  { label: t("用户会员"), value: 10 },
  { label: t("创作者会员"), value: 11 },
  { label: t("投资人会员"), value: 12 },
];
const options = [
  { label: t("是"), value: 1 },
  { label: t("否"), value: 0 },
];

// cl-upsert
const Upsert = useUpsert({
  items: [
    {
      label: t("名称"),
      prop: "name",
      component: { name: "el-input", props: { clearable: true } },
      span: 12,
      required: true,
    },
    {
      label: t("有效期"),
      prop: "period",
      component: { name: "el-input-number", props: { clearable: true } },
      span: 12,
      required: true,
    },
    {
      label: t("会员类型"),
      prop: "type",
      component: {
        name: "cl-select",
        props: {
          options: vipType,
        },
      },
      span: 12,
      required: true,
    },
    {
      label: t("金额"),
      prop: "amount",
      component: { name: "el-input", props: { clearable: true } },
      span: 6,
      required: true,
    },
    {
      label: t("赠送token"),
      prop: "giftTokenAmount",
      component: { name: "el-input", props: { clearable: true } },
      span: 6,
      required: true,
    },
    {
      label: t("启用支付"),
      prop: "enablePay",
      component: {
        name: "cl-select",
        props: {
          options,
          "empty-values":[null]
        },
      },
      span: 12,
      required: true,
    },
    {
      label: t("使用表单"),
      prop: "useForm",
      component: {
        name: "cl-select",
        props: {
          options,
          "empty-values":[null]
        },
      },
      span: 12,
      required: true,
    },
    {
      label: t("购买链接"),
      prop: "url",
      component: { name: "el-input", props: { clearable: true } },
      span: 24,
      hidden: ({ scope }) => scope.type !== 12,
    },
    {
      label: t("描述"),
      prop: "remark",
      component: { name: "cl-editor-wang", props: {} },
      span: 24,
      required: true,
    },
    {
      label: t("角色"),
      prop: "role",
      component: { name: "el-input-number" },
      span: 12,
      required: true,
    },
    {
      label: t("排序"),
      prop: "sort",
      component: { name: "el-input-number" },
      span: 12,
      required: true,
    },
  ],
});

// cl-table
const Table = useTable({
  columns: [
    { type: "selection" },
    { label: t("名称"), prop: "name", minWidth: 120 },
    { label: t("有效期"), prop: "period", minWidth: 120 },
    { label: t("会员类型"), prop: "type", dict: vipType, minWidth: 120 },
    { label: t("金额"), prop: "amount", minWidth: 120 },
    { label: t("赠送token"), prop: "giftTokenAmount", minWidth: 120 },
    { label: t("启用支付"), prop: "enablePay", dict: options, minWidth: 120 },
    { label: t("使用表单"), prop: "useForm", dict: options, minWidth: 120 },
    { label: t("角色"), prop: "role", minWidth: 120 },
    { label: t("排序"), prop: "sort", minWidth: 120 },
    {
      label: t("创建时间"),
      prop: "createTime",
      minWidth: 170,
      sortable: "desc",
      component: { name: "cl-date-text" },
    },
    {
      label: t("更新时间"),
      prop: "updateTime",
      minWidth: 170,
      sortable: "custom",
      component: { name: "cl-date-text" },
    },
    { type: "op", buttons: ["edit", "delete"] },
  ],
});

// cl-search
const Search = useSearch();

// cl-crud
const Crud = useCrud(
  {
    service: service.base.vip,
  },
  (app) => {
    app.refresh();
  }
);

// 刷新
function refresh(params?: any) {
  Crud.value?.refresh(params);
}
</script>
