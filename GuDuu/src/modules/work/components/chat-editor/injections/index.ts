import type { InjectionKey, Ref } from 'vue';

export const chatEditorInsertedMemberFieldMapSymbol = Symbol('chatEditorInsertedMemberFieldMap') as InjectionKey<
  Ref<Record<string, 1>>
>;

export const chatEditorUpdateInsertedMemberFieldMapSymbol = Symbol(
  'chatEditorUpdateInsertedMemberFieldMap',
) as InjectionKey<(field: string, type: 1 | 0) => void>;
