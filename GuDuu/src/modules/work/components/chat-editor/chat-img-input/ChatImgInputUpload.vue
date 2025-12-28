<template>
  <cl-upload class="chatImgInputUpload-wrap" drag draggable :limit="1" v-model="value" :accept="accept">
    <div class="chatImgInputUpload-field">{{ type }}</div>
    <el-icon class="el-icon--upload"><IMdiLightImage></IMdiLightImage></el-icon>
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
  name: 'ChatImgInputUpload',
});

const props = withDefaults(
  defineProps<{
    type: 'image' | 'video' | 'audio';
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
  }
  return '';
});

const value = defineModel<string>();
</script>
