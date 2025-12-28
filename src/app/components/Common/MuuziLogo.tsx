// Logo 组件：包含品牌名称、下划线和标语
import React, { useId } from 'react';
import { motion } from "motion/react";
import svgPaths from '../../../assets/svgs/svg-8689n1ptmx';
import { cn } from '../ui/utils'; // 假设有这个工具，如果没有则不用，直接用模板字符串

// 定义组件属性接口
interface MuuziLogoProps {
  showTagline?: boolean; // 是否显示标语
  className?: string;    // 自定义样式类名
  title?: string;        // 自定义标题
  icon?: React.ReactNode; // 自定义图标
  align?: 'center' | 'left'; // 对齐方式
  as?: 'h1' | 'h2' | 'div'; // 允许自定义标题标签，防止 H1 冲突
}

export function MuuziLogo({ 
  showTagline = true, 
  className = "", 
  title = "MuuZi", 
  icon = "🏡",
  align = 'center',
  as: Component = 'h1'
}: MuuziLogoProps) {
  const alignClass = align === 'left' ? 'items-start' : 'items-center';
  const textClass = align === 'left' ? 'text-left' : 'text-center';
  
  // 生成唯一ID以避免SVG ClipPath冲突
  const rawId = useId(); 
  const clipId = `reveal-underline-${rawId.replace(/:/g, '')}`;

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {/* 品牌标题 */}
      <Component className={`text-white text-[40px] leading-none font-normal ${textClass} whitespace-nowrap font-['Poppins']`}>
        <span className="mr-2">{icon}</span>{title}
      </Component>
      
      {/* 装饰下划线 SVG */}
      <div className="w-[198px] h-[14px] mt-2">
         <svg 
           className="block w-full h-full" 
           fill="none" 
           viewBox="0 0 197.683 13.8826"
           preserveAspectRatio="none"
         >
           <mask id={clipId}>
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
             <g mask={`url(#${clipId})`}>
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
