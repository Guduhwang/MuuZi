// 通用返回头部组件：包含返回按钮、标题及右侧操作区
import React from 'react';
import svgPaths from "../../../assets/svgs/svg-sfybka7943";

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function BackHeader({ title, onBack, rightElement, className = "" }: BackHeaderProps) {
  return (
    <header className={`flex items-center justify-between px-5 h-[120px] pt-[60px] pb-[20px] relative z-10 ${className}`}>
        {/* Left: Back Button */}
        <div className="flex items-center justify-center shrink-0 w-10 h-10">
          {onBack && (
              <button 
                  className="w-full h-full flex items-center justify-center bg-[#3B3B3B] rounded-full cursor-pointer transition-transform" 
                  onClick={onBack}
              >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" d={svgPaths.p3451d900} fill="white" fillRule="evenodd" />
                  </svg>
              </button>
          )}
        </div>

        {/* Center: Title - Absolute positioned */}
        <h1 className="text-[18px] font-semibold absolute left-[80px] top-[80px] -translate-y-1/2 whitespace-nowrap">
            {title}
        </h1>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 min-w-10 justify-end">
            {rightElement}
        </div>
    </header>
  );
}
