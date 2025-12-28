// 首页 (HomePage)
// -----------------------------------------------------------------------------
// 应用的主入口页面，展示核心功能区。
// 主要职责：
// 1. 顶部 Logo 展示 (HomeLogo)。
// 2. 核心群组/房间列表展示 (GroupCard)。
// 3. 支持左右滑动切换 Tab (GroupChat <-> Chat)。
// 4. 作为背景层，支持其他页面 (Chat/Activity) 的叠加显示。
// -----------------------------------------------------------------------------
import React from 'react';
import { motion } from "motion/react";
import { HomeLogo } from "../../components/Home/HomeLogo";
import { GroupCard, Group } from "../../components/Group/GroupCard";

// 导入图片资源
import imgAvatarDefault from "figma:asset/cca52c1ba2653720b531334ad6385e8d699abcc2.png";
import imgAvatar1 from "figma:asset/510b9118b00f6a56a65c4cad6385bfd2cd81be7b.png";
import imgAvatar2 from "figma:asset/f11690ad72c79576ee7fa7162fdc09b82c2e512a.png";
import imgAvatar3 from "figma:asset/5dee420bb110d580c52ae70994f3d3c6831bfed6.png";
import imgAvatar4 from "figma:asset/0f1c8e746b4842709f03a5c1141c6429dcaa7094.png";
import imgAvatar5 from "figma:asset/ab1c1d7700d116a1016fc00c8919424c04e10f47.png";
import imgAvatar6 from "figma:asset/b915258086640dbcbdf40263129a1cd347fc11ff.png";
import imgAvatar7 from "figma:asset/a9fb1e3415df3a6d443999a3a19d2bb3272cd73e.png";

const ASSETS = {
    avatarDefault: imgAvatarDefault,
    avatars: [
        imgAvatar1,
        imgAvatar2,
        imgAvatar3,
        imgAvatar4,
        imgAvatar5,
        imgAvatar6,
        imgAvatar7
    ]
};

const GROUPS: Group[] = [
    {
        id: "1",
        category: "NEWS NEWS 🎉",
        title: "3 Minute News",
        participants: [ASSETS.avatars[5], ASSETS.avatars[6]],
        memberNames: ["Lena Marsh", "Minerva Spencer"],
        userCount: 155,
        messageCount: 3,
        bgColor: "#35484d"
    },
    {
        id: "2",
        category: "BUSINESS ENTREPRENEURSHIP",
        title: "Live Mastermind",
        participants: [ASSETS.avatars[0], ASSETS.avatars[1], ASSETS.avatars[2], ASSETS.avatars[3], ASSETS.avatars[4]],
        memberNames: ["Jon Daniels", "Della Guerrero", "Blake Vega", "Eleanor Lowe"],
        userCount: 49,
        messageCount: 12,
        bgColor: "#645a47"
    },
    {
        id: "3",
        category: "DESIGN TALK 🎨",
        title: "UX/UI Trends 2024",
        participants: [ASSETS.avatars[2], ASSETS.avatars[4], ASSETS.avatars[6]],
        memberNames: ["Alice Cooper", "Bob Smith", "Charlie Brown"],
        userCount: 88,
        messageCount: 24,
        bgColor: "#4A3B4D"
    },
    {
        id: "4",
        category: "TECH & AI 🤖",
        title: "Future of LLMs",
        participants: [ASSETS.avatars[1], ASSETS.avatars[3], ASSETS.avatars[5]],
        memberNames: ["David Lee", "Eva Green", "Frank White"],
        userCount: 230,
        messageCount: 56,
        bgColor: "#2D4059"
    },
    {
        id: "5",
        category: "MUSIC STATION 🎵",
        title: "Lo-Fi Beats & Chill",
        participants: [ASSETS.avatars[0], ASSETS.avatars[4]],
        memberNames: ["Grace Hopper", "Hank Moody"],
        userCount: 412,
        messageCount: 8,
        bgColor: "#5A4632"
    },
    {
        id: "6",
        category: "CODING CLUB 💻",
        title: "React Performance",
        participants: [ASSETS.avatars[3], ASSETS.avatars[1], ASSETS.avatars[2], ASSETS.avatars[5]],
        memberNames: ["Ian Curtis", "Jack White", "Kate Bush", "Leo Fender"],
        userCount: 120,
        messageCount: 15,
        bgColor: "#2F4F4F"
    }
];

interface HomePageProps {
    onOpenGroupChat?: () => void;
    onOpenChat?: () => void;
    onOpenKnowPeople?: () => void;
    onOpenGroupCardPage?: (group: Group) => void;
    onOpenActivity?: () => void;
    onOpenCalendar?: () => void;
}

export function HomePage({ onOpenGroupChat, onOpenChat, onOpenKnowPeople, onOpenGroupCardPage, onOpenActivity, onOpenCalendar }: HomePageProps) {
    return (
        <motion.div 
            className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative flex flex-col text-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 添加左右滑手势支持
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
            {/* Scrollable Main Content Area */}
            {/* Header (fixed in App.tsx) spacer handled internally */}
            <main className="flex-1 overflow-y-auto pb-[120px] no-scrollbar touch-pan-y">
                {/* Spacer for Fixed Header (120px) */}
                <div className="w-full h-[120px] shrink-0" aria-hidden="true" />

                {/* Title Section */}
                <HomeLogo showTagline={false} className="my-[50px] relative z-10" />

                {/* Room List */}
                <section className="flex flex-col gap-4 px-[20px]" aria-label="Group List">
                    {GROUPS.map((group) => (
                        <GroupCard 
                            key={group.id} 
                            group={group} 
                            onClick={() => onOpenGroupCardPage?.(group)}
                        />
                    ))}
                </section>
            </main>
        </motion.div>
    );
}
