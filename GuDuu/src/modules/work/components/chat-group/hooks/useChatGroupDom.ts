import { nextTick, provide, ref, Ref, watch } from 'vue';
import { chatDialogZIndexSymbol } from '../injections/injections';
interface IProps {
  bodyId: string;
  show: Ref<boolean>;
}
export function useChatGroupDom(props: IProps) {
  const dialogZIndex = ref<number>(0);
  provide(chatDialogZIndexSymbol, dialogZIndex);

  watch(props.show, (val) => {
    if (val) {
      nextTick(() => {
        const body = document.getElementById(props.bodyId);
        if (body) {
          // 查找最近的类名为el-overlay的父元素，获取他的zindex
          const overlay = body.closest('.el-overlay');
          if (overlay) {
            dialogZIndex.value = parseInt(getComputedStyle(overlay).zIndex);
          }
        }
      });
    }
  });

  return {
    dialogZIndex,
  };
}
