<template>
  <cl-crud ref="Crud">
    <!-- 工具栏 -->
    <cl-row>
      <cl-refresh-btn @click="reload" />
      <cl-add-btn />
      <cl-flex1 />
      <cl-search-key v-model="keyword" :placeholder="t('搜索名称')" @search="reload" />
    </cl-row>

    <!-- 分组表格 -->
    <div class="crud-table-full">
      <el-table
        :data="parentRows"
        border
        :row-key="(row) => row.value"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-block">
              <div class="expand-head">
                <el-tag :type="ptTagType(row.value)" effect="light">
                  {{ row.label }}
                </el-tag>
                <span class="ml8">
                  {{ t("共 {count} 项", { count: appsByParent[row.value]?.length || 0 }) }}
                </span>
              </div>

              <el-table
                :data="appsByParent[row.value]"
                border
                size="small"
                style="width: 100%"
                :empty-text="t('暂无数据')"
              >
                <el-table-column :label="t('头像')" width="80">
                  <template #default="{ row: app }">
                    <el-image
                      v-if="avatarSrc(app.avatar)"
                      :src="avatarSrc(app.avatar)"
                      style="
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        object-fit: cover;
                      "
                      :preview-src-list="[avatarSrc(app.avatar)]"
                      hide-on-click-modal
                    />
                    <div v-else class="avatar-fallback">A</div>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="name"
                  :label="t('名称')"
                  min-width="160"
                  show-overflow-tooltip
                />

                <el-table-column :label="t('父类型')" width="120">
                  <template #default="{ row: app }">
                    {{ ptLabel(app.parentType) }}
                  </template>
                </el-table-column>

                <el-table-column :label="t('运行方式')" width="120">
                  <template #default="{ row: app }">
                    <el-tag :type="runModeTagType(app.isAsync)" effect="light">
                      {{ runModeLabel(app.isAsync) }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column prop="type" :label="t('类型')" width="120" />
                <el-table-column
                  prop="remark"
                  :label="t('描述')"
                  min-width="220"
                  show-overflow-tooltip
                />

                <el-table-column :label="t('配置项')" width="80">
                  <template #default="{ row: app }">
                    {{ Array.isArray(app.config) ? app.config.length : 0 }}
                  </template>
                </el-table-column>

                <el-table-column :label="t('授权项')" width="80">
                  <template #default="{ row: app }">
                    {{ Array.isArray(app.auth) ? app.auth.length : 0 }}
                  </template>
                </el-table-column>

                <el-table-column :label="t('是否显示')" width="80">
                  <template #default="{ row: app }">
                    {{ app.show ? t("是") : t("否") }}
                  </template>
                </el-table-column>

                <el-table-column :label="t('操作')" fixed="right" width="160" align="center">
                  <template #default="{ row: app }">
                    <el-button type="primary" link @click="onEdit(app)">{{ t("编辑") }}</el-button>
                    <el-divider direction="vertical" />
                    <el-popconfirm :title="t('确认删除该应用？')" @confirm="onDelete(app)">
                      <template #reference>
                        <el-button type="danger" link>{{ t("删除") }}</el-button>
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('父类型')" prop="label" min-width="200" />
        <el-table-column :label="t('数量')" width="120">
          <template #default="{ row }">
            {{ appsByParent[row.value]?.length || 0 }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Upsert -->
    <cl-upsert ref="Upsert">
      <!-- config 动态编辑 -->
      <template #slot-config="{ scope }">
        <div class="list-wrap">
          <div class="list-head">
            <div class="col col--name">{{ t("字段名") }}</div>
            <div class="col col--display">{{ t("显示名") }}</div>
            <div class="col col--type">{{ t("类型") }}</div>
            <div class="col col--show">{{ t("显示") }}</div>
            <div class="col col--value">{{ t("值") }}</div>
            <div class="col col--op">{{ t("操作") }}</div>
          </div>

          <div
            v-for="(row, idx) in Array.isArray(scope.config) ? scope.config : []"
            :key="idx"
            class="list-row"
          >
            <el-input v-model="row.name" :placeholder="t('字段名')" class="col col--name" />
            <el-input
              v-model="row.display"
              :placeholder="t('显示名')"
              class="col col--display"
            />

            <el-select
              v-model="row.type"
              :placeholder="t('选择类型')"
              class="col col--type"
              @change="onConfigTypeChange(row)"
              filterable
            >
              <el-option
                v-for="opt in CONFIG_TYPE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- 是否显示 -->
            <el-select v-model="row.show" class="col col--show" :placeholder="t('显示')">
              <el-option :label="t('是')" :value="1" />
              <el-option :label="t('否')" :value="0" />
            </el-select>

            <div class="col col--value">
              <el-input
                v-if="row.type === 'select'"
                type="textarea"
                :rows="4"
                :model-value="formatSelectValue(row.value)"
                @update:model-value="(val) => (row.value = val)"
                :placeholder="t('请输入数组示例')"
              />
              <el-input
                v-else-if="row.type === 'param'"
                type="textarea"
                :rows="4"
                v-model="row.value"
                :placeholder="t('请输入值，可为 JSON 或字符串')"
              />
              <el-input v-else v-model="row.value" :placeholder="t('请输入（可为空）')" />
            </div>

            <div class="col col--op">
              <el-button type="danger" link @click="deleteConfigItem(scope, idx)"
                >{{ t("删除") }}</el-button
              >
            </div>
          </div>

          <div class="list-footer">
            <el-button type="primary" link @click="addConfigItem(scope)"
              >+ {{ t("新增配置项") }}</el-button
            >
          </div>
        </div>
      </template>

      <!-- auth 动态编辑 -->
      <template #slot-auth="{ scope }">
        <div class="list-wrap">
          <div class="list-head">
            <div class="col col--name">{{ t("字段名") }}</div>
            <div class="col col--display">{{ t("显示名") }}</div>
            <div class="col col--type">{{ t("类型") }}</div>
            <div class="col col--show"></div>
            <div class="col col--value">{{ t("值") }}</div>
            <div class="col col--op">{{ t("操作") }}</div>
          </div>

          <div
            v-for="(row, idx) in Array.isArray(scope.auth) ? scope.auth : []"
            :key="idx"
            class="list-row"
          >
            <el-input v-model="row.name" :placeholder="t('字段名')" class="col col--name" />
            <el-input
              v-model="row.display"
              :placeholder="t('显示名')"
              class="col col--display"
            />

            <el-select
              v-model="row.type"
              :placeholder="t('类型')"
              class="col col--type"
              filterable
            >
              <el-option :label="t('文本框')" value="input" />
              <el-option :label="t('文本区')" value="textarea" />
              <el-option :label="t('密码')" value="password" />
            </el-select>
            <div class="col col--show" />
            <div class="col col--value">
              <el-input
                v-if="row.type === 'textarea'"
                type="textarea"
                :rows="4"
                v-model="row.value"
                :placeholder="t('请输入（可为空）')"
              />
              <el-input
                v-else-if="row.type === 'password'"
                v-model="row.value"
                show-password
                :placeholder="t('请输入（可为空）')"
              />
              <el-input v-else v-model="row.value" :placeholder="t('请输入（可为空）')" />
            </div>

            <div class="col col--op">
              <el-button type="danger" link @click="deleteAuthItem(scope, idx)"
                >{{ t("删除") }}</el-button
              >
            </div>
          </div>

          <div class="list-footer">
            <el-button type="primary" link @click="addAuthItem(scope)"
              >+ {{ t("新增授权项") }}</el-button
            >
          </div>
        </div>
      </template>
    </cl-upsert>
  </cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: "AppGroupByParent" });

