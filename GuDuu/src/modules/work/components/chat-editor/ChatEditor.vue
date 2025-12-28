<template>
  <div class="chatEditor-wrap" ref="chatEditorWrapRef">
    <EditorContent :editor="editor" class="chat-textarea" />
    <div class="chat-textarea-send-icon-wrap" @click="handleSendMessage">
      <IMdiSendCircle class="chat-textarea-send-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import type { Instance as TippyInstance } from 'tippy.js';
import type { JSONContent } from '@tiptap/core';
import type { TChatInputTimerForm } from './chat-input-timer-form/types/chat-input-timer-form.type';
import type { TWorkflowConfigParam } from '/@/modules/work/types/message.type';
import type { TUpdateMentionMemberParams } from './types/chat-editor.type';
import type { TChatGroupFileInputUploadCptInfo } from '../chat-group/types/index.type';
import tippy from 'tippy.js';
import { EditorContent, useEditor, VueRenderer } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import { computed, inject, nextTick, provide, ref, watch } from 'vue';
import { ChatInputButtonExtension } from './extensions/chat-input-button.ext';
import { ChatFormInputExtension } from './extensions/chat-form-input.ext';
import { ChatFlexibleInputExtension } from './extensions/chat-flexible-input.ext';
import { chatDialogZIndexSymbol } from '../chat-group/injections/injections';
import { useUserStore } from '/@/store/user';
import getMentionExtension from './extensions/mention.ext';
import { ChatFormInputMoreExtension } from './extensions/chat-form-input-more.ext';
import { ChatFileInputExtension } from '/@/modules/work/components/chat-editor/extensions/chat-file-input.ext';
import { ChatSelectInputExtension } from '/@/modules/work/components/chat-editor/extensions/chat-select-input.ext';
import { chatEditorInsertedMemberFieldMapSymbol, chatEditorUpdateInsertedMemberFieldMapSymbol } from './injections';

import './css/_variables.scss';
import './css/_keyframe-animations.scss';
import './css/chatEditor.scss';

defineOptions({
  name: 'ChatEditor',
});

const props = defineProps<{
  modelValue: string;
  parentShow: boolean;
  chatImgInputUploadCptInfo: TChatGroupFileInputUploadCptInfo[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'enter', value: string | JSONContent): void;
  (e: 'valid', val: boolean): void;
  (e: 'updateChatImgInputUploadCptInfo', info: Partial<TChatGroupFileInputUploadCptInfo>, type?: 'add' | 'del'): void;
}>();

const userStore = useUserStore();

const chatEditorWrapRef = ref<HTMLDivElement | null>(null);

const curAllMemberList = inject<Ref<Eps.BaseGroupMemberEntity[]>>('curMemberList')!;

const chatDialogZIndex = inject(chatDialogZIndexSymbol)!;
tippy.setDefaultProps({
  showOnCreate: true,
  interactive: true,
  trigger: 'manual',
  placement: 'top-start',
  // 避免点击了picker等后消失
  hideOnClick: false,
  appendTo: () => document.body,
});

// 排除自己的群成员
const curMemberList = computed(() => {
  return curAllMemberList.value.filter((member) => member.userId !== userStore.info!.id);
});

const curMentionMember = ref<Eps.BaseGroupMemberEntity | null>(null);

provide('curMentionMember', curMentionMember);

const curMentionRect = ref<(() => DOMRect | null) | null>(null);

// 更新输入@的时候的dom的getBoundingClientRect
function updateMentionRect(rect: () => DOMRect | null) {
  curMentionRect.value = rect;
}

const { isMentionPopInactive, mentionKit: mentionExt } = getMentionExtension({
  curMemberList,
  updateMentionMember,
  updateMentionRect,
  chatDialogZIndex,
});

const mentionKit = mentionExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      parentType: {},
      type: {},
      params: {},
      config: {},
      timerFormData: {},
    };
  },
});

// 已经插入进入的参数字段名称
const insertedMemberFieldMap = ref<Record<string, 1>>({});

function updateInsertedMemberField(field: string, type: 1 | 0) {
  if (type === 1) {
    insertedMemberFieldMap.value[field] = 1;
  } else {
    delete insertedMemberFieldMap.value[field];
  }
}

provide(chatEditorInsertedMemberFieldMapSymbol, insertedMemberFieldMap);
provide(chatEditorUpdateInsertedMemberFieldMapSymbol, updateInsertedMemberField);

