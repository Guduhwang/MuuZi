// 事件卡片组件：展示活动信息、参与者头像及标签
import React from 'react';
import svgPaths from '../../../assets/svgs/svg-x3cej5mv4g';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface EventCardProps {
  category: string;
  title: React.ReactNode;
  avatars: string[];
  tags: Array<{ icon?: React.ReactNode, text: string }>;
  description: React.ReactNode;
  bgColor?: string;
  authorAvatar?: string;
}

export function EventCard({ 
  category, 
  title, 
  avatars, 
  tags, 
  description, 
  bgColor = '#614E3E',
  authorAvatar
}: EventCardProps) {
  return (
    <div 
      className="w-full rounded-[24px] p-5 flex flex-col relative overflow-hidden shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[#b7b7bc] text-[14px] font-['Poppins'] font-medium uppercase tracking-wide">
            {category}
          </span>
          <h3 className="text-white text-[18px] font-['Poppins'] font-medium leading-tight max-w-[260px]">
            {title}
          </h3>
        </div>
        
        {/* Author Avatar Button */}
        <button className="relative hover:opacity-80 transition-opacity">
          <div className="relative">
            <Avatar className="w-8 h-8 bg-transparent">
               <AvatarImage src={authorAvatar} alt="Author" className="object-cover" />
               <AvatarFallback className="bg-white/10 text-white text-[10px]">U</AvatarFallback>
            </Avatar>
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
              style={{ border: `2px solid ${bgColor}` }}
            >
               <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4V20M4 12H20" />
               </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Dashed Divider */}
      <div className="w-full h-[2px] mb-5 relative opacity-30">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
           <line x1="0" y1="1" x2="100%" y2="1" stroke="white" strokeWidth="2" strokeDasharray="6" strokeLinecap="round" />
        </svg>
      </div>

      {/* Avatars Row */}
      <div className="flex items-center mb-5 pl-1 relative z-10 h-10">
         {avatars.map((src, i) => (
           <div 
             key={i} 
             className="w-10 h-10 rounded-full border-0 overflow-hidden absolute top-0"
             style={{ left: `${i * 32}px`, zIndex: avatars.length - i }}
           >
             <img src={src} alt="Avatar" className="w-full h-full object-cover" />
           </div>
         ))}
         {/* Placeholder to reserve space for absolute avatars */}
         <div style={{ width: `${(avatars.length - 1) * 32 + 40}px` }} className="h-10"></div>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {tags.map((tag, i) => (
          <div key={i} className="bg-[#222222] rounded-full h-[32px] px-3 flex items-center gap-1.5">
            {tag.icon}
            <span className="text-white text-[14px] font-['Poppins']">{tag.text}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="text-white text-[14px] font-['Poppins'] leading-normal opacity-90 relative z-10">
        {description}
      </div>

      {/* Background Mask/Decoration (Optional) */}
      {/* Figma uses a mask on the whole card, but standard bg color works for the main look. */}
    </div>
  );
}
