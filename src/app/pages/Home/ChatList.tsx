// 聊天列表页面 (ChatListPage)
// -----------------------------------------------------------------------------
// 展示当前用户的会话列表。
// 主要职责：
// 1. 分组展示好友、AI 助手和发现的联系人。
// 2. 展示用户在线状态、最后一条消息摘要。
// 3. 支持折叠/展开分组。
// 4. 点击进入具体聊天详情页 (DetailMessagePage)。
// -----------------------------------------------------------------------------
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import svgPaths from "../../../assets/svgs/svg-yyiihyc8w3";
import { CellAddGroup } from "../../components/Group/CellAddGroup";
import { BackHeader } from "../../components/Common/BackHeader";

// 导入 Figma 图片资源
import imgAvatarActive from "figma:asset/02a53d2ffce11f8a350482a0e2d03d0a602c9bb9.png";
import imgAvatarActive1 from "figma:asset/0e2a6c6d90fa14ce148d2496c1b7f0a842659cea.png";
import imgAvatarActive2 from "figma:asset/678da7bea283ae417788a738e9cfd95762052800.png";

// 重用或重新定义接口，保持独立性
export interface ChatUser {
  id: string;
  name: string;
  description: string;
  avatar: string;
  isOnline: boolean;
  role?: 'AI' | 'Human' | 'Group';
}

interface ChatGroup {
  title: string;
  users: ChatUser[];
}

const CHAT_GROUPS: ChatGroup[] = [
  {
    title: "Friends",
    users: [
      {
        id: "1-1",
        name: "Balveer Bhadiar",
        description: "Hey! Are we still on for coffee?",
        avatar: imgAvatarActive,
        isOnline: true,
        role: 'Human',
      },
      {
        id: "1-2",
        name: "Nembo Lukeni",
        description: "Sent you the files you asked for.",
        avatar: imgAvatarActive1,
        isOnline: true,
        role: 'Human',
      },
      {
        id: "1-3",
        name: "Sofietje Boksem",
        description: "Can you call me when you're free?",
        avatar: imgAvatarActive2,
        isOnline: false,
        role: 'Human',
      },
      {
        id: "1-4",
        name: "John Doe",
        description: "Meeting tomorrow at 10 AM.",
        avatar: imgAvatarActive,
        isOnline: true,
        role: 'Human',
      },
      {
        id: "1-5",
        name: "Alice Smith",
        description: "Thanks for the help!",
        avatar: imgAvatarActive1,
        isOnline: false,
        role: 'Human',
      },
      {
        id: "1-6",
        name: "Bob Johnson",
        description: "Let's catch up later.",
        avatar: imgAvatarActive2,
        isOnline: true,
        role: 'Human',
      },
    ]
  },
  {
    title: "AI Agent",
    users: [
      {
        id: "2-1",
        name: "MuuZi Assistant",
        description: "I can help you organize your schedule.",
        avatar: imgAvatarActive2, // Using a placeholder, ideally would be a bot avatar
        isOnline: true,
        role: 'AI',
      },
      {
        id: "2-2",
        name: "Creative Writer",
        description: "Ready to draft your next blog post.",
        avatar: imgAvatarActive,
        isOnline: true,
        role: 'AI',
      },
      {
        id: "2-3",
        name: "Code Reviewer",
        description: "Send me your snippet.",
        avatar: imgAvatarActive1,
        isOnline: true,
        role: 'AI',
      },
      {
        id: "2-4",
        name: "Travel Planner",
        description: "Where do you want to go?",
        avatar: imgAvatarActive2,
        isOnline: true,
        role: 'AI',
      },
    ]
  },
  {
    title: "Discover",
    users: [
      {
        id: "3-1",
        name: "Arjun Khera",
        description: "Holistic health enthusiast.",
        avatar: imgAvatarActive1,
        isOnline: true,
        role: 'Human',
      },
      {
        id: "3-2",
        name: "Elena Rigby",
        description: "Digital artist looking for collabs.",
        avatar: imgAvatarActive2,
        isOnline: false,
        role: 'Human',
      },
      {
        id: "3-3",
        name: "David Chen",
        description: "Photography lover.",
        avatar: imgAvatarActive,
        isOnline: true,
        role: 'Human',
      },
      {
        id: "3-4",
        name: "Sarah Miller",
        description: "Looking for hiking buddies.",
        avatar: imgAvatarActive1,
        isOnline: false,
        role: 'Human',
      },
      {
        id: "3-5",
        name: "Mike Wilson",
        description: "Tech startup founder.",
        avatar: imgAvatarActive2,
        isOnline: true,
        role: 'Human',
      },
    ]
  }
];

interface ChatListPageProps {
  onBack: () => void;
  onOpenChat: (user: ChatUser) => void;
  shouldAnimateEntry?: boolean;
}

export function ChatListPage({ onBack, onOpenChat, shouldAnimateEntry = true }: ChatListPageProps) {
  // 固定从右侧滑入
  const initialX = shouldAnimateEntry ? "100%" : 0;
  const exitX = "100%";

  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-[#222] z-[100] flex flex-col font-['Poppins'] text-white h-[100dvh]"
      initial={{ x: initialX }}
      animate={{ x: 0 }}
      exit={{ x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      // 支持滑动返回 (向右滑)
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.5 }}
      onDragEnd={(e, { offset, velocity }) => {
        // 向右滑动超过 100px 或速度够快，则返回
        if (offset.x > 100 || velocity.x > 500) {
          onBack();
        }
      }}
    >
      {/* Header with Title "Chat" */}
      <BackHeader 
        title="Chat"
        onBack={onBack}
        rightElement={
          <>
             <button 
               className="w-10 h-10 flex items-center justify-center bg-[#3B3B3B] rounded-full shrink-0 transition-transform" 
               aria-label="Search"
             >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p3dcb2d80} fill="white" />
                </svg>
             </button>

             <button className="w-10 h-10 flex items-center justify-center bg-[#3B3B3B] rounded-full shrink-0 transition-transform" aria-label="Add Chat">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p13970200} fill="white" />
                </svg>
             </button>
          </>
        }
      />

      {/* 主要内容区 */}
      <main className="flex-1 overflow-y-auto px-5 pt-4">
        {CHAT_GROUPS.map((group, index) => {
          const isCollapsed = collapsedGroups[group.title];
          return (
            <section key={group.title} className={index !== CHAT_GROUPS.length - 1 ? "mb-6" : "mb-20"}>
               <div 
                 className="flex items-center justify-between mb-2 cursor-pointer active:opacity-70 transition-opacity"
                 onClick={() => toggleGroup(group.title)}
               >
                 <h2 className="text-[16px] font-semibold">{group.title}</h2>
                 <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : '0'}`} 
                 />
               </div>
               
               <motion.div
                 initial={false}
                 animate={{ height: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className="overflow-hidden"
               >
                 <div className="flex flex-col">
                   {group.users.map((user) => (
                     <CellAddGroup 
                       key={user.id}
                       name={user.name}
                       description={user.description}
                       avatar={user.avatar}
                       isOnline={user.isOnline}
                       role={user.role} 
                       buttonText="+ Chat"
                       onButtonClick={() => onOpenChat(user)}
                     />
                   ))}
                 </div>
               </motion.div>
            </section>
          );
        })}
      </main>

      {/* Popup Removed */}
    </motion.div>
  );
}
