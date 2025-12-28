// 群组详情概览页面 (GroupDetailsPage)
// -----------------------------------------------------------------------------
// 展示群组创建者或特定群组的公共资料页。
// 主要职责：
// 1. 展示创建者头像、名称和简介。
// 2. 提供“关注”按钮 (Following)。
// 3. 嵌入预览卡片，展示群组的典型活动或公告。
// 4. 底部指示器表示多卡片分页状态。
// -----------------------------------------------------------------------------
import React from 'react';
import { motion } from "motion/react";
import { MessageHeader } from "../../components/Chat/MessageHeader";
import svgPaths from "../../../assets/svgs/svg-mnegcmakl4";
import svgPathsGroup from "../../../assets/svgs/svg-ezlqu7by1t"; // Reusing paths from GroupCard2
import { imgHeaderIcon } from "../../../assets/svgs/svg-tpo9m";

// Import images as provided in the prompt
import imgAvatarMain from "figma:asset/6e834e9d1b14fe7763938f9cda98128732626757.png";
// Avatars for the card
import imgAvatar1 from "figma:asset/196b0d44a3d3fde7efc640355ec260d5602541d4.png";
import imgAvatar2 from "figma:asset/f8bd0c907c392c15bd661ae5a2982a421b6a46c2.png";
import imgAvatar3 from "figma:asset/0ed317f277e99168c5c472aa03081907ed783595.png";
import imgAvatar4 from "figma:asset/1465bd77552929faf50c4424f58814248844a3da.png";
import imgAvatar5 from "figma:asset/cca52c1ba2653720b531334ad6385e8d699abcc2.png";
import imgAvatar6 from "figma:asset/9bc823212f2145c777cef55a636dfa05c727863d.png";

const CARD_AVATARS = [imgAvatar1, imgAvatar2, imgAvatar3, imgAvatar4, imgAvatar5, imgAvatar6];

interface GroupDetailsPageProps {
  onBack?: () => void;
}

export function GroupDetailsPage({ onBack }: GroupDetailsPageProps) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-[#222] text-white overflow-y-auto font-['Poppins'] z-50 flex flex-col items-center h-[100dvh]"
    >
        {/* Background Overlay (if needed, but bg-[#222] handles it) */}
        
        {/* Header: Back and Share */}
        <MessageHeader title="" onBack={onBack || (() => {})} className="w-full" />

        {/* Main Content */}
        <div className="flex flex-col items-center w-full px-5 pt-4 pb-20">
            
            {/* Main Avatar */}
            <div className="w-[127px] h-[131px] relative mb-4">
                <div className="w-[88px] h-[88px] mx-auto overflow-hidden rounded-full">
                     <img src={imgAvatarMain} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <div className="text-center mt-3 flex items-center justify-center gap-1">
                     <h1 className="text-[18px] font-semibold">GuDuu</h1>
                     <span className="text-[18px]">🦠</span>
                </div>
            </div>

            {/* Description */}
            <div className="text-center text-[#b7b7bc] text-[14px] leading-normal mb-6 max-w-[335px]">
                <p>An AI-powered workspace</p>
                <p>for creators and builders.</p>
                <p>Create, connect, and run intelligent workflows.</p>
            </div>

            {/* Following Button */}
            <button className="w-[132px] h-[56px] bg-[#b2dabb] rounded-[21px] flex items-center justify-center mb-8 transition-transform">
                <span className="text-black text-[18px] font-medium">Following</span>
            </button>

            {/* Group Card (Embedded) */}
            <div className="w-full bg-[#3b3b3b] rounded-[24px] p-5 relative mb-8 aspect-[335/312] shrink-0">
                {/* Card Header */}
                <div className="relative mb-5 min-h-[47px]">
                    <div className="flex justify-between items-start">
                         <div className="flex flex-col pt-[22px]">
                            <h2 className="text-[18px] font-medium leading-none text-white w-[271px]">
                                Welcome 👏🥳🤩
                            </h2>
                         </div>
                         {/* Add Icon */}
                         <button className="w-6 h-6 flex items-center justify-center shrink-0">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d={svgPaths.p302c2280} fill="white" />
                             </svg>
                         </button>
                    </div>
                    {/* Category */}
                    <p className="absolute top-0 left-0 text-[#b7b7bc] text-[14px] font-medium uppercase leading-none">
                        NEW USER ONBOARDING
                    </p>
                </div>

                {/* Divider */}
                <div className="w-full border-t-2 border-dashed border-white/20 mb-5"></div>

                {/* Avatars */}
                <div className="flex h-[40px] items-center mb-4 relative">
                    <div className="relative h-[40px] w-full">
                       {CARD_AVATARS.map((src, i) => (
                           <img 
                               key={i} 
                               src={src} 
                               alt="Avatar" 
                               className="absolute w-[40px] h-[40px] rounded-full object-cover"
                               style={{ 
                                   left: `${i * 51}px`, 
                                   zIndex: CARD_AVATARS.length - i 
                               }}
                           />
                       ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-[8px] items-center mb-4">
                     {/* Today Tag */}
                     <div className="bg-[#222] rounded-[10px] h-[32px] px-[8px] flex items-center gap-[6px]">
                         <div className="w-[14px] h-[14px] flex items-center justify-center">
                             <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                 <path d={svgPaths.p3eeb6400} fill="white"/>
                             </svg>
                         </div>
                         <span className="text-[14px] text-white leading-none pt-0.5">Today</span>
                     </div>
                     
                     {/* Edit Enabled Tag */}
                     <div className="bg-[#222] rounded-[10px] h-[32px] px-[8px] flex items-center gap-[6px]">
                         <div className="w-[14px] h-[14px] flex items-center justify-center">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                 <path d={svgPaths.p359d5b80} fill="white"/>
                              </svg>
                         </div>
                         <span className="text-[14px] text-white leading-none pt-0.5">Edit enabled</span>
                     </div>
                </div>

                {/* Description Text */}
                <div className="text-white text-[14px] leading-normal">
                    <p>Manna Wassalwa, Fatuma dale la, Aya Abdellatif, 💦🍩 Ria Ervilita & SUFI ROXX - Join us in the daily Surah Yaseen recitation room. Safe space, 🥎 all levels are welcome on stage.</p>
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#353535]"></div>
                <div className="w-2 h-2 rounded-full bg-[#3b3b3b]"></div>
                <div className="w-2 h-2 rounded-full bg-[#3b3b3b]"></div>
                <div className="w-2 h-2 rounded-full bg-[#3b3b3b]"></div>
                <div className="w-2 h-2 rounded-full bg-[#3b3b3b]"></div>
            </div>

        </div>
    </motion.div>
  );
}
