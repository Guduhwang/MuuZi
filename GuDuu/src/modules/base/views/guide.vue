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
	name: "base-guide",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
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
			span: 24, // 独占一行
			required: true,
		},
		{
			label: t("类型"),
			prop: "type",
			value: 0, // 默认文章
			component: {
				name: "el-select",
				options: [
					{ label: t("文章"), value: 0 },
					{ label: t("视频"), value: 1 },
				],
				props: { clearable: true, placeholder: t("请选择类型"), "empty-values": [null, undefined] },
			},
			span: 24, // 独占一行
			required: true,
		},
		{
			label: "URL",
			prop: "url",
			component: { name: "el-input", props: { clearable: true, placeholder: t("请输入文章地址") } },
			span: 24,
			hidden: ({ scope }) => scope.type !== 0,
		},
		{
			label: t("内容"),
			prop: "content",
			component: { name: "cl-editor-wang", props: { height: 100 } },
			span: 24,

			hidden: ({ scope }) => scope.type !== 0,
		},
		{
			label: t("视频"),
			prop: "video",
			component: { name: "el-input", props: { clearable: true, placeholder: t("请输入视频地址") } },
			span: 24, // 独占一行
			required: true,
			// 视频显示，文章隐藏
			hidden: ({ scope }) => scope.type !== 1,
		},
		{
			label: t("视频封面"),
			prop: "videoCover",
			component: { name: "cl-upload", props: {} },
			span: 24, // 独占一行
			required: true,
			// 视频显示，文章隐藏
			hidden: ({ scope }) => scope.type !== 1,
		},
		{
			label: t("封面"),
			prop: "cover",
			component: { name: "cl-upload", props: {} },
			span: 24, // 独占一行
			required: true,
			// 视频显示，文章隐藏
			hidden: ({ scope }) => scope.type !== 0,
		},
		{
			label: t("排序"),
			prop: "sort",
			value: 0, // 默认值 0
			component: { name: "el-input-number", props: { min: 0 } },
			span: 24,
			required: true,
		},
	],
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: t("标题"), prop: "title", minWidth: 120 },
		{
			label: t("类型"),
			prop: "type",
			minWidth: 120,
			dict: [
				{ label: t("文章"), value: 0 },
				{ label: t("视频"), value: 1 },
			],
		},
		{ label: t("内容"), prop: "content", minWidth: 120 },
		{ label: t("视频"), prop: "video", minWidth: 120 },
		{ label: t("视频封面"), prop: "videoCover", minWidth: 120 },
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
		service: service.base.guide,
	},
	(app) => {
		app.refresh();
	},
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}
</script>
