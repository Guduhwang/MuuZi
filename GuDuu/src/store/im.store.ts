import { defineStore } from 'pinia';
import { ref, computed, watchEffect, Ref, toRaw } from 'vue';
import { useStore } from '/@/store';
import { useCool } from '/@/cool';
import { TGroupItem } from '../modules/work/types/group.type';

export interface TAtMention {
  userId: number;
  nickName: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface TChatForm {
  content: string;
}

export interface TChatInputHistory {
  form: TChatForm;
  atMentions: TAtMention[];
}

export const useImStore = defineStore('im', () => {
  const { userStore } = useStore();
  const { service } = useCool();

  const activeChatTarget = ref<Eps.FriendEntity | null>(null);
  const activeIndex = ref<number | null>(null);
  // 展开的群ids
  const openGroupIds = ref<number[]>([]);
  // 上传面板
  const uploadFilePanelShow = ref<boolean>(false);
  // const friendList = ref<Required<Eps.BaseFriendEntity>[]>([]);
  const friendList = ref<Eps.FriendEntity[]>([]);
  const messageHistory = ref<Record<string, Required<Eps.BaseMessageEntity>[]>>({});
  const activeGroupId = ref(0);
  const chatInputHistory = ref<Map<number, TChatInputHistory>>(new Map());
  // 正在loading的群的成员的集合
  const loadingGroupMemberMap = ref(new Map());

  function getMessageHistoryById(id: string, type: number) {
    if (!messageHistory.value[id]) {
      refreshMessageHistoryItem(id, type);
      return [];
    } else {
      return messageHistory.value[id];
    }
  }

  /**
   * 根据消息实体获取真正的响应的消息历史对象（消息对象可能会被改变）
   */
  function getMessageHistoryByMsgEntity(message: Required<Eps.BaseMessageEntity>) {
    return getMessageHistoryById(message.toId);
  }

  /**
   * 根据消息实体获取真正的响应的消息对象（因为消息对象可能会被改变）
   */
  function getMessageByMsgEntity(message: Required<Eps.BaseMessageEntity>) {
    const list = getMessageHistoryByMsgEntity(message);
    if (list.length) {
      return list.find((item: Required<Eps.BaseMessageEntity>) => item.id === message.id);
    }
    return null;
  }

  function updateMessageHistoryById(id: string, messageList: Required<Eps.BaseMessageEntity>[]) {
    messageHistory.value[id] = messageList;
  }

  async function refreshFriendList() {
    const list = await service.base.friend.list({
      userId: userStore.info?.id,
    });
    if (list) {
      friendList.value = (list as Required<Eps.FriendEntity>[]).map((item) => ({
        ...item,
        avatar: item.avatar || item.groupavatar,
      }));
    }
    if (friendList.value.length) {
      setActiveChatTarget(0);
    } else {
      activeChatTarget.value = null;
      activeIndex.value = null;
    }
  }

  function setFriendList(value: Required<Eps.FriendEntity>[]) {
    friendList.value = value;
  }

  function addFriendByGroup(group: TGroupItem) {
    friendList.value.push({
      ...group,
      friendId: group.id,
      status: 1,
    });
  }

  /**设置聊天历史 */
  function setChatInputHistory(groupId: number, value: TChatInputHistory) {
    chatInputHistory.value.set(groupId, value);
  }

  /**修改聊天历史的输入框内容*/
  function updateInputHistoryContent(groupId: number, content: string) {
    const curChat = chatInputHistory.value.get(groupId);
    if (curChat) {
      curChat.form.content = content;
    }
  }

  /**修改聊天历史的@提及内容*/
  function updateInputHistoryMention(groupId: number, mentions: TAtMention[]) {
    const curChat = chatInputHistory.value.get(groupId);
    if (curChat) {
      curChat.atMentions = mentions;
    }
  }

  function setActiveChatTarget(index: number) {
    activeChatTarget.value = friendList.value[index];
    activeIndex.value = index;
    if (!chatInputHistory.value.get(activeChatTarget.value.id!)) {
      setChatInputHistory(activeChatTarget.value.id!, {
        form: { content: '' },
        atMentions: [],
      });
    }
  }

  function setActiveChatTargetGroupById(id: number) {
    const index = friendList.value.findIndex((v) => v.friendId === id);
    setActiveChatTarget(index);
  }

  // 设置展开的群聊
  function setOpenGroupIds(groupIds: number[]) {
    openGroupIds.value = groupIds;
  }

  // 设置上传的面板显示
  function setUploadFilePanelShow(show: boolean) {
    uploadFilePanelShow.value = show;
  }

  function setActiveGroup(groupId: number) {
    activeGroupId.value = groupId;
  }

  async function refreshMessageHistoryItem(id: string, type: number) {
    try {
      const messages = await service.base.message.messageList({
        userId: userStore.info?.id,
        friendId: id,
        // 0私聊 1群聊
        type,
      });
      const obj = toRaw(messages);
      // const mergeObj = { ...messages, originContent: obj.content };
      // console.log('refreshMessageHistoryItem', mergeObj);
      messageHistory.value[id] = messages;
    } catch (error) {
      // messageHistory.value[`${id}_${type}`] = { error: true };
    }
  }

  function isGroupMemberLoading(groupId: number, memberId: number) {
    /* 判断是否正在等待加载群成员 */
    return loadingGroupMemberMap.value.has(groupId) && loadingGroupMemberMap.value.get(groupId).has(memberId);
  }

  function updateLoadingTarget({
    groupId,
    memberId,
    avatar,
    id,
  }: {
    groupId: number;
    memberId: number;
    avatar: string;
    id: number;
  }) {
    /* 更新正在等待的群和成员 */
    if (!loadingGroupMemberMap.value.has(groupId)) {
      loadingGroupMemberMap.value.set(groupId, new Map());
    }
    const memberMap = loadingGroupMemberMap.value.get(groupId);
    memberMap.set(memberId, {
      avatar,
      id,
    });
  }

  function delLoadingTarget({ groupId, memberId }: { groupId: number; memberId: number }) {
    /* 删除正在等待的群和成员 */
    const memberMap = loadingGroupMemberMap.value.get(groupId);
    if (memberMap) {
      const member = memberMap.get(memberId);
      if (member) {
        memberMap.delete(memberId);
        // 删除消息列表里的loading消息
        messageHistory.value[groupId] = messageHistory.value[groupId].filter((item) => item.id !== member.id);
        if (memberMap.size === 0) {
          loadingGroupMemberMap.value.delete(groupId);
        }
      }
    }
  }

  return {
    activeChatTarget,
    openGroupIds,
    uploadFilePanelShow,
    activeIndex,
    friendList,
    refreshFriendList,
    setActiveChatTarget,
    setOpenGroupIds,
    setUploadFilePanelShow,
    setFriendList,
    getMessageHistoryById,
    getMessageHistoryByMsgEntity,
    getMessageByMsgEntity,
    refreshMessageHistoryItem,
    updateMessageHistoryById,
    setActiveGroup,
    activeGroupId,
    messageHistory,
    setActiveChatTargetGroupById,
    setChatInputHistory,
    updateInputHistoryContent,
    updateInputHistoryMention,
    chatInputHistory,
    loadingGroupMemberMap,
    isGroupMemberLoading,
    updateLoadingTarget,
    delLoadingTarget,
    addFriendByGroup,
  };
});
