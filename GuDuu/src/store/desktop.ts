import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStore } from '/@/store';
import { useCool } from '/@/cool';

const useDesktopStore = defineStore('desktop', () => {
  // 是否显示编辑桌面信息弹窗
  const isShowEditDesktop = ref<boolean>(false);
  const { userStore } = useStore();
  const { service } = useCool();

  const desktopList = ref<Required<Eps.BaseDesktopEntity>[]>([]);
  const defaultDesktop = ref<Required<Eps.BaseDesktopEntity> | null>({
    id: 999,
    name: 'Default',
    avatar: '/static/img/default_desktop.png',
    member: [],
    sort: 0,
  });
  const editDesktop = ref<Required<Eps.BaseDesktopEntity> | null>(null);

  function setDefaultDesktop(item: Required<Eps.BaseDesktopEntity>) {
    defaultDesktop.value = item;
  }
  function setIsShowEditDesktop(value: boolean, item?: Required<Eps.BaseDesktopEntity>) {
    /* 设置是否显示编辑桌面信息弹窗 */
    isShowEditDesktop.value = value;
    if (item) {
      editDesktop.value = item;
    }
  }
  function sort(data: Required<Eps.BaseDesktopEntity>[]) {
    return data.sort((a, b) => {
      if (a.sort === null) {
        return 1;
      }
      if (b.sort === null) {
        return -1;
      }
      return a.sort! - b.sort!;
    });
  }

  async function getDesktopList() {
    const data = await service.base.desktop.list({ userId: userStore.info?.id });
    if (data) {
      desktopList.value = sort(data as Required<Eps.BaseDesktopEntity>[]);
    }
    return desktopList.value;
  }

  async function refresh() {
    await getDesktopList();
    // defaultDesktop.value = desktopList.value[0] || null;
  }

  const addGroupToDesktop = async (groupId: number, desktopId: number) => {
    // todo 需要优化，前端不能先查一遍
    const desktop = await service.base.desktop.info({ id: desktopId });
    service.base.desktop.update({ id: desktop.id, member: [...new Set([...desktop.member, groupId])] });
  };

  function updateMember(groupId: number, type: 'add' | 'del' = 'add') {
    if (defaultDesktop.value) {
      if (type === 'add') {
        defaultDesktop.value.member = [...new Set([...defaultDesktop.value.member, groupId])];
      } else {
        defaultDesktop.value.member = defaultDesktop.value.member.filter((v: number) => v !== groupId);
      }
    }
  }

  const addGroupToDefaultDesktop = async (groupId: number) => {
    if (defaultDesktop.value) {
      updateMember(groupId);
      service.base.desktop.update({ id: defaultDesktop.value.id, member: defaultDesktop.value.member });
    }
  };

  function updateSort(changedList: { id: number; sort: number }[]) {
    const changedMap = changedList.reduce((acc, v) => {
      acc[v.id] = v.sort;
      return acc;
    }, {} as Record<number, number>);
    const list = [...desktopList.value];
    list.forEach((v) => {
      if (changedMap[v.id] || changedMap[v.id] === 0) {
        v.sort = changedMap[v.id];
      }
    });
    desktopList.value = sort(list);
  }

  return {
    defaultDesktop,
    desktopList,
    getDesktopList,
    setDefaultDesktop,
    refresh,
    addGroupToDesktop,
    addGroupToDefaultDesktop,
    updateSort,
    updateMember,
    isShowEditDesktop,
    setIsShowEditDesktop,
    editDesktop,
  };
});

export default useDesktopStore;
