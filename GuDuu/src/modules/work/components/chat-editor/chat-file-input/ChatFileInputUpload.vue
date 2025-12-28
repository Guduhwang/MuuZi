<template>
  <cl-upload class="chatImgInputUpload-wrap" drag draggable :limit="1" v-model="value" :accept="accept">
    <div class="chatImgInputUpload-field">{{ type }}</div>
    <el-icon class="el-icon--upload">
      <IMdiLightImage v-if="type === 'image'"></IMdiLightImage>
      <IMdiFileVideoOutline v-else-if="type === 'video'"></IMdiFileVideoOutline>
      <IMdiAudioBook v-else-if="type === 'audio'"></IMdiAudioBook>
      <IMdiFile v-else-if="type === 'file'"></IMdiFile>
    </el-icon>
    <div class="el-upload__text">Drag and drop or click to upload file</div>
    <template #tip>
      <!-- <div class="el-upload__tip">jpg/png</div> -->
    </template>
  </cl-upload>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
</script>
