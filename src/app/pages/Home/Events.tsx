// 活动日历页面 (EventsPage / MuuZiPage)
// -----------------------------------------------------------------------------
// 展示即将进行的活动或话题讨论。
// 主要职责：
// 1. 展示精选活动卡片列表 (EventCard)。
// 2. 提供活动的详细信息概览（参与人、时间、标签）。
// 3. 支持手势滑动切换 Tab。
// -----------------------------------------------------------------------------
import React from 'react';
import { motion } from 'motion/react';
import { MuuziLogo } from '../../components/Common/MuuziLogo';
import { EventCard } from '../../components/Group/EventCard';
import svgPaths from '../../../assets/svgs/svg-x3cej5mv4g';

// Import images
import imgAvatarDefault from "figma:asset/196b0d44a3d3fde7efc640355ec260d5602541d4.png";
import imgAvatarDefault1 from "figma:asset/f8bd0c907c392c15bd661ae5a2982a421b6a46c2.png";
import imgAvatarDefault2 from "figma:asset/0ed317f277e99168c5c472aa03081907ed783595.png";
import imgAvatarDefault3 from "figma:asset/1465bd77552929faf50c4424f58814248844a3da.png";
import imgAvatarDefault4 from "figma:asset/cca52c1ba2653720b531334ad6385e8d699abcc2.png";
import imgAvatarDefault5 from "figma:asset/9bc823212f2145c777cef55a636dfa05c727863d.png";
import imgAvatarDefault6 from "figma:asset/49930d582145875ed2da565f8141c0481ff0a808.png";
import imgAvatarDefault7 from "figma:asset/6891e0e701e457c2aa055cf4f60f1afb2892bf2b.png";
import imgAvatarDefault8 from "figma:asset/b054a42f50295b5219d364df2cb40b5510769209.png";
import imgAvatarDefault9 from "figma:asset/8a445bf050501b2cff758ec3ba4d73ed502ba621.png";
import imgAvatarDefault10 from "figma:asset/0e2a6c6d90fa14ce148d2496c1b7f0a842659cea.png";

// [Refactor] 既然导航由 App 控制，此处不再需要 Tab 相关 Props
export interface MuuZiPageProps {
  onOpenGroupChat?: () => void;
  onOpenChat?: () => void;
}

// Icon Components for Tags
const UserIcon = () => (
  <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.pe8ae980} fill="white" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p359d5b80} fill="white" />
  </svg>
);

// 活动数据定义
const EVENTS_DATA = [
  {
    id: 1,
    authorAvatar: imgAvatarDefault,
    bgColor: "#614E3E",
    category: "NEW USER ONBOARDING",
    title: "Welcome 👏🥳🤩",
    avatars: [imgAvatarDefault, imgAvatarDefault1, imgAvatarDefault2, imgAvatarDefault3, imgAvatarDefault4, imgAvatarDefault5],
    tags: [
      { icon: <UserIcon />, text: "Today" },
      { icon: <EditIcon />, text: "Edit enabled" }
    ],
    description: (
      <>
        <p className="mb-0">Manna Wassalwa, Fatuma dale la, Aya</p>
        <p>{`Abdellatif, 💦🍩 Ria Ervilita & SUFI ROXX - Join us in the daily Surah Yaseen recitation room. Safe space, 🥎 all levels are welcome on stage.`}</p>
      </>
    )
  },
  {
    id: 2,
    authorAvatar: imgAvatarDefault6,
    bgColor: "#39404D",
    category: "AWS STARTUPS",
    title: "Early Stage Startup",
    avatars: [imgAvatarDefault6, imgAvatarDefault7, imgAvatarDefault8, imgAvatarDefault9, imgAvatarDefault10],
    tags: [
      { icon: <UserIcon />, text: "Today" },
      { icon: <EditIcon />, text: "10:00 am" }
    ],
    description: (
      <p>
        🐶🐱🐭 There is no denying the fact that the success of an advertisement lies mostly in the headline. 🌿🌱 The headline should attract the reader and make him read the rest of the advertisement.
      </p>
    )
  }
];

export function MuuZiPage({ onOpenGroupChat, onOpenChat }: MuuZiPageProps) {
  return (
    <motion.div 
      className="absolute inset-0 z-10 bg-[#222] flex flex-col font-['Poppins'] h-[100dvh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.2, right: 0.2 }}
      onDragEnd={(e, { offset, velocity }) => {
          if (offset.x < -50 || velocity.x < -500) {
              onOpenChat?.();
          }
          else if (offset.x > 50 || velocity.x > 500) {
              onOpenGroupChat?.();
          }
      }}
    >
      {/* 主内容滚动区 */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-[120px] touch-pan-y">
        {/* 顶部占位区：防止内容被 Fixed Header (App.tsx) 遮挡 */}
        <div className="w-full h-[120px] shrink-0" aria-hidden="true" />
        
        {/* Logo 区域 */}
        <MuuziLogo title="MuuZi" icon="🌍" showTagline={false} className="my-[50px] relative z-10" />

        {/* 活动卡片列表 */}
        <div className="px-5 flex flex-col gap-6">
          {EVENTS_DATA.map((event) => (
            <EventCard 
              key={event.id}
              authorAvatar={event.authorAvatar}
              bgColor={event.bgColor}
              category={event.category}
              title={event.title}
              avatars={event.avatars}
              tags={event.tags}
              description={event.description}
            />
          ))}
        </div>
      </main>
    </motion.div>
  );
}
