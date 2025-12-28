// 消息活动页面 (ActivityPage)
// -----------------------------------------------------------------------------
// 展示用户的通知和社交动态。
// 主要职责：
// 1. 展示活动通知列表 (ActivityItem)。
// 2. 包含关注、提及、日程安排等多种类型的通知。
// 3. 支持手势滑动切换 Tab。
// -----------------------------------------------------------------------------
import React from "react";
import { motion } from "motion/react";
import { MuuziLogo } from "../../components/Common/MuuziLogo";

// 导入 Figma 图片资源
import imgAvatarDefault from "figma:asset/f8bd0c907c392c15bd661ae5a2982a421b6a46c2.png";
import imgAvatarDefault1 from "figma:asset/6891e0e701e457c2aa055cf4f60f1afb2892bf2b.png";
import imgAvatarDefault2 from "figma:asset/0e2a6c6d90fa14ce148d2496c1b7f0a842659cea.png";
import imgAvatarDefault3 from "figma:asset/a3e3bcf4e34a569ac645704478cf7cc9c62862f3.png";
import imgAvatarDefault4 from "figma:asset/032fb14c8ebd0578ba12e50fc15c7c48380b38b7.png";
import imgAvatarDefault5 from "figma:asset/a2fa06e42f185ea10e7729a012d2efea10192710.png";

// 分隔线组件
const Divider = () => (
    <div className="w-full h-px opacity-5 relative ml-[52px]">
        <svg className="block w-full h-[2px]" fill="none" preserveAspectRatio="none" viewBox="0 0 282 2">
            <path d="M1 1H284" stroke="white" strokeDasharray="6" strokeLinecap="round" strokeWidth="2" />
        </svg>
    </div>
);

// 列表项组件
interface ActivityItemProps {
    avatar: string;
    time: string;
    content: React.ReactNode;
}

const ActivityItem = ({ avatar, time, content }: ActivityItemProps) => (
    <div className="flex flex-col py-4 relative pl-5 pr-5">
        <div className="flex items-start gap-3 mb-3">
            <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white leading-normal font-['Poppins']">
                    {content}
                </div>
            </div>
            <span className="text-[12px] text-[#b7b7bc] whitespace-nowrap ml-2 shrink-0">{time}</span>
        </div>
        <Divider />
    </div>
);

// [Refactor] 不再需要 Tab Props
export interface ActivityPageProps {
    onOpenGroupChat?: () => void;
    onOpenChat?: () => void;
}

export function ActivityPage({ onOpenGroupChat, onOpenChat }: ActivityPageProps) {
    return (
        <motion.div 
      className="absolute inset-0 z-10 bg-[#222] flex flex-col font-['Poppins'] text-white overflow-hidden h-[100dvh]"
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
             {/* Scrollable Content */}
             <main className="flex-1 overflow-y-auto pb-[120px] no-scrollbar touch-pan-y">
                 {/* Spacer for Fixed Header (App.tsx) */}
                 <div className="w-full h-[120px] shrink-0" aria-hidden="true" />
                 
                 {/* Title Section (moved inside scrollable area) */}
                 <div className="px-5 my-[50px]">
                     <MuuziLogo title="Activity" icon="💬" align="center" showTagline={false} />
                 </div>

                 <div className="flex flex-col">
                     <ActivityItem 
                        avatar={imgAvatarDefault}
                        time="31m ago"
                        content={<span>"You should join this News News News room 🔥🇺🇸🖐. Andrew Lee D. Nidhi Tewari and Katherine Lynn + 22 others are talking about "</span>}
                     />
                     <ActivityItem 
                        avatar={imgAvatarDefault1}
                        time="37m ago"
                        content={<span className="font-medium">Fizaa Dosani followed you</span>}
                     />
                     <ActivityItem 
                        avatar={imgAvatarDefault4}
                        time="38m ago"
                        content={<span>Fizaa Dosani scheduled "After party extravaganza" with 😄 Recognition Comedy for Tuesday, August 10 at 12:15pm</span>}
                     />
                     <ActivityItem 
                        avatar={imgAvatarDefault5}
                        time="1h ago"
                        content={
                            <div>
                                <p className="mb-0">Manna Wassalwa, Fatuma ¿alL, Aya</p>
                                <p>Abdellatif, Ria Ervilita & SUFI ROXX - Join us in the daily Surah Yaseen recitation room. Safe space, all levels are welcome on stage. [Judgement Freezone] 🌳🎉💖</p>
                            </div>
                        }
                     />
                      <ActivityItem 
                        avatar={imgAvatarDefault2}
                        time="10h ago"
                        content={<span className="font-medium">Mobbin Design followed you</span>}
                     />
                     <ActivityItem 
                        avatar={imgAvatarDefault4} // Reusing avatar as per figma
                        time="10h ago"
                        content={
                            <div>
                                <p className="mb-0">Clubhouse says 💬👀 "When you're done, tap to get connected with</p>
                                <p>the community. The more people</p>
                            </div>
                        }
                     />
                     <ActivityItem 
                        avatar={imgAvatarDefault3}
                        time="10h ago"
                        content={<span className="font-medium">Mobbin Design followed you</span>}
                     />
                 </div>
             </main>
        </motion.div>
    );
}