function handleSendMessage() {
  // 当任何弹窗都没有的时候，emit('enter');
  if (
    (!chatInputFormComponentPopup?.length || chatInputFormComponentPopup[0]?.state?.isDestroyed) &&
    isMentionPopInactive()
  ) {
    if (editor.value?.isEmpty) {
      return;
    }
    if (!editor.value?.getText().replace(/\s+/g, '')) {
      return;
    }
    const { tr } = editor.value.state;
    let params: TWorkflowConfigParam[] | undefined;
    // 已插入的所有字段
    const fieldsMap: Record<string, string> = {};
    // 有字段，但是内容为空的字段
    const invalidFields: string[] = [];
    let moreInsPos: number | undefined;
    editor.value?.state.doc.descendants((node, pos) => {
      if (node.type.name === 'mention') {
        params = node.attrs.params;
      } else if (node.attrs?.type === 'chatFormInputItem') {
        fieldsMap[node.attrs.field] = node.attrs.value;
        // 获取node, 直接设置验证状态
        if (node.attrs?.param?.required === 1) {
          let iValid = true;
          if (typeof node.attrs.value == 'string') {
            iValid = !!node.attrs.value?.trim();
          } else if (typeof node.attrs.value == 'number') {
            iValid = !!(node.attrs.value || node.attrs.value === 0);
          }
          if (!iValid) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              valid: false,
            });
            invalidFields.push(node.attrs.field);
          }
        }
      } else if (node.type.name === 'chatFormInputMore') {
        // 如果是chatFormInputMore，记录位置，如果存在缺失字段，需要插入进入
        moreInsPos = pos;
      }
    });
    // 缺少的必填字段
    const missingFields: string[] = [];
    // 缺失的必填组件
    const missingContent: JSONContent[] = [];
    if (params?.length) {
      params.forEach((param) => {
        // 取出必填字段为空的字段
        if (param.required === 1) {
          // 不存在, 直接放入缺失字段
          if (!(param.name in fieldsMap)) {
            missingFields.push(param.name);
            // 保存需要插入的必填组件
            missingContent.push(...getEditorContent(param));
          }
        }
      });
    }
    // 如果有缺失的必填字段，则手动插入到chatFormInputMore组件前面
    if (missingContent.length) {
      editor.value?.commands.insertContentAt(moreInsPos!, missingContent);
      // 插入后，更新已插入的参数
      missingFields.forEach((field) => {
        insertedMemberFieldMap.value[field] = 1;
      });
    }
    if (missingFields.length || invalidFields.length) {
      // dispatch后才能修改节点的属性
      if (tr.docChanged) {
        editor.value.view.dispatch(tr);
      }
      // 暂时只表示没填写必填字段，不发出参数
      emit('valid', false);
      return;
    } else {
      emit('valid', true);
    }
    emit('enter', editor.value!.getJSON());
    // 清空编辑器
    editor.value?.commands.setContent('');
  }
}

const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        handleSendMessage();
        return true;
      },
    };
  },
});

// 创建删除回调函数
function handleNodeDelete(deleteInfo: { field: string; value: string; type: string; position?: number }) {
  // 从已插入的字段集合中移除被删除的字段
  if (deleteInfo.field) {
    delete insertedMemberFieldMap.value[deleteInfo.field];
  }
}

function handleImgInputDelete(field: string) {
  if (field) {
    emit(
      'updateChatImgInputUploadCptInfo',
      {
        field,
      },
      'del',
    );
  }
}
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bulletList: false, // 排除默认的 BulletList 扩展
    }),
    mentionKit,
    ChatFormInputExtension,
    ChatFlexibleInputExtension,
    ChatInputButtonExtension,
    ChatFormInputMoreExtension,
    ChatFileInputExtension,
    ChatSelectInputExtension,
    Placeholder.configure({
      placeholder: 'Please input',
    }),
    CustomBulletList,
    // CustomParagraph,
  ],
  content: '',
  autofocus: true,
  onUpdate: () => {
    // HTML
    // emit('update:modelValue', editor.value?.getHTML() || '');
    // JSON
    // emit('update:modelValue', JSON.stringify(editor.value?.getJSON() || {}));
    // console.log(editor.value?.getJSON());
  },
  onCreate: ({ editor }) => {
    // 设置删除回调到编辑器storage中
    if (editor.storage) {
      editor.storage.chatDeleteCallback = handleNodeDelete;
      editor.storage.delImgInputCallback = handleImgInputDelete;
    }
  },
  editorProps: {
    handlePaste: (view, event) => {
      // 检查是否在 chatFlexibleInput 元素内
      const target = event.target as HTMLElement;
      if (target.closest('.chatFlexibleInput-input')) {
        return false; // 让组件自己处理
      }

      // 获取纯文本内容
      const text = event.clipboardData?.getData('text/plain') || '';
      if (!text) return false;

      // 阻止默认粘贴行为
      event.preventDefault();

      // 在光标位置插入纯文本
      const { state, dispatch } = view;
      const { tr } = state;
      const { from, to } = state.selection;

      // 删除选中的内容
      if (from !== to) {
        tr.delete(from, to);
      }

      // 插入纯文本
      tr.insertText(text, from);

      // 应用事务
      dispatch(tr);

      return true; // 表示已处理
    },
  },
});

