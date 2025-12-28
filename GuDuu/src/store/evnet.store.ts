import { defineStore } from 'pinia';
import { ref } from 'vue';

const useEventStore = defineStore('event', () => {
  const subscribeList = ref(new Map<string, Set<(payload: unknown) => void>>());

  function on(eventName: string, callback: (payload: unknown) => void) {
    let eventCallbackList = subscribeList.value.get(eventName);
    if (!eventCallbackList) {
      eventCallbackList = new Set();
      subscribeList.value.set(eventName, eventCallbackList);
    }
    eventCallbackList.add(callback);
  }

  function emit(eventName: string, payload: unknown) {
    const eventCallbackList = subscribeList.value.get(eventName);
    if (eventCallbackList) {
      eventCallbackList.forEach((callback) => callback(payload));
    }
  }

  function off(eventName: string) {
    const eventCallbackList = subscribeList.value.get(eventName);
    if (eventCallbackList) {
      eventCallbackList.clear();
      subscribeList.value.delete(eventName);
    }
  }
  // 保存订单号
  const orderNo = ref<string | null>(localStorage.getItem('orderNo') || null);
  console.log(orderNo.value);

  function setOrderNo(value: string) {
    orderNo.value = value;
    localStorage.setItem('orderNo', value);
  }
  function getOrderNo() {
    return orderNo.value;
  }
  function clearOrderNo() {
    orderNo.value = null;
    localStorage.removeItem('orderNo');
  }
  return {
    subscribeList,
    on,
    off,
    emit,
    orderNo,
    setOrderNo,
    getOrderNo,
    clearOrderNo,
  };
});

export default useEventStore;
