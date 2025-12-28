/**
 * chat group members float list
 *  */
import { ref } from 'vue';
export const useChatGroupMembersList = () => {
  const isShowGroupMembers = ref(false);

  function toggleGroupMembers() {
    isShowGroupMembers.value = !isShowGroupMembers.value;
  }

  return {
    isShowGroupMembers,
    toggleGroupMembers,
  };
};
