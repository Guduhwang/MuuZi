# 项目接口整理

## 一、登录相关接口

### 1. 基础登录接口

- **URL**: `POST /admin/base/open/login`
- **功能**: 用户名密码登录

- **URL**: `POST /admin/base/open/loginByEmail`
- **功能**: 邮箱密码登录

- **URL**: `POST /admin/base/auth/login`
- **功能**: 登录（另一种登录方式）

### 2. Token管理接口

- **URL**: `GET /admin/base/open/refreshToken`
- **功能**: 刷新Token

### 3. 验证码相关接口

- **URL**: `POST /admin/base/open/sendCode`
- **功能**: 发送邮箱验证码

- **URL**: `POST /admin/base/open/verifyCode`
- **功能**: 验证邮箱验证码

- **URL**: `GET /admin/base/open/captcha`
- **功能**: 获取图片验证码

### 4. OAuth登录接口

- **URL**: `POST /admin/base/open/oauth1`
- **功能**: OAuth1登录

- **URL**: `POST /admin/base/open/oauth2`
- **功能**: OAuth2登录

### 5. 用户信息接口

- **URL**: `GET /admin/base/comm/person`
- **功能**: 获取当前登录用户信息

- **URL**: `POST /admin/base/comm/logout`
- **功能**: 退出登录

- **URL**: `POST /admin/base/open/exist`
- **功能**: 检查邮箱是否存在

## 二、工作流相关接口

### 1. 工作流执行接口

- **URL**: `POST /admin/base/message/runWorkflow`
- **功能**: 执行工作流

### 2. 任务管理接口

- **URL**: `POST /admin/base/message/addTask`
- **功能**: 添加定时任务

### 3. 媒体发布接口

- **URL**: `POST /admin/base/message/runMediaPublish`
- **功能**: 执行媒体发布（用于发布到社交媒体）

### 4. 消息列表接口

- **URL**: `POST /admin/base/message/messageList`
- **功能**: 获取消息列表

- **URL**: `POST /admin/base/message/receiveWorkflowResult/:workflowResultId`
- **功能**: 接收工作流结果

- **URL**: `POST /admin/base/message/receiveWorkflowError/:workflowResultId`
- **功能**: 接收工作流错误信息

## 三、商品发布相关接口

### 1. 商品信息管理接口

- **URL**: `POST /admin/goods/info/add`
- **功能**: 新增商品

- **URL**: `POST /admin/goods/info/update`
- **功能**: 更新商品信息

- **URL**: `GET /admin/goods/info/info`
- **功能**: 获取商品详情

- **URL**: `POST /admin/goods/info/list`
- **功能**: 获取商品列表

- **URL**: `POST /admin/goods/info/page`
- **功能**: 分页查询商品

### 2. 商品操作接口

- **URL**: `POST /admin/goods/info/openList`
- **功能**: 获取已上架商品列表

- **URL**: `POST /admin/goods/info/openDetail`
- **功能**: 获取商品公开详情

- **URL**: `POST /admin/goods/info/view`
- **功能**: 查看商品（增加浏览量）

- **URL**: `POST /admin/goods/info/remove`
- **功能**: 下架商品

- **URL**: `POST /admin/goods/info/restore`
- **功能**: 恢复下架的商品

- **URL**: `POST /admin/goods/info/pinnedList`
- **功能**: 获取置顶商品列表

- **URL**: `POST /admin/goods/info/pinnedGoodsCount`
- **功能**: 获取已置顶商品数量

- **URL**: `POST /admin/goods/info/allGoods`
- **功能**: 获取所有商品列表

- **URL**: `POST /admin/goods/info/removedList`
- **功能**: 获取已下架商品列表

### 3. 商品统计接口

- **URL**: `POST /admin/goods/info/totalView`
- **功能**: 获取商品总浏览量

- **URL**: `POST /admin/goods/info/totalSold`
- **功能**: 获取商品总销量

- **URL**: `POST /admin/goods/info/totalRevenue`
- **功能**: 获取商品总收入

- **URL**: `POST /admin/goods/info/totalEarnedTokens`
- **功能**: 获取商品总赚取的代币

### 4. 商品类型接口

- **URL**: `POST /admin/goods/type/list`
- **功能**: 获取商品类型列表

- **URL**: `GET /admin/goods/type/info`
- **功能**: 获取商品类型详情

- **URL**: `POST /admin/goods/type/add`
- **功能**: 新增商品类型

- **URL**: `POST /admin/goods/type/update`
- **功能**: 更新商品类型

- **URL**: `POST /admin/goods/type/delete`
- **功能**: 删除商品类型

### 5. 商品订单接口

- **URL**: `POST /admin/goods/order/place`
- **功能**: 下单购买商品

- **URL**: `POST /admin/goods/order/myOrders`
- **功能**: 获取我的订单列表

- **URL**: `POST /admin/goods/order/mySoldOrders`
- **功能**: 获取我售出的订单列表

- **URL**: `POST /admin/goods/order/orderDetail`
- **功能**: 获取订单详情

- **URL**: `POST /admin/goods/order/isPlaced`
- **功能**: 检查是否已下单

- **URL**: `POST /admin/goods/order/cancel`
- **功能**: 取消订单

### 6. 商品收藏接口

- **URL**: `POST /admin/goods/fovorite/addFavorite`
- **功能**: 添加收藏

- **URL**: `POST /admin/goods/fovorite/cancelFavorite`
- **功能**: 取消收藏

- **URL**: `POST /admin/goods/fovorite/myFavorites`
- **功能**: 获取我的收藏列表

### 7. 商品点赞接口

- **URL**: `POST /admin/goods/like/like`
- **功能**: 点赞商品

- **URL**: `POST /admin/goods/like/liked`
- **功能**: 检查是否已点赞

- **URL**: `POST /admin/goods/like/total`
- **功能**: 获取商品总点赞数
