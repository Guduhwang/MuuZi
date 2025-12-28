// Home Logo 组件：专用于首页，显示 GuDuu
import React from 'react';
import { motion } from 'motion/react';
import svgPaths from '../../../assets/svgs/svg-8689n1ptmx';

// 定义组件属性接口
interface HomeLogoProps {
  showTagline?: boolean; // 是否显示标语
  className?: string;    // 自定义样式类名
}

export function HomeLogo({ showTagline = true, className = "" }: HomeLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 品牌标题 - 首页特有 GuDuu */}
      <h1 className="text-white text-[40px] leading-none font-normal text-center whitespace-nowrap font-['Poppins']">
        <span className="mr-2">🏡</span>GuDuu
      </h1>
      
      {/* 装饰下划线 SVG */}
      <div className="w-[198px] h-[14px] mt-2">
         <svg 
           className="block w-full h-full" 
           fill="none" 
           viewBox="0 0 197.683 13.8826"
           preserveAspectRatio="none"
         >
           <mask id="reveal-underline-home-mask">
             <motion.rect
               x="0"
               y="0"
               height="100%"
               fill="white"
               initial={{ width: 0 }}
               animate={{ width: 198 }}
               transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
             />
           </mask>
           
           <g>
             {/* 底色层 (与背景一致 #222) */}
             <path 
               clipRule="evenodd" 
               d={svgPaths.pd6fa8c0} 
               fill="#222222" 
               fillRule="evenodd" 
             />
             
             {/* 绿色亮起层 (动画层) */}
             <g mask="url(#reveal-underline-home-mask)">
               <path 
                 clipRule="evenodd" 
                 d={svgPaths.pd6fa8c0} 
                 fill="#B2DABB" 
                 fillRule="evenodd" 
               />
             </g>
           </g>
         </svg>
      </div>

      {/* 品牌标语 - 可选显示 */}
      {showTagline && (
        <p className="text-white/80 text-sm text-center font-['Poppins'] mt-6 max-w-[280px] leading-relaxed">
          A trusted personal space<br /> to create, share, and offer intelligent tools.
        </p>
      )}
    </div>
  );
}