import { ref, computed, onMounted } from "vue";
import { useCrud, useUpsert } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";

const { service, message } = useCool();
const { t } = useI18n();

const PARENT_OPTIONS = [
  { label: t("Workflow"), value: 1 },
  { label: t("Widget"), value: 2 },
  { label: t("Plugin"), value: 3 },
  { label: t("Custom"), value: 4 },
];

const RUN_MODE_OPTIONS = [
  { label: t("同步"), value: 0 },
  { label: t("异步"), value: 1 },
];

const CONFIG_TYPE_OPTIONS = [
  { label: t("输入框"), value: "input" },
  { label: t("多行文本"), value: "textarea" },
  { label: t("密码"), value: "password" },
  { label: t("下拉"), value: "select" },
  { label: t("参数"), value: "param" },
  { label: t("配置包参数"), value: "liblibConfigPackParam" },
];

const Crud = useCrud({ service: service.base.app }, () => {});
const Upsert = useUpsert({
  dialog: { width: "1000px", title: t("应用配置") },
  items: [
    {
      prop: "name",
      label: t("名称"),
      span: 12,
      required: true,
      component: { name: "el-input" },
    },
    {
      prop: "parentType",
      label: t("父类型"),
      span: 12,
      required: true,
      component: { name: "cl-select", props: { options: PARENT_OPTIONS } },
    },
    {
      prop: "type",
      label: t("类型"),
      span: 12,
      required: true,
      component: {
        name: "el-input-number",
        props: { min: 0, step: 1, style: "width:100%;" },
      },
    },
    {
      prop: "isAsync",
      label: t("运行方式"),
      span: 12,
      value: 0,
      required: true,
      component: { name: "cl-select", props: { options: RUN_MODE_OPTIONS } },
      tips: t("同步：前台等待结果；异步：后台执行，稍后查看结果"),
    },
    {
      prop: "tokens",
      label: t("消耗token"),
      span: 12,
      required: true,
      component: {
        name: "el-input-number",
        props: { min: 0, step: 1, style: "width:100%;" },
      },
      hidden: ({ scope }) => scope.parentType === 1,
    },
    {
      prop: "efficiencyCoefficient",
      label: t("效率系数"),
      span: 12,
      required: true,
      component: {
        name: "el-input-number",
        props: { min: 0, step: 1, style: "width:100%;" },
      },
      hidden: ({ scope }) => scope.parentType === 1,
    },
    {
      prop: "remark",
      label: t("描述"),
      span: 24,
      component: { name: "el-input", props: { type: "textarea", rows: 3 } },
    },
    {
      prop: "avatar",
      label: t("头像"),
      span: 12,
      value: "",
      required: true,
      component: { name: "cl-upload", props: { limit: 1, accept: ["image/*"] } },
    },
    {
      prop: "show",
      label: t("是否显示"),
      span: 12,
      required: true,
      component: { name: "cl-switch", props: { activeValue: 1, inactiveValue: 0 } },
    },
    {
      prop: "config",
      label: t("配置（可增删）"),
      span: 24,
      value: [],
      component: { name: "slot-config" },
    },
    {
      prop: "auth",
      label: t("授权（可增删）"),
      span: 24,
      value: [],
      component: { name: "slot-auth" },
    },
  ],
  onInfo(data, { done }) {
    if (data) data.isAsync = normalizeRunMode(data.isAsync);

    if (data?.config && Array.isArray(data.config)) {
      data.config = data.config.map((row: any) => {
        const r = { ...row };
        if (r.type === "param" && r.value !== undefined && r.value !== null) {
          if (typeof r.value === "object") r.value = JSON.stringify(r.value, null, 2);
          else r.value = String(r.value);
        }
        if (r.show !== 0 && r.show !== 1) r.show = 1;
        return r;
      });
    }

    done(data);
  },
  onSubmit(data, { next }) {
    try {
      if (Array.isArray(data.avatar)) data.avatar = data.avatar[0] || "";
      data.isAsync = normalizeRunMode(data.isAsync);

      if (!Array.isArray(data.config)) data.config = [];
      data.config = data.config.map((row: any) => {
        const r = { ...row };
        if (r.type === "select") {
          if (typeof r.value === "string") r.value = parseArraySafe(r.value);
          if (!Array.isArray(r.value)) r.value = [];
        } else if (r.type === "param") {
          if (typeof r.value === "string" && r.value.trim()) {
            try {
              r.value = JSON.parse(r.value);
            } catch {
              r.value = r.value.trim();
            }
          } else {
            r.value = "";
          }
        } else {
          r.value = r.value == null ? "" : String(r.value);
        }
        r.show = r.show === 0 ? 0 : 1;
        return r;
      });

      if (!Array.isArray(data.auth)) data.auth = [];
      data.auth = data.auth.map((row: any) => ({
        ...row,
        value: row.value == null ? "" : String(row.value),
      }));

      next(data);
      setTimeout(reload, 100);
    } catch (err: any) {
      message.error(err?.message || t("提交失败，请检查表单内容"));
    }
  },
});

