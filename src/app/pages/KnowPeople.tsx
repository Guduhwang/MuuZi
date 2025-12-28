// 推荐关注页面 (KnowPeoplePage)
// -----------------------------------------------------------------------------
// 注册流程的最后一步，引导用户关注初始创作者。
// 主要职责：
// 1. 展示推荐创作者网格列表 (Suggested Creators)。
// 2. 支持批量选择/取消关注 (AvatarItem)。
// 3. 提供“换一批”功能 (Refresh) 以发现更多创作者。
// 4. 提供搜索/邀请功能入口 (InvitePopup)。
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { motion } from "motion/react";
import { Button } from '../components/Common/Button';
import { AvatarItem } from '../components/User/AvatarItem';
import { InvitePopup } from '../components/User/InvitePopup';

// Avatar Images
import imgAvatarCheck from "figma:asset/2998d03f301c57572919bee25242427612f8ca9c.png";
import imgAvatarCheck1 from "figma:asset/01d5664980cd9adb04e6cbd70bc9b0e65be803c4.png";
import imgAvatarCheck2 from "figma:asset/72ae172b08504ba7fc3d0e567d4f4a757bd43a60.png";
import imgAvatarCheck3 from "figma:asset/08dfc5fc9a66c4278e7887549dda7c8a3d622c61.png";
import imgAvatarCheck4 from "figma:asset/025e4666a8344a241ae285b3ea550238778e9c9b.png";
import imgAvatarCheck5 from "figma:asset/4a79b27b075efcc7aa799d406161ca695a536db2.png";
import imgAvatarCheck6 from "figma:asset/1c2eb7ffa485353e96e49d201d4ae826cc1898b8.png";
import imgAvatarCheck7 from "figma:asset/24a62dbc5b9e5af55d88c0f9e8e9eb48b439330b.png";
import imgAvatarCheck8 from "figma:asset/6f8a37c9409ae0d6815029f4393be24bbc6a7946.png";
import imgAvatarCheck9 from "figma:asset/0341506fdc99d859c6a11f77c926a9d99272fd8d.png";
import imgAvatarCheck10 from "figma:asset/372b561763c6c8cb62384a795a0e5ce7b96e07de.png";
import imgAvatarCheck11 from "figma:asset/50d536d538dfc40468ac181b9d21ecd62a45363d.png";

// SVG Paths (Restored from svg-o29lotiajt for pixel-perfect match)
const HEADER_PATHS = {
  bgCircle: "M19.8773 0H20.1227C24.3091 0 27.8583 0.83543 30.7916 2.4042C33.7249 3.97296 36.027 6.27505 37.5958 9.2084C39.1645 12.1417 40 15.6909 40 19.8773V20.1227C40 24.3091 39.1645 27.8583 37.5958 30.7916C36.027 33.7249 33.7249 36.027 30.7916 37.5958C27.8583 39.1645 24.3091 40 20.1227 40H19.8773C15.6909 40 12.1417 39.1645 9.2084 37.5958C6.27505 36.027 3.97296 33.7249 2.4042 30.7916C0.83543 27.8583 0 24.3091 0 20.1227V19.8773C0 15.6909 0.83543 12.1417 2.4042 9.2084C3.97296 6.27505 6.27505 3.97296 9.2084 2.4042C12.1417 0.83543 15.6909 0 19.8773 0Z",
  arrowLeft: "M5.80273 0.318772L2.59273 3.52877L0.622726 5.48877C-0.207575 6.32033 -0.207575 7.66722 0.622726 8.49877L5.80273 13.6788C6.48273 14.3588 7.64273 13.8688 7.64273 12.9188V1.07877C7.64273 0.118772 6.48273 -0.361228 5.80273 0.318772Z",
  search: "M17.3633 17.3633C17.6854 17.0411 18.1912 17.0148 18.5439 17.2832L18.6367 17.3633L20.5361 19.2637C20.8876 19.6151 20.8876 20.1847 20.5361 20.5361C20.214 20.8583 19.7082 20.8857 19.3555 20.6172L19.2637 20.5361L17.3633 18.6367C17.0118 18.2852 17.0118 17.7148 17.3633 17.3633ZM9.9248 0C13.4707 0 16.7476 1.89208 18.5205 4.96289C20.2932 8.03363 20.2934 11.817 18.5205 14.8877C16.7476 17.9585 13.4706 19.8496 9.9248 19.8496C4.44347 19.8495 0 15.4062 0 9.9248C0.000105658 4.44353 4.44353 0.000105655 9.9248 0ZM9.9248 1.7998C5.43765 1.79991 1.79991 5.43765 1.7998 9.9248C1.7998 14.4121 5.43758 18.0497 9.9248 18.0498C12.8276 18.0498 15.5105 16.5012 16.9619 13.9873C18.4131 11.4735 18.4132 8.37606 16.9619 5.8623C15.5105 3.34842 12.8276 1.7998 9.9248 1.7998Z"
};

// Data Structure
type Person = {
  id: string;
  name: string;
  image: string;
  initialSelected: boolean;
};

