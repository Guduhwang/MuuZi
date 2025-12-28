
# MuuZi APP 前端

React + TypeScript + Vite 的移动端界面项目，对应 Figma 设计稿：https://www.figma.com/design/FFuGJzPWi8IXOrWea5ntOz/MuuZi-APP

## 快速开始
1) 安装依赖  
```bash
npm i
```
2) 本地开发  
```bash
npm run dev
```
3) 生产构建  
```bash
npm run build
```

## 技术栈与规范
- 框架：React 18 + Vite 6
- 语言：TypeScript
- UI：MUI、Radix UI、Tailwind（4.x）
- 其他：Emotion、lucide-react、react-hook-form 等
- 路径别名：`@/*` 指向 `src/*`

## 目录速览
- `src/main.tsx`：入口挂载
- `src/app/App.tsx`：应用骨架
- `src/app/pages/*`：页面（Auth、Home、Chat 等）
- `src/app/components/*`：通用/业务组件
- `src/styles/*`：全局样式（tailwind、主题）
- `guidelines/`：接口与凭证规范文档
  - `API_RULES.md`：接口规则与清单
  - `Frontend Credential Handling Guidelines.md`：前端凭证处理指南

## 接口与凭证
- 接口规则与完整列表：`guidelines/API_RULES.md`
- 凭证处理与刷新策略：`guidelines/Frontend Credential Handling Guidelines.md`
- 认证方式：默认 `Authorization: {token}`，部分 `open` 接口免鉴权

## 开发提示
- 严格模式/TS：`strict` 开启，请避免隐式 any
- 分页/时间：统一参见 `API_RULES.md` 约定
- Token 刷新与 401 处理逻辑见凭证指南

## 常见问题
- 安装受限：若本机全局 npm 有权限问题，使用项目内 npm（或 pnpm/yarn）重新安装。
- 样式异常：确认 tailwind 4.x 已正确安装，重新启动 `npm run dev` 让 PostCSS/Vite 重新编译。

  