// 首页顶部 Header 组件：包含用户信息及搜索按钮
// 使用 Figma 导入的 SVG 路径和资源
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import svgPaths from "../../../assets/svgs/svg-n8w9msv03s";
import imgAvatarDefault from "figma:asset/cca52c1ba2653720b531334ad6385e8d699abcc2.png";
import { authFetch, getValidAccessToken } from "../../lib/tokenManager";
import { normalizeAvatarUrl } from "../ui/utils";

interface HomeHeaderProps {
  onAvatarClick?: () => void;
}

export function HomeHeader({ onAvatarClick }: HomeHeaderProps) {
  const [userInfo, setUserInfo] = useState({
    nickName: "MuuZi User", // 默认昵称
    avatar: imgAvatarDefault
  });
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // 1. 设置问候语
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // 2. 获取用户信息
    const fetchUserInfo = async () => {
      const token = await getValidAccessToken();
      if (!token) return;

      try {
        const response = await authFetch('/api/admin/base/comm/person', { method: 'GET' });

        if (response.ok) {
          const data = await response.json();
          if (data.code === 1000 && data.data) {
             // 兼容 avatar 和 headImg 字段
             const { nickName, avatar, headImg, name } = data.data;
             
             // 处理头像 URL (优先使用 avatar，其次 headImg)
             const rawAvatar = avatar || headImg;
             const finalAvatar = normalizeAvatarUrl(rawAvatar) || imgAvatarDefault;
             
             // 优先显示 nickName，其次 name，最后默认
             let displayName = nickName || name || "MuuZi User";
             
             // 安全增强：如果显示名称看起来像邮箱，进行脱敏处理
             if (displayName.includes('@')) {
               const [localPart, domain] = displayName.split('@');
               if (localPart.length > 3) {
                 displayName = `${localPart.substring(0, 3)}***@${domain}`;
               } else {
                 displayName = `***@${domain}`;
               }
             }

             setUserInfo({
               nickName: displayName,
               avatar: finalAvatar
             });
          }
        }
      } catch (error) {
        console.error("Failed to fetch header user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-[120px] bg-app-dark rounded-b-[32px] shadow-[0_5px_20px_rgba(0,0,0,0.3)] flex items-center justify-between px-[20px] pt-[60px] pb-[20px]">
      {/* 左侧：头像与欢迎语 */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onAvatarClick}
          className="cursor-pointer active:scale-95 transition-transform"
          aria-label="Open profile"
        >
          <Avatar className="size-[40px] border-2 border-white/10">
            <AvatarImage 
              src={userInfo.avatar} 
              alt={userInfo.nickName} 
              className="object-cover"
              onError={(e) => {
                  // 如果图片加载失败，回退到默认
                  e.currentTarget.src = imgAvatarDefault;
              }}
            />
            <AvatarFallback className="bg-gray-700 text-white">
                {userInfo.nickName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex flex-col">
          <span className="text-text-muted text-[14px] leading-none mb-1">{greeting}</span>
          <span className="font-semibold text-[18px] leading-none text-white">{userInfo.nickName}</span>
        </div>
      </div>

      {/* 右侧：搜索按钮 (使用 SVG 路径绘制 Squircle 背景) */}
      <button 
        type="button"
        aria-label="Search"
        className="size-[40px] relative bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40" aria-hidden="true">
           <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--color-jet)" fillRule="evenodd" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="size-[24px]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                 <path d="M18.9633 18.9633C19.2854 18.6411 19.7912 18.6148 20.1439 18.8832L20.2367 18.9633L22.1361 20.8637C22.4876 21.2151 22.4876 21.7847 22.1361 22.1361C21.814 22.4583 21.3082 22.4857 20.9555 22.2172L20.8637 22.1361L18.9633 20.2367C18.6118 19.8852 18.6118 19.3148 18.9633 18.9633ZM11.5248 1.6C15.0707 1.6 18.3476 3.49208 20.1205 6.56289C21.8932 9.63363 21.8934 13.417 20.1205 16.4877C18.3476 19.5585 15.0706 21.4496 11.5248 21.4496C6.04347 21.4495 1.6 17.0062 1.6 11.5248C1.60011 6.04353 6.04353 1.60011 11.5248 1.6ZM11.5248 3.3998C7.03765 3.39991 3.39991 7.03765 3.3998 11.5248C3.3998 16.0121 7.03758 19.6497 11.5248 19.6498C14.4276 19.6498 17.1105 18.1012 18.5619 15.5873C20.0131 13.0735 20.0132 9.97606 18.5619 7.4623C17.1105 4.94842 14.4276 3.3998 11.5248 3.3998Z" fill="white" />
            </svg>
        </div>
      </button>
    </header>
  );
}
