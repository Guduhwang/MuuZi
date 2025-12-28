import type { Socket } from 'socket.io-client';
import { defineStore } from 'pinia';
import { ref, watchEffect } from 'vue';
import { useStore } from '/@/store';

import io from 'socket.io-client';

export const useSocketStore = defineStore('socket', () => {
  const { userStore, imStore, eventStore } = useStore();

  let socket: Socket | null = null;

  const isConnected = ref(false);

  function connectSocket() {
    if (!isConnected.value) {
      socket = io('/', {
        transports: ['websocket'],
        auth: {
          token: userStore.token,
        },
        reconnection: true,
        reconnectionAttempts: 1000,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log(`重新连接成功，尝试次数：${attemptNumber}`);
        isConnected.value = true;
      });

      socket.on('data', (msg) => {
        console.log('服务端消息', msg);
      });

      socket.on('reconnect_error', (error) => {
        console.error('重新连接失败，错误信息：', error);
      });

      socket.on('reconnect_failed', () => {
        console.error('重连失败，已停止尝试');
      });
      // [
      //   'notice',
      //   {
      //     message: 78,
      //     memberId: 278,
      //     data: {
      //       id: 572,
      //       createTime: '2025-07-08 10:22:07',
      //       updateTime: '2025-07-08 10:22:07',
      //       tenantId: null,
      //       fromId: 278,
      //       toId: 78,
      //       toType: 1,
      //       type: 1,
      //       content:
      //         '{"content_type":1,"data":"输入的key是33，输入的name是55","original_result":null,"type_for_model":2}',
      //       status: 0,
      //       at: [],
      //     },
      //   },
      // ];
      // 收到新消息
      socket.on('notice', (res: { data: Required<Eps.BaseMessageEntity>; message: number; memberId: number }) => {
        const message = res.data;
        // 统一使用 toId（群组ID）作为消息历史的key，无论是发送的消息还是接收的消息
        // res.message 是群组ID，TODO 后端问题，message字段应该改名为groupId
        const groupId = res.message || message.toId;
        imStore.delLoadingTarget({ groupId, memberId: res.memberId });
        // 使用 toType（群组类型：0私聊 1群聊）而不是 message.type（消息内容类型）
        const messageList = imStore.getMessageHistoryById(String(groupId), message.toType);
        messageList.push(message);
        imStore.updateMessageHistoryById(String(groupId), messageList);
        eventStore.emit('newMessage', message);
      });

      isConnected.value = true;
    }
  }

  function disconnectSocket() {
    if (isConnected.value) {
      socket?.disconnect();
      socket = null;
      isConnected.value = false;
    }
  }

  /**
   * 发送消息到本地
   */
  function sendMessageToLocal(message: Eps.BaseMessageEntity) {
    // 统一使用 toId 作为消息历史的key，并传递 toType（群组类型）
    const messageList = imStore.getMessageHistoryById(String(message.toId), message.toType);
    messageList.push(message);
    imStore.updateMessageHistoryById(String(message.toId), messageList);
  }

  /**
   * 发送消息到服务器
   */
  function sendMessageToServer(message: Eps.BaseMessageEntity) {
    console.log('发送消息到服务器', message);
    if (socket && isConnected) {
      socket.emit('sendMessage', { message: message });
    }
  }

  /**
   * 发送消息到本地和服务器
   */
  function sendMessage(message: Eps.BaseMessageEntity) {
    sendMessageToLocal(message);
    sendMessageToServer(message);
  }

  watchEffect(() => {
    if (userStore.token) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  });

  return {
    sendMessage,
    sendMessageToLocal,
    sendMessageToServer,
    socket,
  };
});
