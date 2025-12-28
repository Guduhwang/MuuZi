<template>
  <view class="chat-group">
    <view class="list">
      <view class="item" v-for="i in groupStore.groupList" :key="i.id">
        <view class="item-header" @click="toggleGroup(item, index)">
          <view class="left">
            <img :src="iconArrowRight" alt="" class="arrow-right" />
            <view class="group-name">{{ i.name }}</view></view
          >
          <img src="/svg/arrow-down.svg" alt="" class="arrow-down" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGroupStore } from '/@/store/group.store';
import { useImStore } from '/@/store/im.store';
import './css/aiBox.scss';
defineOptions({
  name: 'ChatGroup',
});

const groupStore = useGroupStore();
const imStore = useImStore();

const iconArrowRight = computed(() => {
  return '/svg/arrow-right.svg';
});

function getMessageList() {
  if (activeChatTarget.value) {
    // 可以直接判断messageList，但是那样本函数就会在messageList执行完后才执行，没必要
    if (!messageHistory.value[activeChatTarget.value.friendId]?.length) {
      imStore.refreshMessageHistoryItem(activeChatTarget.value.friendId).then(() => {
        scrollToBottom();
      });
    } else {
      scrollToBottom();
    }
  }
}

function getGroupMemberList(groupId: number) {
  if (groupMemberMap.value[groupId]) {
    return;
  }
  // service.base.groupMember
  //   .memberList({ groupIds: [groupId], pageSize: import.meta.env.VITE_MAX_GROUP_NUMBER * 1, page: 1 })
  //   .then((groupMemberList) => {
  //     groupMemberMap.value[groupId] = groupMemberList[0]?.members;
  //   });
  groupStore.getGroupMember([groupId]);
}

const toggleGroup = async (gp: Eps.BaseFriendEntity, index: number) => {
  // 设置激活的群组
  imStore.setActiveChatTarget(index);
  // imStore.setActiveGroup(0);
  getMessageList();
  getGroupMemberList(gp.friendId!);
};
// const groupList = computed(() => {
//   const list = [...(groupStore.groupList || [])];
//   const result = new Array(12).fill({
//     type: 'add',
//   });
//   list.forEach((item, index) => {
//     if (item.position || item.position === 0) {
//       result[item.position] = item;
//     } else {
//       result[index] = item;
//     }
//   });
//   console.log('群', result);
//   return result;
// });
</script>
