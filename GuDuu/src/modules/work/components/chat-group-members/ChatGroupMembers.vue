<template>
  <div class="chatGroupMembers" v-if="show">
    <div class="chatGroupMembers__header">
      <div class="chatGroupMembers__title">Members</div>
      <div class="chatGroupMembers__close" @click="handleClose">
        <el-icon><Close /></el-icon>
      </div>
    </div>
    <div class="chatGroupMembers-search">
      <el-input v-model="searchVal" placeholder="Search members" clearable class="w-full" />
    </div>
    <div class="chatGroupMembers__list">
      <div v-for="item in list" :key="item.id" class="chatGroupMembers__member-item">
        <ChatMemberProfileWrap :member="item">
          <img class="chatGroupMembers__avatar" :src="item.avatar" :alt="item.name" />
        </ChatMemberProfileWrap>
        <div class="chatGroupMembers__info">
          <div class="chatGroupMembers__name">{{ item.name }}</div>
          <!-- <div class="chatGroupMembers__role">{{ item.role || 'Member' }}</div> -->
        </div>
        <!-- <div class="chatGroupMembers__actions">
          <el-button class="chatGroupMembers__action-button" size="small" @click="handleMemberAction(item)">
            <el-icon><More /></el-icon>
          </el-button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, inject, ref } from 'vue';
import './css/chatGroupMembers.scss';
import ChatMemberProfileWrap from '../chat-member-profile-wrap/ChatMemberProfileWrap.vue';

const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const memberList = inject<Ref<Eps.BaseGroupMemberEntity[]>>('curMemberList');

const list = computed(() => {
  return memberList?.value?.filter((item) => item.name.includes(searchVal.value.trim())) || [];
});

const handleMemberAction = (member: Eps.BaseGroupMemberEntity) => {
  // TODO: 实现成员操作逻辑
  console.log('Member action:', member);
};

const handleAddMember = () => {
  // TODO: 实现添加成员逻辑
  console.log('Add member clicked');
};

function handleClose() {
  emit('update:show', false);
}

const searchVal = ref('');
</script>
