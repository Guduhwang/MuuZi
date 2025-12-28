import { Editor, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ChatFlexibleInput from '../chat-flexible-input/ChatFlexibleInput.vue';
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
  if (nodeBefore && nodeBefore.type.name === 'chatFlexibleInput') {
    const deleteInfo = {
      field: nodeBefore.attrs.field,
      value: nodeBefore.attrs.value,
      type: nodeBefore.attrs.type || 'chatFlexibleInput',
      position: $from.pos - nodeBefore.nodeSize,
    };

    console.log('🔥 即将删除ChatFlexibleInput节点：', deleteInfo);

    // 调用删除回调函数
    deleteCallback?.(deleteInfo);
  }
  return false; // 继续默认删除行为
}

export const chatFlexibleInputProps = {
  // 表单参数组件类型
  type: { default: 'chatFormInputItem' },
  field: { default: '' },
  maxWidth: { default: null },
  placeholder: { default: '' },
  value: { default: '' },
  valid: { default: true },
  readonly: { default: false },
  param: { default: {} },
  onEnter: { default: () => {} },
  onInput: {},
};

export const ChatFlexibleInputExtension = Node.create({
  name: 'chatFlexibleInput',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      ...chatFlexibleInputProps,
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="chatFlexibleInput"]' }];
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
    console.log('添加dom节点', ChatFlexibleInput);
    return VueNodeViewRenderer(ChatFlexibleInput);
  },
  // onDestroy() {
  //   console.log('🎯 ChatFlexibleInput节点被删除了！', this.options);
  // },
  // addProseMirrorPlugins() {
  //   return [
  //     new Plugin({
  //       key: new PluginKey('chatFlexibleInputDeleteTracker'),
  //       appendTransaction(transactions, oldState, newState) {
  //         // 比较新旧状态，找出被删除的chatFlexibleInput节点
  //         const oldNodes = new Map();
  //         const newNodes = new Map();

  //         // 收集旧文档中的所有 chatFlexibleInput 节点
  //         oldState.doc.descendants((node: any, pos: number) => {
  //           if (node.type.name === 'chatFlexibleInput') {
  //             const key = `${pos}-${node.attrs.field}-${node.attrs.value}`;
  //             oldNodes.set(key, { node, pos });
  //           }
  //         });

  //         // 收集新文档中的所有 chatFlexibleInput 节点
  //         newState.doc.descendants((node: any, pos: number) => {
  //           if (node.type.name === 'chatFlexibleInput') {
  //             const key = `${pos}-${node.attrs.field}-${node.attrs.value}`;
  //             newNodes.set(key, { node, pos });
  //           }
  //         });

  //         // 找出被删除的节点
  //         oldNodes.forEach(({ node, pos }, key) => {
  //           if (!newNodes.has(key)) {
  //             console.log('🎯 ChatFlexibleInput节点被删除了！', {
  //               field: node.attrs.field,
  //               value: node.attrs.value,
  //               type: node.attrs.type,
  //               position: pos,
  //             });
  //           }
  //         });

  //         return null;
  //       },
  //     }),
  //   ];
  // },
});
