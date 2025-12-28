// 聊天详情页面 (DetailMessagePage)
// -----------------------------------------------------------------------------
// 具体的单聊或群聊交互界面。
// 主要职责：
// 1. 展示消息气泡流 (Message Bubble)，区分发送者和接收者。
// 2. 底部消息输入框 (MessageInput)，支持文本发送。
// 3. 顶部导航栏 (MessageHeader)，展示对方信息。
// 4. 处理自动滚动到底部等交互细节。
// -----------------------------------------------------------------------------

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { MessageHeader } from "../../components/Chat/MessageHeader";
import { MessageInput } from "../../components/Chat/MessageInput";
import imgAvatarDefault from "figma:asset/3ef1115de8a24bb10557cf82642a0ab47e71a44e.png";

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  avatar?: string;
}

interface DetailMessagePageProps {
  onBack: () => void;
  userName?: string;
  userAvatar?: string;
}

export function DetailMessagePage({ onBack, userName = "Malin Quist", userAvatar }: DetailMessagePageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "There is no denying the fact that the success of an advertisement lies mostly in the headline. The headline should attract the reader and make him read the rest of the advertisement.",
      isMe: false,
      avatar: imgAvatarDefault // Default placeholder from Figma
    },
    {
      id: "2",
      text: "There is no denying the fact that the success of an advertisement lies mostly in the head. 🤩😍🥳",
      isMe: true,
    },
    {
      id: "3",
      text: "There is no denying the fact that the success of an",
      isMe: false,
      avatar: imgAvatarDefault // Default placeholder from Figma
    }
  ]);

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isMe: true
    };
    
    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-[#3b3b3b] z-[101] flex flex-col font-['Poppins'] text-white h-[100dvh]"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.5 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.x > 100 || velocity.x > 500) {
          onBack();
        }
      }}
    >
      {/* Header */}
      <MessageHeader title={userName} onBack={onBack} />

      {/* Chat Area (Backdrop) */}
      <div className="flex-1 bg-[#222] rounded-t-[32px] overflow-hidden flex flex-col relative w-full">
        {/* Timestamp */}
        <div className="absolute top-[24px] left-0 right-0 text-center z-10">
          <p className="text-[#b7b7bc] text-[14px]">Today 10:57 PM</p>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-5 py-14 flex flex-col gap-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for Other */}
              {!msg.isMe && (
                <div className="size-[32px] shrink-0 mr-[10px] mt-auto mb-1">
                  <img 
                    src={msg.avatar || userAvatar || imgAvatarDefault} 
                    alt="Avatar" 
                    className="size-full rounded-full object-cover" 
                  />
                </div>
              )}

              {/* Message Bubble */}
              <div 
                className={`max-w-[70%] p-[14px] rounded-[20px] text-[14px] leading-normal break-words ${
                  msg.isMe 
                    ? 'bg-[#b2dabb] text-black rounded-tr-[4px]' 
                    : 'bg-[#3b3b3b] text-white rounded-tl-[4px]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Bar */}
        <MessageInput 
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
        />
      </div>
    </motion.div>
  );
}
