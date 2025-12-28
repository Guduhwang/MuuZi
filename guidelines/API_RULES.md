## 接口规则（合并版）

本文件整合了通用接口规范（原 API_RULES）与业务接口清单（原 API_RULES2 / API接口文档.md），去重后形成统一文档。

> 注：已根据最新「对接内容」整理了前端实际复用度与风险提示，标注为【复用提示】。若与后端实际接口有出入，请以后端 `/admin/base/open/eps` 拉取的元数据为准。

---

### 0. 基础信息
- 域名：`guduu.co`
- 生产环境：`https://guduu.co`
- API 基础路径：`https://guduu.co/api/admin/base`
- 编码与格式：UTF-8，默认 `Content-Type: application/json; charset=utf-8`
- 传输：全站 HTTPS

### 1. 通用规范
- 鉴权：默认在请求头携带 `Authorization: {token}`；标记为 `IGNORE_TOKEN` 的接口无需认证。
- 必备 Header：
  - `Accept: application/json`
  - `Content-Type: application/json`（文件上传除外）
  - `Accept-Language`（可选，用于多语言）
- 幂等：GET 默认幂等；需要幂等的写操作可提供 `Idempotency-Key`（UUID）。
- 分页：`page` 从 1 起，`pageSize` 默认 20，最大 100。
- 时间格式：ISO 8601 或 Unix 时间戳，建议使用 UTC。
- 批量：避免单请求过大，推荐单次不超过 100 条。

【复用提示】前端统一 axios 封装：`baseUrl`(开发 `/dev`，生产 `/api`) + `namespace` + `path`，成功码固定 `code === 1000`。请求头额外携带 `language`。Token 过期自动用 `refreshToken` 换新。

### 2. 响应规范
- 成功：
  ```json
  {
    "code": 1000,
    "data": {},
    "message": "操作成功"
  }
  ```
- 失败：
  ```json
  { 
    "code": 1001,
    "data": null,
    "message": "错误信息"
  }
  ```
- 统一错误结构应包含 `code`、`message`，必要时附带 `traceId` 便于排障。

### 3. 安全与防护
- 仅允许 HTTPS；敏感接口可结合时间戳、nonce、签名头（如 `X-Sign-Nonce`、`X-Sign-Timestamp`、`X-Signature`）抵御重放。
- 建议所有接口在服务端记录 `traceId` 便于链路追踪。
- 429/503 建议客户端指数退避重试。

### 4. 注意事项
1. 所有时间字段使用 ISO 8601 或 Unix 时间戳。
2. 分页接口默认 `pageSize=20`，最大不超过 100。
3. 删除多为软删除（`delete=1`）。
4. 部分接口支持批量操作。
5. 外部链接的 `count` 与 `expireTime` 二选一。
6. 工作流的 params 需 base64 编码的 JSON 字符串。

---

## 5. 核心数据模型 (MuuZi定制)

### 5.1 User (用户)
- **核心字段**: `id`, `name`(用户名), `nickName`(昵称), `avatar`(头像), `email`, `phone`, `remark`, `tokens`, `isVip`, `status`
- **扩展字段**: `roleIds`(角色), `inviteCode`, `invitationShortUrl`, `serviceCode`(个人页脚本), `shareLink`, `teamId`, `ownerId`
- **MuuZi建议**: 重点关注头像、昵称、签名、社交链接、作品指标；敏感字段(roleIds, tokens)需谨慎处理。

### 5.2 Avatar / Agent (成员)
- **模板 (TMembersParentConfig)**: 用于生成可用的 Agent/成员配置。包含 `id`, `name`, `avatar`, `type`, `config[]`。
- **实例**: `userId`, `groupId`, `config`, `configPacks`。
- **MuuZi建议**: 复用模板+实例的 `avatar`/`name`/`config`。注意 `parentType=7001` 等特殊配置包的处理。

### 5.3 Group / Workspace (群组/空间)
- **字段**: `id`, `name`, `remark`, `avatar`, `userId`(创建者), `type`, `onwerIds`, `members`(人数), `position`。
- **MuuZi建议**: 适用于团队/工作空间展示。

### 5.4 Workflow (工作流)
- **定义**: 成员(Member)即工作流载体。
- **执行**: `execute { type, config, params }`。
- **消息**: `TWorkflowMsg { code, data, msg }`。
- **MuuZi建议**: 关注运行参数与展示型字段。

### 5.5 Personal Page (个人主页)
- **公开信息**: `nickName`, `remark`, `avatar`, `serviceCode`, `invitationShortUrl`。
- **作品 (Goods)**: `id`, `title`, `mainPic`, `price`, `video`, `typeId`, `workflowId`。
- **指标**: `totalViews`, `totalPurchases`, `totalEarned`。

---

## 6. MuuZi 集成与复用策略

### 6.1 推荐复用模块
- **✅ 鉴权/用户**: 登录/注册/刷新 (`open/login`, `open/loginByEmail`), 个人信息 (`comm/person`), 邀请列表 (`sys/user/invitedList`)。
- **✅ 社交/IM**: 好友列表 (`friend/list`), 消息记录 (`message/messageList`), 群组管理 (`group/*`), 群成员 (`groupMember/*`)。
- **✅ 展示/交易**: 公开主页 (`sys/user/openDetail`), 作品列表 (`goods/info/openList`), 订单记录 (`goods/order/myOrders`)。
- **✅ 基础服务**: 文件上传 (`comm/upload`), 站点配置 (`site/info` - 文案/Logo)。

### 6.2 需适配/抽象模块
- **⚠️ 权限体系**: 原系统 `permmenu` / `roleIds` 与 GuDuu 强绑定，MuuZi 需确认是否沿用或简化。
- **⚠️ 支付配置**: `site/info` 中的 Stripe/支付宝配置若不使用需屏蔽。
- **⚠️ 安全沙箱**: `serviceCode` (个人页脚本) 需确保来源可信。

### 6.3 风险提示
- **EPS 元数据**: 接口定义以运行时 `/admin/base/open/eps` 为准。
- **状态码**: 前端目前固定 `code === 1000` 为成功。
- **环境差异**: 开发环境前缀 `/dev`, 生产环境 `/api`, 需注意代理配置。

---

# API 接口清单

以下为业务接口列表，路径均以基础路径 `https://guduu.co/api/admin/base` 为前缀。内容以最新的《API接口文档(1).md》为准，并保留本文件的通用规范。

**域名**: guduu.co  
**生产环境**: https://guduu.co  
**API基础路径**: https://guduu.co/api/admin/base

