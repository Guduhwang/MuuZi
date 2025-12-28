// 消息详情页头部组件：包含返回按钮、用户名标题、更多操作按钮
import React from "react";
import svgPaths from "../../../assets/svgs/svg-c6bae15slw";

interface MessageHeaderProps {
  title: string;
  onBack: () => void;
  onMore?: () => void;
  className?: string;
}

export function MessageHeader({ title, onBack, onMore, className = "" }: MessageHeaderProps) {
  return (
    <header className={`h-[120px] shrink-0 flex items-center justify-between px-5 pt-[60px] pb-[20px] bg-[#3b3b3b] ${className}`}>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="relative size-[40px] flex items-center justify-center shrink-0 transition-transform"
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 40 40" fill="none">
             <path clipRule="evenodd" d={svgPaths.p23913300} fill="#222222" fillRule="evenodd" />
          </svg>
          <div className="relative size-[24px] flex items-center justify-center">
             <svg className="w-[8px] h-[14px]" viewBox="0 0 8 14" fill="none">
                <path clipRule="evenodd" d={svgPaths.p3451d900} fill="white" fillRule="evenodd" />
             </svg>
          </div>
        </button>

        {/* Title */}
        <h1 className="text-[18px] font-medium text-white">
          {title}
        </h1>

        {/* More Button */}
        <button
            onClick={onMore}
            className="relative size-[40px] flex items-center justify-center shrink-0 transition-transform"
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 40 40" fill="none">
             <path clipRule="evenodd" d={svgPaths.p23913300} fill="#222222" fillRule="evenodd" />
          </svg>
          <div className="relative size-[24px] flex items-center justify-center">
             <svg className="size-[18px] w-[18px] h-[4px]" viewBox="0 0 18 4" fill="none">
                <path d={svgPaths.p1b317c80} fill="white" />
             </svg>
          </div>
        </button>
    </header>
  );
}
