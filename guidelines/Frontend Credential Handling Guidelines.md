# 前端凭证处理指南（精简版）

**项目**: x2mu-work-back ｜ **环境**: 生产 (guduu.co) ｜ **版本**: v1.0

---

## 目录
1. 概述与角色
2. 登录与存储流程
3. 存储机制与键名
4. 请求拦截与携带
5. 刷新策略与并发队列
6. 响应处理与 401 策略
7. 用户状态与多账号
8. 退出与清理
9. 安全要点
10. 速查示例

---

## 1. 概述与角色
- 双 Token：`token`（短效访问），`refreshToken`（长效刷新）。
- 关键文件：
  - `/src/cool/utils/storage.ts`：本地存储与过期检查。
  - `/src/store/user.ts`：用户状态与 Token 管理。
  - `/src/cool/service/request.ts`：请求/响应拦截。
- 统一携带：请求头 `Authorization: {token}`。

## 2. 登录与存储流程
- 登录接口（用户名/邮箱/验证码）成功后调用 `userStore.setToken(res)`。
- 期望返回字段：`token`, `expire`, `refreshToken`, `refreshExpire`, `userInfo`.
- 存储后立即获取用户信息：`service.base.comm.person()` → `userStore.set(res)`。

## 3. 存储机制与键名
- 使用基于 localStorage 的 `storage`：
  - 值键：`token`、`refreshToken`
  - 过期键：`token_deadtime`、`refreshToken_deadtime`
- 过期判定：`isExpired(key)` 提前 2 秒视为过期，避免请求中途失效。

## 4. 请求拦截与携带
- 语言头：`language = config.i18n.locale || 'zh-cn'`
- 携带 Token：若有 `userStore.token` 且头未显式置 null，则加 `Authorization`。
- 免鉴权直通：`/eps`、`/refreshToken`。

## 5. 刷新策略与并发队列
- 触发：`storage.isExpired('token')` 且 `refreshToken` 未过期。
- 队列去重：`isRefreshing` + `queue.push(cb)`，刷新完成后回放队列并设置新 Token。
- 刷新接口：`GET /api/admin/base/open/refreshToken?refreshToken=...`。
- 刷新失败或 `refreshToken` 过期：提示后 `userStore.logout()`。

## 6. 响应处理与 401 策略
- 成功：`code === 1000` 返回 `data`，否则提示 `message` 并 reject。
- 401：不再刷新，直接登出、清空凭证并跳转登录页（防止无效 Token 反复使用）。
- 其他网络/超时：提示错误，不触发登出。

## 7. 用户状态与多账号
- `useUserStore` 核心字段：`token`, `info`, `isLogined`.
- `loginList` 支持账号切换，结构含 `userInfo` 与 `tokenInfo`（含 deadtime）。
- 登录后缓存登录列表，刷新 Token 时同步更新对应用户的 tokenInfo。

## 8. 退出与清理
- 退出流程：`userStore.logout()` → `clear()` 清 token/info/localStorage → `router.push('/login')`。
- 可选调用后端 `POST /api/admin/base/comm/logout`，失败也照常本地清理。
- 退出默认不清 `refreshToken` 与 `loginList`，以便多账号切换。

## 9. 安全要点
- HTTPS 强制；Token 不入 URL。
- localStorage 有 XSS 风险，需配合前端防御（内容安全策略、输入/输出净化）。
- 过期时间合理设置，提前 2 秒判过期。
- 401 直接登出；刷新失败直接登出。

## 10. 速查示例
- 登录并存储：
  ```ts
  const res = await service.base.open.login({ username, password, captchaId, verifyCode });
  userStore.setToken(res);
  await userStore.get();
  ```
- 手动刷新：
  ```ts
  const newToken = await userStore.refreshToken();
  ```
- 检查过期：
  ```ts
  if (storage.isExpired('token')) userStore.refreshToken();
  ```
- 发请求（自动带头）：
  ```ts
  const me = await service.base.comm.person();
  ```
- 退出：
  ```ts
  await service.base.comm.logout().catch(() => {});
  userStore.logout();
  ```

---

**维护**: 开发团队 ｜ **最后更新**: 2024 年  
关联文件：`/src/cool/service/request.ts`、`/src/store/user.ts`、`/src/cool/utils/storage.ts`

