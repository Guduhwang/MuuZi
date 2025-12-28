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
  name: "base-ads",
});

import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service } = useCool();
const { t } = useI18n();

// cl-upsert
const Upsert = useUpsert({
  items: [
    {
      label: t("标题"),
      prop: "title",
      component: { name: "el-input", props: { clearable: true } },
      span: 24,
      required: true,
    },
    {
      label: t("副标题"),
      prop: "subTitle",
      component: { name: "el-input", props: { clearable: true } },
      span: 24,
    },
    {
      label: t("图片"),
      prop: "image",
      component: {
        name: "cl-upload",
        props: {
          limit: 1,
          type: "image",
        },
      },
      span: 24,
      required: true,
    },
    {
      label: t("链接"),
      prop: "url",
      component: { name: "el-input", props: { clearable: true } },
      span: 24,
    },
  ],
});

// cl-table
const Table = useTable({
  columns: [
    { type: "selection" },
    { label: t("标题"), prop: "title", minWidth: 150 },
    { label: t("副标题"), prop: "subTitle", minWidth: 150 },
    {
      label: t("图片"),
      prop: "image",
      minWidth: 120,
      component: {
        name: "cl-image",
        props: { size: 50, preview: true },
      },
    },
    { label: t("链接"), prop: "url", minWidth: 200 },
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



// cl-crud
const Crud = useCrud(
  {
    service: service.base.ads,
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
