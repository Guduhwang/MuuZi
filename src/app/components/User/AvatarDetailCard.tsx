// 头像详情卡组件：展示群组成员的头像、昵称、简介及生成的AI效果图
import React from 'react';

interface AvatarDetailCardProps {
    name: string;
    avatarUrl: string;
    subtitle: string;
}

export function AvatarDetailCard({ name, avatarUrl, subtitle }: AvatarDetailCardProps) {
    return (
        <div className="w-full bg-[#3b3b3b] rounded-[24px] p-5 mb-8 flex flex-col">
            <div className="flex items-center gap-[10px] mb-4">
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden shrink-0">
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-white text-[18px] font-medium font-['Poppins'] leading-tight">{name}</h3>
                    <p className="text-[#b7b7bc] text-[14px] font-['Poppins'] leading-tight">{subtitle}</p>
                </div>
            </div>
            
            <div className="w-full border-t-[2px] border-dashed border-white/20 mb-4"></div>

            <p className="text-white text-[14px] font-['Poppins'] leading-normal">
                An AI agent that automatically prepares and posts content to Twitter for you.
            </p>
            
            <div className="w-full h-[140px] rounded-[16px] overflow-hidden mt-4">
                <img 
                  src="https://images.unsplash.com/photo-1736175549681-c24c552da1e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwYWJzdHJhY3QlMjBmdXR1cmlzdGljJTIwY29sb3JmdWx8ZW58MXx8fHwxNzY2NDc2NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                  alt="Generated content" 
                  className="w-full h-full object-cover" 
                />
            </div>
        </div>
    );
}
