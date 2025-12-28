// 列表项组件：用于展示群组/用户列表项，包含头像、名称、描述及操作按钮
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bot, User } from "lucide-react";
import imgAvatarDefault from "figma:asset/63f6ab0084c3046efc83a5deb4f49aa8b015583e.png";
import imgAvatarBorder from "figma:asset/ca2c1ce9cd3a540655df6bf9f2653a0a78825639.png";
import imgAvatarCheck from "figma:asset/63f6ab0084c3046efc83a5deb4f49aa8b015583e.png";

const CHECK_PATH = "M10.1359 0.171626C10.2698 0.290975 10.3508 0.458697 10.3609 0.637807C10.3711 0.816917 10.3096 0.992704 10.19 1.12641L3.756 8.33229C3.62781 8.47618 3.44428 8.55847 3.25158 8.55847C3.05888 8.55847 2.87536 8.47618 2.74717 8.33229L0.174671 5.44994C0.0120967 5.27029 -0.041823 5.01734 0.0333607 4.78701C0.108544 4.55669 0.301317 4.38426 0.538569 4.33513C0.775822 4.28599 1.02122 4.36768 1.18169 4.5492L3.25158 6.8677L9.18203 0.22567C9.30135 0.092005 9.46889 0.011218 9.64778 0.00108267C9.82667 -0.00905269 10.0023 0.0522938 10.1359 0.171626Z";

interface CellAddGroupProps {
  name: string;
  description: string;
  avatar?: string;
  /**
   * The status of the avatar default image and indicators.
   * - 'default': Standard placeholder
   * - 'border': Placeholder with a border style
   * - 'active': Standard placeholder with an active (online) indicator at top-right
   * - 'check': Standard placeholder with a check indicator at bottom-right
   */
  avatarStatus?: 'default' | 'border' | 'active' | 'check';
  /**
   * The role of the entity, displayed as an indicator at bottom-left.
   */
  role?: 'AI' | 'Human' | 'Group';
  isOnline?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function CellAddGroup({ 
  name, 
  description, 
  avatar,
  avatarStatus = 'default',
  role,
  isOnline = false, 
  buttonText = "Button",
  onButtonClick 
}: CellAddGroupProps) {
  // Determine the image source
  let avatarSrc = avatar;
  if (!avatarSrc) {
    if (avatarStatus === 'border') {
      avatarSrc = imgAvatarBorder;
    } else if (avatarStatus === 'check') {
      avatarSrc = imgAvatarCheck;
    } else {
      avatarSrc = imgAvatarDefault;
    }
  }

  return (
    <div className="relative w-full py-4 flex items-center gap-3">
      {/* Avatar Section */}
      <div className="relative shrink-0 size-[40px]">
        <Avatar className="size-full overflow-visible">
          <AvatarImage 
            src={avatarSrc} 
            alt={name} 
            className={`object-cover rounded-full ${avatarStatus === 'border' ? '' : ''}`} 
          />
          <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        
        {/* Legacy isOnline indicator (Moved to Top Right as requested) */}
        {isOnline && avatarStatus === 'default' && (
          <div className="absolute top-0 right-0 size-3 bg-[#B2DABB] border-2 border-[#222] rounded-full z-10" />
        )}

        {/* Active Status Indicator (Top Right) */}
        {avatarStatus === 'active' && (
          <div className="absolute inset-[0_0_70%_70%] z-10">
            <svg className="block size-full" fill="none" viewBox="0 0 24 24">
              <g id="Group">
                <circle cx="12" cy="12" fill="#B2DABB" stroke="#222222" strokeWidth="2" r="11" />
              </g>
            </svg>
          </div>
        )}

        {/* Check Status Indicator (Bottom Right) */}
        {avatarStatus === 'check' && (
          <div className="absolute inset-[65%_0_0_65%] z-10">
             <svg className="block size-full" fill="none" viewBox="0 0 28 28">
               <circle cx="14" cy="14" fill="#B2DABB" stroke="#222222" strokeWidth="2" r="13" />
               <g transform="translate(9, 9.7)">
                 <path clipRule="evenodd" d={CHECK_PATH} fill="#222222" fillRule="evenodd" />
               </g>
             </svg>
          </div>
        )}

        {/* Role Indicator (Bottom Left) - AI Only */}
        {role && role === 'AI' && (
           <div 
             className="absolute bottom-0 left-0 size-[14px] rounded-full border border-[#222] flex items-center justify-center z-20"
             style={{ 
               backgroundColor: '#F2C94C'
             }}
           >
              <span className="text-[8px] font-bold text-black leading-none font-['Poppins']">
                A
              </span>
           </div>
        )}


      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="font-['Poppins'] font-medium text-[16px] text-white leading-none truncate">
          {name}
        </p>
        <p className="font-['Poppins'] text-[12px] text-[#b7b7bc] leading-none truncate">
          {description}
        </p>
      </div>

      {/* Button */}
      <button 
        onClick={onButtonClick}
        className="relative shrink-0 h-[34px] w-[80px] bg-[#b2dabb] rounded-[13px] flex items-center justify-center transition-transform"
      >
        <span className="font-['Poppins'] font-medium text-[14px] text-black leading-none">
          {buttonText}
        </span>
      </button>

      {/* Divider */}
      <div className="absolute bottom-0 left-[52px] right-0 h-[2px] opacity-10">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 258 2" fill="none">
           <path d="M0 1H258" stroke="white" strokeWidth="2" strokeDasharray="6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
