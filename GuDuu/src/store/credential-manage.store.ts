import { useQuery } from '@tanstack/vue-query';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuthMapQuery } from '../modules/work/queries';
import { TAuthItem } from '../modules/work/types/auth.type';

export const useCredentialManageStore = defineStore('credentialManageStore', () => {
  // 是否显示凭证管理对话框
  const isShowCredentialManage = ref<boolean>(false);
  // 凭证父类型 workflow widget plugin
  const credentialParentType = ref<string>('');
  // 凭证类型 coze n8n 。。。。
  const credentialType = ref<number | undefined>(undefined);

  function setCredentialParentType(type: string) {
    /* 设置当前的凭证父类型 */
    credentialParentType.value = type;
  }
  function setCredentialType(type?: number) {
    /* 设置当前的凭证子类型 */
    credentialType.value = type;
  }
  function setIsShowCredentialManage(value: boolean) {
    /* 设置是否显示凭证管理对话框 */
    isShowCredentialManage.value = value;
  }
  // 各个子类型对应的凭证对象（子类型id也是唯一的）
  const { data: authMap, refetch: refetchAuthMap } = useQuery({
    ...getAuthMapQuery,
    enabled: false,
  });

  function query() {
    refetchAuthMap();
  }

  function setAuthMap(type: number, map: TAuthItem) {
    if (authMap.value) {
      const typeKey = type.toString();
      if (!authMap.value[typeKey]) {
        authMap.value[typeKey] = [];
      }
      authMap.value[typeKey].push(map);
    }
  }
  return {
    isShowCredentialManage,
    credentialParentType,
    credentialType,
    authMap,
    query,
    setIsShowCredentialManage,
    setCredentialParentType,
    setCredentialType,
    setAuthMap,
  };
});
