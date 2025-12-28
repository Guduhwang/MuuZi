import { useAppStore } from './app';
import { useMenuStore } from './menu';
import { useProcessStore } from './process';
import { useUserStore } from './user';
import { useGroupStore } from './group.store';
import useDesktopStore from './desktop';
import { useMemberStore } from './member';
import { useInviteStore } from './invite';
import { useImStore } from './im.store';
import { useSocketStore } from './socket.store';
import { useNftStore } from './nft';
import useEventStore from './evnet.store';
import { useSiteStore } from './site';

export function useStore() {
  const app = useAppStore();
  const menu = useMenuStore();
  const process = useProcessStore();
  const userStore = useUserStore();
  const groupStore = useGroupStore();
  const desktopStore = useDesktopStore();
  const memberStore = useMemberStore();
  const invite = useInviteStore();
  const imStore = useImStore();
  const socketStore = useSocketStore();
  const nft = useNftStore();
  const eventStore = useEventStore();
  const siteStore = useSiteStore();
  function resetAllStore() {
    userStore.$restore();
    groupStore.$restore();
    desktopStore.$restore();
    memberStore.$restore();
    invite.$restore();
    imStore.$restore();
    socketStore.$restore();
    nft.$restore();
    eventStore.$restore();
    siteStore.$restore();
  }

  return {
    resetAllStore,
    app,
    menu,
    process,
    userStore,
    groupStore,
    desktopStore,
    memberStore,
    invite,
    imStore,
    socketStore,
    nft,
    eventStore,
    siteStore,
  };
}