/************** 显示当前成员的参数表单 start ********************************************************/
const chatInputFormComponent: VueRenderer | null = null;
const chatInputFormComponentPopup: TippyInstance[] | null = null;

function destroyChatInputForm() {
  chatInputFormComponentPopup?.[0]?.destroy();
  chatInputFormComponent?.destroy();
}

watch(
  () => props.parentShow,
  (val) => {
    // 聊天窗口关闭的时候，要销毁表单弹出框
    if (!val) {
      destroyChatInputForm();
    }
  },
);

function getEditorContent(param: TWorkflowConfigParam): JSONContent[] {
  // todo 以后增加各种类型的的判断
  let content: JSONContent;
  if (param.type === 'String') {
    content = {
      type: 'chatFlexibleInput',
      attrs: {
        type: 'chatFormInputItem',
        field: param.name,
        value: '',
        param,
        onEnter: handleSendMessage,
      },
    };
  } else if (param.type === 'Image' || param.type === 'Video' || param.type === 'Audio' || param.type === 'File') {
    content = {
      type: 'chatFileInput',
      attrs: {
        type: 'chatFormInputItem',
        field: param.name,
        fileType: param.type.toLowerCase(),
        value: '',
        readonly: true,
        maxWidth: 200,
        placeholder: 'Please attach a file',
        param,
        onEnter: handleSendMessage,
      },
    };
    // get的时候设置，以后可能不合适，以后改
    // 设置ChatGroup组件的图片上传组件的显示
    emit('updateChatImgInputUploadCptInfo', {
      field: param.name,
      value: '',
      fileType: param.type.toLowerCase() as 'image' | 'video' | 'audio',
    });
  } else if (param.type === 'Select') {
    content = {
      type: 'chatSelectInput',
      attrs: {
        type: 'chatFormInputItem',
        field: param.name,
        value: '',
        options: param.options || [],
        param,
        onEnter: handleSendMessage,
      },
    };
  }
  return [
    content!,
    {
      type: 'text',
      text: ' ',
    },
  ];
}
// 旧的图片上传组件的值，用于比较，由于修改的是同一个对象，所以在watch里无法获取老的值
let oldChatImgInputUploadCptInfo: TChatGroupFileInputUploadCptInfo[] = [];
watch(
  () => props.chatImgInputUploadCptInfo,
  (val) => {
    // 图片上传成功后，同步修改编辑器里的对应的一样的字段的图片组件的值
    // 新的值字段永远不小于老值，所以直接用新的值遍历
    const updatedMap: Record<string, unknown> = {};
    val.forEach((v, index) => {
      if (v.value !== oldChatImgInputUploadCptInfo[index]?.value) {
        updatedMap[v.field] = v.value;
      }
    });
    if (Object.keys(updatedMap).length) {
      const { tr } = editor.value!.state;
      editor.value?.state.doc.descendants((node, pos) => {
        if (node.type?.name === 'chatFileInput' && node.attrs.field in updatedMap) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            value: updatedMap[node.attrs.field],
          });
        }
      });
      nextTick(() => {
        if (tr.docChanged) {
          editor.value?.view.dispatch(tr);
        }
      });
    }
    oldChatImgInputUploadCptInfo = val.map((v) => ({
      ...v,
    }));
  },
  {
    deep: true,
  },
);

function getRequiredContent(params: TWorkflowConfigParam[]) {
  const contents: JSONContent[] = [];
  params.forEach((param) => {
    if (param.required === 1) {
      contents.push(...getEditorContent(param));
    }
  });
  return contents;
}

function insertChatCustomInput(param: TWorkflowConfigParam) {
  const contents = getEditorContent(param);
  // 使用 insertContentAt 方法在当前位置插入内容，而不是替换
  const { from } = editor.value?.state.selection || { from: 0 };
  editor.value?.commands.insertContentAt(from, contents);
  // 插入后将光标移动到插入内容之后
  editor.value?.commands.setTextSelection(from + 1);
}

