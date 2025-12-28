<template>
  <ElDialog
    :modelValue="show"
    width="1000px"
    class="publish-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="$emit('update:show', false)"
  >
    <div class="publishDialog-wrap">
      <div class="publishDialog-menu-wrap">
        <ul class="publishDialog-menu-list">
          <li
            class="publishDialog-menu-item"
            v-for="(item, index) in menuList"
            :key="item.label"
            :class="{
              active: index === currentMenuIndex,
              error: errorMenuIndex.has(index),
            }"
            @click="handleMenuClick(index)"
          >
            <div class="publishDialog-menu-item-icon">
              {{ index + 1 }}
            </div>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>
      <div class="publishDialog-content-wrap">
        <el-form
          label-position="left"
          size="default"
          :rules="rules"
          :model="form"
          ref="formEl"
          label-width="140px"
          class="publishDialog-form"
        >
          <div v-show="currentMenuIndex === 0">
            <el-form-item label="Price" prop="price" class="publishDialog-form-item">
              <el-input-number
                v-model.number="form.price"
                :min="0"
                :precision="2"
                :step="0.1"
                size="default"
                class="publishDialog-price-input"
              >
                <template #prefix>
                  <span class="publishDialog-price-prefix">$</span>
                </template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="Name" prop="title" class="publishDialog-form-item">
              <el-input v-model="form.title" placeholder="Please enter name" clearable />
            </el-form-item>
            <el-form-item label="Subtitle" prop="subTitle" class="publishDialog-form-item">
              <el-input v-model="form.subTitle" placeholder="Please enter subtitle" clearable />
            </el-form-item>
            <el-form-item label="Category" prop="typeId" class="publishDialog-form-item">
              <el-cascader
                class="w-full"
                v-model="form.typeId"
                :options="categoryList"
                :props="{
                  expandTrigger: 'hover' as const,
                }"
                placeholder="Select category"
                clearable
                popper-class="publishDialog-popper"
                size="default"
              />
            </el-form-item>
            <el-form-item label="Tags" prop="tags" class="publishDialog-form-item">
              <DynamicTag class="publishDialog-tags" v-model="form.tags" :dictTags="workflowTags" />
            </el-form-item>
            <el-form-item label="Description" prop="content" class="publishDialog-form-item">
              <div style="width: 100%">
                <QuillEditor
                  ref="quill"
                  theme="snow"
                  contentType="html"
                  v-model:content="form.content"
                  placeholder="Please enter your description (Max 1000 characters)"
                  :toolbar="[
                    [
                      'bold',
                      'italic',
                      'underline',
                      'link',
                      { list: 'ordered' },
                      { list: 'bullet' },
                      { list: 'check' },
                      'code',
                      'code-block',
                    ],
                  ]"
                />
              </div>
            </el-form-item>

            <el-form-item label="Set Pinned" prop="isPinned" class="publishDialog-form-item">
              <el-switch v-model="form.isPinned" size="default" active-text="Y" inactive-text="N" inline-prompt />
            </el-form-item>
            <el-form-item prop="attachments">
              <template #label>
                <span>Add Attachments</span>
              </template>
              <cl-upload class="" type="file" @success="onSuccess" @remove="onRemove" multiple>
                <div class="publishDialog-upload-add-icon">
                  <el-icon><Plus /></el-icon> Add
                </div>
                <template #tip>
                  <!-- <div class="el-upload__tip">jpg/png</div> -->
                </template>
              </cl-upload>
            </el-form-item>
          </div>
          <div v-show="currentMenuIndex === 1">
            <el-form-item prop="video" label-width="60px">
              <template #label>
                <span class="flex items-center"
                  >Video
                  <el-tooltip effect="dark" content="Please enter the video URL of bilibili" placement="top-start">
                    <el-icon class="fs-[14px] ml-[4px]"><InfoFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.video" placeholder="Video URL" clearable />
            </el-form-item>

            <el-form-item label=" " prop="" label-width="60px">
              <div class="flex items-center">
                <div class="mr-[10px] text-[14px] text-[#595959]">Showcase Mode</div>
                <el-switch v-model="form.isDisplay" active-text="Y" inactive-text="N" inline-prompt />
              </div>
            </el-form-item>
            <el-form-item prop="pics" class="publishDialog-images-item" label-width="60px">
              <template #label>
                <span class="publishDialog-images-label">
                  <span>images</span>
                </span>
              </template>
              <div class="publishDialog-images-content">
                <div class="publishDialog-images-tip">
                  Add up to 9 images to your gallery（Recommended size:1920*1080）
                </div>
                <div class="publishDialog-upload-carousel-wrap">
                  <!-- 显示已上传的图片 -->
                  <div
                    v-for="(imgUrl, index) in uploadedPics"
                    :key="index"
                    class="publishDialog-upload-carousel publishDialog-upload-carousel-image"
                  >
                    <img :src="imgUrl" alt="" class="publishDialog-upload-image" />
                    <div class="publishDialog-upload-remove" @click="removeImage(index)">
                      <el-icon><Close /></el-icon>
                    </div>
                  </div>
                  <!-- 上传按钮（当图片数量小于9时显示） -->
                  <cl-upload
                    v-if="uploadedPics.length < 9"
                    class="publishDialog-upload-carousel"
                    draggable
                    type="file"
                    :limit="1"
                    customClass="publishDialog-upload-carousel-item"
                    @success="onImageUploadSuccess"
                  >
                    <div class="publishDialog-upload-placeholder">
                      <img src="/@/assets/imgs/personal/img_upload.svg" alt="" class="publishDialog-upload-icon" />
                    </div>
                  </cl-upload>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="Public" prop="isPublic" label-width="100px">
              <el-switch v-model="form.isPublic" size="small" active-text="Y" inactive-text="N" inline-prompt />
              <span class="ml-[8px]">Show workflow details</span>
            </el-form-item>
          </div>
          <div v-show="currentMenuIndex === 2">
            <el-form-item label="Share as" prop="author" label-width="180px">
              <el-radio-group v-model="form.author" class="w-full">
                <div class="publishDialog-author-list">
                  <div
                    class="publishDialog-author-item"
                    :class="{ team: item.value === 'team' }"
                    v-for="item in formAuthorOptions"
                    :key="item.value"
                    @click="form.author = item.value"
                  >
                    <el-radio :value="item.value" class="publishDialog-author-item-radio"></el-radio>
                    <!-- <el-image class="publishDialog-author-item-image" :src="item.avatar"></el-image> -->
                    <!-- <div class="publishDialog-author-item-name">{{ item.name }}</div> -->
                    <div class="publishDialog-author-item-tips">{{ item.tips }}</div>
                  </div>
                </div>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="contributors" label="Additional contributors" label-width="180px">
              <el-input
                v-model="form.contributors"
                placeholder="Enter additional contributors (optional)"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="Support Contact" prop="contactInfo" label-width="180px">
              <el-input v-model="form.contactInfo" clearable placeholder="Email or website for user support" />
            </el-form-item>
            <el-form-item prop="isCommentAllowed" label="Comments" label-width="180px">
              <div class="flex items-center">
                <el-switch class="mr-[10px]" v-model="form.isCommentAllowed" :active-value="1" :inactive-value="0" />
                <span class="text-[14px] text-[#595959]">Allow comments from community members</span>
              </div>
            </el-form-item>
          </div>
          <div v-show="currentMenuIndex === 3">
            <el-form-item label="License" label-width="125px">
              <el-radio-group v-model="LicenseType" class="publishDialog-license-group">
                <div
                  class="publishDialog-license-item"
                  :class="{ active: LicenseType === '1' }"
                  @click="LicenseType = '1'"
                >
                  <el-radio value="1" class="publishDialog-license-radio"></el-radio>
                  <span class="publishDialog-license-text">Personal Use License</span>
                </div>
                <div
                  class="publishDialog-license-item"
                  :class="{ active: LicenseType === '2' }"
                  @click="LicenseType = '2'"
                >
                  <el-radio value="2" class="publishDialog-license-radio"></el-radio>
                  <span class="publishDialog-license-text">Custom License</span>
                </div>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="LicenseType === '2'" label="License Content" label-width="125px">
              <el-input
                v-model="form.copyright"
                type="textarea"
                placeholder="Enter your license terms here"
                clearable
                class="publishDialog-license-textarea"
              ></el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
    <template #header>
      <div class="publishDialog-header">
        <h2 class="publishDialog-header-title">Publish Your File To Community</h2>
      </div>
    </template>
    <template #footer>
      <div class="publishDialog-footer">
        <ElButton class="publishDialog-btn-cancel" @click="back">{{
          currentMenuIndex === 0 ? 'Cancel' : 'Back'
        }}</ElButton>
        <template v-if="submitType === 'edit'">
          <ElButton class="publishDialog-btn-next" @click="submit" :loading="loading" :disabled="!canSubmit">{{
            currentMenuIndex === menuList.length - 1 ? 'Update' : 'Next'
          }}</ElButton>
        </template>
        <template v-else>
          <ElButton class="publishDialog-btn-next" @click="submit" :loading="loading" :disabled="!canSubmit">{{
            currentMenuIndex === menuList.length - 1 ? 'Publish' : 'Next'
          }}</ElButton>
        </template>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { ElDialog, ElButton, CascaderOption, ElMessage } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import './css/publishDialog.scss';
