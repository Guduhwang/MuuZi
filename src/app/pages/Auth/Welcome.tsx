// 欢迎页面 (WelcomePage)
// -----------------------------------------------------------------------------
// 应用启动后的首屏引导页。
// 主要职责：
// 1. 展示品牌标识 (MuuziLogo)，带入场动画。
// 2. 执行头像自检动画 (AvatarCheck)，作为一种趣味性的加载/准备状态。
// 3. 提供进入应用的唯一入口 (LetsGoButton)，需等待检查完成后激活。
// 4. 适配移动端布局，包括灵动岛区域的安全距离。
import React, { useState } from 'react';
import AvatarCheck from '../../components/Auth/AvatarCheck';
import { MuuziLogo } from '../../components/Common/MuuziLogo';
import { LetsGoButton } from '../../components/Auth/LetsGoButton';

interface WelcomePageProps {
  // 点击 "Let's Go" 按钮后的回调，通常用于导航到登录/注册页
  onLogin?: () => void;
}

export function WelcomePage({ onLogin }: WelcomePageProps) {
  // 控制 "Let's Go" 按钮的激活状态
  // 由 AvatarCheck 组件的动画完成回调 (onComplete) 触发设置为 true
  const [isReady, setIsReady] = useState(false);

  return (
    <main className="relative w-full min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] bg-app-dark overflow-hidden flex flex-col items-center justify-between py-[5vh]">
      
      {/* 
        顶部区域：Logo 展示
        - flex-none: 防止被挤压
        - mt-[8vh]: 顶部留白，预留出状态栏和灵动岛的安全距离
        - scale-110: 在小屏设备上保持原大小，大屏适当放大以增强视觉冲击力
        - role="banner": 增加语义化
      */}
      <header className="flex-none mt-[8vh] flex flex-col items-center" role="banner">
         {/* 隐藏的 H1 标签，用于 SEO 和屏幕阅读器 */}
         <h1 className="sr-only">MuuZi Welcome Screen</h1>
         <MuuziLogo className="transform scale-100 sm:scale-110 origin-center transition-transform duration-500" />
      </header>

      {/* 
        中部区域：头像检查动画
        - flex-1: 占据剩余垂直空间，确保视觉重心居中
        - w-[38vw]: 宽度随视口宽度缩放，保持响应式
        - min/max: 限制尺寸边界，避免在超大/超小屏幕上失调
      */}
      <section className="flex-1 flex items-center justify-center w-full min-h-0 my-4" aria-label="Avatar Check Animation">
         <AvatarCheck 
           className="w-[38vw] max-w-[180px] min-w-[130px] aspect-square"
           onComplete={() => setIsReady(true)} 
         />
      </section>

      {/* 
        底部区域：操作入口与版权
        - flex-none: 固定高度，贴底展示
        - mb-[5vh]: 底部留白，适配全面屏手势条
      */}
      <footer className="flex-none flex flex-col items-center gap-6 mb-[5vh]">
        <LetsGoButton 
          onClick={onLogin} 
          disabled={!isReady} // 动画未完成时禁用点击，防止误触
        />
        
        {/* 底部版权声明文字 */}
        <p className="text-text-subtle text-tiny tracking-wide">
          Powered by GuDuu OS
        </p>
      </footer>
    </main>
  );
}
