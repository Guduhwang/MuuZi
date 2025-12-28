// 群组卡片组件：展示群组信息、参与者头像、统计数据及用户列表
// 基于 Figma 导入代码重构为 Flexbox 布局
import React from 'react';
// Using the same SVG import as GroupCardPage
import svgPaths from "../../../assets/svgs/svg-ko9q16fvpt";
import GroupCreatorAvatar from "figma:asset/c16e6091b111d23830d11c774e8ac20c159f4ed1.png";

// 群组数据接口定义
export interface Group {
    id: string;
    category: string;
    title: string;
    participants: string[];
    memberNames: string[]; // List of names to display in list view
    userCount: number;
    messageCount: number;
    bgColor: string;
    description?: string;
    subtitle?: string;
}

interface GroupCardProps {
    group: Group;
    onClick?: () => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <article 
      className="w-full rounded-[24px] relative overflow-hidden flex flex-col p-[20px] cursor-pointer transition-transform"
      style={{ backgroundColor: group.bgColor }}
      onClick={onClick}
    >
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
                <p className="font-['Poppins'] text-[#b7b7bc] text-[14px] font-medium mb-1 uppercase leading-none">
                    {group.category}
                </p>
                <h2 className="font-['Poppins'] text-[18px] font-medium leading-none text-white">
                    {group.title}
                </h2>
            </div>
            {/* Avatar + Status Button */}
            <button 
                type="button"
                className="relative w-[40px] h-[40px] shrink-0 transition-transform group-avatar-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    // Add handler if needed
                }}
            >
                {/* Avatar Image Wrapper */}
                <div className="w-full h-full rounded-full overflow-hidden border border-white/20">
                    <img 
                        src={GroupCreatorAvatar} 
                        className="w-full h-full object-cover block" 
                        alt="Avatar" 
                    />
                </div>
                {/* Status Dot */}
                <div 
                    className="absolute top-0 right-0 w-[12px] h-[12px] bg-[#44b571] rounded-full border-[2px]"
                    style={{ borderColor: group.bgColor || '#39404d' }}
                ></div>
            </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px border-t-2 border-dashed border-white/10 mb-5 relative"></div>

        {/* Card Content Row */}
        <div className="flex justify-between items-start">
            {/* Left Col: Avatars + Stats */}
            <div className="flex flex-col gap-5">
                {/* Avatars Overlapping */}
                <div className="flex pl-2 h-[32px] items-center"> 
                   <div className="relative h-[32px] flex"> 
                        <div className="relative h-[32px]" style={{ width: `${group.participants.length * 24 + 8}px` }}>
                            {group.participants.map((src, i) => (
                                <img 
                                    key={i} 
                                    src={src} 
                                    alt="Avatar" 
                                    className="absolute w-8 h-8 rounded-full border border-[#39404d] object-cover"
                                    style={{ 
                                        left: `${i * 24}px`, 
                                        zIndex: group.participants.length - i,
                                        borderColor: group.bgColor // Match card bg
                                    }}
                                />
                            ))}
                        </div>
                   </div>
                </div>
                
                {/* Stats Tags */}
                <div className="flex gap-2 mt-1">
                     <div className="bg-[#222] rounded-[10px] px-2 py-1.5 flex items-center gap-1.5">
                         <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d={svgPaths.p3eeb6400} fill="white"/></svg>
                         <span className="text-[14px] text-white leading-none font-['Poppins']">{group.userCount}</span>
                     </div>
                     <div className="bg-[#222] rounded-[10px] px-2 py-1.5 flex items-center gap-1.5">
                         <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d={svgPaths.p3b451e00} fill="white"/></svg>
                         <span className="text-[14px] text-white leading-none font-['Poppins']">{group.messageCount}</span>
                     </div>
                </div>
            </div>

            {/* Right Col: Users List */}
            <div className="flex flex-col gap-[10px] items-end pt-1">
                {group.memberNames.map((name, i) => (
                    <div key={i} className="text-[14px] flex items-center gap-1 text-white h-[20px]">
                        <span className="font-['Poppins'] text-nowrap">{name}</span> 
                        <span className="opacity-80 text-[14px]">💬</span>
                    </div>
                ))}
            </div>
        </div>
    </article>
  );
}
