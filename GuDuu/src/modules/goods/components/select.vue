<template>
	<div class="goods-select__inner">
		<template v-if="multiple">
			<div class="btns">
				<el-button type="success" @click="open">添加</el-button>
				<el-button
					type="danger"
					:disabled="refs.table?.selection.length == 0"
					@click="remove"
					>移除</el-button
				>
			</div>

			<cl-crud padding="0">
				<cl-table :data="data" :ref="setRefs('table')" :auto-height="false" />

				<cl-row type="flex" align="middle" justify="end" :style="{ marginTop: '10px' }">
					<el-pagination
						v-model:current-page="pager.page"
						:page-size="pager.size"
						:total="list.length"
						background
						layout="total, prev, pager, next, jumper"
					/>
				</cl-row>
			</cl-crud>
		</template>

		<template v-else>
			<slot>
				<div class="goods" @click="open">
					<template v-if="data[0]">
						<cl-avatar :size="24" :src="data[0].mainPic"></cl-avatar>
						<span>{{ data[0].name }}</span>

						<el-icon @click.stop="remove">
							<circle-close />
						</el-icon>
					</template>

					<span class="placeholder" v-else>请选择商品</span>
				</div>
			</slot>
		</template>
	</div>

	<cl-dialog v-model="visible" width="1200px" title="选择商品">
		<cl-crud ref="Crud" padding="0">
			<cl-row>
				<!-- 刷新按钮 -->
				<cl-refresh-btn />

				<!-- 全选 -->
				<el-button type="primary" @click="selectAll" v-if="multiple">全选</el-button>

				<cl-filter label="分类">
					<cl-select
						tree
						:options="options.type"
						prop="typeId"
						all-levels-id
						:width="140"
					/>
				</cl-filter>

				<cl-filter label="状态">
					<cl-select :options="options.status" prop="status" :width="140" />
				</cl-filter>

				<cl-flex1 />
				<!-- 关键字搜索 -->
				<cl-search-key placeholder="搜索标题" />
			</cl-row>

			<cl-row>
				<!-- 数据表格 -->
				<cl-table ref="Table" :auto-height="false" @selection-change="onSelectionChange">
					<template #column-check="{ scope }">
						<el-button type="success" disabled v-if="selection[0]?.id == scope.row.id"
							>已选</el-button
						>
						<el-button @click="select(scope.row)" v-else>选择</el-button>
					</template>
				</cl-table>
			</cl-row>

			<cl-row>
				<span v-if="multiple">已选 {{ selection.length }} 件</span>
				<cl-flex1 />
				<!-- 分页控件 -->
				<cl-pagination />
			</cl-row>
		</cl-crud>

		<template #footer>
			<el-button @click="close">取消</el-button>
			<el-button
				type="success"
				:disabled="isEmpty(selection)"
				@click="select()"
				v-if="multiple"
				>选择</el-button
			>
		</template>
	</cl-dialog>
</template>

<script lang="ts" setup name="goods-select">
import { useCrud, useForm, useTable } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { type PropType, computed, nextTick, reactive, ref, watch } from "vue";
import { cloneDeep, isEmpty } from "lodash-es";
import { CircleClose } from "@element-plus/icons-vue";
import type { Dict } from "/$/dict/types";
import { deepTree } from "/@/cool/utils";

// 替换你的类型
type Item = Eps.GoodsInfoEntity;

const props = defineProps({
	modelValue: {
		type: Array as PropType<Item[]>,
		default: () => []
	},
	isDisabled: Boolean,
	prop: String,
	scope: null,
	disabled: Boolean,

	// 是否多选
	multiple: {
		type: Boolean,
		default: true
	}
});

const emit = defineEmits(["update:modelValue", "change"]);

const { service, refs, setRefs } = useCool();

// 上级表单
const Form = useForm();

// 选项
const options = reactive({
	status: [
		{
			label: "启用",
			value: 1,
			type: "success"
		},
		{
			label: "禁用",
			value: 0,
			type: "danger"
		}
	],
	type: [] as Dict.Item[]
});

