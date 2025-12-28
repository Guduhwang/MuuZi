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
			<!-- 关键字搜索 -->
			<cl-search-key placeholder="搜索appKey、appSecret" />
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

<script lang="ts" name="demo-keys" setup>
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { reactive, ref, onMounted } from 'vue';

const { service } = useCool();
const nameOptions = ref([
	{ label: '忏悔墙', value: '忏悔墙' },
	{ label: '祝福墙', value: '祝福墙' },
	{ label: '漂流瓶', value: '漂流瓶' }
]);

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: '名称',
			prop: 'name',
			component: { name: 'el-input', props: { clearable: true } },
			required: true
		},
		{
			label: '分类',
			prop: 'category',
			component: { name: 'el-select', options: nameOptions },
			required: true
		},
		{
			label: 'appKey',
			prop: 'appKey',
			component: { name: 'el-input', props: { clearable: true } },
			required: true
		},
		{
			label: 'appSecret',
			prop: 'appSecret',
			component: { name: 'el-input', props: { clearable: true } },
			required: true
		},
		{
			label: 'accessToken',
			prop: 'accessToken',
			component: { name: 'el-input', props: { clearable: true } },
			required: true
		},
		{
			label: 'accessSecret',
			prop: 'accessSecret',
			component: { name: 'el-input', props: { clearable: true } },
			required: true
		},
		{
			label: '序号',
			prop: 'sort',
			component: { name: 'el-input-number' },
			required: true
		},
		{
			label: '备注',
			prop: 'memo',
			component: { name: 'el-input', props: { clearable: true } },
			required: false
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: '名称', prop: 'name', minWidth: 140 },
		{ label: '分类', prop: 'name', minWidth: 140 },
		{ label: '备注', prop: 'memo', minWidth: 140 },
		{ label: '序号', prop: 'sort', minWidth: 140 },
		{ label: 'appKey', prop: 'appKey', minWidth: 140 },
		{ label: 'appSecret', prop: 'appSecret', minWidth: 140 },
		{ label: 'accessToken', prop: 'accessToken', minWidth: 140 },
		{ label: 'accessSecret', prop: 'accessSecret', minWidth: 140 },
		{
			label: '更新时间',
			prop: 'updateTime',
			minWidth: 170,
			sortable: 'custom',
			component: { name: 'cl-date-text' }
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc',
			component: { name: 'cl-date-text' }
		},
		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: service.demo.keys
	},
	app => {
		app.refresh();
	}
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}
</script>
