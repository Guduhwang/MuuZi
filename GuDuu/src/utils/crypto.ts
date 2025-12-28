// Polyfill 实现的 randomUUID，兼容浏览器和 Node.js 环境
export function getUUID() {
  // 1. 优先使用浏览器的 crypto.randomUUID()
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // 3. Fallback: 纯 JavaScript 实现 RFC4122 v4 UUID
  return 'xxxxxxxx-xxxx-xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 3) | 8;
    return v.toString(16);
  });
}
