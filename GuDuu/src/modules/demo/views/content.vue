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
			<cl-search-key placeholder="搜索内容" />
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

<script lang="ts" name="demo-content" setup>
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: '名称',
			prop: 'name',
			required: true,
			component: {
				name: 'el-input'
			}
		},
		{
			label: '内容',
			prop: 'content',
			required: true,
			component: {
				name: 'cl-editor',
				props: {
					name: 'cl-editor-wang'
				}
			}
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: '名称', prop: 'name', minWidth: 200 },
		{ label: '内容', prop: 'content', showOverflowTooltip: true, minWidth: 200 },
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
		service: service.demo.content
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
