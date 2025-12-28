// 欢迎页面 (WelcomePage)
// -----------------------------------------------------------------------------
// 应用启动后的首屏引导页。
// 主要职责：
// 1. 品牌展示：通过 MuuziLogo 建立第一视觉印象。
// 2. 趣味交互：执行头像自检动画 (AvatarCheck)，在等待资源加载时提供视觉反馈。
// 3. 流程引导：提供进入应用的入口 (LetsGoButton)，确保用户在完成品牌感知后进入后续流程。
// 布局考虑：
// - 采用 Mobile-first 策略，全宽容器。
// - 适配全面屏安全区域（灵动岛及底部手势条）。
// -----------------------------------------------------------------------------

import React, { useState } from 'react'; // 引入 React 核心库及状态钩子
import AvatarCheck from '../../components/Auth/AvatarCheck'; // 导入头像自检动画组件
import { MuuziLogo } from '../../components/Common/MuuziLogo'; // 导入品牌 Logo 组件
import { LetsGoButton } from '../../components/Auth/LetsGoButton'; // 导入底部操作按钮组件

// 定义组件属性接口
interface WelcomePageProps {
  // 点击 "Let's Go" 按钮后的回调，由父组件控制路由跳转至登录或注册页
  onLogin?: () => void;
}

/**
 * 欢迎页组件
 * 遵循语义化 HTML 结构，确保 SEO 友好且具备良好的交互反馈
 */
export function WelcomePage({ onLogin }: WelcomePageProps) {
  // 🔴 [状态管理]: 控制 "Let's Go" 按钮的激活状态
  // 业务价值：强制用户观看品牌入场动画，确保应用核心视觉元素被完整感知
  const [isReady, setIsReady] = useState(false);

  return (
    // [主容器]: 使用全屏高度并适配 100dvh 以解决移动端浏览器工具栏遮挡问题
    <main className="relative w-full min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] bg-app-dark overflow-hidden flex flex-col items-center justify-between py-[5vh] min-py-[40px] max-py-[80px]">
      
      {/* 
        [页头区域]: 品牌 Logo 展示
        - 语义化: 使用 <header> 并通过 role="banner" 定义页面地标
        - 响应式: 通过 mt-[8vh] 预留灵动岛区域，并设置上下限确保视觉一致性
      */}
      <header className="flex-none mt-[8vh] min-mt-[60px] max-mt-[120px] flex flex-col items-center" role="banner">
         {/* 🔴 [SEO 优化]: 全页唯一且必须的 H1 标签，虽视觉隐藏但对爬虫极其重要 */}
         <h1 className="sr-only">MuuZi Welcome Screen</h1>
         {/* 品牌标识，带平滑的入场缩放动画。指定 as="div" 以避免与上方的 h1 冲突 */}
         <MuuziLogo 
           as="div"
           className="transform scale-100 sm:scale-110 origin-center transition-transform duration-500" 
         />
      </header>

      {/* 
        [核心交互区]: 头像动画
        - 语义化: <section> 明确定义功能区块
        - 业务逻辑: 监听动画完成回调，解锁下方按钮
      */}
      <section className="flex-1 flex items-center justify-center w-full min-h-0 my-4" aria-label="Avatar Check Animation">
         <AvatarCheck 
           className="w-[38vw] max-w-[180px] min-w-[130px] aspect-square drop-shadow-2xl"
           onComplete={() => setIsReady(true)} // 动画完成后将状态置为就绪
         />
      </section>

      {/* 
        [页脚区域]: 操作入口与归属信息
        - 适配性: mb-[5vh] 避开底部手势操作区，并设置最小值确保不紧贴边缘
      */}
      <footer className="flex-none flex flex-col items-center gap-6 mb-[5vh] min-mb-[30px]">
        {/* 进入应用的主操作按钮 */}
        <LetsGoButton 
          onClick={onLogin} 
          disabled={!isReady} // 视觉反馈：在自检完成前保持禁用
        />
        
        {/* 🔴 [品牌归属]: 展示底层技术支撑，增强品牌信任感 */}
        <p className="text-text-subtle text-tiny tracking-wide">
          Powered by GuDuu OS
        </p>
      </footer>
    </main>
  );
}
