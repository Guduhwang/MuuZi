// src/sodium-init.ts

if (typeof self === 'undefined' && typeof window !== 'undefined') {
  (window as any).self = window;
}

import sodium from 'libsodium-wrappers-sumo';

// ✅ 不使用顶层 await，改为异步立即执行函数 IIFE
(async () => {
  await sodium.ready;
  (window as any).__SODIUM__ = sodium;
  console.log('[libsodium] 初始化完成');
})();
