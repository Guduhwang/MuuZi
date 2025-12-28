import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCool } from '/@/cool';
import { TGroupItem, TGroupListParams, TGroupMemberItem } from '/$/work/types/group.type';
import { useUserStore } from './user';
import useDesktopStore from './desktop';

export const useGroupStore = defineStore('group', () => {
  const { service } = useCool();
  const userStore = useUserStore();
  const desktopStore = useDesktopStore();

  const groupList = ref<TGroupItem[]>([]);
  // 全部的群组
  const allGroupList = ref<TGroupItem[]>([]);
  const groupMemberMap = ref<Record<number, Eps.BaseGroupMemberEntity[]>>({});
  // 此变量即将废弃
  const groupMemberList = ref<Record<number, TGroupMemberItem[]>>({});

  // 保存个人主页中的邀请注册链接
  const invitationShortUrl = ref<string>('');

  // TODO abandon
  function getGroupMemberListById(id: number) {
    if (!groupMemberList.value[id]) {
      refreshGroupMemberList(id);
      return []; // 返回一个加载中的占位符
    } else {
      return groupMemberList.value[id].filter((item) => item.userId !== userStore.info?.id);
    }
  }

  // TODO abandon
  async function refreshGroupMemberList(id: number) {
    groupMemberList.value[id] = (await service.base.groupMember.list({ groupId: id })) as TGroupMemberItem[];
  }

  function getGroupMember(groupIds: number[]) {
    return service.base.groupMember
      .memberList({ groupIds, pageSize: import.meta.env.VITE_MAX_GROUP_NUMBER * 1, page: 1 })
      .then((groupMemberList: { groupId: number; members: Eps.BaseGroupMemberEntity[] }[]) => {
        if (groupMemberList?.length) {
          const map = groupMemberList.reduce<Record<number, Eps.BaseGroupMemberEntity[]>>((pre, cur) => {
            pre[cur.groupId] = cur.members.map((v) => {
              // 7001特殊处理，7001是liblib配置包，受后台配置限制，只能如此改动
              if (v.parentType === 3) {
                const selectItem = v.config?.params?.find((p) => p.type === 'Select');
                if (selectItem) {
                  selectItem.options = v.configPacks.map((conf) => ({
                    value: conf.id,
                    label: conf.name,
                    ...conf,
                  }));
                }
              }
              return v;
            });
            return pre;
          }, {});
          groupMemberMap.value = { ...groupMemberMap.value, ...map };
        }
      });
  }

  function updateGroupMemberByMemberId(memberId: number, memberItem: TGroupMemberItem) {
    /** 根据成员id修改成员 */
    Object.keys(groupMemberMap.value).forEach((groupId) => {
      const groupIdNum = Number(groupId);
      const members = groupMemberMap.value[groupIdNum];
      if (members) {
        const memberIndex = members.findIndex((member) => member.userId === memberId);
        if (memberIndex !== -1) {
          // 使用深拷贝并替换整个对象，确保触发 Vue 的响应式更新
          const updatedMember = JSON.parse(JSON.stringify({ ...members[memberIndex], ...memberItem }));
          // 替换数组中的元素，触发响应式更新
          groupMemberMap.value[groupIdNum] = [
            ...members.slice(0, memberIndex),
            updatedMember,
            ...members.slice(memberIndex + 1),
          ];
        }
      }
    });
  }

  function deleteGroupMemberByMemberId(memberId: number) {
    /** 根据成员id删除成员 */
    Object.values(groupMemberMap.value).forEach((item) => {
      item.forEach((member) => {
        if (member.userId === memberId) {
          groupMemberMap.value[member.groupId] = groupMemberMap.value[member.groupId].filter(
            (item) => item.userId !== memberId,
          );
        }
      });
    });
  }

  async function refreshAllGroupList() {
    const data = (await service.base.group.list({ userId: userStore.info?.id })) as TGroupItem[];
    allGroupList.value = data;
    return data;
  }

  function delGroupById(groupId: number) {
    /* 通过群id删除本store里的群 */
    // 全部群
    allGroupList.value = allGroupList.value.filter((item) => item.id !== groupId);
    // 当前工作台所下属的群
    // 群里不包含工作台id，所以还得判断下
    if (groupList.value.some((item) => item.id === groupId)) {
      groupList.value = groupList.value.filter((item) => item.id !== groupId);
    }

    desktopStore.updateMember(groupId, 'del');
  }

  async function queryGroupById(groupId: number) {
    /* 获取群信息 */
    const data = (await service.base.group.list({
      ids: [groupId],
    })) as TGroupItem[];
    if (data?.length) {
      return data[0];
    }
    return null;
  }

  async function refresh() {
    let data: TGroupItem[] = [];
    // 有默认工作台，取默认工作台的数据，没有默认的，则表示未创建工作台，取所有数据
    if (desktopStore.defaultDesktop) {
      // 有默认桌面，但是无群，直接返回
      if (!desktopStore.defaultDesktop.member?.length) {
        groupList.value = [];
        return;
      }
      data = (await service.base.group.list({
        ids: desktopStore.defaultDesktop.member,
      })) as TGroupItem[];
    } else {
      data = await refreshAllGroupList();
    }

    groupList.value = data;
    // 查询群成员
    // TODO 群成员应该和群一起返回
    getGroupMember(data.map((item) => item.id!));
    return data;
  }

  function updateAllGroup(group: TGroupItem) {
    /* 更新 allGroupList */
    if (allGroupList.value.some((item) => item.id === group.id)) {
      allGroupList.value = allGroupList.value.map((item) => (item.id === group.id ? group : item));
    } else {
      allGroupList.value.push(group);
    }
  }

  function updateCurDesktopGroup(group: TGroupItem) {
    /* 更新 groupList */
    if (groupList.value.some((item) => item.id === group.id)) {
      groupList.value = groupList.value.map((item) => (item.id === group.id ? group : item));
    } else {
      groupList.value.push(group);
    }
    desktopStore.updateMember(group.id);
    // 更新群成员信息
    getGroupMember([group.id]);
  }

  // async function updateGroupByIdAsync(groupId: number) {
  //   /* 根据群id刷新群信息 */
  //   const data = (await service.base.group.list({
  //     ids: [groupId],
  //   })) as TGroupItem[];
  //   if (data?.length) {
  //     updateGroup(data[0]);
  //     getGroupMember([groupId]);
  //   }
  // }

  async function setGroup(item: Partial<TGroupItem>) {
    groupList.value.push(item as TGroupItem);
  }

  return {
    groupList,
    allGroupList,
    delGroupById,
    refreshAllGroupList,
    groupMemberMap,
    refresh,
    getGroupMember,
    getGroupMemberListById,
    refreshGroupMemberList,
    groupMemberList,
    setGroup,
    invitationShortUrl,
    updateAllGroup,
    queryGroupById,
    updateCurDesktopGroup,
    updateGroupMemberByMemberId,
    deleteGroupMemberByMemberId,
  };
});
