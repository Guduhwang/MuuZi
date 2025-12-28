<template>
  <cl-upload
    class="chatImgInputUpload-wrap"
    :class="{ 'is-mobile': isMobile }"
    drag
    draggable
    :limit="1"
    v-model="value"
    :accept="accept"
  >
    <div class="chatImgInputUpload-field">{{ type }}</div>
    <!-- <el-icon class="el-icon--upload">
      <IMdiLightImage v-if="type === 'image'"></IMdiLightImage>
      <IMdiFileVideoOutline v-else-if="type === 'video'"></IMdiFileVideoOutline>
      <IMdiAudioBook v-else-if="type === 'audio'"></IMdiAudioBook>
      <IMdiFile v-else-if="type === 'file'"></IMdiFile>
    </el-icon> -->
    <img alt="" src="/svg/upload.svg" class="el-icon--upload" />
    <div class="el-upload__text">Drag and drop or click to upload file</div>

    <template #tip>
      <!-- <div class="el-upload__tip">jpg/png</div> -->
    </template>
  </cl-upload>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Close } from '@element-plus/icons-vue';
import './css/chatImgInputUpload.scss';
defineOptions({
  name: 'ChatFileInputUpload',
});

const props = withDefaults(
  defineProps<{
    type: 'image' | 'video' | 'audio' | 'file';
  }>(),
  {
    type: 'image',
  },
);

// 检测是否为手机端
const isMobile = ref(false);

function detectMobile(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '';
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  if (mobileRegex.test(userAgent)) {
    return true;
  }
  if (window.innerWidth <= 768) {
    return true;
  }
  return false;
}

function handleResize() {
  isMobile.value = detectMobile();
}

onMounted(() => {
  isMobile.value = detectMobile();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const accept = computed(() => {
  if (props.type === 'image') {
    return 'image/*';
  } else if (props.type === 'video') {
    return 'video/*';
  } else if (props.type === 'audio') {
    return 'audio/*';
  } else if (props.type === 'file') {
    // pdf excel txt csv docx xlsx pptx
    return 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  return '';
});

const value = defineModel<string>();

// 删除文件
function handleDelete() {
  value.value = '';
}
</script>
