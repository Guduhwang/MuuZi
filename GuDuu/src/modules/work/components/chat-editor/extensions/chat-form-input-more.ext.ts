import { Node, Editor } from '@tiptap/core';
import { nextTick } from 'vue';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import { NodeSelection } from '@tiptap/pm/state';
import ChatFormInputMore from '../chat-form-input-more/ChatFormInputMore.vue';

function onDelete(editor: Editor) {
  const { state } = editor;
  const { selection } = state;
  const $from = selection.$from;

  // 情况1: 检查是否选中了 chatFormInputMore 节点（光标在节点上面）
  if (selection instanceof NodeSelection && selection.node.type.name === 'chatFormInputMore') {
    // 阻止删除，将光标移动到节点前面
    const pos = selection.from;
    editor.commands.setTextSelection(pos);
    return true;
  }

  // 情况2: 光标在节点后面 - 允许正常删除，不做任何处理
  if ($from.nodeBefore && $from.nodeBefore.type.name === 'chatFormInputMore') {
    // 跳到节点前
    const pos = $from.pos - $from.nodeBefore.nodeSize;
    editor.commands.setTextSelection(pos);
    return true;
  }
  return false;
}

export const ChatFormInputMoreExtension = Node.create({
  name: 'chatFormInputMore',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      num: { default: 1 },
      // TWorkflowConfigParam[]
      params: { default: [] },
      // 已插入的字段
      insertedMemberFields: { default: {} },
      // 选择参数后，执行的插入函数
      onInsert: { default: () => {} },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="chatFormInputMore"]' }];
  },
  renderHTML() {
    return '';
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
  addNodeView() {
    return VueNodeViewRenderer(ChatFormInputMore);
  },
});

// 导出一个辅助函数，用于插入 chatFormInputMore 并将光标移动到前面
export function insertChatFormInputMoreWithCursor(editor: Editor) {
  const { from } = editor.state.selection;
  editor.commands.insertContent({
    type: 'chatFormInputMore',
  });
  nextTick(() => {
    editor.commands.setTextSelection(from);
    editor.view.focus();
  });
}