// cl-table
const Table = useTable({
	contextMenu: [],
	columns: [
		props.multiple
			? {
					type: "selection",
					width: 60,
					reserveSelection: true
			  }
			: {
					label: "操作",
					prop: "check",
					width: 100
			  },
		{ label: "分类", prop: "typeId", minWidth: 160, dict: computed(() => options.type) },
		{ label: "标题", prop: "title", minWidth: 240 },
		{
			label: "主图",
			prop: "mainPic",
			minWidth: 100,
			component: { name: "cl-image", props: { size: 50 } }
		},
		{
			label: "示例图",
			prop: "pics",
			minWidth: 100,
			component: { name: "cl-image", props: { size: 50 } }
		},
		{ label: "价格", prop: "price", minWidth: 100, sortable: "custom" },
		{ label: "已售", prop: "sold", minWidth: 100, sortable: "custom" },
		{ label: "排序", prop: "sortNum", minWidth: 100, sortable: "desc" },
		{
			label: "状态",
			prop: "status",
			minWidth: 100,
			dict: options.status
		},
		{
			label: "创建时间",
			prop: "createTime",
			sortable: "desc",
			minWidth: 160
		}
	]
});

// cl-crud
const Crud = useCrud({
	service: service.goods.info,
	async onRefresh(params, { next }) {
		const res = await next(params);

		// 添加已加载列表的 id
		loadIds.value.push(...res.list.map((e) => e.id));

		// 数据反选
		selection.value.forEach((e) => {
			const d = Table.value?.data.find((a) => a.id == e.id);

			if (d) {
				Table.value?.toggleRowSelection(d, true);
			}
		});
	}
});

// 刷新
async function refresh(params?: any) {
	return Crud.value?.refresh(params);
}

// 弹窗是否可见
const visible = ref(false);

// 已选的数据列表，双向绑定用
const list = ref<Item[]>([]);

// 已选列表
const selection = ref<any[]>([]);

// 分页
const pager = reactive({
	page: 1,
	size: 10
});

// 分页数据
const data = computed(() => {
	const { page, size } = pager;
	return list.value.slice((page - 1) * size, page * size);
});

// 已加载列表的 id
const loadIds = ref<number[]>([]);

// 监听已选列表
function onSelectionChange(arr: Item[]) {
	// 已加载的
	const ids = Array.from(new Set(loadIds.value));

	// 过滤掉已加载的，再加上已选的
	selection.value = selection.value.filter((e) => !ids.includes(e.id!)).concat(...arr);
}

// 打开选择弹窗
function open() {
	visible.value = true;

	// 清空数据
	loadIds.value = [];

	// 设置已选
	selection.value = cloneDeep(list.value);

	nextTick(() => {
		// 获取分类
		service.goods.type.list().then((res) => {
			res.forEach((e) => {
				e.label = e.name;
				e.value = e.id;
			});

			options.type = deepTree(res);
		});

		refresh({
			size: 10
		});
	});
}

// 关闭选择弹窗
function close() {
	visible.value = false;
}

// 选择
function select(item?: Item) {
	// 单选不触发 onSelectionChange 手动设置
	if (item) {
		selection.value = [item];
	}

	list.value = cloneDeep(selection.value || []);

	close();
}

// 全选
async function selectAll() {
	// 全部数据
	await Crud.value?.refresh({ page: 1, size: 10000 }).then((res) => {
		list.value = res.list;
	});

	// 当前页数据
	// list.value = Table.value?.data || [];

	close();
}

// 移除
function remove() {
	const ids = selection.value.map((e) => e.id);

	list.value = list.value.filter((e) => {
		// 清空选择状态
		refs.table?.toggleRowSelection(e, false);

		// 移除已选的
		return !ids.find((id) => id == e.id);
	});
}

// 监听已选列表，返回 ids/id
watch(
	list,
	(arr = []) => {
		const ids = arr.map((e) => e.id);

		if (props.multiple) {
			emit("update:modelValue", ids);
			emit("change", ids);
		} else {
			emit("update:modelValue", ids[0]);
			emit("change", ids[0]);
		}

		Form.value?.validateField(props.prop);
	},
	{
		deep: true
	}
);

defineExpose({
	remove,
	select,
	selectAll,
	open
});
</script>

<style lang="scss" scoped>
.goods-select__inner {
	.btns {
		margin-bottom: 10px;
	}
}
</style>
