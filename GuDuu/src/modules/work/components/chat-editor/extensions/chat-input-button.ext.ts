import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ChatInputButton from '../ChatInputButton.vue';
import { componentToHTML } from '/@/modules/work/util/vue';

export const ChatInputButtonExtension = Node.create({
  name: 'chatInputButton',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      form: { default: {} },
      timerFormData: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="chatInputButton"]' }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const form = node.attrs.form || {};
    // return {
    //   dom: [
    //     'span',
    //     {
    //       'data-type': 'chatInputButton',
    //       class: 'chatInputButton-wrap',
    //       ...HTMLAttributes,
    //     },
    //     [
    //       'button',
    //       {
    //         type: 'button',
    //         class: 'el-button el-button--primary el-button--plain el-button--small chatInputButton-btn',
    //       },
    //       btnText,
    //     ],
    //   ],
    //   contentDOM: document.createElement('div'),
    // };
    const html = componentToHTML(ChatInputButton, {
      node,
      form,
    });
    return html;
  },
  addNodeView() {
    return VueNodeViewRenderer(ChatInputButton);
  },
});