import { service } from '/@/cool';
import { useUserStore } from '/@/store/user';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import DynamicTag from '../dynamic-tag/DynamicTag.vue';
import { QuillEditor } from '@vueup/vue-quill';
import { usePublishDialogStore } from './store/usePublishDialogStore';
import { TAddGoodsParams } from '../../types/goods.type';
import { useDict } from '/@/modules/dict';
defineOptions({
  name: 'PublishDialog',
});

const props = withDefaults(
  defineProps<{
    show: boolean;
    type: string;
    workId?: number;
    groupId?: number;
    goodsInfo?: Eps.GoodsInfoEntity;
    submitType?: string;
  }>(),
  {
    show: false,
    type: '',
    groupId: undefined,
    goodsInfo: () => ({}),
    submitType: '',
  },
);
const emit = defineEmits(['update:show']);
const userStore = useUserStore();
const publishDialogStore = usePublishDialogStore();

const { dict } = useDict();
const workflowTags = [
  { value: 'n8n', label: 'n8n' },
  { value: 'make', label: 'make' },
  { value: 'coze', label: 'coze' },
  { value: 'comfyUI', label: 'comfyUI' },
];
const quill = ref();
const formEl = ref();
const LicenseType = ref('1');
// const dictInfo = ref<Eps.DictInfoEntity>({});

