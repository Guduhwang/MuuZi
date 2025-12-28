<template>
  <!-- <DialogWrap
    :show="show"
    @close="handleClosed"
    :title="editForm ? 'Edit Avatar' : 'Add Avatar'"
    :width="app.isShowLive ? '500px' : '1000px'"
    destroy-on-close
  > -->
  <el-dialog
    :model-value="show"
    :title="editForm ? 'Edit Avatar' : 'Add Avatar'"
    :width="app.isShowLive ? '600px' : '1000px'"
    @close="handleClosed"
    append-to-body
    destroy-on-close
    :z-index="99"
  >
    <el-tabs v-model="activeTab" class="setting-tabs" :tabPosition="app.isShowLive ? 'top' : 'left'">
      <el-tab-pane label="Basic Info" name="Basic" label-width="100px" label-position="left">
        <template #label>
          <div :class="{ 'tab-error': errorMenuIndex.includes(0) }">Basic Info</div>
        </template>
        <el-form
          label-width="auto"
          label-position="left"
          class="p-[40px] bg-white rounded-[12px]"
          ref="formRef"
          :rules="rules"
          :model="form"
        >
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" placeholder="Please enter a name" @keyup.enter.prevent clearable />
          </el-form-item>
          <el-form-item label="Description" prop="remark" v-if="editForm?.isPurchased !== 1">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="Please enter your description (Max 200 characters)"
              maxlength="200"
              show-word-limit
              :rows="5"
            />
          </el-form-item>
          <el-form-item label="Tags" prop="tags" v-if="editForm?.isPurchased !== 1">
            <DynamicTag v-model="form.tags" :dictTags="workflowTags" />
          </el-form-item>

          <el-form-item label="Avatar" prop="avatar">
            <div class="avatar-upload-container">
              <cl-upload type="file" v-model="form.avatar" :showFileList="false" accept=".jpg,.png,.gif,.jpeg">
                <el-avatar :size="50" :src="form.avatar" v-if="form.avatar" />
                <el-avatar :size="50" v-else>
                  <IMdiPlus class="text-2xl" />
                </el-avatar>
              </cl-upload>
            </div>
          </el-form-item>

          <el-button
            type="primary"
            size="default"
            @click="handleNext"
            class="w-full"
            color="#0c0c0e"
            :loading="loading"
          >
            Next
          </el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="" name="Parameter">
        <template #label>
          <div :class="{ 'tab-error': errorMenuIndex.includes(1) }">Parameters</div>
        </template>
        <el-form
          label-width="200px"
          label-position="left"
          class="form-container"
          ref="parameterFormRef"
          :rules="rules"
          :model="form"
        >
          <el-form-item v-if="editForm?.isPurchased !== 1" label="Type" prop="Type">
            <el-row :gutter="16" class="w-full m-[0px !important]">
              <el-col class="pl-[0px !important]" :span="12">
                <el-select v-model="form.parentType" clearable @change="handleParentTypeChange">
                  <el-option :value="item.value" :label="item.label" v-for="(item, index) in memberType" :key="index" />
                </el-select>
              </el-col>
              <el-col v-if="form.parentType || form.parentType === 0" :span="12">
                <el-select v-model="form.type" clearable @change="handleSubTypeChange">
                  <el-option
                    v-for="(item, index) in memberConfig?.[form.parentType] || []"
                    :value="item.type"
                    :label="item.name"
                    :key="index"
                  />
                </el-select>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item v-if="form.parentType === 3 && editForm?.isPurchased !== 1 && form.type">
            <el-space>
              <el-button type="primary" @click="handleSelectConfigPack">Edit config pack</el-button>
              <el-tag v-for="item in form.configPacks || []" :key="item.id" type="warning" size="small">{{
                item.name
              }}</el-tag>
            </el-space>
          </el-form-item>
          <el-form-item v-if="form.parentType === 3 && form.type" label="Credential Type" prop="authType">
            <el-radio-group v-model="form.authType">
              <el-radio :value="1">Platform</el-radio>
              <el-radio :value="2" v-if="editForm?.isPurchased === 1">Creator</el-radio>
              <el-radio :value="3">User</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="isShowAuth" label="Credential" prop="authId" :required="!!authMap![form.type]?.length">
            <el-select :model-value="form.authId" clearable @change="handleAuthChange">
              <el-option
                v-for="(item, index) in authMap![form.type]"
                :value="item.id"
                :label="item.name"
                :key="index"
              />
              <el-option value="add">
                <div class="flex items-center" @click="handleAddCredential">
                  <IMdiAdd></IMdiAdd> Create new credential
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <template v-if="editForm?.isPurchased !== 1">
            <el-divider />
            <MembersConfig
              v-if="form.parentType === 1 || form.parentType === 3 || form.parentType === 4"
              ref="paramsFormRef"
              v-model:form="form.configForm"
              :configs="memberParamsConfigs"
              :parentType="form.parentType"
              :uniqueId="form.uniqueId || ''"
            />
            <el-form-item label="Platform tokens" prop="tokens" v-if="form.parentType === 3">
              {{ memberConfig![form.parentType]?.find((item) => item.type === form.type)?.tokens || 0 }}
            </el-form-item>
            <el-form-item label="Tokens" prop="tokens">
              <span v-if="form.parentType === 2">{{
                memberConfig![form.parentType]?.find((item) => item.type === form.type)?.tokens || 0
              }}</span>
              <el-input-number
                v-else
                v-model="form.tokens"
                :min="0"
                :max="999999999"
                :disabled="userIdentity == 'level_0' && form.parentType !== 4"
              />
            </el-form-item>

            <el-form-item label="Efficiency Coefficient" prop="efficiencyCoefficient">
              <span v-if="form.parentType === 2 || form.parentType === 3">{{
                memberConfig![form.parentType]?.find((item) => item.type === form.type)?.efficiencyCoefficient || 1
              }}</span>
              <el-input-number
                v-model="form.efficiencyCoefficient"
                :min="1"
                v-else
                :disabled="userIdentity == 'level_0' && form.parentType !== 4"
              />
            </el-form-item>

            <!-- only show when groupId is passed -->
            <el-form-item label="Join group" v-if="!(groupId || groupId === 0)">
              <el-select v-model="form.groupId" clearable>
                <el-option :value="item.id" :label="item.name" v-for="(item, index) in groupList" :key="index">{{
                  item.name
                }}</el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-button type="primary" size="default" @click="submit" class="w-full" color="#0c0c0e" :loading="loading">
            Save Avatar
          </el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="" name="Hotkeys">
        <template #label>
          <div :class="{ 'tab-error': errorMenuIndex.includes(2) }">Hotkeys</div>
        </template>
        <div class="hotkeys-container">
          <div class="flex items-center justify-between mb-[30px]">
            <div class="title-action">Hotkeys</div>
            <el-button round type="warning" @click="handleAddHotkey">Add Hotkey</el-button>
          </div>
          <el-table :data="hotkeyList" style="width: 100%" height="350">
            <el-table-column prop="name" label="Name" width="120" />
            <el-table-column prop="type" label="Type" width="120">
              <template #default="scope">
                {{
                  scope.row.type === 'sendFixedMessage'
                    ? 'Send Predefined Message'
                    : 'Send Predefined Message Via Workflow'
                }}
              </template>
            </el-table-column>
            <el-table-column prop="firstMemberId" label="First Avatar" width="120">
              <template #default="scope">
                {{ getMemberName(scope.row.firstMemberId) }}
              </template>
            </el-table-column>
            <el-table-column prop="secondMemberId" label="Second Avatar" width="120">
              <template #default="scope">
                {{ scope.row.secondMemberId ? getMemberName(scope.row.secondMemberId) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="operate" label="Actions" width="180" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleEditHotkey(scope.row, scope.$index)">Edit</el-button>
                <el-button size="small" @click="handleDeleteHotkey(scope.$index)" type="danger">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="" name="Prompts">
        <template #label>
          <div :class="{ 'tab-error': errorMenuIndex.includes(3) }">Prompts</div>
        </template>
        <div class="hotkeys-container">
          <div class="flex items-center justify-between mb-[30px]">
            <div class="title-action">Prompts</div>
            <el-button round type="warning" @click="handleAddPrompt">Add</el-button>
          </div>
          <el-table :data="promptList" style="width: 100%" height="350" v-loading="promptLoading">
            <el-table-column prop="example" label="Example" width="180">
              <template #default="scope">
                <div v-if="scope.row.example" class="example-preview-cell">
                  <!-- 图片预览 -->
                  <div v-if="getFileType(scope.row.example) === 'image'" class="example-preview-image">
                    <el-image
                      :src="scope.row.example"
                      :preview-src-list="[scope.row.example]"
                      fit="cover"
                      class="example-thumbnail"
                      preview-teleported
                    />
                  </div>
                  <!-- 视频预览 -->
                  <div v-else-if="getFileType(scope.row.example) === 'video'" class="example-preview-media">
                    <el-icon class="example-icon" @click="handlePreviewMedia(scope.row.example, 'video')">
                      <VideoPlay />
                    </el-icon>
                    <span class="example-text">Video</span>
                  </div>
                  <!-- 音频预览 -->
                  <div v-else-if="getFileType(scope.row.example) === 'audio'" class="example-preview-media">
                    <el-icon class="example-icon" @click="handlePreviewMedia(scope.row.example, 'audio')">
                      <Headset />
                    </el-icon>
                    <span class="example-text">Audio</span>
                  </div>
                  <!-- 其他文件或链接 -->
                  <div v-else class="example-preview-link">
                    <el-link :href="scope.row.example" target="_blank" type="primary">
                      {{
                        scope.row.example.length > 20 ? scope.row.example.substring(0, 20) + '...' : scope.row.example
                      }}
                    </el-link>
                  </div>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="prompt" label="Prompt" min-width="200" show-overflow-tooltip />

            <el-table-column prop="remark" label="Remark" width="180" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.remark || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="Create Time" width="180">
              <template #default="scope">
                {{ formatPromptTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="operate" label="Operate" width="180" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleEditPrompt(scope.row)">Edit</el-button>
                <el-button size="small" @click="handleDeletePrompt(scope.row)" type="danger">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Hotkey Add/Edit Dialog -->
    <el-dialog
      v-model="showHotkeyDialog"
      :title="editingHotkeyIndex !== null ? 'Edit Hotkey' : 'Add Hotkey'"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <el-form
        label-width="200px"
        label-position="left"
        class="form-container dialog-form-container"
        ref="hotkeyFormRef"
        :rules="hotkeyRules"
        :model="hotkeyForm"
      >
        <el-form-item label="Hotkey Name" prop="name">
          <el-input v-model="hotkeyForm.name" placeholder="Please enter hotkey name" clearable />
        </el-form-item>

        <el-form-item label="Hotkey Type" prop="type">
          <el-radio-group v-model="hotkeyForm.type">
            <el-radio :value="'sendFixedMessage'">Send Predefined Message</el-radio>
            <el-radio :value="'sendFixedMessageWithChain'">Send Predefined Message Via Workflow</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="First Member" prop="firstMemberId">
          <el-select
            :model-value="hotkeyForm.firstMemberId ?? undefined"
            @update:model-value="handleFirstMemberChange"
            placeholder="Please select a member"
            clearable
            filterable
          >
            <el-option
              v-for="member in currentGroupMembers"
              :key="member.id"
              :value="member.id ?? 0"
              :label="member.name"
            >
              <div class="flex items-center">
                <el-avatar :size="24" :src="member.avatar" class="mr-2" />
                <span>{{ member.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- First Member Params Form -->
        <template v-if="hotkeyForm.firstMemberId && firstMemberParams.length > 0">
          <div class="mb-4">
            <h4 class="text-base font-semibold mb-2">First Member Parameters</h4>
          </div>
          <el-form-item
            v-for="param in firstMemberParams"
            :key="param.name"
            :label="param.name"
            :prop="`firstMemberParams.${param.name}`"
            :rules="param.required === 1 ? [{ required: true, message: `${param.name} is required` }] : []"
          >
            <el-input
              v-if="param.type === 'String' || param.type === 'Header'"
              :model-value="String(hotkeyForm.firstMemberParams[param.name] ?? '')"
              @update:model-value="(val: string) => (hotkeyForm.firstMemberParams[param.name] = val)"
              :placeholder="`Please enter ${param.name}`"
              clearable
            />
            <el-input-number
              v-else-if="param.type === 'Integer' || param.type === 'Number'"
              :model-value="Number(hotkeyForm.firstMemberParams[param.name] ?? 0)"
              @update:model-value="(val: number | undefined) => (hotkeyForm.firstMemberParams[param.name] = val ?? 0)"
              :placeholder="`Please enter ${param.name}`"
              style="width: 100%"
            />
            <el-switch
              v-else-if="param.type === 'Boolean'"
              :model-value="Number(hotkeyForm.firstMemberParams[param.name] ?? 0)"
              @update:model-value="
                (val: boolean | string | number) =>
                  (hotkeyForm.firstMemberParams[param.name] = val === true || val === 1 || val === '1' ? 1 : 0)
              "
              :active-value="1"
              :inactive-value="0"
            />
            <el-date-picker
              v-else-if="param.type === 'Time'"
              :model-value="hotkeyForm.firstMemberParams[param.name] as string"
              @update:model-value="(val: string | undefined) => (hotkeyForm.firstMemberParams[param.name] = val ?? '')"
              type="datetime"
              :placeholder="`Please select ${param.name}`"
              style="width: 100%"
            />
            <cl-upload
              v-else-if="['Image', 'File', 'Video'].includes(param.type)"
              :type="param.type === 'Image' ? 'image' : 'file'"
              :limit="1"
              :accept="getUploadAccept(param.type)"
              :show-file-list="param.type !== 'File'"
              v-model="hotkeyForm.firstMemberParams[param.name]"
            >
              <el-button type="primary" plain>
                <el-icon class="mr-1">
                  <UploadFilled />
                </el-icon>
                Upload {{ param.name }}
              </el-button>
            </cl-upload>
            <el-input
              v-else
              :model-value="String(hotkeyForm.firstMemberParams[param.name] ?? '')"
              @update:model-value="(val: string) => (hotkeyForm.firstMemberParams[param.name] = val)"
              :placeholder="`Please enter ${param.name}`"
              clearable
            />
          </el-form-item>
        </template>
        <template v-if="firstMemberOutputParams.length > 0">
          <div class="mb-4">
            <h4 class="text-base font-semibold mb-2">First Member Output Parameters</h4>
          </div>
          <el-table :data="firstMemberOutputParams" border class="param-table" size="small">
            <el-table-column prop="type" label="Type" width="160" />
            <el-table-column prop="name" label="Name" />
          </el-table>
        </template>

        <!-- Second Member (Only for Chain Type) -->
        <template v-if="hotkeyForm.type === 'sendFixedMessageWithChain'">
          <el-divider />
          <el-form-item label="Second Member" prop="secondMemberId">
            <el-select
              :model-value="hotkeyForm.secondMemberId ?? undefined"
              @update:model-value="handleSecondMemberChange"
              placeholder="Please select a member"
              clearable
              filterable
            >
              <el-option
                v-for="member in availableSecondMembers"
                :key="member.id"
                :value="member.id ?? 0"
                :label="member.name"
                :disabled="member.disabled"
              >
                <div class="flex items-center">
                  <el-avatar :size="24" :src="member.avatar" class="mr-2" />
                  <span>{{ member.name }}</span>
                  <el-tag v-if="member.disabled" type="danger" size="small" class="error-tag ml-2"
                    >Parameter mismatch</el-tag
                  >
                </div>
              </el-option>
            </el-select>
            <div v-if="secondMemberValidationError" class="text-red-500 text-sm mt-1">
              {{ secondMemberValidationError }}
            </div>
          </el-form-item>
          <template v-if="secondMemberParams.length > 0">
            <div class="mb-4">
              <h4 class="text-base font-semibold mb-2">Second Member Input Mapping</h4>
            </div>
            <el-table :data="secondMemberParams" border class="param-table" size="small">
              <el-table-column prop="type" label="Type" width="160" />
              <el-table-column prop="name" label="Name" />
              <el-table-column label="Mapping" width="220">
                <template #default="{ row }">
                  <el-select
                    class="w-full"
                    :model-value="hotkeyForm.secondMemberMappings[row.name]"
                    @update:model-value="(val: string) => (hotkeyForm.secondMemberMappings[row.name] = val)"
                    placeholder="Select output parameter"
                    clearable
                    :disabled="getOutputOptions(row.type).length === 0"
                  >
                    <el-option
                      v-for="option in getOutputOptions(row.type)"
                      :key="option.name"
                      :label="option.name"
                      :value="option.name"
                    />
                  </el-select>
                  <span
                    v-if="getOutputOptions(row.type).length === 0"
                    class="param-mapping__warning text-red-500 text-xs mt-1"
                  >
                    No matching output parameter
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </template>

        <el-button
          type="primary"
          size="default"
          @click="handleSaveHotkey"
          class="w-full"
          color="#0c0c0e"
          :loading="hotkeyLoading"
        >
          {{ editingHotkeyIndex !== null ? 'Update Hotkey' : 'Save Hotkey' }}
        </el-button>
      </el-form>
    </el-dialog>

    <!-- Prompt Add/Edit Dialog -->
    <el-dialog
      v-model="showPromptDialog"
      :title="editingPromptId !== null ? 'Edit Prompt' : 'Add Prompt'"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <el-form
        label-width="120px"
        label-position="left"
        class="form-container dialog-form-container"
        ref="promptFormRef"
        :rules="promptRules"
        :model="promptForm"
      >
        <el-form-item label="Example Type" prop="exampleType">
          <el-radio-group v-model="promptForm.exampleType">
            <el-radio :value="'file'">Upload File</el-radio>
            <el-radio :value="'link'">Input Link</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="promptForm.exampleType === 'file'"
          label="Example File"
          prop="exampleFile"
          :rules="[{ required: false, message: 'Please upload a file' }]"
        >
          <cl-upload type="file" v-model="promptForm.exampleFile" :limit="1" :show-file-list="true">
            <el-button type="primary" plain>
              <el-icon class="mr-1">
                <UploadFilled />
              </el-icon>
              Upload File
            </el-button>
          </cl-upload>
        </el-form-item>

        <el-form-item
          v-if="promptForm.exampleType === 'link'"
          label="Example Link"
          prop="exampleLink"
          :rules="[{ required: false, message: 'Please enter a link' }]"
        >
          <el-input v-model="promptForm.exampleLink" placeholder="Please enter example link" clearable />
        </el-form-item>

        <el-form-item label="Prompt" prop="prompt">
          <el-input
            v-model="promptForm.prompt"
            type="textarea"
            :rows="8"
            placeholder="Please enter prompt content"
            clearable
          />
        </el-form-item>

        <el-form-item label="Remark" prop="remark">
          <el-input v-model="promptForm.remark" placeholder="Please enter remark" clearable />
        </el-form-item>

        <el-button
          type="primary"
          size="default"
          @click="handleSavePrompt"
          class="w-full"
          color="#0c0c0e"
          :loading="promptSubmitLoading"
        >
          {{ editingPromptId !== null ? 'Update Prompt' : 'Save Prompt' }}
        </el-button>
      </el-form>
    </el-dialog>

    <!-- Media Preview Dialog -->
    <el-dialog
      v-model="showMediaPreviewDialog"
      :title="previewMediaType === 'video' ? 'Video Preview' : 'Audio Preview'"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <div class="media-preview-container">
        <video v-if="previewMediaType === 'video'" :src="previewMediaUrl" controls class="media-preview-player"></video>
        <audio
          v-else-if="previewMediaType === 'audio'"
          :src="previewMediaUrl"
          controls
          class="media-preview-player"
        ></audio>
      </div>
    </el-dialog>

    <LiblibPackage
      v-model:show="showLiblibPackage"
      :configs="liblibConfigPackParams"
      :data="form.configPacks"
      :selectedPacks="selectedPacks"
      @select="handleSelectPack"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, FormItemRule } from 'element-plus';
import type { TGroupMemberItem } from '../../types/group.type';
import { ref, defineProps, defineEmits, watch, computed, nextTick, onMounted, toRefs } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import DialogWrap from '../dialog-wrap/DialogWrap.vue';
import { ElNotification } from 'element-plus';
import { UploadFilled, VideoPlay, Headset } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { useStore } from '/@/store';
import { useBase } from '/$/base';
import { getIdentity } from '/@/utils';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';

const { app } = useBase();

const { service } = useCool();

const { userStore, memberStore, groupStore } = useStore();
const { groupList } = storeToRefs(groupStore);
import './css/memberAdd.scss';

import { useDict } from '/@/modules/dict';
import DynamicTag from '../dynamic-tag/DynamicTag.vue';
import MembersConfig from '../setting_components/MembersConfig.vue';
import { TMembersConfig, TMembersConfigParam, TMembersPackConfigItem } from './types/member-add.type';
import { storeToRefs } from 'pinia';
import { AVATAR_PREFIX_PATH } from '../../util/const';
import { getMemberConfigQuery } from '../../queries';
import { useCredentialManageStore } from '/@/store/credential-manage.store';
import LiblibPackage from '../liblib-package/LiblibPackage.vue';
const credentialManageStore = useCredentialManageStore();
const { authMap, setCredentialParentType, setCredentialType, setIsShowCredentialManage } =
  toRefs(credentialManageStore);

defineOptions({
  name: 'MemberAdd',
});
type Tag = {
  id: number;
  name: string;
  value: string;
  isActive: boolean;
};
const props = withDefaults(
  defineProps<{
    show: boolean;
    groupId?: number;
    editForm?: Eps.GroupMemberEntity;
  }>(),
  {
    show: false,
  },
);

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const { data: memberConfig } = useQuery(getMemberConfigQuery);

const formRef = ref<FormInstance>();
const parameterFormRef = ref<FormInstance>();
const hotkeyFormRef = ref<FormInstance>();
const promptFormRef = ref<FormInstance>();
const loading = ref(false);
const activeTab = ref('Basic');
// 是否显示配置包配置对话框
const showLiblibPackage = ref(false);
const selectedPacks = ref<number[]>([]);
// 快捷键相关
const hotkeyLoading = ref(false);
const showHotkeyDialog = ref(false);
const editingHotkeyIndex = ref<number | null>(null);
const hotkeyList = ref<
  Array<{
    userId: number | null;
    name: string;
    type: 'sendFixedMessage' | 'sendFixedMessageWithChain';
    firstMemberId: number | null;
    secondMemberId: number | null;
    firstMemberParams: Record<string, string | number | boolean>;
    secondMemberMappings: Record<string, string>;
  }>
>([]);
const hotkeyForm = ref<{
  userId: number | null;
  name: string;
  type: 'sendFixedMessage' | 'sendFixedMessageWithChain';
  firstMemberId: number | null;
  secondMemberId: number | null;
  firstMemberParams: Record<string, string | number | boolean>;
  secondMemberMappings: Record<string, string>;
}>({
  userId: null,
  name: '',
  type: 'sendFixedMessage',
  firstMemberId: null,
  secondMemberId: null,
  firstMemberParams: {},
  secondMemberMappings: {},
});
const firstMemberParams = ref<TMembersConfigParam[]>([]);
const firstMemberOutputParams = ref<TMembersConfigParam[]>([]);
const secondMemberParams = ref<TMembersConfigParam[]>([]);
const secondMemberValidationError = ref<string>('');
function handleClosed() {
  emit('update:show', false);
}

const { dict } = useDict();
const memberType = [
  {
    value: 1,
    label: 'Workflow',
  },
  {
    value: 2,
    label: 'Widget',
  },
  {
    value: 3,
    label: 'Plugin',
  },
  {
    value: 4,
    label: 'Custom',
  },
];
const workflowTags = dict.get('workflowTags') as unknown as Tag[];

function initForm() {
  if (props.editForm) {
    return { ...props.editForm };
  }
  return {
    id: 0,
    ownerId: userStore.info?.id,
    avatar: '', // 初始为空，稍后会自动上传随机头像
    name: '',
    parentType: '',
    type: '',
    remark: '',
    email: Date.now() + '.' + userStore.info?.email,
    groupId: undefined,
    configForm: {},
    tags: [],
    tokens: 0,
    // 效率系数
    efficiencyCoefficient: 1,
    uniqueId: generateUniqueId(),
    authId: null,
    // 凭证使用类型
    authType: 1,
    configPacks: [],
  };
}

const form = ref(initForm());
const paramsFormRef = ref<InstanceType<typeof MembersConfig>>();
// 随机头像列表
const randomAvatars = AVATAR_PREFIX_PATH;

// 获取随机头像并上传
const getRandomAvatarAndUpload = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  const randomAvatarPath = randomAvatars[randomIndex];
  return randomAvatarPath;
};

const liblibConfigPackParams = computed(() => {
  if (3 !== form.value.parentType) {
    return [];
  }
  const libConfig = memberConfig.value?.[3].find((item) => item.type === form.value.type)?.config;
  const data: TMembersConfig[] = [];
  libConfig?.forEach((v) => {
    if (v.type === 'liblibConfigPackParam') {
      data.push(v);
    }
  });
  return data;
});
// service.base.appConfig.delete(@Body('id') id: number)   删除
// service.base.appConfig.info(@Body('id') id: number)   单个
// service.base.appConfig.update(@Body('id') id: number,@Body('config') auth: AppConfigEntity)   更新
// service.base.appConfig.list(@Body('type') type: number)   列表

const validateAuthId: FormItemRule['validator'] = function (_, value, callback) {
  if (authMap.value?.[form.value.type]?.length && !(value || value === 0)) {
    callback(new Error('Please select a authentication'));
  } else {
    callback();
  }
};
const rules: FormRules = {
  avatar: [{ required: true, message: 'Please upload a avatar' }],
  name: [{ required: true, message: 'Please enter a name' }],
  parentType: [{ required: true, message: 'Please select a type' }],
  type: [{ required: true, message: 'Please select a sub type' }],
  authId: [{ validator: validateAuthId, trigger: 'change' }],
  remark: [{ max: 200, message: 'The maximum length is 200 characters' }],
  authType: [{ required: true, message: 'Please select a credential usage type' }],
};

const hotkeyRules: FormRules = {
  name: [{ required: true, message: 'Please enter hotkey name' }],
  type: [{ required: true, message: 'Please select hotkey type' }],
  firstMemberId: [{ required: true, message: 'Please select first member' }],
  secondMemberId: [
    {
      validator: (rule, value, callback) => {
        if (hotkeyForm.value.type === 'sendFixedMessageWithChain' && !value) {
          callback(new Error('Please select second member'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
};

// Prompt 相关
const promptLoading = ref(false);
const promptSubmitLoading = ref(false);
const showPromptDialog = ref(false);
const editingPromptId = ref<number | null>(null);
const promptList = ref<Eps.PromptEntity[]>([]);
const promptForm = ref<{
  exampleType: 'file' | 'link';
  exampleFile: string;
  exampleLink: string;
  prompt: string;
  remark: string;
}>({
  exampleType: 'file',
  exampleFile: '',
  exampleLink: '',
  prompt: '',
  remark: '',
});

const promptRules: FormRules = {
  prompt: [{ required: true, message: 'Please enter prompt content', trigger: 'blur' }],
};

// Media Preview 相关
const showMediaPreviewDialog = ref(false);
const previewMediaUrl = ref('');
const previewMediaType = ref<'video' | 'audio'>('video');

// 判断文件类型
function getFileType(url: string): 'image' | 'video' | 'audio' | 'other' {
  if (!url) return 'other';

  const lowerUrl = url.toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];

  // 检查是否是图片
  if (
    imageExtensions.some((ext) => lowerUrl.includes(ext)) ||
    lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i)
  ) {
    return 'image';
  }

  // 检查是否是视频
  if (
    videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
    lowerUrl.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)(\?|$)/i)
  ) {
    return 'video';
  }

  // 检查是否是音频
  if (
    audioExtensions.some((ext) => lowerUrl.includes(ext)) ||
    lowerUrl.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)(\?|$)/i)
  ) {
    return 'audio';
  }

  return 'other';
}

// 预览媒体文件
function handlePreviewMedia(url: string, type: 'video' | 'audio') {
  previewMediaUrl.value = url;
  previewMediaType.value = type;
  showMediaPreviewDialog.value = true;
}

const errorMenuIndex = ref<number[]>([]);
const submit = async () => {
  await formRef.value
    ?.validate()
    .then(() => {
      errorMenuIndex.value = errorMenuIndex.value.filter((item) => item !== 0);
    })
    .catch(() => {
      errorMenuIndex.value.push(0);
    });
  await parameterFormRef.value
    ?.validate()
    .then(() => {
      errorMenuIndex.value = errorMenuIndex.value.filter((item) => item !== 1);
    })
    .catch(() => {
      errorMenuIndex.value.push(1);
    });

  console.log('errorMenuIndex', errorMenuIndex.value);
  if (errorMenuIndex.value.length > 0) {
    return;
  }
  await Promise.all([
    formRef.value?.validate(),
    parameterFormRef.value?.validate(),
    paramsFormRef.value?.validateParamsForm(),
  ])
    .then(async () => {
      console.log('validate success');
      form.value.groupId = props.groupId;
      loading.value = true;
      let isAdd = false;
      const tokens =
        form.value.parentType === 2 || (form.value.parentType === 3 && form.value.authType !== 2)
          ? undefined
          : form.value.tokens;
      if (form.value.id === 0) {
        isAdd = true;
        await service.base.sys.user
          .saveApp({
            ...form.value,
            config: form.value.configForm,
            configForm: undefined,
            tokens,
            // 保存现有的 Hotkeys 数据（如果有）
            shortcutCommands:
              hotkeyList.value.length > 0
                ? {
                    list: JSON.parse(JSON.stringify(hotkeyList.value)),
                  }
                : undefined,
            // 保存现有的 Prompts 数据（如果有）
            prompts: props.editForm?.prompts || [],
          })
          .catch(() => {
            loading.value = false;
          });
        loading.value = false;
      } else {
        // 有updateId的才算更新
        let updateId;
        // 要
        let updateStashedForm = {};
        const nameForm = {
          name: form.value.name,
          avatar: form.value.avatar,
        };
        if (props.editForm?.isPurchased == 1) {
          // 加入群也算新增
          isAdd = true;
          await service.base.groupMember
            .updateMemberInfo({
              groupId: props.editForm.groupId,
              memberId: props.editForm.userId,
              authId: form.value.authId,
              ...(form.value.parentType === 3 ? { authType: form.value.authType } : {}),
              ...nameForm,
            })
            .catch(() => {
              loading.value = false;
            });
        } else {
          let id = form.value.userId;
          // friendlist接口里没有userId，只有id
          if (!id && id !== 0) {
            id = form.value.id;
          }
          updateId = id;
          updateStashedForm = {
            id,
            config: form.value.configForm,
            ...nameForm,
            parentType: form.value.parentType,
            type: form.value.type,
            tokens,
            remark: form.value.remark,
            tags: form.value.tags,
            authId: form.value.authId,
            authType: form.value.authType,
            efficiencyCoefficient: form.value.efficiencyCoefficient,
            configPacks: form.value.configPacks,
            // 保存现有的 Hotkeys 数据
            shortcutCommands: {
              list: JSON.parse(JSON.stringify(hotkeyList.value)),
            },
          };
          await service.base.sys.user
            .updateApp({
              user: updateStashedForm,
              memberId: props.editForm?.id,
            })
            .catch(() => {
              loading.value = false;
            });
        }
        loading.value = false;
        //修改的时候，直接遍历一遍，修改所有群组里的对应的成员
        if (updateId) {
          updateStashedForm.userId = updateId;
          delete updateStashedForm.id;
          // 确保包含 Hotkeys 和 Prompts 数据
          const updateData = {
            ...updateStashedForm,
            shortcutCommands: {
              list: JSON.parse(JSON.stringify(hotkeyList.value)),
            },
            prompts: props.editForm?.prompts || [],
          };
          groupStore.updateGroupMemberByMemberId(updateId, updateData as TGroupMemberItem);
        }
      }

      ElNotification({
        message: 'Saved successfully',
      });
      // 获取所有成员，todo，待优化，不应该重新查询，应该手动修改成员列表
      memberStore.refresh();
      if (isAdd) {
        // 添加的时候，重新查询
        // TODO，以后改成添加后返回成员id，然后手动修改group的memberList和friendList
        if (props.groupId) {
          // 更新群组的里的成员
          groupStore.getGroupMember([props.groupId]);
        }
      }

      handleClosed();
    })
    .catch((r) => {
      console.log(r);
    });
  // if (form.value.type === 11 && (!form.value.config.token || !form.value.config.workflowId)) {
  //   ElNotification({
  //     message: 'Please fill in the relevant configuration',
  //   });
  //   return;
  // }
  // if (
  //   [12, 13].includes(form.value.type) &&
  //   (!form.value.config.webhook || !form.value.config.token || !form.value.config.workflowId)
  // ) {
  //   ElNotification({
  //     message: 'Please fill in the relevant configuration',
  //   });
  //   return;
  // }

  // if (form.value.params.findIndex((item) => item.name === '') >= 0) {
  //   ElNotification({
  //     message: 'Please fill in the parameter name',
  //   });
  //   return;
  // }
};

const memberParamsConfigs = ref<TMembersConfig[]>([]);

function setConfigForm(val: number, config?: Omit<TMembersConfig, 'display' | 'type'>[]) {
  if (!memberConfig.value) return;
  const member = memberConfig.value[form.value.parentType]?.find((item) => item.type === val);
  memberParamsConfigs.value = member?.config || [];
  const data = config || memberParamsConfigs.value;
  // 创建工作流参数的表单
  nextTick(() => {
    form.value.configForm = data.reduce<Record<string, string | TMembersConfigParam[]>>((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
  });
}
const handleSubTypeChange = (val: number) => {
  // 重置凭证id
  form.value.authId = null;
  setConfigForm(val);
};

const handleParentTypeChange = () => {
  form.value.type = '';
  form.value.authId = null;
  form.value.configForm = {};
};

const handleAuthChange = (val: string) => {
  if (val !== 'add') {
    form.value.authId = val ?? null;
  }
};

function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 判断角色
const userIdentity = computed(() => {
  return getIdentity(userStore.info?.roleIds ?? []);
});

watch(
  () => props.show,
  async (newVal) => {
    if (!newVal) {
      errorMenuIndex.value = [];
      formRef.value?.resetFields();
      parameterFormRef.value?.resetFields();
      paramsFormRef.value?.resetFields();
      hotkeyFormRef.value?.resetFields();
      promptFormRef.value?.resetFields();
      resetHotkeyForm();
      resetPromptForm();
      promptList.value = [];
      // memberParamsConfigs 是计算属性，不能直接赋值
    } else {
      activeTab.value = 'Basic';
      form.value = initForm();
      resetHotkeyForm();
      resetPromptForm();

      // 如果是新增模式，自动上传随机头像
      if (!props.editForm) {
        try {
          const uploadedAvatarUrl = await getRandomAvatarAndUpload();
          if (uploadedAvatarUrl) {
            form.value.avatar = uploadedAvatarUrl;
          }
        } catch (error) {
          console.error('Failed to set random avatar:', error);
        }
      }

      // 如果是编辑模式，加载快捷键数据
      if (props.editForm && props.groupId) {
        // 从 editForm 中加载已保存的快捷键列表
        if (props.editForm.shortcutCommands?.list && props.editForm.shortcutCommands.list.length > 0) {
          hotkeyList.value = JSON.parse(JSON.stringify(props.editForm.shortcutCommands.list));
        } else {
          hotkeyList.value = [];
        }
      } else {
        hotkeyList.value = [];
      }

      // 确保群组成员已加载
      if (props.groupId) {
        groupStore.getGroupMember([props.groupId]);
      } else if (props.editForm?.groupId) {
        groupStore.getGroupMember([props.editForm.groupId]);
      }

      // 加载 Prompts 列表（如果有 editForm 或 form 有 id）
      if (props.editForm?.userId || form.value.id) {
        await loadPromptList();
      }
    }
  },
);

watch([() => props.show, () => props.editForm, () => memberConfig.value], ([newVal, formVal, memberConfigVal]) => {
  if (newVal && formVal && memberConfigVal) {
    nextTick(() => {
      const configAy: Array<{ name: string; value: string | TMembersConfigParam[] }> = Object.keys(
        formVal.configForm,
      ).map((item) => ({
        name: item,
        value: formVal.configForm[item],
      }));
      setConfigForm(formVal.type, configAy as Omit<TMembersConfig, 'display' | 'type'>[]);
    });
  }
});

function handleAddCredential() {
  /* 打开凭证管理对话框 */
  const typeName = memberType.find((item) => item.value === form.value.parentType)?.label || '';
  setCredentialParentType.value(typeName.toLocaleLowerCase());
  setCredentialType.value(form.value.type);
  setIsShowCredentialManage.value(true);
}

const handleSelectPack = (val: TMembersPackConfigItem[]) => {
  form.value.configPacks = [...val];
};

function handleSelectConfigPack() {
  selectedPacks.value = form.value.configPacks?.map((item: TMembersPackConfigItem) => item.id) || [];
  showLiblibPackage.value = true;
}

const handleNext = async () => {
  await formRef.value
    ?.validate()
    .then(() => {
      errorMenuIndex.value = errorMenuIndex.value.filter((item) => item !== 0);

      activeTab.value = 'Parameter';
    })
    .catch(() => {
      errorMenuIndex.value.push(0);
    });
};

const isShowAuth = computed(() => {
  let state = false;
  if (form.value.authType === 1) {
    state = false;
  } else if (form.value.authType === 2) {
    state = false;
  } else if (form.value.authType === 3) {
    state = true;
  }
  const normalState = memberConfig.value?.[form.value.parentType]?.find((item) => item.type === form.value.type)?.auth
    ?.length;
  if (form.value.parentType === 3) {
    return state && normalState;
  }
  return normalState;
});

// 检查Parameter Info选项卡是否有必填项错误
const hasParameterInfoErrors = computed(() => {
  // 基础必填项
  const basicRequiredFields = ['parentType', 'authType'];

  // 检查基础必填项
  const hasBasicErrors = basicRequiredFields.some((field) => {
    const value = form.value[field];
    return value === undefined || value === null || value === '';
  });

  if (hasBasicErrors) return true;

  // 检查条件必填项：type（当parentType有值时必填）
  if ((form.value.parentType || form.value.parentType === 0) && !form.value.type && form.value.type !== 0) {
    return true;
  }

  // 检查条件必填项：authId（当需要认证时必填）
  if (isShowAuth.value && authMap.value?.[form.value.type]?.length && !(form.value.authId || form.value.authId === 0)) {
    return true;
  }

  return false;
});

// 获取当前群组的成员列表
const currentGroupMembers = computed(() => {
  const groupId = props.groupId ?? props.editForm?.groupId;
  if (!groupId && groupId !== 0) {
    return [];
  }
  console.log('groupStore.groupMemberMap', groupStore.groupMemberMap);
  // 筛选出不是自己的成员
  const members = (groupStore.groupMemberMap[groupId] || []) as Eps.GroupMemberEntity[];
  return members.filter((member) => member.userId !== userStore.info?.id) || [];
});

// 获取可用的第二个成员列表（用于链式类型）
const availableSecondMembers = computed<Array<Eps.GroupMemberEntity & { disabled: boolean }>>(() => {
  if (hotkeyForm.value.type !== 'sendFixedMessageWithChain' || !hotkeyForm.value.firstMemberId) {
    return [];
  }

  const firstMember = currentGroupMembers.value.find((m) => m.userId === hotkeyForm.value.firstMemberId);
  if (!firstMember || !(firstMember.config as Record<string, unknown>)?.outputParams) {
    return currentGroupMembers.value.map((m) => ({ ...m, disabled: false }));
  }

  const firstOutputParams = ((firstMember.config as Record<string, unknown>).outputParams ||
    []) as TMembersConfigParam[];

  return currentGroupMembers.value.map((member) => {
    const memberParams = ((member.config as Record<string, unknown>)?.params || []) as TMembersConfigParam[];

    // 检查参数数量和类型是否匹配
    const isMatch = validateParamsMatch(firstOutputParams, memberParams);

    return {
      ...member,
      disabled: !isMatch,
    };
  });
});

// 验证参数匹配
function validateParamsMatch(outputParams: TMembersConfigParam[], inputParams: TMembersConfigParam[]): boolean {
  if (outputParams.length !== inputParams.length) {
    return false;
  }

  // 检查每个参数的类型是否匹配（按顺序）
  for (let i = 0; i < outputParams.length; i++) {
    if (outputParams[i].type !== inputParams[i].type) {
      return false;
    }
  }

  return true;
}

function getUploadAccept(paramType: string) {
  switch (paramType) {
    case 'Image':
      return 'image/*';
    case 'Video':
      return 'video/*';
    case 'File':
      return '*/*';
    default:
      return '';
  }
}

// 处理第一个成员选择变化
function handleFirstMemberChange(memberId: number | string | null, preserveParams = false) {
  const id = typeof memberId === 'string' ? parseInt(memberId) : memberId;
  hotkeyForm.value.firstMemberId = id;
  if (!id && id !== 0) {
    firstMemberParams.value = [];
    hotkeyForm.value.firstMemberParams = {};
    firstMemberOutputParams.value = [];
    return;
  }

  const member = currentGroupMembers.value.find((m) => m.id === id);
  if (!member) {
    firstMemberParams.value = [];
    hotkeyForm.value.firstMemberParams = {};
    firstMemberOutputParams.value = [];
    return;
  }

  const params = ((member.config as Record<string, unknown>)?.params || []) as TMembersConfigParam[];
  firstMemberParams.value = params;

  // 保存现有的参数值（用于编辑时保留已填写的值）
  const existingParams = preserveParams ? { ...hotkeyForm.value.firstMemberParams } : {};

  // 初始化表单值
  const initialParams: Record<string, string | number | boolean> = {};
  params.forEach((param) => {
    // 如果保留参数且已存在该参数的值，则使用现有值；否则使用默认值
    if (preserveParams && existingParams[param.name] !== undefined) {
      initialParams[param.name] = existingParams[param.name];
    } else {
      // 根据类型设置默认值
      if (param.type === 'Boolean') {
        initialParams[param.name] = 0;
      } else if (param.type === 'Integer' || param.type === 'Number') {
        initialParams[param.name] = 0;
      } else {
        initialParams[param.name] = '';
      }
    }
  });
  hotkeyForm.value.firstMemberParams = initialParams;
  firstMemberOutputParams.value = ((member.config as Record<string, unknown>)?.outputParams ||
    []) as TMembersConfigParam[];

  // 如果类型是链式的，需要重新验证第二个成员
  if (hotkeyForm.value.type === 'sendFixedMessageWithChain' && hotkeyForm.value.secondMemberId) {
    handleSecondMemberChange(hotkeyForm.value.secondMemberId, preserveParams);
  }
}

// 处理第二个成员选择变化
function handleSecondMemberChange(memberId: number | string | null, preserveParams = false) {
  const id = typeof memberId === 'string' ? parseInt(memberId) : memberId;
  hotkeyForm.value.secondMemberId = id;

  if (!id) {
    secondMemberValidationError.value = '';
    secondMemberParams.value = [];
    hotkeyForm.value.secondMemberMappings = {};
    return;
  }

  const member = currentGroupMembers.value.find((m) => m.id === id);
  if (!member) {
    secondMemberValidationError.value = '';
    secondMemberParams.value = [];
    hotkeyForm.value.secondMemberMappings = {};
    return;
  }

  // 验证参数匹配
  const firstMember = currentGroupMembers.value.find((m) => m.userId === hotkeyForm.value.firstMemberId);
  if (firstMember && (firstMember.config as Record<string, unknown>)?.outputParams) {
    const firstOutputParams = ((firstMember.config as Record<string, unknown>).outputParams ||
      []) as TMembersConfigParam[];
    const memberParams = ((member.config as Record<string, unknown>)?.params || []) as TMembersConfigParam[];

    if (!validateParamsMatch(firstOutputParams, memberParams)) {
      secondMemberValidationError.value =
        'This member cannot be configured because the parameters do not match. The output parameters of the first member must match the input parameters of the second member in quantity and type.';
      hotkeyForm.value.secondMemberId = null;
      secondMemberParams.value = [];
      hotkeyForm.value.secondMemberMappings = {};
      return;
    }
  }

  secondMemberValidationError.value = '';
  const params = ((member.config as Record<string, unknown>)?.params || []) as TMembersConfigParam[];
  secondMemberParams.value = params;

  // 保存现有的映射值（用于编辑时保留已配置的映射）
  const existingMappings = preserveParams ? { ...hotkeyForm.value.secondMemberMappings } : {};

  const mappings: Record<string, string> = {};
  params.forEach((param) => {
    // 如果保留参数且已存在该参数的映射，则使用现有映射；否则自动匹配
    if (preserveParams && existingMappings[param.name] !== undefined) {
      mappings[param.name] = existingMappings[param.name];
    } else {
      const match = firstMemberOutputParams.value.find((output) => output.type === param.type);
      mappings[param.name] = match ? match.name : '';
    }
  });
  hotkeyForm.value.secondMemberMappings = mappings;
}

function getOutputOptions(paramType: string) {
  return firstMemberOutputParams.value.filter((output) => output.type === paramType);
}

// 新增快捷键
function handleAddHotkey() {
  editingHotkeyIndex.value = null;
  resetHotkeyForm();
  showHotkeyDialog.value = true;
}

// 编辑快捷键
function handleEditHotkey(hotkey: (typeof hotkeyList.value)[0], index: number) {
  editingHotkeyIndex.value = index;
  hotkeyForm.value = JSON.parse(JSON.stringify(hotkey));
  // 如果有第一个成员ID，需要加载其参数配置，并保留已存在的参数值
  if (hotkeyForm.value.firstMemberId) {
    handleFirstMemberChange(hotkeyForm.value.firstMemberId, true);
  }
  // 如果有第二个成员ID，需要加载其映射配置，并保留已存在的映射值
  if (hotkeyForm.value.type === 'sendFixedMessageWithChain' && hotkeyForm.value.secondMemberId) {
    handleSecondMemberChange(hotkeyForm.value.secondMemberId, true);
  }
  showHotkeyDialog.value = true;
}

// 删除快捷键
async function handleDeleteHotkey(index: number) {
  try {
    await ElMessageBox.confirm('Are you sure to delete this hotkey?', 'Tips', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });
    hotkeyList.value.splice(index, 1);
    // 保存所有快捷键
    await saveAllHotkeys();
    ElNotification({
      message: 'Hotkey deleted successfully',
      type: 'success',
    });
  } catch (error) {
    // 用户取消删除
  }
}

// 获取成员名称
function getMemberName(memberId: number | null) {
  if (!memberId && memberId !== 0) return '-';
  const member = currentGroupMembers.value.find((m) => m.id === memberId || m.userId === memberId);
  return member?.name || '-';
}

// 保存所有快捷键
async function saveAllHotkeys() {
  let id = (form.value as any).userId;
  // friendlist接口里没有userId，只有id
  if (!id && id !== 0) {
    id = form.value.id;
  }
  const updateId = id;
  const userForm = {
    id: id,
    config: form.value.configForm,
    name: form.value.name,
    avatar: form.value.avatar,
    parentType: form.value.parentType,
    type: form.value.type,
    tokens: form.value.tokens,
    remark: form.value.remark,
    tags: form.value.tags,
    authId: form.value.authId,
    authType: form.value.authType,
    efficiencyCoefficient: form.value.efficiencyCoefficient,
    configPacks: form.value.configPacks,
    shortcutCommands: {
      list: JSON.parse(JSON.stringify(hotkeyList.value)),
    },
  };
  try {
    await service.base.sys.user.updateApp({
      user: userForm,
      memberId: props.editForm?.id,
    });
    //修改的时候，直接遍历一遍，修改所有群组里的对应的成员
    if (updateId) {
      userForm.userId = updateId;
      delete userForm.id;
      groupStore.updateGroupMemberByMemberId(updateId, {
        ...userForm,
      } as TGroupMemberItem);
    }
  } catch (error) {
    console.error('Failed to save hotkeys:', error);
  }
}

// 保存快捷键
async function handleSaveHotkey() {
  try {
    await hotkeyFormRef.value?.validate();
  } catch (error) {
    errorMenuIndex.value.push(2);
    return;
  }
  // 验证必填参数
  const hasRequiredErrors = firstMemberParams.value.some((param) => {
    if (param.required === 1) {
      const value = hotkeyForm.value.firstMemberParams[param.name];
      return value === undefined || value === null || value === '';
    }
    return false;
  });

  if (hasRequiredErrors) {
    errorMenuIndex.value.push(2);
    ElNotification({
      message: 'Please fill in all required parameters',
      type: 'error',
    });
    return;
  }
  if (hotkeyForm.value.type === 'sendFixedMessageWithChain') {
    const hasMappingErrors = secondMemberParams.value.some(
      (param) => !hotkeyForm.value.secondMemberMappings[param.name],
    );
    if (hasMappingErrors) {
      errorMenuIndex.value.push(2);
      ElNotification({
        message: 'Please configure all second member parameter mappings',
        type: 'error',
      });
      return;
    }
  }

  errorMenuIndex.value = errorMenuIndex.value.filter((item) => item !== 2);
  hotkeyForm.value.userId = (form.value as any).userId;
  const hotkey = JSON.parse(JSON.stringify(hotkeyForm.value));
  hotkeyLoading.value = true;

  try {
    // 如果是编辑模式，更新列表中的项；否则新增
    if (editingHotkeyIndex.value !== null) {
      hotkeyList.value[editingHotkeyIndex.value] = hotkey;
    } else {
      hotkeyList.value.push(hotkey);
    }

    // 保存所有快捷键
    await saveAllHotkeys();

    ElNotification({
      message: editingHotkeyIndex.value !== null ? 'Hotkey updated successfully' : 'Hotkey saved successfully',
      type: 'success',
    });
    hotkeyLoading.value = false;
    showHotkeyDialog.value = false;
    // 重置表单
    resetHotkeyForm();
  } catch (error) {
    hotkeyLoading.value = false;
    ElNotification({
      message: 'Failed to save hotkey',
      type: 'error',
    });
  }
}

// 重置快捷键表单
function resetHotkeyForm() {
  hotkeyForm.value = {
    userId: null,
    name: '',
    type: 'sendFixedMessage',
    firstMemberId: null,
    secondMemberId: null,
    firstMemberParams: {},
    secondMemberMappings: {},
  };
  firstMemberParams.value = [];
  firstMemberOutputParams.value = [];
  secondMemberParams.value = [];
  secondMemberValidationError.value = '';
  hotkeyFormRef.value?.resetFields();
}

// 监听快捷键类型变化
watch(
  () => hotkeyForm.value.type,
  (newType) => {
    if (newType === 'sendFixedMessage') {
      // 如果是单消息类型，清除第二个成员
      hotkeyForm.value.secondMemberId = null;
      secondMemberParams.value = [];
      hotkeyForm.value.secondMemberMappings = {};
      secondMemberValidationError.value = '';
    }
  },
);

// 监听 tab 切换，切换到 Prompts tab 时加载数据
watch(
  () => activeTab.value,
  async (newTab) => {
    if (newTab === 'Prompts') {
      await loadPromptList();
    }
  },
);

// 格式化 Prompt 时间
function formatPromptTime(time: string | undefined): string {
  if (!time) return '-';
  return dayjs(time).format('YYYY-MM-DD HH:mm');
}

// 加载 Prompt 列表
async function loadPromptList() {
  // 获取 appId，优先使用 editForm.userId，如果没有则使用 form.value.id 或 form.value.userId
  const appId = props.editForm?.userId || (form.value as any)?.userId || form.value.id;
  if (!appId || appId === 0) {
    promptList.value = [];
    return;
  }

  try {
    promptLoading.value = true;
    const list = await service.base.prompt.list({ appId });
    promptList.value = list || [];
  } catch (error: any) {
    console.error('Failed to load prompt list:', error);
    ElMessage.error(error?.message || 'Failed to load prompts');
  } finally {
    promptLoading.value = false;
  }
}

// 新增 Prompt
function handleAddPrompt() {
  editingPromptId.value = null;
  resetPromptForm();
  showPromptDialog.value = true;
}

// 编辑 Prompt
function handleEditPrompt(prompt: Eps.PromptEntity) {
  editingPromptId.value = prompt.id || null;
  promptForm.value = {
    exampleType: prompt.example ? (prompt.example.startsWith('http') ? 'link' : 'file') : 'file',
    exampleFile: prompt.example && !prompt.example.startsWith('http') ? prompt.example : '',
    exampleLink: prompt.example && prompt.example.startsWith('http') ? prompt.example : '',
    prompt: prompt.prompt || '',
    remark: prompt.remark || '',
  };
  showPromptDialog.value = true;
}

// 删除 Prompt
async function handleDeletePrompt(prompt: Eps.PromptEntity) {
  try {
    await ElMessageBox.confirm('Are you sure to delete this prompt?', 'Tips', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });

    await service.base.prompt.delete({ id: prompt.id });
    ElMessage.success('Deleted successfully');
    await loadPromptList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || 'Failed to delete');
    }
  }
}

// 保存 Prompt
async function handleSavePrompt() {
  if (!promptFormRef.value) return;

  await promptFormRef.value.validate(async (valid) => {
    if (!valid) return;

    // 获取 appId，优先使用 editForm.userId，如果没有则使用 form.value.id 或 form.value.userId
    const appId = props.editForm?.userId || (form.value as any)?.userId || form.value.id;
    if (!appId || appId === 0) {
      ElMessage.error('App ID is required. Please save the member first.');
      return;
    }

    try {
      promptSubmitLoading.value = true;

      const example =
        promptForm.value.exampleType === 'file' ? promptForm.value.exampleFile : promptForm.value.exampleLink;

      if (editingPromptId.value !== null) {
        // 编辑
        await service.base.prompt.update({
          id: editingPromptId.value,
          prompt: promptForm.value.prompt,
          example: example,
          remark: promptForm.value.remark,
        });
        ElMessage.success('Updated successfully');
      } else {
        // 新增
        await service.base.prompt.add({
          appId: appId,
          prompt: promptForm.value.prompt,
          example: example,
          remark: promptForm.value.remark,
        });
        ElMessage.success('Added successfully');
      }

      showPromptDialog.value = false;
      await loadPromptList();
    } catch (error: any) {
      ElMessage.error(error?.message || 'Operation failed');
    } finally {
      promptSubmitLoading.value = false;
    }
  });
}

// 重置 Prompt 表单
function resetPromptForm() {
  promptForm.value = {
    exampleType: 'file',
    exampleFile: '',
    exampleLink: '',
    prompt: '',
    remark: '',
  };
  editingPromptId.value = null;
  promptFormRef.value?.clearValidate();
}

onMounted(() => {
  credentialManageStore.query();
});
</script>

<style scoped>
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-tip {
  text-align: center;
  margin-top: 4px;
}

.avatar-upload-container .el-avatar {
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-upload-container .el-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 选项卡错误状态的红色边框样式 */
:deep(.tab-error) {
  border: 1px dashed #f56c6c !important;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 2px;
  background-color: #fef0f0;
  color: #f56c6c;
  font-weight: bold;
  position: relative;
  transition: all 0.3s ease;
}

:deep(.tab-error .el-tab-pane__label::after) {
  content: '!';
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f56c6c;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 对于顶部布局的选项卡 */
:deep(.el-tabs--top .tab-error .el-tab-pane__label) {
  border: 2px solid #f56c6c !important;
  border-radius: 4px;
  padding: 8px 16px;
  margin: 2px 4px;
  background-color: #fef0f0;
}

/* 对于左侧布局的选项卡 */
:deep(.el-tabs--left .tab-error .el-tab-pane__label) {
  border: 2px solid #f56c6c !important;
  border-radius: 4px;
  padding: 12px 16px;
  margin: 4px 2px;
  background-color: #fef0f0;
}

/* 激活状态下的错误选项卡 */
:deep(.tab-error.is-active .el-tab-pane__label) {
  background-color: #f56c6c;
  color: white;
}

.form-container {
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  height: 600px;
  overflow-y: auto;
}
.hotkeys-container {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
}
.title-action {
  font-size: 16px;
  font-weight: 600;
}
.dialog-form-container {
  height: 500px;
}
.param-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.param-display__item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
}
.param-display__type {
  font-weight: 600;
  color: #409eff;
}
.param-display__name {
  color: #606266;
}
.param-table {
  margin-bottom: 16px;
}
.param-mapping__warning {
  display: inline-block;
}
.error-tag {
  height: 20px !important;
  line-height: 20px !important;
  padding: 0 8px !important;
  border-radius: 4px !important;
  background-color: #f56c6c !important;
  color: #fff !important;
  font-size: 12px !important;
  /* font-weight: bold !important; */
}

/* Example Preview 样式 */
.example-preview-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.example-preview-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.example-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
  border: 1px solid #e6e6e6;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.example-preview-media {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f5f7fa;
  }

  .example-icon {
    font-size: 20px;
    color: #409eff;
    transition: all 0.3s ease;
  }

  &:hover .example-icon {
    color: #66b1ff;
    transform: scale(1.1);
  }

  .example-text {
    font-size: 14px;
    color: #606266;
  }
}

.example-preview-link {
  display: flex;
  align-items: center;
}

/* Media Preview Dialog 样式 */
.media-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 20px;
}

.media-preview-player {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  background-color: #000;
}

.media-preview-player video {
  width: 100%;
  height: auto;
  max-height: 70vh;
}

.media-preview-player audio {
  width: 100%;
  max-width: 600px;
}
</style>
