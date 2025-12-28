<template>
  <cl-crud ref="Crud">
    <cl-row>
      <cl-refresh-btn />
      <cl-multi-delete-btn />
      <cl-flex1 />
      <cl-search ref="Search" />
      <el-button type="primary" @click="openGenerate">{{ t("生成兑换码") }}</el-button>
    </cl-row>

    <cl-row>
      <cl-table ref="Table">
        <!-- 使用类型列插槽 -->
        <template #column-useType="{ scope }">
          <el-select
            v-model="scope.row.useType"
            @change="changeUseType($event, scope.row.id)"
            :empty-values="[null]"
          >
            <el-option value="" :label="t('无')" />
            <el-option value="营销" :label="t('营销')" />
            <el-option value="销售" :label="t('销售')" />
          </el-select>
        </template>
        <!-- 备注列插槽 -->
        <template #column-memo="{ scope }">
          <el-input
            v-model="scope.row.memo"
            size="small"
            :placeholder="t('点击编辑备注')"
            @blur="saveMemo(scope.row)"
            clearable
          />
        </template>
        <template #column-names="{ scope }">{{ scope.row.name }}</template>
      </cl-table>
    </cl-row>

    <cl-row>
      <cl-flex1 />
      <cl-pagination />
    </cl-row>

    <cl-upsert ref="Upsert" />

    <!-- 生成兑换码弹窗 -->
    <el-dialog v-model="showGenerateDialog" :title="t('生成兑换码')">
      <el-form ref="generateFormRef" :model="generateForm" label-width="100px">
        <el-form-item :label="t('类型')" required>
          <el-select
            v-model="generateForm.type"
            :placeholder="t('请选择类型')"
            @change="onTypeChange"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('天数')" required v-if="generateForm.type < 80">
          <el-input-number v-model="generateForm.days" :min="1" />
        </el-form-item>
        <el-form-item :label="t('生成数量')" required>
          <el-input-number v-model="generateForm.num" :min="1" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showGenerateDialog = false">{{ t("取消") }}</el-button>
        <el-button type="primary" @click="doGenerate">{{ t("生成") }}</el-button>
      </template>
    </el-dialog>
  </cl-crud>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service, message } = useCool();
const { t } = useI18n();

// 公共 typeOptions
const typeOptions = [
  { label: t("User Monthly Plan"), value: 10, days: 7, tokens: 0 },
  { label: t("User Quarterly Plan"), value: 11, days: 7, tokens: 0 },
  { label: t("User Annual Plan"), value: 12, days: 7, tokens: 0 },
  { label: t("Creator Monthly Plan"), value: 13, days: 7, tokens: 0 },
  { label: t("Creator Annual Plan"), value: 14, days: 7, tokens: 0 },
  { label: t("Participant NFT"), value: 15, days: 7, tokens: 0 },
  { label: t("Guardian NFT"), value: 16, days: 7, tokens: 0 },
  { label: t("Investor NFT"), value: 17, days: 7, tokens: 0 },
  { label: t("600 Tokens"), value: 81, days: 0, tokens: 600 },
  { label: t("1500 Tokens"), value: 82, days: 0, tokens: 1500 },
  { label: t("20000 Tokens"), value: 83, days: 0, tokens: 20000 },
];

// CRUD 初始化
const Crud = useCrud({ service: service.base.coupon }, (app) => {
  app.refresh();
});

// 搜索配置
const Search = useSearch({
  items: [
    {
      label: t("类型"),
      prop: "type",
      component: {
        name: "el-select",
        options: typeOptions.map((o) => ({ label: o.label, value: o.value })),
        props: { clearable: true, placeholder: t("请选择类型") },
      },
    },
    {
      label: t("状态"),
      prop: "status",
      component: {
        name: "el-select",
        options: [
          { label: t("未兑换"), value: 0 },
          { label: t("已兑换"), value: 1 },
          { label: t("已过期"), value: 2 },
        ],
        props: { clearable: true, placeholder: t("请选择状态") },
      },
    },
    {
      label: t("兑换码"),
      prop: "code",
      component: {
        name: "el-input",
        props: { clearable: true, placeholder: t("请输入兑换码") },
      },
    },
  ],
});

// 表格配置
const Table = useTable({
  columns: [
    { type: "selection" },
    { label: t("兑换码"), prop: "code", minWidth: 200 },
    {
      label: t("类型"),
      prop: "type",
      minWidth: 160,
      //dict: typeOptions.map((o) => ({ label: o.label, value: o.value })),
      formatter: (row) => {
        const item = typeOptions.find((i) => i.value === row.type);
        if (row.type < 80) {
          return t("{days}天{label}试用", { days: row.days, label: item?.label || "" });
        } else {
          return item?.label || "";
        }
      },
    },
    { label: t("天数"), prop: "days", minWidth: 100 },
    { label: t("Tokens"), prop: "tokens", minWidth: 120 },
    {
      label: t("状态"),
      prop: "status",
      minWidth: 120,
      dict: [
        { label: t("未兑换"), value: 0 },
        { label: t("已兑换"), value: 1 },
        { label: t("已过期"), value: 2 },
      ],
    },
    {
      label: t("生成方式"),
      prop: "generateType",
      minWidth: 120,
      dict: [
        { label: t("后台"), value: 0 },
        { label: t("活动"), value: 1 },
      ],
    },
    { label: t("用户ID"), prop: "userId", minWidth: 120 },
    {
      label: t("兑换时间"),
      prop: "redeemTime",
      minWidth: 180,
      component: { name: "cl-date-text" },
    },
    {
      label: t("使用类型"),
      prop: "useType",
      minWidth: 120,
    },
    {
      label: t("备注"),
      prop: "memo",
      minWidth: 120,
    },
  ],
});

// Upsert 配置
const Upsert = useUpsert({
  items: [
    {
      label: t("兑换码"),
      prop: "code",
      component: { name: "el-input" },
      span: 24,
      required: true,
    },
    {
      label: t("类型"),
      prop: "type",
      component: { name: "el-select", options: typeOptions },
      span: 24,
      required: true,
    },
  ],
});

// 生成兑换码弹窗
const showGenerateDialog = ref(false);
const generateFormRef = ref();

// 表单初始值
const defaultForm = {
  type: 10,
  num: 1,
  days: 0,
  tokens: 0,
};

// 表单数据
const generateForm = reactive({ ...defaultForm });

// 重置表单
function resetGenerateForm() {
  Object.assign(generateForm, defaultForm);
}

function onTypeChange(val: number) {
  const opt = typeOptions.find((o) => o.value === val);
  if (opt) {
    generateForm.days = opt.days;
    generateForm.tokens = opt.tokens;
  }
}

function openGenerate() {
  resetGenerateForm();
  onTypeChange(generateForm.type);
  showGenerateDialog.value = true;
}

async function doGenerate() {
  try {
    await service.base.coupon.generate({
      type: generateForm.type,
      days: generateForm.days,
      tokens: generateForm.tokens,
      num: generateForm.num,
    });
    showGenerateDialog.value = false;
    Crud.value?.refresh();
  } catch (err) {
    console.error("生成失败:", err);
  }
}

async function saveMemo(row: any) {
    await service.base.coupon.update({ id: row.id, memo: row.memo });
}

const changeUseType=async (e,id)=>{
    await service.base.coupon.update({ id, useType: e });
}
</script>
