import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ChatFormInput from '../chat-form-input/ChatFormInput.vue';
import { componentToHTML } from '/@/modules/work/util/vue';
import ChatWorkflowMsg from '/@/modules/work/components/chat-workflow-msg-2/ChatWorkflowMsg.vue';
import { TWorkflowMsgItem } from '../../../types/message.type';

export const ChatFormInputExtension = Node.create({
  name: 'chatFormInput',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      form: { default: {} },
      onEnter: { default: () => {} },
      configParams: { default: () => {} },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="chatFormInput"]' }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const form = HTMLAttributes.form;
    const msgList: TWorkflowMsgItem[] = [];
    if (form) {
      Object.keys(form).forEach((key) => {
        msgList.push({
          type: 'String',
          required: 1,
          name: key,
          content: form[key],
        });
      });
    }
    const html = componentToHTML(ChatWorkflowMsg, {
      msgs: msgList,
      isDark: true,
    });
    return html;
  },
  addNodeView() {
    return VueNodeViewRenderer(ChatFormInput);
  },
});
