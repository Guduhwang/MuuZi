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
  boxType: string;
};

export default function getSuggestion({
  curMemberList,
  updateMentionMember,
  updateMentionRect,
  chatDialogZIndex,
  boxType,
}: TGetSuggestionParams) {
  let component: VueRenderer;
  let popup: TippyInstance[];

  function updatePopup(params: Partial<TippyInstance['props']>) {
    popup[0]?.setProps(params);
  }

  function updatePopupWidth(targetDiv, instance) {
    console.log('目标', targetDiv);
    const width = targetDiv.offsetWidth + 'px';
    console.log('width', width);
    instance.popper.style.width = width;
    instance.popper.style.maxWidth = width;
  }

  function createMentionList(props: SuggestionProps) {
    console.log('创建createMentionList的props', props);
    console.log('createMentionList - curMemberList.value:', curMemberList.value);
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
      console.warn('createMentionList - props.clientRect is null');
      return;
    }
    const targetDiv = document.getElementById(`chatInputWrapContent_${boxType}`);
    if (!targetDiv) {
      console.error(`createMentionList - targetDiv not found: chatInputWrapContent_${boxType}`);
      return;
    }
    console.log('createMentionList - targetDiv found:', targetDiv);
    popup = tippy('body', {
      // getReferenceClientRect: props.clientRect,
      getReferenceClientRect: () => targetDiv.getBoundingClientRect(),
      maxWidth: 'none',
      appendTo: () => document.body,
      content: component.element,
      showOnCreate: true,
      interactive: true,
      trigger: 'manual',
      hideOnClick: true,
      placement: 'top-start',
      // zIndex: chatDialogZIndex.value + 1,
      zIndex: 9999,
      onCreate(instance) {
        console.log('createMentionList - popup created');
        updatePopupWidth(targetDiv, instance);
        // 添加 resize 监听
        const resizeObserver = new ResizeObserver(() => {
          updatePopupWidth(targetDiv, instance);
          instance.popperInstance.update();
        });
        resizeObserver.observe(targetDiv);

        // 销毁时取消监听
        instance.setProps({
          onDestroy: () => resizeObserver.disconnect(),
        });
      },
    });
  }

  const suggestions: MentionOptions['suggestion'] = {
    items: ({ query }: { query: string }) => {
      console.log('mention items - curMemberList.value:', curMemberList.value);
      console.log('mention items - query:', query);
      const filtered = curMemberList.value.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
      console.log('mention items - filtered:', filtered);
      return filtered;
    },
    command: ({ editor, range, props }) => {
      function insertMention() {
        // increase range.to by one when the next node is of type "text"
        // and starts with a space character
        console.log('执行command', editor, range, props);
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
          console.log('mention onStart', props);
          console.log('mention onStart - curMemberList.value:', curMemberList.value);
          // 如果已经存在一个@的人了，就不显示mentions了
          let hasMention = false;
          props.editor.state.doc.descendants((node) => {
            if (node.type.name === 'mention') {
              hasMention = true;
              return false;
            }
          });
          if (hasMention) {
            console.log('mention onStart - hasMention is true, not showing');
            return false;
          }
          // 检查成员列表是否为空
          if (!curMemberList.value || curMemberList.value.length === 0) {
            console.warn('mention onStart - curMemberList is empty, not showing');
            return false;
          }
          console.log('mention onStart - creating mention list');
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