const loading = ref(false);
const keyword = ref("");
const allApps = ref<any[]>([]);

async function fetchAll() {
  loading.value = true;
  try {
    const res: any = await Crud.value?.service?.list?.({
      keyWord: keyword.value?.trim() || undefined,
    });
    const data = Array.isArray(res) ? res : res?.list || [];
    allApps.value = data || [];
  } catch (e) {
    console.error(e);
    message.error(t("加载失败"));
  } finally {
    loading.value = false;
  }
}
function reload() {
  fetchAll();
}

const parentRows = computed(() => PARENT_OPTIONS);
const appsByParent = computed<Record<number, any[]>>(() => {
  const map: Record<number, any[]> = { 1: [], 2: [], 3: [] };
  const kw = (keyword.value || "").trim().toLowerCase();
  for (const a of allApps.value || []) {
    const pt = Number(a?.parentType);
    if (!map[pt]) map[pt] = [];
    if (
      kw &&
      !String(a?.name ?? "")
        .toLowerCase()
        .includes(kw)
    )
      continue;
    map[pt].push(a);
  }
  Object.keys(map).forEach((k) => {
    map[Number(k)] = (map[Number(k)] || [])
      .slice()
      .sort((a, b) => Number(a?.type ?? 0) - Number(b?.type ?? 0));
  });
  return map;
});

