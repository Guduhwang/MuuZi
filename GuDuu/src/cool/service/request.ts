import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ElMessage } from 'element-plus';
import { endsWith } from 'lodash-es';
import { storage } from '/@/cool/utils';
import { useBase } from '/$/base';
import { router } from '../router';
import { config, isDev } from '/@/config';

// 创建 axios 实例
const request = axios.create({
  timeout: import.meta.env.VITE_TIMEOUT, // 设置请求超时时间
  withCredentials: false, // 不携带凭证
});

// 配置 NProgress
NProgress.configure({
  showSpinner: true, // 显示加载指示器
  minimum: 0.1, // 最小百分比
  trickleSpeed: 200, // 自动递增间隔
});

// 重写 NProgress.start 方法，添加时间戳记录
const originalStart = NProgress.start;
NProgress.start = function () {
  const result = originalStart.call(this);
  const progressElement = document.querySelector('#nprogress');
  if (progressElement) {
    progressElement.setAttribute('data-start-time', Date.now().toString());
  }
  return result;
};

// 请求队列，用于存储待处理的请求
let queue: Array<(token: string) => void> = [];

// 标识是否正在刷新 token
let isRefreshing = false;

// 请求计数器，用于跟踪进行中的请求数量
let requestCount = 0;
// 进度条状态锁，防止重复启动
let progressBarLocked = false;

// 请求拦截器
request.interceptors.request.use(
  (req: AxiosRequestConfig) => {
    const { userStore } = useBase(); // 获取用户信息

    if (req.url) {
      // 控制请求进度条的显示
      if (!config.ignore.NProgress.some((e) => req.url.match(new RegExp(`${e}.*`))) && (req.NProgress ?? true)) {
        // 增加请求计数
        requestCount++;
        // 只在第一个请求时启动进度条，并添加锁保护
        if (requestCount === 1 && !progressBarLocked) {
          progressBarLocked = true;
          NProgress.start();
        }
      }
    }

    // 在开发环境中打印请求信息
    if (isDev) {
    }

    if (!req.headers) {
      req.headers = {};
    }

    // 设置请求头中的语言（后端会根据该字段返回对应的菜单、字典多语言）
    req.headers['language'] = config.i18n.locale || 'zh-cn';

    // 验证 token
    if (userStore.token) {
      // 设置请求头中的 Authorization
      if (req.headers['Authorization'] !== null) {
        req.headers['Authorization'] = userStore.token;
      }

      // 忽略特定请求
      if (['eps', 'refreshToken'].some((e) => endsWith(req.url, e))) {
        return req;
      }

      // 判断 token 是否过期
      if (storage.isExpired('token')) {
        // 判断 refreshToken 是否过期
        if (storage.isExpired('refreshToken')) {
          ElMessage.error('登录状态已失效，请重新登录');
          userStore.logout();
        } else {
          // 如果不在刷新中，则刷新 token
          if (!isRefreshing) {
            isRefreshing = true;

            userStore
              .refreshToken()
              .then((token) => {
                queue.forEach((cb) => cb(token)); // 处理队列中的请求
                queue = [];
                isRefreshing = false;
              })
              .catch(() => {
                userStore.logout();
              });
          }

          // 返回一个新的 Promise，等待 token 刷新完成
          return new Promise((resolve) => {
            queue.push((token) => {
              if (req.headers) {
                req.headers['Authorization'] = token; // 重新设置 token
              }
              resolve(req);
            });
          });
        }
      }
    }

    return req;
  },
  (error) => {
    // 减少请求计数
    requestCount--;
    // 只在所有请求完成时关闭进度条
    if (requestCount <= 0) {
      requestCount = 0;
      progressBarLocked = false;
      NProgress.done(); // 结束进度条
    }
    return Promise.reject(error); // 请求错误处理
  },
);

// 响应拦截器
request.interceptors.response.use(
  (res) => {
    // 减少请求计数
    requestCount--;
    // 只在所有请求完成时关闭进度条
    if (requestCount <= 0) {
      requestCount = 0;
      progressBarLocked = false;
      NProgress.done(); // 结束进度条
    }

    if (!res?.data) {
      return res;
    }

    const { code, data, message } = res.data;

    if (!code) {
      return res.data; // 返回数据
    }

    switch (code) {
      case 1000:
        return data; // 成功返回数据
      default:
        ElMessage.error(message);
        return Promise.reject({ code, message }); // 处理错误
    }
  },
  async (error) => {
    // 减少请求计数
    requestCount--;
    // 只在所有请求完成时关闭进度条
    if (requestCount <= 0) {
      requestCount = 0;
      progressBarLocked = false;
      NProgress.done(); // 结束进度条
    }

    if (error.response) {
      const { status } = error.response;
      const message = error.response?.data?.message || error.message;
      const { userStore } = useBase();

      if (status == 401) {
        userStore.logout(); // 未授权，登出用户
      } else {
        // if (!isDev) {
        //   switch (status) {
        //     case 403:
        //       router.push('/403'); // 禁止访问
        //       break;

        //     case 500:
        //       router.push('/500'); // 服务器错误
        //       break;

        //     case 502:
        //       router.push('/502'); // 网关错误
        //       break;
        //   }
        // }
        ElMessage.error(message);
      }
    } else {
      // 网络错误或请求超时
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        ElMessage.error('Request timeout, please try again');
      } else if (error.message.includes('Network Error')) {
        ElMessage.error('Network error, please check your connection');
      }
    }
    return Promise.reject({ message: error.response?.data?.message || error.message }); // 返回错误信息
  },
);

export { request };