const PEOPLE: Person[] = [
  { id: '1', name: 'Quỳnh', image: imgAvatarCheck3, initialSelected: true },
  { id: '2', name: 'Sampson', image: imgAvatarCheck6, initialSelected: true },
  { id: '3', name: 'Jaclynn Bradley', image: imgAvatarCheck9, initialSelected: true },
  { id: '4', name: 'Davea Butler', image: imgAvatarCheck4, initialSelected: true },
  { id: '5', name: 'Uesugi Suzuki', image: imgAvatarCheck8, initialSelected: false },
  { id: '6', name: 'Fátima', image: imgAvatarCheck10, initialSelected: false },
  { id: '7', name: 'Rahul', image: imgAvatarCheck5, initialSelected: false },
  { id: '8', name: 'Hashim', image: imgAvatarCheck7, initialSelected: true },
  { id: '9', name: 'Teng Jiang', image: imgAvatarCheck11, initialSelected: true },
  { id: '10', name: 'Sophie Asveld', image: imgAvatarCheck2, initialSelected: true },
  { id: '11', name: 'Kong Yijun', image: imgAvatarCheck, initialSelected: true },
  { id: '12', name: 'Farrokh', image: imgAvatarCheck1, initialSelected: true },
];

/**
 * 推荐关注页面
 * 包含用户网格列表和底部操作栏
 */
export function KnowPeoplePage({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(PEOPLE.filter(p => p.initialSelected).map(p => p.id));
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRefresh = () => {
    const shuffled = [...PEOPLE].sort(() => Math.random() - 0.5);
    setPeople(shuffled);
    const newSelected = new Set(shuffled.filter(p => p.initialSelected).map(p => p.id));
    setSelectedIds(newSelected);
  };

  return (
    <motion.div 
      className="absolute inset-0 z-10 bg-[#222222] flex flex-col items-center overflow-hidden h-[100dvh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header - Custom Implementation to match Figma EXACTLY */}
      <header className="relative w-full h-[120px] shrink-0 z-10">
        
        {/* Title: Suggested Creators - Positioned exactly as per Figma */}
        <p className="absolute left-[20.27%] top-[65.83%] -translate-y-1/2 font-['Poppins'] font-medium text-[18px] text-white whitespace-nowrap">
            Suggested Creators
        </p>

        {/* Back Button (Left) */}
        <button 
            className="absolute left-[5.33%] top-[65.83%] -translate-y-1/2 w-[40px] h-[40px] cursor-pointer transition-transform"
            onClick={onBack}
        >
            {/* Button Bg */}
            <svg className="absolute inset-0 size-full" viewBox="0 0 40 40" fill="none">
                <path clipRule="evenodd" d={HEADER_PATHS.bgCircle} fill="#3B3B3B" fillRule="evenodd" />
            </svg>
            {/* Icon */}
            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[8px] h-[14px]" viewBox="0 0 8 14" fill="none">
                 <path clipRule="evenodd" d={HEADER_PATHS.arrowLeft} fill="white" fillRule="evenodd" />
            </svg>
        </button>

        {/* Search Button (Right) */}
        <button 
            className="absolute right-[5.33%] top-[65.83%] -translate-y-1/2 w-[40px] h-[40px] cursor-pointer transition-transform"
            onClick={() => setShowInvitePopup(true)}
        >
             {/* Button Bg */}
             <svg className="absolute inset-0 size-full" viewBox="0 0 40 40" fill="none">
                <path clipRule="evenodd" d={HEADER_PATHS.bgCircle} fill="#3B3B3B" fillRule="evenodd" />
            </svg>
            {/* Icon */}
            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[21px]" viewBox="0 0 21 21" fill="none">
                <path d={HEADER_PATHS.search} fill="white" />
            </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[375px] flex-1 overflow-y-auto no-scrollbar pb-[160px]">
        
        {/* Title Section */}
        <div className="w-full px-[20px] mb-[30px] flex flex-col items-center z-10">
            <h1 className="font-['Poppins'] font-semibold text-[20px] leading-normal text-center text-white">
                Follow creators you might<br/> like to get started...
            </h1>
        </div>

        {/* Grid Container */}
        <div className="w-full px-[28px] grid grid-cols-3 gap-y-[32px] gap-x-[13px] justify-items-center">
            {people.map((person) => (
                <AvatarItem 
                    key={person.id}
                    image={person.image}
                    name={person.name}
                    isSelected={selectedIds.has(person.id)}
                    onToggle={() => toggleSelection(person.id)}
                />
            ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full flex justify-center z-20 pointer-events-none">
          <div className="w-full max-w-[375px] h-[136px] relative pointer-events-auto flex flex-col items-center justify-center gap-[16px] pt-[20px]">
             {/* Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-b from-[rgba(34,34,34,0)] via-[rgba(34,34,34,0.8)] to-[#222222] via-[13.9%] -z-10" />
             
             {/* Refresh Button */}
             <Button 
                variant="primary"
                className="w-[200px] h-[56px] rounded-[21px]"
                onClick={handleRefresh}
             >
                More Creators
             </Button>

             {/* Secondary Action */}
             <Button 
                variant="tertiary"
                className="font-['Poppins'] font-medium text-[#b7b7bc]"
                onClick={onNext}
             >
                Skip
             </Button>
          </div>
      </footer>

      {/* Search Popup Overlay */}
      {showInvitePopup && (
        <InvitePopup onClose={() => setShowInvitePopup(false)} />
      )}
    </motion.div>
  );
}
