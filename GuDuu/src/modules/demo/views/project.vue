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
			<cl-search-key placeholder="搜索关键字" />
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

<script lang="ts" name="demo-project" setup>
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useDict } from '/$/dict';

const { dict } = useDict();
const { service } = useCool();

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
			component: {
				name: 'el-select',
				options: dict.get('category')
			}
		},
		{ label: '图片', prop: 'image', component: { name: 'cl-upload' } },
		{ label: 'LOGO', prop: 'logo', component: { name: 'cl-upload' } },
		{
			label: '介绍',
			prop: 'memo',
			component: { name: 'el-input', props: { type: 'textarea', rows: 4 } }
		},
		{ label: '链接', prop: 'link', component: { name: 'el-input', props: { clearable: true } } }
	]
});

// cl-table
const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: '名称', prop: 'name', minWidth: 140 },
		{ label: '分类', prop: 'category', minWidth: 140 },
		{
			label: '图片',
			prop: 'image',
			minWidth: 100,
			component: { name: 'cl-image', props: { size: 60 } }
		},
		{
			label: 'lOGO',
			prop: 'logo',
			minWidth: 60,
			component: { name: 'cl-image', props: { size: 60 } }
		},
		{ label: '介绍', prop: 'memo', showOverflowTooltip: true, minWidth: 200 },
		{ label: '链接', prop: 'link', minWidth: 140 },
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc',
			component: { name: 'cl-date-text' }
		},
		{
			label: '更新时间',
			prop: 'updateTime',
			minWidth: 170,
			sortable: 'custom',
			component: { name: 'cl-date-text' }
		},
		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: service.demo.project
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
