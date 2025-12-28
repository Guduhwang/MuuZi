import type { TGetSuggestionParams } from './mention-suggestion-config';
import Mention from '@tiptap/extension-mention';
import getSuggestion from './mention-suggestion-config';

export default function getMentionExtension({
  curMemberList,
  updateMentionMember,
  updateMentionRect,
  chatDialogZIndex,
}: TGetSuggestionParams) {
  const { suggestions: suggestionConfig, isPopInactive: isMentionPopInactive } = getSuggestion({
    curMemberList,
    updateMentionMember,
    updateMentionRect,
    chatDialogZIndex,
  });
  const mentionKit = Mention.configure({
    HTMLAttributes: {
      class: 'mention chatEditor-mention',
    },
    suggestion: suggestionConfig,
  });

  return {
    isMentionPopInactive,
    mentionKit,
  };
}
