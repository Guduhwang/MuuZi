import type { Ref } from 'vue';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { Instance as TippyInstance } from 'tippy.js';
import type { TUpdateMentionMemberParams } from '../types/chat-editor.type';
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import MentionList from '../MentionList.vue';
import { MentionOptions } from '@tiptap/extension-mention';

export type TGetSuggestionParams = {
  curMemberList: Ref<Eps.BaseGroupMemberEntity[]>;
  updateMentionMember: (params: TUpdateMentionMemberParams) => void;
  updateMentionRect: (rect: () => DOMRect | null) => void;
  chatDialogZIndex: Ref<number>;
};

export default function getSuggestion({
  curMemberList,
  updateMentionMember,
  updateMentionRect,
  chatDialogZIndex,
}: TGetSuggestionParams) {
  let component: VueRenderer;
  let popup: TippyInstance[];

  function updatePopup(params: Partial<TippyInstance['props']>) {
    popup[0]?.setProps(params);
  }

  function createMentionList(props: SuggestionProps) {
    component = new VueRenderer(MentionList, {
      props: {
        ...props,
        type: 'mentionList',
        updatePopup,
      },
      editor: props.editor,
    });
    updateMentionRect(() => props.clientRect?.() || null);

    if (!props.clientRect) {
      return;
    }
    popup = tippy('body', {
      getReferenceClientRect: props.clientRect,
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

  const suggestions: MentionOptions['suggestion'] = {
    items: ({ query }: { query: string }) => {
      return curMemberList.value.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
    },
    command: ({ editor, range, props }) => {
      function insertMention() {
        // increase range.to by one when the next node is of type "text"
        // and starts with a space character
        const nodeAfter = editor.view.state.selection.$to.nodeAfter;
        const overrideSpace = nodeAfter?.text?.startsWith(' ');
        if (overrideSpace) {
          range.to += 1;
        }
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'mention',
              attrs: props,
            },
            {
              type: 'text',
              text: ' ',
            },
          ])
          .run();

        // get reference to `window` object from editor element, to support cross-frame JS usage
        editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
        return props;
      }
      // 直接点击的时候，会导致不销毁mentions弹窗,如下让mentions弹窗销毁
      editor.chain().focus();
      updateMentionMember({
        member: curMemberList.value.find((item) => item.userId === props.id)!,
        timerFormData: props.timerFormData,
        callback: insertMention,
      });
    },
    render: () => {
      return {
        onStart: (props) => {
          console.log('onStart');
          // 如果已经存在一个@的人了，就不显示mentions了
          let hasMention = false;
          props.editor.state.doc.descendants((node) => {
            if (node.type.name === 'mention') {
              hasMention = true;
              return false;
            }
          });
          if (hasMention) {
            return false;
          }
          createMentionList(props);
        },

        onUpdate(props) {
          console.log('onUpdate');

          component.updateProps(props);
          updateMentionRect(() => props.clientRect?.() || null);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: () => props.clientRect?.(),
          });
        },

        onKeyDown(props) {
          if (props.event?.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          console.log('onExit');
          popup[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };

  /**
   * 弹窗是否激活中
   *  */
  function isPopInactive() {
    return !popup?.length || popup[0]?.state?.isDestroyed;
  }
  return { suggestions, isPopInactive };
}
