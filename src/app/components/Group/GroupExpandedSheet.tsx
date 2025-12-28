import React from 'react';
import { motion, useDragControls } from "motion/react";
import svgPaths from "../../../assets/svgs/svg-4i2utnugh5";
import { Group } from './GroupCard';
import { AvatarDetailCard } from '../User/AvatarDetailCard';

// Helper to zip participants and names if available
const getAvatars = (group: Group) => {
    return group.participants.map((src, i) => ({
        src,
        name: group.memberNames?.[i] || `User ${i + 1}`
    }));
};

interface GroupExpandedSheetProps {
  onClose: () => void;
  group?: Group;
}

export default function GroupExpandedSheet({ onClose, group }: GroupExpandedSheetProps) {
  const dragControls = useDragControls();

  // Fallback if no group provided (shouldn't happen if logic is correct)
  if (!group) return null;

  const avatars = getAvatars(group);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div 
        className="relative w-full max-w-[375px] bg-[#222] rounded-t-[32px] overflow-hidden flex flex-col pb-8 h-[85vh]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
          }
        }}
      >
        {/* Header / Handle area */}
        <div 
          className="w-full flex justify-center pt-3 pb-1 touch-none cursor-grab active:cursor-grabbing" 
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-[32px] h-[4px] bg-white/20 rounded-full" />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-5 pt-4">
          
          {/* Header Title Section */}
          <div 
            className="relative mb-6 touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-[#b7b7bc] text-[14px] font-['Poppins'] font-medium uppercase mb-1">{group.category}</p>
                     <h2 className="text-[18px] text-white font-['Poppins'] font-medium">{group.title}</h2>
                 </div>
                 <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                        <path d={svgPaths.p2dfa3b00} fill="white" />
                    </svg>
                 </div>
             </div>
          </div>

          {/* Dashed Divider */}
          <div className="w-full border-t border-dashed border-white/20 mb-6"></div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 mb-8">
              {avatars.map((avatar, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-gray-700">
                          <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-white text-[14px] font-medium font-['Poppins'] text-center">{avatar.name}</span>
                  </div>
              ))}
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-6">
              <div className="bg-[#222] border border-white/10 rounded-[10px] px-2 py-1.5 flex items-center gap-1.5">
                  <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none">
                      <path d="M4.97743 8.3125C6.15009 8.12691 7.34198 8.10393 8.51942 8.24316L9.02333 8.3125L9.16688 8.33496C11.0545 8.63362 12.4442 10.2495 12.4442 12.1465C12.4422 12.6401 12.2439 13.1124 11.8934 13.46C11.5429 13.8076 11.0687 14.0021 10.5751 14H3.4247C2.93107 14.0021 2.45684 13.8076 2.10634 13.46C1.75591 13.1124 1.55761 12.6401 1.55556 12.1465C1.55559 10.2496 2.94455 8.6329 4.8329 8.33496L4.97743 8.3125ZM6.99989 0C8.89292 0 10.4275 1.52197 10.4276 3.39941C10.4276 5.27775 8.893 6.7998 6.99989 6.7998C5.10683 6.79975 3.57216 5.27771 3.57216 3.39941C3.57229 1.52201 5.10692 5.82872e-05 6.99989 0Z" fill="white"/>
                  </svg>
                  <span className="text-white text-[14px] font-['Poppins']">{group.userCount}</span>
              </div>
              <div className="bg-[#222] border border-white/10 rounded-[10px] px-2 py-1.5 flex items-center gap-1.5">
                   <svg className="w-[14px] h-[14px]" viewBox="0 0 12 14" fill="none">
                       <path d="M11.0939 12.0792C11.3838 12.0792 11.6192 12.3138 11.6193 12.6036C11.6193 12.8712 11.4182 13.0927 11.1594 13.1251L11.0939 13.129H0.525584C0.235635 13.129 0.000193564 12.8935 0.000193564 12.6036C0.000322099 12.3361 0.2005 12.1156 0.459178 12.0831L0.525584 12.0792H11.0939ZM5.89961 0.721746C6.52247 0.0990534 7.43069 -0.143787 8.28144 0.084051C9.1322 0.312012 9.79742 0.97654 10.0256 1.82722C10.2536 2.67807 10.0097 3.58611 9.38691 4.20905L6.42988 7.16608C5.0773 8.51841 3.38275 9.47768 1.52754 9.94147L0.955272 10.085C0.693645 10.1508 0.416776 10.0744 0.22578 9.88386C0.035131 9.69342 -0.042475 9.41683 0.0226545 9.15436L0.166209 8.5821C0.630348 6.72652 1.59004 5.03125 2.94258 3.67878L5.89961 0.721746ZM3.68574 4.42194C2.46777 5.63984 1.60283 7.16579 1.18476 8.83698L1.15547 8.95222L1.27265 8.92389C2.8601 8.52706 4.31713 7.72665 5.50312 6.60358L5.68769 6.42389L7.24433 4.86628C6.34896 4.56041 5.54775 3.75979 5.24238 2.86432L3.68574 4.42194ZM8.00996 1.09772C7.52156 0.966945 7.00039 1.10751 6.64277 1.46491L6.17793 1.92878C5.99445 2.85073 7.25771 4.11331 8.17988 3.93073L8.64472 3.46686C9.00212 3.10925 9.1417 2.58807 9.01094 2.09968C8.8799 1.61127 8.49842 1.22861 8.00996 1.09772Z" fill="white"/>
                   </svg>
                  <span className="text-white text-[14px] font-['Poppins']">Edit enabled</span>
              </div>
          </div>

          {/* Description */}
          <div className="mb-8">
             <p className="text-[#b7b7bc] text-[14px] font-['Poppins'] leading-relaxed">
                 {group.description || "Businesses often become known today through effective marketing. The marketing may be in the form of a regular news item or half column society news in the Sunday."}
             </p>
          </div>

          {/* Action Buttons Row */}
          {avatars.map((avatar, index) => (
              <AvatarDetailCard 
                  key={index} 
                  name={avatar.name} 
                  avatarUrl={avatar.src} 
                  subtitle={group.subtitle || "Auto Post to Twitter"} 
              />
          ))}

          {/* Join Button */}
          <button className="w-full h-[56px] bg-[#b2dabb] rounded-[21px] flex items-center justify-center active:opacity-90 transition-opacity">
              <span className="text-black text-[18px] font-medium font-['Poppins']">Join the room in progres</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActionButton({ iconPath }: { iconPath: string }) {
    return (
        <button className="w-[56px] h-[56px] bg-[#3b3b3b] rounded-[24px] flex items-center justify-center active:bg-[#4a4a4a] transition-colors">
            <svg className="w-[24px] h-[24px]" viewBox="0 0 32 32" fill="none">
                 <path d={iconPath} fill="white" />
            </svg>
        </button>
    )
}
