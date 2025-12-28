<template>
  <NodeViewWrapper as="span">
    <!-- <span class="chatFormInputMore-btn" v-if="restNum > 0" @click="handleMoreClick" ref="moreBtnRef">
      +{{ restNum }} more</span
    > -->
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import type { Instance as TippyInstance } from 'tippy.js';
import { nodeViewProps, NodeViewWrapper, VueRenderer } from '@tiptap/vue-3';
import { computed, inject, onMounted, useTemplateRef } from 'vue';
import './css/chatFormInputMore.scss';
import { TWorkflowConfigParam } from '../../../types/message.type';
import ChatFormInputMoreMention from './ChatFormInputMoreMention.vue';
import tippy from 'tippy.js';
// import { chatDialogZIndexSymbol } from '../../chat-group/injections/injections';
import { chatDialogZIndexSymbol } from '../../ai-box/injections/injections';

defineOptions({
  name: 'ChatFormInputMore',
});

const props = defineProps({
  ...nodeViewProps,
});

const insertedMemberFieldsRef = computed(() => props.node.attrs.insertedMemberFields);

const attrs = computed(
  () =>
    props.node.attrs as {
      params: TWorkflowConfigParam[];
      insertedMemberFields: Set<string>;
      onInsert: (param: TWorkflowConfigParam) => void;
    },
);
const restNum = computed(() => {
  return props.node.attrs.params.length - Object.keys(props.node.attrs.insertedMemberFields).length;
});

const chatDialogZIndex = inject(chatDialogZIndexSymbol)!;
let component: VueRenderer;
let popup: TippyInstance[];

function onDestroy() {
  popup.forEach((item) => item?.destroy());
  popup = [];
}

function addInsertedMemberFields(field: string) {
  props.updateAttributes({
    insertedMemberFields: { ...props.node.attrs.insertedMemberFields, [field]: 1 },
  });
}

const moreBtnRef = useTemplateRef('moreBtnRef');

function createMentionList() {
  component = new VueRenderer(ChatFormInputMoreMention, {
    props: {
      params: attrs.value.params,
      insertedMemberFields: insertedMemberFieldsRef,
      onSelect: attrs.value.onInsert,
      onDestroy,
      addInsertedMemberFields,
    },
    editor: props.editor,
  });
  popup = tippy('body', {
    getReferenceClientRect: () => moreBtnRef.value?.getBoundingClientRect() || null,
    appendTo: () => document.body,
    content: component.element,
    showOnCreate: true,
    interactive: true,
    trigger: 'manual',
    hideOnClick: true,
    placement: 'top-start',
    zIndex: chatDialogZIndex.value + 1,
  });
}

function handleMoreClick() {
  createMentionList();
}
onMounted(() => {
  console.log(props);
});
</script>
