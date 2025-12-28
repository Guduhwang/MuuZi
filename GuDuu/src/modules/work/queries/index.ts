import { enabled } from 'store';
import type { TMembersPackConfigItem, TMembersParentConfig } from '../components/member-add/types/member-add.type';
import type { TAuthItem } from '../types/auth.type';
import { service } from '/@/cool';

function getMemberConfig() {
  return service.base.app.all().then((res) => {
    return res as Record<number, TMembersParentConfig[]>;
  });
}

/**
 * 获取成员配置
 */
export const getMemberConfigQuery = {
  queryKey: ['getMemberConfig'],
  queryFn: getMemberConfig,
  staleTime: Infinity,
};

function getAuthMap() {
  return service.base.auth.list().then((res) => {
    let map = {};
    if (res) {
      map = res.reduce((acc, curr) => {
        if (!acc[curr.type]) {
          acc[curr.type] = [];
        }
        acc[curr.type].push(curr);
        return acc;
      }, {});
    }
    return map as Record<string, TAuthItem[]>;
  });
}

/**
 * 获取认证列表
 */
export const getAuthMapQuery = {
  queryKey: ['getAuthMap'],
  queryFn: getAuthMap,
  staleTime: Infinity,
};

/**
 * 获取配置包列表
 */
export const getConfigPackListQuery = {
  queryKey: ['getConfigPackList'],
  queryFn: getConfigPackList,
  staleTime: Infinity,
  enabled: false,
};

function getConfigPackList() {
  return service.base.appConfig.list({ appId: 7001 }).then((res) => {
    return res as TMembersPackConfigItem[];
  });
}
