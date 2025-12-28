import React from 'react';
import svgPaths from "../../../assets/svgs/svg-ko9q16fvpt";
import svgPathsMessage from "../../../assets/svgs/svg-c6bae15slw";

interface RoomHeaderProps {
  onBack?: () => void;
  title?: string;
}

export function RoomHeader({ onBack, title = "GuDuu" }: RoomHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 h-[120px] pt-[60px] pb-[20px] relative z-10">
        {/* Back Button Left */}
        <button
          onClick={onBack}
          className="relative size-[40px] flex items-center justify-center shrink-0 transition-transform"
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 40 40" fill="none">
             <path clipRule="evenodd" d={svgPathsMessage.p23913300} fill="#3B3B3B" fillRule="evenodd" />
          </svg>
          <div className="relative size-[24px] flex items-center justify-center">
             <svg className="w-[8px] h-[14px]" viewBox="0 0 8 14" fill="none">
                <path clipRule="evenodd" d={svgPathsMessage.p3451d900} fill="white" fillRule="evenodd" />
             </svg>
          </div>
        </button>
        
        {/* Title Center */}
        <h1 className="text-[18px] font-semibold">{title}</h1>
        
        {/* Search Right */}
        <button className="w-10 h-10 flex items-center justify-center bg-[#3B3B3B] rounded-full">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d={svgPaths.p3dcb2d80} fill="white" />
            </svg>
        </button>
    </header>
  );
}
