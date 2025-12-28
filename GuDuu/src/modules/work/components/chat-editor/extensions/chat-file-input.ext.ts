import { Editor, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ChatFlexibleInput from '../chat-flexible-input/ChatFlexibleInput.vue';
import { componentToHTML } from '/@/modules/work/util/vue';
import ChatWorkflowMsg from '/@/modules/work/components/chat-workflow-msg-2/ChatWorkflowMsg.vue';
import { TWorkflowMsgItem } from '/$/work/types/message.type';
import { chatFlexibleInputProps } from './chat-flexible-input.ext';

// 删除回调函数类型
type TDeleteCallback = (deleteInfo: { field: string; value: string; type: string; position?: number }) => void;
type TDeleteImgCallback = (field: string) => void;

// 扩展Editor类型以包含storage
interface EditorWithStorage extends Editor {
  storage: {
    chatDeleteCallback?: TDeleteCallback;
    delImgInputCallback?: TDeleteImgCallback;
    [key: string]: unknown;
  };
}

function onDelete(editor: Editor) {
  const { state } = editor;
  const { $from } = state.selection;

  // 检查光标前的节点
  const nodeBefore = $from.nodeBefore;
  if (nodeBefore && nodeBefore.type.name === 'chatFileInput') {
    const deleteInfo = {
      field: nodeBefore.attrs.field,
      value: nodeBefore.attrs.value,
      type: nodeBefore.attrs.type || 'chatFileInput',
      position: $from.pos - nodeBefore.nodeSize,
    };

    console.log('🔥 即将删除chatFileInput节点：', deleteInfo);
    // 从编辑器的storage中获取删除回调
    editor.storage?.chatDeleteCallback?.(deleteInfo);
    editor.storage?.delImgInputCallback?.(deleteInfo.field);
  }
  return false; // 继续默认删除行为
}

export const ChatFileInputExtension = Node.create({
  name: 'chatFileInput',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      ...chatFlexibleInputProps,
      fileType: { default: 'image' },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="chatFileInput"]' }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const msgList: TWorkflowMsgItem[] = [
      {
        type: 'String',
        required: 1,
        name: node.attrs.field,
        content: node.attrs.value,
      },
    ];
    const html = componentToHTML(ChatWorkflowMsg, {
      msgs: msgList,
      isDark: true,
    });
    return html;
  },
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        return onDelete(editor);
      },
      Delete: ({ editor }) => {
        return onDelete(editor);
      },
    };
  },
  addStorage() {
    return {
      chatDeleteCallback: null as TDeleteCallback | null,
      delImgInputCallback: null as TDeleteImgCallback | null,
    };
  },
  addNodeView() {
    return VueNodeViewRenderer(ChatFlexibleInput);
  },
});
