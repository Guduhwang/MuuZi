// 群组卡片详情页 (GroupCardPage)
// -----------------------------------------------------------------------------
// 展示单个群组的详细信息卡片。
// 主要职责：
// 1. 展示群组标题、类别、描述和成员头像堆叠。
// 2. 提供热门标签 (Hotkeys) 列表。
// 3. 支持底部手势拖拽呼出扩展菜单 (GroupExpandedSheet)。
// 4. 作为群组交互的核心入口。
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import GroupExpandedSheet from "../../components/Group/GroupExpandedSheet";
import svgPaths from "../../../assets/svgs/svg-ko9q16fvpt";
import svgPathsGroup from "../../../assets/svgs/svg-ezlqu7by1t";
import BarsBottomMinimize from "../../components/Home/BarsBottomMinimize";
import { RoomHeader } from "../../components/Group/RoomHeader";
import { HomeBottomNavigation } from "../../components/Home/HomeBottomNavigation";
import { Group } from "../../components/Group/GroupCard";
import imgAvatarDefault from "figma:asset/c16e6091b111d23830d11c774e8ac20c159f4ed1.png";

// 数据常量
const TAGS = [
  "📚 Books", "❤️ Health", "❤️ Math", "🏕 Traveling", "🍏 Education",
  "🎼 Music", "👀 Marketing", "🎬 Movies", "🧠 AI", "📖 History",
  "🦠 Covid-19", "👏 Indigenous", "👧🏻 Woman", "🤘 Asian", "🧒🏽 Baby",
  "🧚🏻‍♀️ The Future", "🧬 GenZ", "🛍 Shopping", "⚫️ Black", "🏳️‍🌈 LGBTQ"
];

interface GroupCardPageProps {
  group?: Group;
  onBack?: () => void;
  onOpenProfile?: () => void;
  // 添加可选的 navigation props 以兼容现有组件接口
  activeTab?: 'home' | 'calendar' | 'notification';
  onTabChange?: (tab: 'home' | 'calendar' | 'notification') => void;
}