async function onEdit(app: any) {
  try {
    const res = await service.base.app.info({ id: app.id });
    if (res && typeof res.avatar === "string" && res.avatar) res.avatar = [res.avatar];
    res.isAsync = normalizeRunMode(res.isAsync);

    if (res?.config && Array.isArray(res.config)) {
      res.config = res.config.map((row: any) => {
        const r = { ...row };
        if (r.type === "param" && r.value !== undefined && r.value !== null) {
          if (typeof r.value === "object") r.value = JSON.stringify(r.value, null, 2);
          else r.value = String(r.value);
        }
        if (r.show !== 0 && r.show !== 1) r.show = 1;
        return r;
      });
    }

    Upsert.value?.edit(res);
  } catch (err) {
    console.error(err);
    message.error(t("加载详情失败"));
  }
}

async function onDelete(app: any) {
  try {
    await Crud.value?.service?.delete?.({ ids: [app.id] });
    message.success(t("删除成功"));
    reload();
  } catch (e) {
    console.error(e);
    message.error(t("删除失败"));
  }
}

function addConfigItem(scope: any) {
  if (!Array.isArray(scope.config)) scope.config = [];
  scope.config.push({ name: "", display: "", type: "input", value: "", show: 1 });
}
function deleteConfigItem(scope: any, idx: number) {
  if (!Array.isArray(scope.config)) return;
  scope.config.splice(idx, 1);
}
function addAuthItem(scope: any) {
  if (!Array.isArray(scope.auth)) scope.auth = [];
  scope.auth.push({ name: "", display: "", type: "input", value: "" });
}
function deleteAuthItem(scope: any, idx: number) {
  if (!Array.isArray(scope.auth)) return;
  scope.auth.splice(idx, 1);
}

function ptLabel(v: any) {
  return PARENT_OPTIONS.find((o) => o.value === Number(v))?.label ?? "-";
}
function ptTagType(v: any) {
  return { 1: "success", 2: "warning", 3: "info" }[Number(v)] || "info";
}
function runModeLabel(v: any) {
  const n = normalizeRunMode(v);
  return n === 1 ? "异步" : "同步";
}
function runModeTagType(v: any) {
  return normalizeRunMode(v) === 1 ? "warning" : "success";
}
function normalizeRunMode(v: any): number {
  return Number(v) === 1 ? 1 : 0;
}
function avatarSrc(a: any) {
  if (!a) return "";
  return Array.isArray(a) ? a[0] : a;
}
function parseArraySafe(str: string): any[] {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}
function formatSelectValue(val: any): string {
  try {
    if (Array.isArray(val)) return JSON.stringify(val, null, 2);
    return typeof val === "string" ? val : "";
  } catch {
    return "";
  }
}
function onConfigTypeChange(row: any) {
  if (row.type === "select") {
    if (!Array.isArray(row.value)) row.value = [];
  } else {
    if (typeof row.value !== "string") row.value = "";
  }
}
onMounted(fetchAll);
</script>

<style lang="scss" scoped>
.crud-table-full {
  margin-top: 20px;
}
.expand-block {
  padding: 10px 20px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
}
.expand-head {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.avatar-fallback {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
.list-wrap {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
}
.list-head,
.list-row {
  display: grid;
  grid-template-columns: 180px 200px 100px 60px 1fr 80px;
  gap: 10px;
  align-items: center;
}
.list-head {
  background: #f5f5f5;
  padding: 10px;
  font-weight: 500;
}
.list-row {
  padding: 10px;
  border-top: 1px solid #eee;
}
.list-footer {
  padding: 10px;
  border-top: 1px solid #eee;
  text-align: left;
}
</style>