const getDefaultForm = () => {
  return {
    title: '',
    subTitle: '',
    content: '',
    price: '',
    typeId: [],
    isDisplay: false,
    sortNum: 1,
    tags: [],
    pics: [],
    // 自己的账号还是团队账号
    author: 'self',
    // 是否公开
    isPublic: false,
    // 协作者
    contributors: '',
    // 是否允许评论
    isCommentAllowed: 1,
    // 联系方式
    contactInfo: '',
    // 是否置顶
    isPinned: false,
    // 附件
    attachments: [],
  };
};
const pinnedGoodsCount = ref(0);
const errorMenuIndex = ref<Set<number>>(new Set());
const menuList = [
  {
    label: 'Describe Your Resource',
  },
  {
    label: 'Video and Images',
  },
  {
    label: 'Add Details',
  },
  {
    label: 'Set a License',
  },
];
const currentMenuIndex = ref(0);
// // 获取字典数据
// async function getDictInfo() {
//   const res = await service.dict.info.data();
//   if (res) {
//     dictInfo.value = res;
//   }
// }

const handleMenuClick = (index: number) => {
  currentMenuIndex.value = index;
};
function resetForm() {
  form.value = getDefaultForm();
  formEl.value?.resetFields();
  quill.value?.setHTML(null);
  errorMenuIndex.value.clear();
}
watch(
  () => props.show,
  (val) => {
    if (val) {
      currentMenuIndex.value = 0;
      if (props.goodsInfo?.id) {
        form.value = {
          ...props.goodsInfo,
        };
      }
    } else {
      // 清理form
      resetForm();
    }
  },
);
const form = ref<Eps.GoodsInfoEntity>(getDefaultForm());

