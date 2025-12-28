import { Editor, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ChatSelectInput from '../chat-select-input/ChatSelectInput.vue';
import { componentToHTML } from '/@/modules/work/util/vue';
import ChatWorkflowMsg from '/@/modules/work/components/chat-workflow-msg-2/ChatWorkflowMsg.vue';
import { TWorkflowMsgItem } from '../../../types/message.type';

// 删除回调函数类型
type DeleteCallback = (deleteInfo: { field: string; value: string; type: string; position?: number }) => void;

// 扩展Editor类型以包含storage
interface EditorWithStorage extends Editor {
  storage: {
    chatDeleteCallback?: DeleteCallback;
    [key: string]: unknown;
  };
}

function onDelete(editor: Editor, deleteCallback?: DeleteCallback) {
  const { state } = editor;
  const { $from } = state.selection;

  // 检查光标前的节点
  const nodeBefore = $from.nodeBefore;
  if (nodeBefore && nodeBefore.type.name === 'chatSelectInput') {
    const deleteInfo = {
      field: nodeBefore.attrs.field,
      value: nodeBefore.attrs.value,
      type: nodeBefore.attrs.type || 'chatSelectInput',
      position: $from.pos - nodeBefore.nodeSize,
    };

    console.log('🔥 即将删除ChatSelectInput节点：', deleteInfo);

    // 调用删除回调函数
    deleteCallback?.(deleteInfo);
  }
  return false; // 继续默认删除行为
}

export const chatSelectInputProps = {
  // 表单参数组件类型
  type: { default: 'chatFormInputItem' },
  value: { default: '' },
  label: { default: '' },
  index: { default: 0 },
  field: { default: '' },
  valid: { default: true },
  param: { default: {} },
  options: { default: [] },
};

export const ChatSelectInputExtension = Node.create({
  name: 'chatSelectInput',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      ...chatSelectInputProps,
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="chatSelectInput"]' }];
  },
  renderHTML({ node }) {
    const msgList: TWorkflowMsgItem[] = [
      {
        type: 'String',
        required: 1,
        name: node.attrs.field,
        content: node.attrs.label,
      },
    ];
    const html = componentToHTML(ChatWorkflowMsg, {
      msgs: msgList,
    });
    return html;
  },
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        // 从编辑器的storage中获取删除回调
        const deleteCallback = (editor as EditorWithStorage).storage?.chatDeleteCallback;
        return onDelete(editor, deleteCallback);
      },
      Delete: ({ editor }) => {
        // 从编辑器的storage中获取删除回调
        const deleteCallback = (editor as EditorWithStorage).storage?.chatDeleteCallback;
        return onDelete(editor, deleteCallback);
      },
    };
  },
  addStorage() {
    return {
      chatDeleteCallback: null as DeleteCallback | null,
    };
  },
  addNodeView() {
    return VueNodeViewRenderer(ChatSelectInput);
  },
});