function showChatInputForm(
  options: {
    // 插入@符号
    insertMention?: () => void;
    // 定时任务参数
    timerFormData?: TChatInputTimerForm;
    // 编辑的时候传的参数，编辑的时候，会回显这个参数
    editFormValue?: Record<string, string | number | boolean>;
    // 编辑的时候，更新表单函数
    updateForm?: (newForm: Record<string, string | number | boolean>) => void;
  } = {},
) {
  // 手动关闭mentions
  /** 显示当前成员的参数表单 */
  // const updateChatGroupDisabled = inject(updateChatGroupDisabledSymbol);
  // chatInputFormComponent = new VueRenderer(ChatInputWorkflowForm, {
  //   props: {
  //     preForm: options.editFormValue,
  //     onClose: () => {
  //       destroyChatInputForm();
  //       // 如果是关闭，而且前面只有@+name,删除前面的@+name
  //       // editor.value?.commands.deleteRange({
  //       //   // 上一个@的开始位置，到当前光标的位置
  //       //   from: editor.value?.state.selection.from,
  //       //   to: editor.value?.state.selection.to,
  //       // });
  //     },
  //     onSave: (form: Record<string, string | number | boolean>) => {
  //       if (options.editFormValue) {
  //         // 编辑的时候，获取编辑器里chatInputButton组件的实例，然后修改组件的form参数
  //         options.updateForm?.(form);
  //       } else {
  //         // 先执行插入@
  //         const mentionInfo = options.insertMention?.();
  //         // 把ChatInputButton组件插入到编辑器中，点击编辑器，还是显示ChatInputForm组件
  //         editor.value?.commands.insertContent({
  //           type: 'chatInputButton',
  //           attrs: {
  //             form,
  //             timerFormData: options.timerFormData,
  //           },
  //         });
  //       }
  //       destroyChatInputForm();
  //       // 编辑器获得焦点
  //       editor.value?.commands.focus();
  //     },
  //   },
  //   editor: editor.value!,
  // });
  // chatInputFormComponentPopup = tippy('body', {
  //   zIndex: chatDialogZIndex.value + 1,
  //   // getReferenceClientRect: curMentionRect.value,
  //   getReferenceClientRect: () => chatEditorWrapRef.value?.getBoundingClientRect() || null,
  //   appendTo: () => document.body,
  //   content: chatInputFormComponent.element,
  //   onShow: () => {
  //     editor.value?.setEditable(false);
  //     updateChatGroupDisabled?.(true);
  //   },
  //   onHide: () => {
  //     editor.value?.setEditable(true);
  //     updateChatGroupDisabled?.(false);
  //   },
  //   onClickOutside: () => {
  //     destroyChatInputForm();
  //   },
  // });

  options.insertMention?.();
  let params = curMentionMember.value?.config?.params as TWorkflowConfigParam[];
  // 发布推特类型，自动设置一个图片参数
  if (curMentionMember.value?.parentType === 3 && curMentionMember.value?.type === 31) {
    params = [
      {
        name: 'image',
        type: 'Image',
        required: 0,
      },
    ];
  }
  let contents: JSONContent[] = [];
  if (params?.length) {
    // 上来只有必填的才加进去
    contents = getRequiredContent(params);
    // 保存已经添加的字段名称，后续应该增加字段不能重复校验
    params.forEach((param) => {
      if (param.required === 1) {
        insertedMemberFieldMap.value[param.name] = 1;
      }
    });
  }
  // 记录插入前的光标位置
  const insertPosition = editor.value?.state.selection.from || 0;

  editor.value?.commands.insertContent([
    ...contents,
    // {
    //   type: 'text',
    //   text: ' ',
    // },
    {
      type: 'chatFormInputMore',
      attrs: {
        params,
        insertedMemberFields: insertedMemberFieldMap.value,
        onInsert: insertChatCustomInput,
      },
    },
  ]);

  // 插入后将 selection 移动到 chatFormInputMore 节点前面
  if (editor.value) {
    // nextTick(() => {
    // chatFormInputMore 的位置是原始位置 + contents 的长度
    const chatFormInputMorePos = insertPosition + contents.length;
    editor.value?.commands.setTextSelection(chatFormInputMorePos);
    // editor.value?.view.focus();
    // });
  }
}

/************** 显示当前成员的参数表单 end ********************************************************/

function updateMentionMember({ member, timerFormData, callback }: TUpdateMentionMemberParams) {
  curMentionMember.value = member;
  showChatInputForm({
    insertMention: callback,
    timerFormData,
  });
}

/************** Expose start ********************************************************/

defineExpose({
  editor,
});
/************** Expose end ********************************************************/
</script>