// 获取已上传的图片（过滤掉空值）
const uploadedPics = computed(() => {
  return form.value.pics?.filter((pic: string) => pic && pic.trim() !== '') || [];
});

// 图片上传成功处理
function onImageUploadSuccess(item: Upload.Item) {
  const imageUrl = item.url || '';
  if (imageUrl && form.value.pics) {
    // 直接添加到数组末尾
    if (form.value.pics.length < 9) {
      form.value.pics.push(imageUrl);
    }
  }
}

// 删除图片
function removeImage(index: number) {
  if (form.value.pics) {
    // 找到要删除的图片在 form.pics 中的实际索引
    const uploadedList = uploadedPics.value;
    const picToRemove = uploadedList[index];
    const actualIndex = form.value.pics.findIndex((pic: string) => pic === picToRemove);
    if (actualIndex !== -1) {
      // 直接从数组中删除该元素
      form.value.pics.splice(actualIndex, 1);
    }
  }
}

const rules = ref({
  title: [
    { required: true, message: 'Please input title', trigger: 'blur' },
    { max: 100, message: 'Length should be 1 to 100', trigger: 'blur' },
  ],
  subTitle: [{ max: 100, message: 'Length should be 1 to 100', trigger: 'blur' }],
  content: [{ required: true, message: 'Please select a category', trigger: 'blur' }],
  typeId: [{ required: true, message: 'Please select a category', trigger: 'blur' }],
  tags: [{ required: true, message: 'Please select tags', trigger: 'blur' }],
  price: [
    { required: true, message: 'Please input price', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: number, callback: (error?: Error) => void) => {
        if (value === 0) {
          callback(); // 允许价格为0
        } else if (value >= 9.9) {
          callback(); // 允许价格大于等于9.9
        } else if (value > 0 && value < 9.9) {
          callback(new Error('Price must be 0 or greater than or equal to 9.9'));
        } else {
          callback(new Error('Please input a valid price'));
        }
      },
      trigger: 'blur',
    },
  ],
  isDisplay: [{ required: true, message: 'Please set', trigger: 'blur' }],
  sortNum: [{ type: 'number', min: 1, message: 'Price must be greater than 0', trigger: 'blur' }],
  pics: [{ required: true, message: 'Please set at least one image', trigger: 'blur' }],
  // video
  video: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value) {
          // 判断是否有bvid 哔哩哔哩
          if (value.includes('bvid=')) {
            callback();
          } else {
            callback(new Error('Please input a valid URL'));
          }
          // if (/^http(s)?:\/\/\S+$/.test(value)) {
          //   callback();
          // } else {
          //   callback(new Error('Please input a valid URL'));
          // }
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  // email or website url
  contactInfo: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value) {
          if (/^http(s)?:\/\/\S+$/.test(value) || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            callback();
          } else {
            callback(new Error('Please input a valid email or website URL'));
          }
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
});

function back() {
  if (currentMenuIndex.value === 0) {
    emit('update:show', false);
  } else {
    currentMenuIndex.value--;
  }
}

