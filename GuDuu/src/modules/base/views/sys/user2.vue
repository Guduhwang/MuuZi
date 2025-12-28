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
	name: "base-sys-user3",
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
			label: t("选择部门"),
			prop: "departmentId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("姓名"),
			prop: "name",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("用户名"),
			prop: "username",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("密码"),
			prop: "password",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("密码版本,"),
			prop: "passwordV",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("昵称"),
			prop: "nickName",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("头像"),
			prop: "avatar",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("手机"),
			prop: "phone",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("邮箱"),
			prop: "email",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("备注"),
			prop: "remark",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("邀请码"),
			prop: "inviteCode",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("关注数"),
			prop: "followCount",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("粉丝数"),
			prop: "fansCount",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("标签"),
			prop: "tags",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("验证码"),
			prop: "code",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("用户类型"),
			prop: "type",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("配置"),
			prop: "config",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择所有者"),
			prop: "ownerId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择行业"),
			prop: "industryId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("是否在线"),
			prop: "online",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("用户KEY"),
			prop: "key",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择邀请者"),
			prop: "inviteId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t(
				"封面图(针对工作流是封面图，针对真人是个人主页的背景图1520*240)",
			),
			prop: "cover",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("喜欢人数"),
			prop: "like",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择喜欢的工作流"),
			prop: "likeIds",
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
			label: t("选择socket"),
			prop: "socketId",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
	],
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: t("部门ID"), prop: "departmentId", minWidth: 120 },
		{ label: t("姓名"), prop: "name", minWidth: 120 },
		{ label: t("用户名"), prop: "username", minWidth: 120 },
		{ label: t("密码"), prop: "password", minWidth: 120 },
		{ label: t("密码版本,"), prop: "passwordV", minWidth: 120 },
		{ label: t("昵称"), prop: "nickName", minWidth: 120 },
		{ label: t("头像"), prop: "avatar", minWidth: 120 },
		{ label: t("手机"), prop: "phone", minWidth: 120 },
		{ label: t("邮箱"), prop: "email", minWidth: 120 },
		{ label: t("备注"), prop: "remark", minWidth: 120 },
		{ label: t("邀请码"), prop: "inviteCode", minWidth: 120 },
		{ label: t("关注数"), prop: "followCount", minWidth: 120 },
		{ label: t("粉丝数"), prop: "fansCount", minWidth: 120 },
		{ label: t("标签"), prop: "tags", minWidth: 120 },
		{ label: t("验证码"), prop: "code", minWidth: 120 },
		{ label: t("用户类型"), prop: "type", minWidth: 120 },
		{ label: t("配置"), prop: "config", minWidth: 120 },
		{ label: t("所有者ID"), prop: "ownerId", minWidth: 120 },
		{ label: t("行业ID"), prop: "industryId", minWidth: 120 },
		{ label: t("是否在线"), prop: "online", minWidth: 120 },
		{ label: t("用户KEY"), prop: "key", minWidth: 120 },
		{ label: t("邀请者ID"), prop: "inviteId", minWidth: 120 },
		{
			label: t(
				"封面图(针对工作流是封面图，针对真人是个人主页的背景图1520*240)",
			),
			prop: "cover",
			minWidth: 120,
		},
		{ label: t("喜欢人数"), prop: "like", minWidth: 120 },
		{ label: t("喜欢的工作流ID"), prop: "likeIds", minWidth: 120 },
		{ label: t("状态"), prop: "status", minWidth: 120 },
		{ label: t("socketId"), prop: "socketId", minWidth: 120 },
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
		service: service.base.sys.user,
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
