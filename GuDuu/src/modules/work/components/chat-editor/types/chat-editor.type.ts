import { TChatInputTimerForm } from '../chat-input-timer-form/types/chat-input-timer-form.type';

export type ChatEditorFormParams = Record<string, string | number | boolean>;

export interface TUpdateMentionMemberParams {
  member: Eps.BaseGroupMemberEntity;
  timerFormData?: TChatInputTimerForm;
  callback: () => void;
}
