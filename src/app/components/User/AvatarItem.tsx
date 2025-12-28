import React from 'react';
import svgPaths from "../../../assets/svgs/svg-cqeye3g2oa";
import { cn } from "../ui/utils";

function IconCheck() {
  return (
    <svg className="w-[10px] h-[8px]" viewBox="0 0 11 9" fill="none" preserveAspectRatio="none">
        <path clipRule="evenodd" fillRule="evenodd" d={svgPaths.pf456a00} fill="#222222" />
    </svg>
  );
}

function IconAdd() {
  return (
    <svg className="w-[12px] h-[12px]" viewBox="0 0 18 18" fill="none" preserveAspectRatio="none">
        <path d={svgPaths.p35867370} fill="white" />
    </svg>
  );
}

export interface AvatarItemProps {
  image: string;
  name: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function AvatarItem({ image, name, isSelected, onToggle }: AvatarItemProps) {
  return (
    <button 
      className="flex flex-col items-center gap-[12px] w-[80px] p-0 bg-transparent border-none cursor-pointer group"
      onClick={onToggle}
      type="button"
    >
      {/* Avatar Wrapper */}
      <div className="relative size-[80px]">
        <img 
          src={image} 
          alt={name} 
          className="size-full object-contain rounded-full transition-transform duration-300" 
        />
        
        {/* Status Indicator (Absolute positioned) */}
        <div 
            className={cn(
                "absolute bottom-0 right-0 size-[28px] rounded-full flex items-center justify-center transition-colors duration-200 z-10",
                isSelected ? "bg-[#B2DABB]" : "bg-[#3B3B3B] group-hover:bg-[#505050]"
            )}
        >
          {isSelected ? <IconCheck /> : <IconAdd />}
        </div>
      </div>

      {/* Name Label */}
      <span className="font-['Poppins'] text-[14px] text-white text-center leading-normal line-clamp-2 w-full transition-colors duration-300 group-hover:text-[#B2DABB]">
        {name}
      </span>
    </button>
  );
}
