<template>
	<cl-form ref="Form">
		<template #slot-spec>
			<cl-crud padding="0">
				<cl-row>
					<el-button type="success" @click="add">添加规格</el-button>
					<el-button
						:disabled="Table?.selection.length == 0"
						type="danger"
						@click="remove()"
						>删除</el-button
					>
				</cl-row>

				<cl-row>
					<cl-table ref="Table" :data="data" :auto-height="false">
						<template #column-images="{ scope }">
							<cl-upload
								small
								:size="40"
								draggable
								multiple
								v-model="scope.row.images"
								@change="onChange(scope.row)"
							/>
						</template>

						<template #column-name="{ scope }">
							<el-form-item
								:prop="`spec.${scope.$index}.name`"
								:rules="{
									required: true,
									message: '名称不能为空'
								}"
							>
								<el-input
									v-model="scope.row.name"
									clearable
									placeholder="请输入名称"
									@change="onChange(scope.row)"
								/>
							</el-form-item>
						</template>

						<template #column-price="{ scope }">
							<el-form-item
								:prop="`spec.${scope.$index}.price`"
								:rules="{
									required: true,
									message: '价格不能为空'
								}"
							>
								<el-input-number
									v-model="scope.row.price"
									:min="0.01"
									:max="100000"
									:precision="2"
									:controls="false"
									placeholder="价格"
									@change="onChange(scope.row)"
								/>
							</el-form-item>
						</template>

						<template #column-stock="{ scope }">
							<el-form-item>
								<el-input-number
									v-model="scope.row.stock"
									:min="0"
									:max="100000"
									:precision="0"
									:controls="false"
									placeholder="库存"
									@change="onChange(scope.row)"
								/>
							</el-form-item>
						</template>

						<template #column-sortNum="{ scope }">
							<el-form-item>
								<el-input-number
									v-model="scope.row.sortNum"
									:min="0"
									:max="100000"
									:precision="0"
									:controls="false"
									placeholder="排序"
								/>
							</el-form-item>
						</template>

						<template #slot-btn="{ scope }">
							<el-icon class="del-btn" @click="remove(scope.row.uid)">
								<delete />
							</el-icon>
						</template>
					</cl-table>
				</cl-row>
			</cl-crud>
		</template>
	</cl-form>
</template>

<script lang="ts" setup name="goods-spec">
import { useForm, useTable } from "@cool-vue/crud";
import { computed, ref } from "vue";
import { useCool } from "/@/cool";
import { ElMessage } from "element-plus";
import { isEmpty, orderBy } from "lodash-es";
import { Delete } from "@element-plus/icons-vue";
import { uuid } from "/@/cool/utils";

const { service } = useCool();
const Form = useForm();

// 规格列表
const list = ref<Eps.GoodsSpecEntity[]>([]);

// 表格数据
const data = computed(() => {
	return list.value.filter((e) => !e.isDel);
});

// 以详情方式打开
async function openById(id: number) {
	const data = await service.goods.info.info({ id });

	if (data) {
		open(data);
	}
}

// 打开
async function open(info: Eps.GoodsInfoEntity) {
	await refresh(info.id!);

	Form.value?.open({
		title: "编辑规格",
		form: {
			spec: list.value
		},
		width: "70%",
		items: [
			{
				prop: "spec",
				component: {
					name: "slot-spec"
				}
			}
		],
		on: {
			submit(_, { close, done }) {
				const delIds: number[] = [];
				const add: Eps.GoodsSpecEntity[] = [];
				const update: Eps.GoodsSpecEntity[] = [];

				list.value.forEach((e) => {
					if (e.id) {
						if (e.isDel) {
							delIds.push(e.id);
						}

						if (e.isEdit) {
							update.push(e);
						}
					} else {
						if (!e.isDel) {
							add.push(e);
						}
					}
				});

				const arr: Promise<any>[] = [];

				// 要删除的
				if (!isEmpty(delIds)) {
					arr.push(service.goods.spec.delete({ ids: delIds }));
				}

				// 要更新的
				if (!isEmpty(update)) {
					arr.push(
						...update.map((e) => {
							return service.goods.spec.update(e);
						})
					);
				}

				// 要添加的
				if (!isEmpty(add)) {
					arr.push(
						service.goods.spec.add(
							add.map((e) => {
								return {
									...e,
									goodsId: info.id
								};
							})
						)
					);
				}

				Promise.all(arr)
					.then(() => {
						ElMessage.success("保存成功");
						close();
					})
					.catch((err) => {
						ElMessage.error(err.message);
						refresh(info.id!);
						done();
					});
			}
		}
	});
}

// 刷新
async function refresh(goodsId: number) {
	await service.goods.spec.list({ goodsId, order: "sortNum", sort: "desc" }).then((res) => {
		list.value = res.map((e) => {
			return {
				...e,
				price: Number(e.price),
				uid: e.id
			};
		});
	});
}

// 添加
function add() {
	list.value.push({
		uid: uuid(),
		name: "",
		images: []
	});
}

// 移除
function remove(uid?: string) {
	const arr = uid ? [uid] : Table.value?.selection.map((e) => e.uid);

	list.value.forEach((e) => {
		if (arr?.includes(e.uid)) {
			e.isDel = true;
		}
	});
}

// 输入改变
function onChange(item: Eps.GoodsSpecEntity, prop?: string) {
	item.isEdit = true;

	// 排序改变
	if (prop == "sortNum") {
		list.value = orderBy(list.value, "sortNum", "desc");
	}
}

const Table = useTable({
	columns: [
		{
			type: "selection"
		},
		{
			label: "名称",
			prop: "name",
			minWidth: 200,
			align: "left"
		},
		{
			label: "图片",
			prop: "images",
			minWidth: 160,
			align: "left"
		},
		{
			label: "价格",
			prop: "price",
			minWidth: 140,
			align: "left"
		},
		{
			label: "库存",
			prop: "stock",
			minWidth: 120,
			align: "left"
		},
		{
			label: "排序",
			prop: "sortNum",
			minWidth: 120,
			align: "left"
		},
		{
			type: "op",
			width: 80,
			buttons: ["slot-btn"]
		}
	]
});

defineExpose({
	open,
	openById
});
</script>

<style lang="scss" scoped>
.el-form-item {
	margin-bottom: 0;
}

.del-btn {
	cursor: pointer;

	&:hover {
		color: red;
	}
}
</style>
