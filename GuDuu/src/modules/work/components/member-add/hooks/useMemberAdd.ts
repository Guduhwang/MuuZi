import { ref } from 'vue';

export const useMemberAdd = () => {
  const isShowMemberAdd = ref(false);
  const memberEditForm = ref<Eps.BaseGroupMemberEntity>();

  function handleAddMember() {
    memberEditForm.value = undefined;
    isShowMemberAdd.value = true;
  }

  function handleEditMember(member: Eps.BaseGroupMemberEntity) {
    memberEditForm.value = {
      ...member,
      configForm: member.config,
    };
    console.log(memberEditForm.value);
    isShowMemberAdd.value = true;
  }
  return {
    isShowMemberAdd,
    memberEditForm,
    handleAddMember,
    handleEditMember,
  };
};