// 群组详情页：展示群组信息、用户列表和标签
export function GroupCardPage({ group, onBack, onOpenProfile, activeTab = 'home', onTabChange = () => {} }: GroupCardPageProps) {
  const [showSheet, setShowSheet] = useState(false);

  // 如果没有选中群组，显示提示或返回空
  if (!group) return <div className="flex items-center justify-center h-full text-white">No group selected</div>;

  return (
    <motion.div 
      className="flex flex-col w-full h-[100dvh] bg-[#222] text-white relative overflow-hidden font-['Poppins']"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.2 }}
      onDragEnd={(e, info) => {
        // 右滑返回逻辑：位移 > 100px 触发
        if (info.offset.x > 100) {
          onBack?.();
        }
      }}
    >
        {/* 顶部导航栏 */}
        <RoomHeader onBack={onBack} />

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto pb-[200px] scrollbar-hide">
            {/* 房间卡片信息区域 */}
            <div 
                className="mx-5 mt-5 rounded-[24px] p-5 relative"
                style={{ backgroundColor: group.bgColor || '#39404d' }}
            >
                {/* Header: Title and Category */}
                <div className="relative mb-5 min-h-[47px]">
                    <div className="flex justify-between items-start">
                         <div className="flex flex-col pt-[22px]">
                            <h2 className="text-[18px] font-['Poppins'] font-medium leading-none text-white w-[271px]">
                                {group.title}
                            </h2>
                         </div>
                         {/* Add Icon Button */}
                         <button className="w-6 h-6 flex items-center justify-center shrink-0 active:opacity-70 transition-opacity">
                             <svg className="w-full h-full" viewBox="0 0 18 18" fill="none">
                                <path d={svgPathsGroup.pb8c5300} fill="white" />
                             </svg>
                         </button>
                    </div>
                    {/* Category Absolute Position */}
                    <p className="absolute top-0 left-0 text-[#b7b7bc] text-[14px] font-['Poppins'] font-medium uppercase leading-none">
                        {group.category}
                    </p>
                </div>
                
                {/* Divider */}
                <div className="w-full h-px relative mb-5">
                   <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t-[2px] border-dashed border-white/20"></div>
                   </div>
                </div>
                
                {/* Content: Avatars, Tags, Description */}
                <div className="flex flex-col gap-4">
                    {/* Avatars Row */}
                    <div className="flex h-[40px] items-center"> 
                       <div className="relative h-[40px] w-full">
                           {group.participants.map((src, i) => (
                               <img 
                                   key={i} 
                                   src={src} 
                                   alt="Avatar" 
                                   className="absolute w-[40px] h-[40px] rounded-full object-cover"
                                   style={{ 
                                       left: `${i * 51}px`, // Spacing based on design (71-20 = 51px)
                                       zIndex: group.participants.length - i,
                                   }}
                               />
                           ))}
                       </div>
                    </div>
                    
                    {/* Tags: User Count & Edit Enabled */}
                    <div className="flex gap-[8px] items-center">
                         {/* User Count Tag */}
                         <div className="bg-[#222] rounded-[10px] h-[32px] px-[8px] flex items-center gap-[6px]">
                             <div className="w-[14px] h-[14px] flex items-center justify-center">
                                 <svg className="w-full h-full" viewBox="0 0 11 14" fill="none">
                                     <path d={svgPathsGroup.pade2100} fill="white"/>
                                 </svg>
                             </div>
                             <span className="text-[14px] font-['Poppins'] text-white leading-none pt-0.5">{group.userCount}</span>
                         </div>
                         
                         {/* Edit Enabled Tag */}
                         <div className="bg-[#222] rounded-[10px] h-[32px] px-[8px] flex items-center gap-[6px]">
                             <div className="w-[14px] h-[14px] flex items-center justify-center">
                                  <svg className="w-full h-full" viewBox="0 0 12 14" fill="none">
                                     <path d={svgPathsGroup.p1213c340} fill="white"/>
                                  </svg>
                             </div>
                             <span className="text-[14px] font-['Poppins'] text-white leading-none pt-0.5">Edit enabled</span>
                         </div>
                    </div>

                    {/* Description Text */}
                    <div className="text-white text-[14px] font-['Poppins'] leading-normal mt-2">
                        <p className="mb-0">
                           {group.description || "A collaborative workspace where multiple AI agents and creators work together to plan content, generate ideas, analyze trends, and automate daily workflows — all in one shared Group."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 热门标签区域 */}
            <div className="mx-5 mt-8">
                <h3 className="text-[16px] font-semibold mb-4">Hotkeys</h3>
                <div className="flex flex-wrap gap-3">
                    {TAGS.map((tag, i) => (
                        <button key={i} className="bg-[#3b3b3b] rounded-[14px] px-3 py-2.5 text-[14px] font-medium whitespace-nowrap active:opacity-80 transition-opacity">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* 底部悬浮控制栏 */}
        <motion.div 
            className="absolute bottom-[80px] left-0 w-full z-20 cursor-pointer"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.2, bottom: 0.05 }}
            onDragEnd={(e, info) => {
                if (info.offset.y < -50) {
                    setShowSheet(true);
                }
            }}
            onClick={() => setShowSheet(true)}
        >
             <div className="w-full h-[88px] relative">
                 <BarsBottomMinimize onOpenProfile={onOpenProfile} participants={group.participants} />
             </div>
        </motion.div>

        {/* 底部导航菜单 */}
        <HomeBottomNavigation activeTab={activeTab} onTabChange={onTabChange} />

        <AnimatePresence>
            {showSheet && <GroupExpandedSheet onClose={() => setShowSheet(false)} group={group} />}
        </AnimatePresence>
    </motion.div>
  );
}