const formAuthorOptions = computed(() => {
  return [
    {
      value: 'self',
      name: userStore.info?.name,
      avatar: userStore.info?.avatar,
      tips: 'Individual',
    },
    {
      value: 'team',
      name: userStore.info?.name + "'s team",
      avatar: userStore.info?.avatar,
      tips: 'Team',
    },
  ];
});
const loading = ref(false);
const canSubmit = computed(() => {
  // 可以根据表单验证状态来决定按钮是否可用
  return true;
});
// 步骤1验证
function validateStep1() {
  return formEl.value
    .validateField(['title', 'subTitle', 'content', 'typeId', 'tags', 'price', 'isDisplay', 'sortNum', 'video'])
    .then(() => {
      errorMenuIndex.value.delete(0);
    })
    .catch(() => {
      errorMenuIndex.value.add(0);
      return Promise.reject(false);
    });
}
// 步骤2验证
function validateStep2() {
  return formEl.value
    .validateField(['pics'])
    .then(() => {
      errorMenuIndex.value.delete(1);
    })
    .catch(() => {
      errorMenuIndex.value.add(1);
      return Promise.reject(false);
    });
}
// 步骤3验证
function validateStep3() {
  return formEl.value
    .validateField(['author', 'contributors', 'isCommentAllowed', 'contactInfo'])
    .then(() => {
      errorMenuIndex.value.delete(2);
    })
    .catch(() => {
      errorMenuIndex.value.add(2);
      return Promise.reject(false);
    });
}
// 上传成功
function onSuccess<T extends { id: number }>(data: T) {
  form.value.attachments.push(data);
}
// 删除
function onRemove<T extends { id: number }>(data: T) {
  form.value.attachments = form.value.attachments.filter((v: T) => v.id !== data.id);
}
// 获取已经置顶的商品数
async function getTopGoodsCount() {
  const res = await service.goods.info.pinnedGoodsCount();
  if (res) {
    pinnedGoodsCount.value = res;
  }
}
function submit() {
  let validate;
  if (currentMenuIndex.value === 0) {
    validate = validateStep1();
  } else if (currentMenuIndex.value === 1) {
    validate = Promise.all([validateStep1(), validateStep2()]);
  } else if (currentMenuIndex.value === 2) {
    validate = Promise.all([validateStep1(), validateStep2(), validateStep3()]);
  } else if (currentMenuIndex.value === 3) {
    validate = Promise.all([validateStep1(), validateStep2(), validateStep3()]);
  }
  validate.then(() => {
    if (currentMenuIndex.value < menuList.length - 1) {
      currentMenuIndex.value++;
      return;
    }
    loading.value = true;
    if (LicenseType.value === '1') {
      form.value.copyright = userStore.info?.copyright;
    }
    const params: TAddGoodsParams = {
      userId: userStore.info!.id!,
      title: form.value.title!,
      subTitle: form.value.subTitle!,
      content: form.value.content!,
      price: form.value.price,
      isDisplay: form.value.isDisplay ? 1 : 0,
      sortNum: form.value.sortNum,
      video: form.value.video,
      typeId: form.value.typeId?.toString().slice(-1)[0] || '',
      tags: form.value.tags,
      pics: form.value.pics?.filter((v: string) => !!v),
      type: props.type === 'group' ? 2 : 1,
      author: form.value.author,
      contributors: form.value.contributors,
      isCommentAllowed: form.value.isCommentAllowed,
      contactInfo: form.value.contactInfo,
      isPinned: form.value.isPinned ? 1 : 0,
      attachments: form.value.attachments,
      copyright: form.value.copyright,
    };
    if (props.type === 'group') {
      params.groupId = props.groupId;
    } else if (props.type === 'workflow') {
      params.workflowId = props.workId;
    }
    if (props.submitType === 'edit') {
      service.goods.info
        .update({
          ...params,
          id: props.goodsInfo?.id,
        })
        .then((res) => {
          if (!res) {
            ElMessage({
              message: 'Update successfully',
              grouping: true,
              type: 'success',
            });
            emit('update:show', false);
            publishDialogStore.setHasNew(true);
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      service.goods.info
        .add(params)
        .then((res) => {
          if (res) {
            ElMessage({
              message: 'Publish successfully',
              grouping: true,
              type: 'success',
            });
            publishDialogStore.setHasNew(true);
            emit('update:show', false);
          }
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

const categoryList = ref<CascaderOption[]>([]);
onMounted(() => {
  // getDictInfo();
  getTopGoodsCount();
  service.goods.type.list().then((res: Eps.GoodsTypeEntity[]) => {
    if (res) {
      // 取res中的id和name做为value和label
      // res中还有parentId字段，需要根据parentId来构建级联结构，parentId就是对应父级的id
      const list = res.map((item) => ({
        value: item.id,
        label: item.name,
        parentId: item.parentId,
      }));
      // 构建树形结构
      const buildTree = (items: any[], parentId: number | null = null) => {
        return items
          .filter((item) => item.parentId === parentId)
          .map((item) => {
            const children = buildTree(items, item.value);
            if (children.length) {
              return { ...item, children };
            }
            return item;
          });
      };

      categoryList.value = buildTree(list);
    }
  });
});
</script>