---

## 目录

1. [认证与登录](#1-认证与登录)
2. [用户管理](#2-用户管理)
3. [网站配置](#3-网站配置)
4. [应用管理](#4-应用管理)
5. [群组管理](#5-群组管理)
6. [群成员管理](#6-群成员管理)
7. [桌面管理](#7-桌面管理)
8. [消息与工作流](#8-消息与工作流)
9. [授权管理](#9-授权管理)
10. [Prompt管理](#10-prompt管理)
11. [外部链接](#11-外部链接)
12. [好友管理](#12-好友管理)
13. [VIP与订阅](#13-vip与订阅)
14. [优惠券](#14-优惠券)
15. [支付相关](#15-支付相关)
16. [Token日志](#16-token日志)
17. [支付日志](#17-支付日志)
18. [通用接口](#18-通用接口)

---

## 1. 认证与登录

【复用提示】核心可直接复用：`open/login`、`open/loginByEmail`、`open/refreshToken`、`comm/person`、`comm/logout`、`open/eps`。验证码链路、第三方登录可按需取舍。

### 1.1 登录
- **接口地址**: `POST /api/admin/base/open/login`
- **接口说明**: 用户登录
- **请求参数**:
  ```json
  {
    "username": "string",  // 用户名
    "password": "string",   // 密码
    "captchaId": "string",  // 验证码ID
    "verifyCode": "string"  // 验证码
  }
  ```
- **响应说明**:
  ```json
  {
    "code": 1000,
    "data": {
      "token": "string",        // 访问令牌
      "refreshToken": "string"  // 刷新令牌
    }
  }
  ```

### 1.2 邮箱密码登录
- **接口地址**: `POST /api/admin/base/open/loginByEmail`
- **接口说明**: 使用邮箱和密码登录
- **请求参数**:
  ```json
  {
    "email": "string",    // 邮箱
    "password": "string"  // 密码
  }
  ```
- **响应说明**: 返回token信息

### 1.3 刷新Token
- **接口地址**: `GET /api/admin/base/open/refreshToken`
- **接口说明**: 刷新访问令牌
- **请求参数**:
  - `refreshToken` (Query): 刷新令牌
- **响应说明**: 返回新的token信息

### 1.4 获取验证码
- **接口地址**: `GET /api/admin/base/open/captcha`
- **接口说明**: 获取图形验证码
- **请求参数**:
  - `width` (Query, 可选): 宽度
  - `height` (Query, 可选): 高度
  - `color` (Query, 可选): 颜色
- **响应说明**: 返回验证码图片和ID

### 1.5 检查用户是否存在
- **接口地址**: `POST /api/admin/base/open/exist`
- **接口说明**: 检查邮箱是否已注册
- **请求参数**:
  ```json
  {
    "email": "string"  // 邮箱地址
  }
  ```
- **响应说明**: 返回布尔值

### 1.6 发送验证码
- **接口地址**: `POST /api/admin/base/open/sendCode`
- **接口说明**: 发送邮箱验证码
- **请求参数**:
  ```json
  {
    "email": "string",      // 邮箱地址
    "invitation": "string"  // 邀请码（可选）
  }
  ```
- **响应说明**: 成功或失败信息

### 1.7 校验验证码
- **接口地址**: `POST /api/admin/base/open/verifyCode`
- **接口说明**: 校验邮箱验证码并登录
- **请求参数**:
  ```json
  {
    "email": "string",  // 邮箱地址
    "code": "string"    // 验证码
  }
  ```
- **响应说明**: 返回token信息

### 1.8 退出登录
- **接口地址**: `POST /api/admin/base/comm/logout`
- **接口说明**: 用户退出登录
- **请求参数**: 无
- **响应说明**: 成功或失败信息

---

## 2. 用户管理

【复用提示】前端已用：`comm/person` 获取自我信息，`comm/personUpdate`、`sys/user/openDetail` 公开主页，`sys/user/list`/`invitedList` 团队成员与邀请。其余运营/安全敏感接口按需打开。

### 2.1 获取个人信息
- **接口地址**: `GET /api/admin/base/comm/person`
- **接口说明**: 获取当前登录用户的个人信息
- **请求参数**: 无
- **响应说明**: 返回用户详细信息

### 2.2 更新个人信息
- **接口地址**: `POST /api/admin/base/comm/personUpdate`
- **接口说明**: 更新当前用户个人信息
- **请求参数**:
  ```json
  {
    "nickName": "string",    // 昵称
    "avatar": "string",       // 头像
    "remark": "string",       // 备注
    "cover": "string",        // 封面
    "copyright": "string"     // 版权信息
  }
  ```
- **响应说明**: 成功或失败信息

### 2.3 更新用户信息
- **接口地址**: `POST /api/admin/base/sys/user/update`
- **接口说明**: 更新用户信息
- **请求参数**:
  ```json
  {
    "id": "number",          // 用户ID
    "nickName": "string",    // 昵称
    "avatar": "string",       // 头像
    "remark": "string",       // 备注
    "shareLink": "string",    // 分享链接
    "cover": "string",        // 封面
    "copyright": "string"     // 版权信息
  }
  ```
- **响应说明**: 成功或失败信息

### 2.4 删除用户
- **接口地址**: `POST /api/admin/base/sys/user/delete`
- **接口说明**: 软删除用户
- **请求参数**:
  ```json
  {
    "id": "number"  // 用户ID
  }
  ```
- **响应说明**: 成功或失败信息

### 2.5 保存补充资料
- **接口地址**: `POST /api/admin/base/sys/user/additionalInfo`
- **接口说明**: 保存用户补充资料
- **请求参数**:
  ```json
  {
    "id": "number",              // 用户ID
    "avatar": "string",          // 头像URL
    "industryId": "array",       // 行业ID列表
    "invitationCode": "string",  // 邀请码
    "inviteCode": "string",      // 邀请码（同invitationCode）
    "name": "string",            // 名称
    "nickName": "string",        // 昵称
    "password": "string",        // 密码
    "password2": "string"        // 确认密码
  }
  ```
- **响应说明**: 成功或失败信息

### 2.6 用户是否存在（检查昵称）
- **接口地址**: `POST /api/admin/base/sys/user/isExist`
- **接口说明**: 检查用户是否存在
- **请求参数**:
  ```json
  {
    "nickName": "string"  // 昵称
  }
  ```
- **响应说明**: 返回布尔值

### 2.7 发送重置密码验证码
- **接口地址**: `POST /api/admin/base/sys/user/sendResetPasswordCode`
- **接口说明**: 发送重置密码的验证码
- **请求参数**:
  ```json
  {
    "email": "string"  // 邮箱地址
  }
  ```
- **响应说明**: 成功或失败信息

### 2.8 重置密码
- **接口地址**: `POST /api/admin/base/sys/user/resetPassword`
- **接口说明**: 重置用户密码
- **请求参数**:
  ```json
  {
    "email": "string",     // 邮箱地址
    "code": "string",      // 验证码
    "password": "string"    // 新密码
  }
  ```
- **响应说明**: 成功或失败信息

### 2.9 成为博主
- **接口地址**: `POST /api/admin/base/sys/user/becomeBlogger`
- **接口说明**: 申请成为博主
- **请求参数**: 无
- **响应说明**: 成功或失败信息

### 2.10 更新应用信息
- **接口地址**: `POST /api/admin/base/sys/user/updateApp`
- **接口说明**: 更新应用信息
- **请求参数**:
  ```json
  {
    "id": "number",        // 应用ID
    "config": "object",    // 配置信息
    "tokens": "number",    // Token数量
    "remark": "string"     // 备注
  }
  ```
- **响应说明**: 成功或失败信息

### 2.11 公开详情
- **接口地址**: `POST /api/admin/base/sys/user/openDetail`
- **接口说明**: 获取用户公开信息
- **请求参数**:
  ```json
  {
    "name": "string"  // 用户名或昵称
  }
  ```
- **响应说明**: 返回用户公开信息

### 2.12 检查NFT质押
- **接口地址**: `POST /api/admin/base/sys/user/isNftStacked`
- **接口说明**: 检查是否质押了NFT
- **请求参数**:
  ```json
  {
    "address": "string"  // 钱包地址（可选）
  }
  ```
- **响应说明**: 返回布尔值

### 2.13 用户列表
- **接口地址**: `POST /api/admin/base/sys/user/list`
- **接口说明**: 获取用户列表
- **请求参数**:
  ```json
  {
    "keyword": "string",   // 关键词
    "type": "number",      // 类型
    "ownerId": "number"    // 所有者ID
  }
  ```
- **响应说明**: 返回用户列表

### 2.14 用户分页
- **接口地址**: `POST /api/admin/base/sys/user/page`
- **接口说明**: 分页获取用户列表
- **请求参数**:
  ```json
  {
    "page": "number",      // 页码
    "pageSize": "number",  // 每页数量
    "keyword": "string",   // 关键词
    "type": "number"       // 类型
  }
  ```
- **响应说明**: 返回分页数据

---

## 3. 网站配置

【复用提示】前端读取 `site/info` 用于站点文案/Logo/多语言；`site/save` 仅后台运营使用，MuuZi 如不需要支付/邮件配置可不开放。

### 3.1 获取网站信息
- **接口地址**: `POST /api/admin/base/site/info`
- **接口说明**: 获取网站配置信息
- **请求参数**: 无
- **响应说明**:
  ```json
  {
    "siteName": "string",              // 网站名
    "siteLogo": "string",              // LOGO
    "siteLightLogo": "string",         // 浅色图标
    "loginLogo": "string",             // 登录页LOGO
    "cornerIcon": "string",            // 网站图标
    "siteIcon": "string",              // 浏览器图标
    "siteDomain": "string",            // 域名
    "tokenPlan": "array",              // Token套餐
    "minTokenAmount": "number",        // 最低token数
    "newUserGiftTokens": "number",     // 新用户赠送token数
    "activityGifDays": "number",       // 活动赠送天数
    "activityEndDate": "string",       // 活动截至日期
    "desktopAnnouncement": "string",   // 桌面公告
    "postAnnouncement": "string",      // 弹窗公告
    "cornerQr": "string",              // 角落二维码
    "cornerEmail": "string",           // 角落邮箱
    "cornerLink": "string",            // 角落链接
    "loginAgreement": "string",        // 登录协议
    "loginIntro": "string",            // 登录页介绍
    "paymentAgreement": "string",      // 支付协议
    "websiteAgreement": "string",      // 网站协议
    "legalTerms": "string",            // 法律条款
    "emailHost": "string",             // 邮件服务器
    "emailAccount": "string",          // 邮件账号
    "emailPassword": "string",         // 邮件密码
    "alipayAppId": "string",           // 支付宝APP ID
    "alipayPrivateKey": "string",      // 支付宝私钥
    "alipayPublicKey": "string",       // 支付宝公钥
    "stripeSecretKey": "string",       // Stripe密钥
    "discordBotEnable": "boolean",     // 启用Bot
    "discordUserId": "string",         // Discord用户ID
    "discordBotToken": "string",       // Bot Token
    "discordClientId": "string",       // Client ID
    "discordGuildId": "string",        // Guild ID
    "discordApiBase": "string",        // API地址
    "googleClientId": "string",        // Google Client ID
    "webDiscordClientId": "string",    // 网页Discord Client ID
    "sendSiteData": "string",          // 发送网站数据
    "siteDataReceiveUrl": "string"     // 网站数据接收地址
  }
  ```

### 3.2 保存网站信息
- **接口地址**: `POST /api/admin/base/site/save`
- **接口说明**: 保存网站配置信息
- **请求参数**: 同获取网站信息的所有字段
- **响应说明**: 成功或失败信息

---

## 4. 应用管理

### 4.1 获取所有应用
- **接口地址**: `GET /api/admin/base/app/all`
- **接口说明**: 获取所有应用，按父类型分组
- **请求参数**: 无
- **响应说明**: 返回按parentType分组的应用列表

### 4.2 根据父类型获取应用
- **接口地址**: `GET /api/admin/base/app/byParent`
- **接口说明**: 根据父类型获取应用列表
- **请求参数**:
  - `parentType` (Query): 父类型
- **响应说明**: 返回应用列表

### 4.3 应用列表
- **接口地址**: `POST /api/admin/base/app/list`
- **接口说明**: 获取应用列表
- **请求参数**:
  ```json
  {
    "show": "number",      // 是否显示
    "parentType": "number" // 父类型
  }
  ```
- **响应说明**: 返回应用列表

### 4.4 应用分页
- **接口地址**: `POST /api/admin/base/app/page`
- **接口说明**: 分页获取应用列表
- **请求参数**:
  ```json
  {
    "page": "number",
    "pageSize": "number",
    "parentType": "number"
  }
  ```
- **响应说明**: 返回分页数据

---

## 5. 群组管理

【复用提示】前端常用：`group/list`、`group/updateGroupInfo`。新增/删除接口若 MuuZi 仅读可关闭写入。位置/奖励池等字段为 GuDuu 业务特有。

### 5.1 新增群组
- **接口地址**: `POST /api/admin/base/group/add`
- **接口说明**: 创建新群组
- **请求参数**:
  ```json
  {
    "name": "string",           // 群组名称
    "remark": "string",         // 备注
    "avatar": "string",         // 头像
    "type": "number",           // 类型（0:普通群组, 1:团队）
    "onwerIds": "array",        // 所有者ID列表
    "allocationRatio": "number", // 分配比例
    "rewardPool": "number",     // 奖励池
    "key": "string",            // 密钥
    "rows": "number",           // 行数
    "cols": "number",           // 列数
    "onBoard": "number",        // 是否上板
    "channelId": "string",      // 频道ID
    "position": "number"        // 位置
  }
  ```
- **响应说明**: 返回创建的群组信息

### 5.2 更新群组
- **接口地址**: `POST /api/admin/base/group/update`
- **接口说明**: 更新群组信息
- **请求参数**:
  ```json
  {
    "id": "number",
    "name": "string",
    "remark": "string",
    "avatar": "string",
    "allocationRatio": "number",
    "rewardPool": "number",
    "rows": "number",
    "cols": "number"
  }
  ```
- **响应说明**: 成功或失败信息

### 5.3 删除群组
- **接口地址**: `POST /api/admin/base/group/delete`
- **接口说明**: 软删除群组
- **请求参数**:
  ```json
  {
    "id": "number"  // 群组ID
  }
  ```
- **响应说明**: 成功或失败信息

### 5.4 群组列表
- **接口地址**: `POST /api/admin/base/group/list`
- **接口说明**: 获取群组列表
- **请求参数**:
  ```json
  {
    "id": "number",        // 群组ID
    "ids": "array",         // 群组ID列表
    "userId": "number",     // 用户ID
    "type": "number"        // 类型
  }
  ```
- **响应说明**: 返回群组列表

### 5.5 群组分页
- **接口地址**: `POST /api/admin/base/group/page`
- **接口说明**: 分页获取群组列表
- **请求参数**:
  ```json
  {
    "page": "number",
    "pageSize": "number",
    "userId": "number",
    "type": "number"
  }
  ```
- **响应说明**: 返回分页数据

### 5.6 更新群组信息
- **接口地址**: `POST /api/admin/base/group/updateGroupInfo`
- **接口说明**: 更新群(团队)信息
- **请求参数**:
  ```json
  {
    "groupId": "number",
    "info": {
      "name": "string",
      "remark": "string",
      "avatar": "string",
      "allocationRatio": "number",
      "rewardPool": "number",
      "rows": "number",
      "cols": "number"
    }
  }
  ```
- **响应说明**: 成功或失败信息

---

## 6. 群成员管理

【复用提示】核心复用：`memberList`/`memberDetail`、`teams`/`teamsByUserId`、`allMemberList`、`setTeamMemberRole`。`joinTeam`/`withdraw*` 取决于 MuuZi 是否开放自助团队。

### 6.1 新增群成员
- **接口地址**: `POST /api/admin/base/groupMember/add`
- **接口说明**: 添加群成员
- **请求参数**:
  ```json
  {
    "groupId": "number",    // 群组ID
    "userId": "number",     // 用户ID
    "name": "string",       // 成员名称
    "avatar": "string",     // 成员头像
    "authId": "number",     // 授权ID
    "authType": "number"    // 授权类型
  }
  ```
- **响应说明**: 返回创建的成员信息

### 6.2 更新群成员
- **接口地址**: `POST /api/admin/base/groupMember/update`
- **接口说明**: 更新群成员信息
- **请求参数**:
  ```json
  {
    "id": "number",
    "name": "string",
    "avatar": "string",
    "authId": "number",
    "authType": "number"
  }
  ```
- **响应说明**: 成功或失败信息

### 6.3 删除群成员
- **接口地址**: `POST /api/admin/base/groupMember/delete`
- **接口说明**: 批量删除群成员
- **请求参数**:
  ```json
  {
    "ids": "array"  // 成员ID列表
  }
  ```
- **响应说明**: 成功或失败信息

### 6.4 群成员列表
- **接口地址**: `POST /api/admin/base/groupMember/list`
- **接口说明**: 获取群成员列表
- **请求参数**:
  ```json
  {
    "groupId": "number",   // 群组ID
    "userId": "number"     // 用户ID
  }
  ```
- **响应说明**: 返回成员列表（包含用户信息）

### 6.5 群成员分页
- **接口地址**: `POST /api/admin/base/groupMember/page`
- **接口说明**: 分页获取群成员列表
- **请求参数**:
  ```json
  {
    "page": "number",
    "pageSize": "number",
    "groupId": "number",
    "userId": "number"
  }
  ```
- **响应说明**: 返回分页数据

### 6.6 加入团队
- **接口地址**: `POST /api/admin/base/groupMember/joinTeam`
- **接口说明**: 通过邀请码加入团队
- **请求参数**:
  ```json
  {
    "invitation": "string"  // base64编码的邀请码
  }
  ```
- **响应说明**: 成功或失败信息

### 6.7 退出所有团队
- **接口地址**: `POST /api/admin/base/groupMember/withdrawFromTeams`
- **接口说明**: 退出所有团队
- **请求参数**: 无
- **响应说明**: 成功或失败信息

### 6.8 退出指定团队
- **接口地址**: `POST /api/admin/base/groupMember/withdrawFromTeam`
- **接口说明**: 退出指定团队
- **请求参数**:
  ```json
  {
    "groupId": "number"  // 群组ID
  }
  ```
- **响应说明**: 成功或失败信息

### 6.9 获取加入的团队列表
- **接口地址**: `POST /api/admin/base/groupMember/teams`
- **接口说明**: 获取当前用户加入的团队列表
- **请求参数**: 无
- **响应说明**: 返回团队列表

### 6.10 查询用户的团队
- **接口地址**: `POST /api/admin/base/groupMember/teamsByUserId`
- **接口说明**: 查询某个用户的团队
- **请求参数**:
  ```json
  {
    "userId": "number"  // 用户ID
  }
  ```
- **响应说明**: 返回团队列表

### 6.11 团队成员列表
- **接口地址**: `POST /api/admin/base/groupMember/teamMember`
- **接口说明**: 获取当前用户的团队成员列表
- **请求参数**: 无
- **响应说明**: 返回团队成员列表

### 6.12 设置团队成员角色
- **接口地址**: `POST /api/admin/base/groupMember/setTeamMemberRole`
- **接口说明**: 设置团队成员角色
- **请求参数**:
  ```json
  {
    "userId": "number",    // 用户ID
    "isOwner": "number",   // 角色（11:队长, 12:副队长, 13:成员）
    "groupId": "number"    // 群组ID
  }
  ```
- **响应说明**: 成功或失败信息

### 6.13 是否能加入团队
- **接口地址**: `POST /api/admin/base/groupMember/canJoin`
- **接口说明**: 检查是否能加入团队
- **请求参数**:
  ```json
  {
    "key": "string"  // 团队密钥
  }
  ```
- **响应说明**: 返回布尔值

### 6.14 成员列表（分页）
- **接口地址**: `POST /api/admin/base/groupMember/memberList`
- **接口说明**: 群成员列表，支持多个组且各自分页
- **请求参数**:
  ```json
  {
    "groupIds": "array",   // 群组ID列表
    "page": "number",      // 页码
    "pageSize": "number"   // 每页数量
  }
  ```
- **响应说明**: 返回每个群组的成员列表和分页信息

### 6.15 所有成员列表
- **接口地址**: `POST /api/admin/base/groupMember/allMemberList`
- **接口说明**: 获取所有群成员列表
- **请求参数**:
  ```json
  {
    "parentType": "number"  // 父类型（可选）
  }
  ```
- **响应说明**: 返回成员列表

### 6.16 成员详情
- **接口地址**: `POST /api/admin/base/groupMember/memberDetail`
- **接口说明**: 按成员或群组获取成员信息
- **请求参数**:
  ```json
  {
    "memberId": "number",  // 成员ID（可选）
    "groupId": "number"     // 群组ID（可选）
  }
  ```
- **响应说明**: 
  - 按memberId查询：返回单个成员信息
  - 按groupId查询：返回群组信息和成员列表

### 6.17 添加购买到的成员到群组
- **接口地址**: `POST /api/admin/base/groupMember/memberToGroup`
- **接口说明**: 给群添加购买到的成员
- **请求参数**:
  ```json
  {
    "groupId": "number",   // 群组ID
    "memberId": "number"   // 成员ID
  }
  ```
- **响应说明**: 成功或失败信息

### 6.18 更新成员信息
- **接口地址**: `POST /api/admin/base/groupMember/updateMemberInfo`
- **接口说明**: 更新成员信息
- **请求参数**:
  ```json
  {
    "groupId": "number",   // 群组ID
    "memberId": "number",  // 成员ID
    "name": "string",      // 名称（可选）
    "avatar": "string",    // 头像（可选）
    "authId": "number",    // 授权ID（可选）
    "authType": "number"   // 授权类型（可选）
  }
  ```
- **响应说明**: 成功或失败信息

---

## 7. 桌面管理

【复用提示】前端使用 `desktop/list`、`desktop/info`、`desktop/update` 维护“工作台”。新增/删除/批量排序可按需保留。

### 7.1 新增桌面
- **接口地址**: `POST /api/admin/base/desktop/add`
- **接口说明**: 创建新桌面
- **请求参数**:
  ```json
  {
    "name": "string",      // 桌面名称
    "remark": "string",    // 备注
    "avatar": "string",    // 头像
    "sort": "number",      // 排序
    "member": "array"      // 成员ID列表（群组ID）
  }
  ```
- **响应说明**: 返回创建的桌面信息

### 7.2 更新桌面
- **接口地址**: `POST /api/admin/base/desktop/update`
- **接口说明**: 更新桌面信息（支持单条或多条）
- **请求参数**:
  ```json
  {
    "id": "number",
    "name": "string",
    "remark": "string",
    "avatar": "string",
    "member": "array"
  }
  ```
  或数组格式：
  ```json
  [
    {
      "id": "number",
      "name": "string",
      ...
    }
  ]
  ```
- **响应说明**: 成功或失败信息

### 7.3 删除桌面
- **接口地址**: `POST /api/admin/base/desktop/delete`
- **接口说明**: 软删除桌面
- **请求参数**:
  ```json
  {
    "id": "number"  // 桌面ID
  }
  ```
- **响应说明**: 成功或失败信息

### 7.4 桌面列表
- **接口地址**: `POST /api/admin/base/desktop/list`
- **接口说明**: 获取桌面列表
- **请求参数**:
  ```json
  {
    "userId": "number"  // 用户ID（可选）
  }
  ```
- **响应说明**: 返回桌面列表

### 7.5 桌面分页
- **接口地址**: `POST /api/admin/base/desktop/page`
- **接口说明**: 分页获取桌面列表
- **请求参数**:
  ```json
  {
    "page": "number",
    "pageSize": "number",
    "userId": "number"
  }
  ```
- **响应说明**: 返回分页数据

### 7.6 批量更新排序
- **接口地址**: `POST /api/admin/base/desktop/updateSortByIds`
- **接口说明**: 批量更新桌面排序
- **请求参数**:
  ```json
  [
    {
      "id": "number",
      "sort": "number"
    }
  ]
  ```
- **响应说明**: 成功或失败信息

---

## 8. 消息与工作流

【复用提示】IM/工作流核心：`message/messageList`（type:0私聊/1群聊），`message/runWorkflow`（从分享页触发工作流），`addTask`/`sendTeamNotice` 视业务开放。返回码同 1000 规范。

### 8.1 消息列表
- **接口地址**: `POST /api/admin/base/message/messageList`
- **接口说明**: 获取消息列表
- **请求参数**:
  ```json
  {
    "userId": "number",    // 用户ID
    "friendId": "number",  // 好友ID或群组ID
    "type": "number"       // 类型（0:私聊, 1:群聊）
  }
  ```
- **响应说明**: 返回消息列表（包含发送者信息）

### 8.2 执行工作流
- **接口地址**: `POST /api/admin/base/message/runWorkflow`
- **接口说明**: 执行工作流
- **请求参数**:
  ```json
  {
    "groupId": "number",         // 群组ID
    "memberId": "number",        // 成员ID
    "params": "string",          // base64编码的JSON参数
    "configPackIndex": "number", // 配置包索引（可选）
    "externalLinkCode": "string" // 外部链接代码（可选）
  }
  ```
- **响应说明**: 
  ```json
  {
    "logId": "number"  // 工作流日志ID
  }
  ```

### 8.3 添加任务
- **接口地址**: `POST /api/admin/base/message/addTask`
- **接口说明**: 添加定时任务
- **请求参数**:
  ```json
  {
    "groupId": "number",   // 群组ID
    "memberId": "number",  // 成员ID
    "execute": {           // 执行配置
      "type": "string",    // 类型（如"once"）
      "config": {
        "date": "string",
        "time": "string"
      },
      "params": {}
    }
  }
  ```
- **响应说明**: 成功或失败信息

### 8.4 发送团队通知
- **接口地址**: `POST /api/admin/base/message/sendTeamNotice`
- **接口说明**: 发送团队通知
- **请求参数**:
  ```json
  {
    "groupId": "number",   // 群组ID
    "memberId": "number",   // 成员ID
    "title": "string",      // 标题
    "text": "string"        // 内容
  }
  ```
- **响应说明**: 返回消息对象

### 8.5 消息列表（标准）
- **接口地址**: `POST /api/admin/base/message/list`
- **接口说明**: 获取消息列表（标准接口）
- **请求参数**:
  ```json
  {
    "userId": "number",
    "friendId": "number"
  }
  ```
- **响应说明**: 返回消息列表

### 8.6 消息分页
- **接口地址**: `POST /api/admin/base/message/page`
- **接口说明**: 分页获取消息列表
- **请求参数**:
  ```json
  {
    "page": "number",
    "pageSize": "number",
    "userId": "number",
    "friendId": "number"
  }
  ```
- **响应说明**: 返回分页数据

---

## 9. 授权管理

### 9.1 新增授权配置
- **接口地址**: `POST /api/admin/base/auth/add`
- **接口说明**: 新增授权配置
- **请求参数**:
  ```json
  {
    "name": "string",      // 授权名称
    "type": "number",      // 授权类型
    "config": "object"     // 配置信息
  }
  ```
- **响应说明**: 成功或失败信息

### 9.2 查询授权配置
- **接口地址**: `POST /api/admin/base/auth/info`
- **接口说明**: 查询单个授权配置
- **请求参数**:
  ```json
  {
    "id": "number"  // 授权ID
  }
  ```
- **响应说明**: 返回授权配置信息

### 9.3 更新授权配置
- **接口地址**: `POST /api/admin/base/auth/update`
- **接口说明**: 更新授权配置
- **请求参数**:
  ```json
  {
    "id": "number",
    "auth": {
      "name": "string",
      "type": "number",
      "config": "object"
    }
  }
  ```
- **响应说明**: 成功或失败信息

### 9.4 删除授权配置
- **接口地址**: `POST /api/admin/base/auth/delete`
- **接口说明**: 删除授权配置
- **请求参数**:
  ```json
  {
    "id": "number"  // 授权ID
  }
  ```
- **响应说明**: 成功或失败信息

### 9.5 授权配置列表
- **接口地址**: `POST /api/admin/base/auth/list`
- **接口说明**: 查询当前用户的授权配置，可按类型筛选
- **请求参数**:
  ```json
  {
    "type": "number",      // 类型（可选）
    "keyword": "string",   // 关键词（可选）
    "orderBy": "string"    // 排序字段（可选，"createTime"或"updateTime"）
  }
  ```
- **响应说明**: 返回授权配置列表

---

## 10. Prompt管理

### 10.1 新增Prompt
- **接口地址**: `POST /api/admin/base/prompt/add`
- **接口说明**: 新增prompt
- **请求参数**:
  ```json
  {
    "appId": "number",     // 应用ID
    "prompt": "string",    // Prompt内容
    "example": "string",   // 示例（可选）
    "remark": "string"     // 备注（可选）
  }
  ```
- **响应说明**: 返回创建的prompt信息

### 10.2 Prompt列表
- **接口地址**: `POST /api/admin/base/prompt/list`
- **接口说明**: 根据appId获取prompt列表
- **请求参数**:
  ```json
  {
    "appId": "number"  // 应用ID
  }
  ```
- **响应说明**: 返回prompt列表

### 10.3 更新Prompt
- **接口地址**: `POST /api/admin/base/prompt/update`
- **接口说明**: 更新prompt
- **请求参数**:
  ```json
  {
    "id": "number",        // Prompt ID
    "prompt": "string",    // Prompt内容
    "example": "string",   // 示例（可选）
    "remark": "string"     // 备注（可选）
  }
  ```
- **响应说明**: 返回更新后的prompt信息

### 10.4 删除Prompt
- **接口地址**: `POST /api/admin/base/prompt/delete`
- **接口说明**: 删除prompt
- **请求参数**:
  ```json
  {
    "id": "number"  // Prompt ID
  }
  ```
- **响应说明**: 成功或失败信息

---

## 11. 外部链接

【复用提示】前端公开页使用 `memberInfoByCode`、`workflowLogInfo`；创建/更新/删除外链偏运营，可按需收敛。

### 11.1 新增外部链接
- **接口地址**: `POST /api/admin/base/externalLink/add`
- **接口说明**: 创建外部链接
- **请求参数**:
  ```json
  {
    "desktopId": "number",      // 桌面ID
    "groupId": "number",        // 群组ID
    "memberId": "number",       // 成员ID
    "count": "number",          // 使用次数限制（与expireTime二选一）
    "expireTime": "string",     // 过期时间（与count二选一）
    "quantity": "number",       // 创建数量（默认1）
    "guideCover": "string",     // 引导封面（可选）
    "guideTitle": "string",     // 引导标题（可选）
    "guideType": "number",      // 引导类型（可选）
    "guideContent": "string",   // 引导内容（可选）
    "chatBackground": "string"  // 聊天背景（可选）
  }
  ```
- **响应说明**: 单个返回对象，批量返回数组

### 11.2 更新外部链接
- **接口地址**: `POST /api/admin/base/externalLink/update`
- **接口说明**: 更新外部链接
- **请求参数**:
  ```json
  {
    "id": "number",
    "desktopId": "number",
    "groupId": "number",
    "memberId": "number",
    "count": "number",          // 与expireTime二选一
    "expireTime": "string",     // 与count二选一
    "guideCover": "string",
    "guideTitle": "string",
    "guideType": "number",
    "guideContent": "string",
    "chatBackground": "string"
  }
  ```
- **响应说明**: 返回更新后的链接信息

### 11.3 外部链接列表
- **接口地址**: `POST /api/admin/base/externalLink/list`
- **接口说明**: 按批次获取外部链接列表
- **请求参数**:
  ```json
  {
    "page": "number",      // 页码（默认1）
    "pageSize": "number"   // 每页数量（默认20，最大100）
  }
  ```
- **响应说明**: 
  ```json
  {
    "list": [
      {
        "batCode": "number",      // 批次代码
        "nickName": "string",     // 成员昵称
        "avatar": "string",       // 成员头像
        "desktopId": "number",
        "groupId": "number",
        "memberId": "number",
        "count": "number",
        "expireTime": "string",
        "items": [                // 链接项（只包含id和code）
          {
            "id": "number",
            "code": "string"
          }
        ]
      }
    ],
    "pagination": {
      "page": "number",
      "pageSize": "number",
      "total": "number"
    }
  }
  ```

### 11.4 外部链接详情
- **接口地址**: `POST /api/admin/base/externalLink/info`
- **接口说明**: 获取外部链接详情
- **请求参数**:
  ```json
  {
    "id": "number"  // 链接ID
  }
  ```
- **响应说明**: 返回链接详细信息

### 11.5 根据代码获取成员信息
- **接口地址**: `POST /api/admin/base/externalLink/memberInfoByCode`
- **接口说明**: 根据外部链接代码获取成员用户信息
- **请求参数**:
  ```json
  {
    "code": "string"  // 外部链接代码
  }
  ```
- **响应说明**: 
  ```json
  {
    // 用户信息
    "id": "number",
    "nickName": "string",
    "avatar": "string",
    "config": "object",
    "configPacks": "array",
    "parentType": "number",
    "type": "number",
    "tags": "array",
    "remark": "string",
    "tokens": "number",
    "efficiencyCoefficient": "number",
    "ownerId": "number",
    // 链接信息
    "linkInfo": {},
    // Prompt列表
    "prompts": [],
    // 快捷命令
    "shortcutCommands": {}
  }
  ```

### 11.6 工作流日志信息
- **接口地址**: `POST /api/admin/base/externalLink/workflowLogInfo`
- **接口说明**: 根据logId获取执行日志
- **请求参数**:
  ```json
  {
    "logId": "number"  // 日志ID
  }
  ```
- **响应说明**: 返回工作流执行日志

### 11.7 删除外部链接
- **接口地址**: `POST /api/admin/base/externalLink/delete`
- **接口说明**: 删除外部链接
- **请求参数**:
  ```json
  {
    "id": "number"  // 链接ID
  }
  ```
- **响应说明**: 成功或失败信息

### 11.8 创建重置订单
- **接口地址**: `POST /api/admin/base/externalLink/createResetOrder`
- **接口说明**: 创建外部链接使用次数重置订单（公开接口，无需认证）
- **请求参数**:
  ```json
  {
    "code": "string",      // 外部链接代码
    "amount": "number"     // 支付金额（可选，默认9.99）
  }
  ```
- **响应说明**: 
  ```json
  {
    "orderNo": "string",   // 订单号
    "payUrl": "string",    // 支付URL
    "orderId": "number"    // 订单ID
  }
  ```

---

## 12. 好友管理

【复用提示】前端用于 IM 列表：`friend/list`（type=1 代表群）。新增/删除好友在当前产品中较少使用，可按需开放。

### 12.1 好友列表
- **接口地址**: `POST /api/admin/base/friend/list`
- **接口说明**: 获取好友列表
- **请求参数**:
  ```json
  {
    "userId": "number",      // 用户ID
    "friendId": "number",    // 好友ID
    "status": "number",      // 状态
    "type": "number",        // 类型（0:用户, 1:群组）
    "startTime": "string",   // 开始时间（可选）
    "endTime": "string"      // 结束时间（可选）
  }
  ```
- **响应说明**: 返回好友列表（包含用户或群组信息）

### 12.2 好友分页
- **接口地址**: `POST /api/admin/base/friend/page`
- **接口说明**: 分页获取好友列表
- **请求参数**:
  ```json
  {
    "page": "number",
    "pageSize": "number",
    "userId": "number",
    "friendId": "number",
    "status": "number",
    "type": "number"
  }
  ```
- **响应说明**: 返回分页数据

### 12.3 新增好友
- **接口地址**: `POST /api/admin/base/friend/add`
- **接口说明**: 添加好友
- **请求参数**:
  ```json
  {
    "userId": "number",      // 用户ID
    "friendId": "number",    // 好友ID
    "type": "number",        // 类型（0:用户, 1:群组）
    "status": "number",      // 状态
    "remark": "string"       // 备注
  }
  ```
- **响应说明**: 成功或失败信息

### 12.4 删除好友
- **接口地址**: `POST /api/admin/base/friend/delete`
- **接口说明**: 批量删除好友
- **请求参数**:
  ```json
  {
    "ids": "array"  // 好友ID列表
  }
  ```
- **响应说明**: 成功或失败信息

---

## 13. VIP与订阅

【复用提示】当前前端未显式使用 VIP 购买链路；MuuZi 可选择关闭或延后接入。

### 13.1 获取全部VIP列表
- **接口地址**: `POST /api/admin/base/vip/all`
- **接口说明**: 获取全部VIP列表（公开接口）
- **请求参数**:
  ```json
  {
    "id": "number",        // VIP ID（可选）
    "name": "string",      // 名称（可选，模糊匹配）
    "remark": "string",    // 备注（可选，模糊匹配）
    "period": "number",   // 周期（可选）
    "type": "number",     // 类型（可选）
    "amount": "number"    // 金额（可选）
  }
  ```
- **响应说明**: 返回VIP列表（按sort排序）

### 13.2 VIP列表
- **接口地址**: `POST /api/admin/base/vip/list`
- **接口说明**: 获取VIP列表
- **请求参数**: 标准列表参数
- **响应说明**: 返回VIP列表

### 13.3 VIP分页
- **接口地址**: `POST /api/admin/base/vip/page`
- **接口说明**: 分页获取VIP列表
- **请求参数**: 标准分页参数
- **响应说明**: 返回分页数据

---

## 14. 优惠券

【复用提示】未在现有前端复用，可作为运营后台保留，不必暴露给 MuuZi 最小集。

### 14.1 使用兑换码
- **接口地址**: `POST /api/admin/base/coupon/use`
- **接口说明**: 使用优惠券兑换码
- **请求参数**:
  ```json
  {
    "code": "string"  // 兑换码
  }
  ```
- **响应说明**: 成功或失败信息

### 14.2 生成兑换码
- **接口地址**: `POST /api/admin/base/coupon/generate`
- **接口说明**: 生成兑换码
- **请求参数**:
  ```json
  {
    "type": "number",        // 类型
    "days": "number",        // 天数
    "tokens": "number",      // Token数量
    "num": "number",         // 生成数量
    "generateType": "number" // 生成类型（可选，0:普通, 1:活动）
  }
  ```
- **响应说明**: 
  ```json
  {
    "codes": ["string"]  // 生成的兑换码列表
  }
  ```

---

## 15. 支付相关

【复用提示】MuuZi 轻量场景可暂不接入 Stripe/支付宝；若接入，请复核回调域名与订单模型。

### 15.1 Stripe支付
- **接口地址**: `GET /api/admin/base/stripe/pay`
- **接口说明**: Stripe支付
- **请求参数**:
  - `orderNo` (Query): 订单号
- **响应说明**: 重定向到Stripe支付页面

### 15.2 Stripe订阅
- **接口地址**: `GET /api/admin/base/stripe/subscribe`
- **接口说明**: Stripe订阅
- **请求参数**:
  - `orderNo` (Query): 订单号
- **响应说明**: 重定向到Stripe订阅页面

### 15.3 Stripe支付回调
- **接口地址**: `GET /api/admin/base/stripe/return`
- **接口说明**: Stripe支付成功回调
- **请求参数**:
  - `orderNo` (Query): 订单号
- **响应说明**: 重定向到成功页面

### 15.4 Stripe支付取消
- **接口地址**: `GET /api/admin/base/stripe/cancel`
- **接口说明**: Stripe支付取消回调
- **请求参数**:
  - `orderNo` (Query): 订单号
- **响应说明**: 重定向到取消页面

### 15.5 支付宝支付
- **接口地址**: `GET /api/admin/base/alipay/pay`
- **接口说明**: 支付宝支付
- **请求参数**:
  - `orderNo` (Query): 订单号
- **响应说明**: 返回支付表单或支付URL

### 15.6 支付宝支付回调
- **接口地址**: `GET /api/admin/base/alipay/return`
- **接口说明**: 支付宝支付成功回调
- **请求参数**: 支付宝回调参数
- **响应说明**: 重定向到成功页面

---

## 16. Token日志

### 16.1 我的Token日志
- **接口地址**: `POST /api/admin/base/tokenLog/myList`
- **接口说明**: 分页获取当前用户的Token日志
- **请求参数**:
  ```json
  {
    "page": "number",      // 页码（默认1）
    "pageSize": "number"  // 每页数量（默认20，最大100）
  }
  ```
- **响应说明**: 
  ```json
  {
    "list": [
      {
        "id": "number",
        "userId": "number",
        "operatorId": "number",
        "token": "number",
        "type": "number",
        "createTime": "string",
        "appName": "string",      // 应用名称
        "ownerName": "string",   // 所有者名称
        "userName": "string",     // 用户名称
        "operatorName": "string"  // 操作者名称
      }
    ],
    "pagination": {
      "page": "number",
      "pageSize": "number",
      "total": "number",
      "pages": "number"
    }
  }
  ```

### 16.2 创作者收益日志列表
- **接口地址**: `POST /api/admin/base/tokenLog/auditList`
- **接口说明**: 查询创作者收益日志列表（公开接口）
- **请求参数**:
  ```json
  {
    "userId": "number",      // 用户ID（可选）
    "startTime": "string",    // 开始时间（可选）
    "endTime": "string"       // 结束时间（可选）
  }
  ```
- **响应说明**: 返回创作者收益日志列表（type=1或3，withdrawableStatus=0）

### 16.3 批量设置可提现
- **接口地址**: `POST /api/admin/base/tokenLog/batchSetWithdrawable`
- **接口说明**: 批量设置可提现（公开接口）
- **请求参数**:
  ```json
  {
    "ids": "array",      // 日志ID列表
    "userId": "number"   // 用户ID
  }
  ```
- **响应说明**: 
  ```json
  {
    "totalTokens": "number"  // 总Token数
  }
  ```

---

## 17. 支付日志

### 17.1 支付日志列表
- **接口地址**: `GET /api/admin/base/paidLog/list`
- **接口说明**: 获取当前用户的支付日志
- **请求参数**: 无
- **响应说明**: 返回支付日志列表（包含订单信息）

---

## 18. 通用接口

### 18.1 权限菜单
- **接口地址**: `GET /api/admin/base/comm/permmenu`
- **接口说明**: 获取权限与菜单
- **请求参数**: 无
- **响应说明**: 返回权限和菜单信息

### 18.2 文件上传
- **接口地址**: `POST /api/admin/base/comm/upload`
- **接口说明**: 文件上传（公开接口）
- **请求参数**: 
  - FormData格式，包含文件字段
- **响应说明**: 返回文件URL

### 18.3 文件上传模式
- **接口地址**: `GET /api/admin/base/comm/uploadMode`
- **接口说明**: 获取文件上传模式（公开接口）
- **请求参数**: 无
- **响应说明**: 返回上传模式（local或cloud）

### 18.4 实体信息与路径
- **接口地址**: `GET /api/admin/base/open/eps`
- **接口说明**: 获取实体信息与路径（公开接口）
- **请求参数**: 无
- **响应说明**: 返回实体信息

### 18.5 获取网页内容
- **接口地址**: `GET /api/admin/base/open/html`
- **接口说明**: 根据配置参数key获得网页内容（公开接口）
- **请求参数**:
  - `key` (Query): 参数key
- **响应说明**: 返回HTML内容

---

## 响应格式说明

### 成功响应
```json
{
  "code": 1000,
  "data": {},  // 数据内容
  "message": "操作成功"
}
```

### 失败响应
```json
{
  "code": 1001,
  "data": null,
  "message": "错误信息"
}
```

---

## 认证说明

大部分接口需要在请求头中携带认证信息：

```
Authorization: {token}
```

部分接口标记为 `IGNORE_TOKEN`，表示无需认证即可访问。

---

## 注意事项

1. 所有时间字段使用ISO 8601格式或Unix时间戳
2. 分页接口默认pageSize为20，最大不超过100
3. 删除操作多为软删除（设置delete=1）
4. 部分接口支持批量操作
5. 外部链接的count和expireTime参数二选一，不能同时提供
6. 工作流的params参数需要base64编码的JSON字符串

---

## 元信息
- 文档生成时间: 2024年  
- API版本: v1.0  
- 维护者: 开发团队
