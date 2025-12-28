import type { PiniaPluginContext } from 'pinia';
import { cloneDeep } from 'lodash-es';

const piniaPluginReset = ({ store }: PiniaPluginContext) => {
  const initialState = cloneDeep(store.$state);
  store.$restore = () => {
    store.$patch(cloneDeep(initialState));
  };
};

export default piniaPluginReset;
