import type { InjectionKey, Ref } from 'vue';

export const isChatGroupDisabledSymbol = Symbol('isChatGroupDisabled') as InjectionKey<Ref<boolean>>;

export const updateChatGroupDisabledSymbol = Symbol('updateChatGroupDisabled') as InjectionKey<
  (value: boolean) => void
>;

export const chatDialogZIndexSymbol = Symbol('chatDialogZIndex') as InjectionKey<Ref<number>>;

// 插入的图片类型参数信息，需要在聊天群组件内显示，而不是只是在富文本内显示
export const chatGroupImgInputUploadCptInfoSymbol = Symbol('chatGroupImgInputUploadCptInfo') as InjectionKey<
  Ref<{ field: string; value: string }[]>
>;

// 更新插入的图片类型参数信息，需要在聊天群组件内显示，而不是只是在富文本内显示
export const updateChatImgInputUploadCptInfoSymbol = Symbol('updateChatImgInputUploadCptInfo') as InjectionKey<
  (field: string, value: string, type?: 'add' | 'del') => void
>;
