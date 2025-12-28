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
	name: "base-message",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive } from "vue";

const { service } = useCool();
const { t } = useI18n();

// 选项
const options = reactive({
	type: [
		{ label: t("文本"), value: 0 },
		{ label: t("图片"), value: 1 },
		{ label: t("语音"), value: 2 },
		{ label: t("视频"), value: 3 },
	],
});

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: t("选择发送者"),
			prop: "fromId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择接收者（私聊为用户id，群聊为群组id）"),
			prop: "toId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("接收者类型"),
			prop: "toType",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("消息类型"),
			prop: "type",
			component: { name: "el-radio-group", options: options.type },
			value: 0,
			required: true,
		},
		{
			label: t("消息内容"),
			prop: "content",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("状态"),
			prop: "status",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("@信息（用户ID列表）"),
			prop: "at",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
	],
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: t("昵称"), prop: "toNickname", minWidth: 120 },
		{ label: t("昵称"), prop: "fromNickname", minWidth: 120 },
		{ label: t("发送者ID"), prop: "fromId", minWidth: 120 },
		{
			label: t("接收者ID（私聊为用户ID，群聊为群组ID）"),
			prop: "toId",
			minWidth: 120,
		},
		{ label: t("接收者类型"), prop: "toType", minWidth: 120 },
		{
			label: t("消息类型"),
			prop: "type",
			minWidth: 120,
			dict: options.type,
		},
		{ label: t("消息内容"), prop: "content", minWidth: 120 },
		{ label: t("状态"), prop: "status", minWidth: 120 },
		{ label: t("@信息（用户ID列表）"), prop: "at", minWidth: 120 },
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
		service: service.base.message,
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
