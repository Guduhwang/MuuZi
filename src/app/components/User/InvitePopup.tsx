import React from 'react';
import { SearchInput } from '../Common/SearchInput';
import imgAvatarActive from "figma:asset/73785c90eb9a9a7c52da8fa41368294233bba1bb.png";
import imgAvatarActive1 from "figma:asset/a2fb29d265f08e9410489ea80aa146ef19d126a5.png";
import imgAvatarActive2 from "figma:asset/1ceaefe52de51aaf5aa83d3ecaaba16783ded467.png";
import imgAvatarActive3 from "figma:asset/062cb5ccab369f642c6c8026bcb59a39b455efb2.png";
import imgAvatarActive4 from "figma:asset/303aa909dd8c65549ed6780149fb801c172b1dc9.png";
import imgAvatarActive5 from "figma:asset/00e9d7960b71f777e6e723bc13c5db0870e77fc8.png";
import imgAvatarActive6 from "figma:asset/ea41c2a344dfb571c4a316f1b71278a8f1aea2cc.png";

// SVG Paths
// 统一管理所有图标路径，避免JSX中出现硬编码
const svgPaths = {
  share: "M12.9992 0C13.5816 1.73555e-08 14.0539 0.472334 14.0539 1.05469C14.0538 1.63693 13.5815 2.10937 12.9992 2.10938C11.7175 2.1089 10.4395 2.25561 9.19159 2.54785V2.54688C5.89497 3.32042 3.3214 5.89472 2.54803 9.19141C1.96058 11.6956 1.96059 14.3015 2.54803 16.8057C3.3214 20.1023 5.89498 22.6767 9.19159 23.4502C11.6959 24.0376 14.3025 24.0376 16.8068 23.4502C20.1037 22.6768 22.6779 20.1025 23.4514 16.8057C23.7445 15.5536 23.8908 14.2756 23.8908 12.999C23.8908 12.4167 24.3631 11.9443 24.9455 11.9443C25.5277 11.9445 25.9992 12.4168 25.9992 12.999C25.9992 14.4375 25.8348 15.8775 25.5041 17.2871C24.5481 21.3638 21.365 24.5469 17.2883 25.5029C14.4673 26.163 11.5321 26.163 8.71112 25.5029C4.63488 24.5464 1.45204 21.3635 0.496273 17.2871C-0.165421 14.4664 -0.165427 11.5307 0.496273 8.70996C1.45301 4.63467 4.63566 1.45309 8.71112 0.49707C10.1166 0.16715 11.5555 0.000228328 12.9992 0ZM24.9455 0C25.5277 0.000198381 25.9992 0.472456 25.9992 1.05469V6.6748C25.9782 7.24157 25.5126 7.69043 24.9455 7.69043C24.3785 7.69024 23.9128 7.24146 23.8918 6.6748V3.59766L17.258 10.2324C16.8434 10.6252 16.1913 10.6165 15.7873 10.2129C15.3835 9.80907 15.3742 9.15691 15.7668 8.74219L22.3996 2.10938H19.3234C18.7411 2.10938 18.2689 1.63693 18.2687 1.05469C18.2687 0.472334 18.7411 0 19.3234 0H24.9455Z",
  statusDot: "M8.40039 1C12.4871 1.00021 15.7998 4.31361 15.7998 8.40039C15.7996 12.487 12.487 15.7996 8.40039 15.7998C4.31361 15.7998 1.00021 12.4871 1 8.40039C1 4.31348 4.31348 1 8.40039 1Z",
  check: "M21.8486 0C27.2384 0 29.6376 2.39846 29.6377 7.78809V13.5781C29.6377 18.968 27.2385 21.3662 21.8486 21.3662H21.3662V21.8486C21.3662 27.2385 18.968 29.6377 13.5781 29.6377H7.78809C2.39846 29.6376 0 27.2384 0 21.8486V16.0596C0 10.6698 2.39846 8.27062 7.78809 8.27051H8.27051V7.78809C8.27062 2.39846 10.6698 0 16.0596 0H21.8486ZM7.78809 10.3389C3.51506 10.339 2.06738 11.7864 2.06738 16.0596V21.8486C2.06738 26.1218 3.51506 27.5692 7.78809 27.5693H13.5781C17.8514 27.5693 19.2988 26.122 19.2988 21.8486V16.0596C19.2988 11.7863 17.8514 10.3389 13.5781 10.3389H7.78809ZM16.0596 2.06738C11.7864 2.06738 10.339 3.51506 10.3389 7.78809V8.27051H13.5781C18.968 8.27051 21.3662 10.6697 21.3662 16.0596V19.2988H21.8486C26.122 19.2988 27.5693 17.8514 27.5693 13.5781V7.78809C27.5692 3.51506 26.1218 2.06738 21.8486 2.06738H16.0596Z",
  more: "M14.2686 0C22.1391 0.000202055 28.5361 6.39795 28.5361 14.2686C28.5359 22.139 22.139 28.5359 14.2686 28.5361C6.39795 28.5361 0.000202067 22.1391 0 14.2686C0 6.39783 6.39783 0 14.2686 0ZM14.2686 1.99121C7.49946 1.99121 1.99121 7.49946 1.99121 14.2686C1.99141 21.0375 7.49959 26.5459 14.2686 26.5459C21.0374 26.5457 26.5457 21.0374 26.5459 14.2686C26.5459 7.49959 21.0375 1.99141 14.2686 1.99121ZM8.95898 12.9404C9.68898 12.9404 10.2861 13.5386 10.2861 14.2686C10.2859 14.9984 9.70213 15.5957 8.95898 15.5957C8.21589 15.5956 7.63203 14.9984 7.63184 14.2686C7.63184 13.5386 8.22903 12.9405 8.95898 12.9404ZM14.2686 12.9404C14.9984 12.9406 15.5957 13.5387 15.5957 14.2686C15.5955 14.9983 15.0115 15.5955 14.2686 15.5957C13.5254 15.5957 12.9406 14.9984 12.9404 14.2686C12.9404 13.5386 13.5386 12.9404 14.2686 12.9404ZM19.5771 12.9404C20.3071 12.9404 20.9043 13.5386 20.9043 14.2686C20.9041 14.9984 20.3203 15.5957 19.5771 15.5957C18.8341 15.5956 18.2502 14.9983 18.25 14.2686C18.25 13.5386 18.8472 12.9405 19.5771 12.9404Z",
  copy: "M8.53906 0C9.05178 0.000134217 9.47447 0.386537 9.53223 0.883789L9.53906 1V7.53906H16.0771C16.6294 7.53906 17.0771 7.98678 17.0771 8.53906C17.077 9.05174 16.6915 9.47442 16.1943 9.53223L16.0771 9.53906H9.53906V16.0771C9.53906 16.6293 9.09122 17.077 8.53906 17.0771C8.02628 17.0771 7.60374 16.6916 7.5459 16.1943L7.53906 16.0771V9.53906H1C0.447804 9.53906 0.000144543 9.09122 0 8.53906C0 8.02623 0.38645 7.60366 0.883789 7.5459L1 7.53906H7.53906V1C7.53906 0.447715 7.98678 0 8.53906 0Z"
};

interface InvitePopupProps {
  onClose: () => void;
}

const PEOPLE_DATA = [
  { id: '1', name: 'Barrueco', image: imgAvatarActive2 },
  { id: '2', name: 'Shirai', image: imgAvatarActive },
  { id: '3', name: 'Alicia', image: imgAvatarActive4 },
  { id: '4', name: 'Abhoy', image: imgAvatarActive6 },
  { id: '5', name: 'Chineze', image: imgAvatarActive1 },
  { id: '6', name: 'Sang', image: imgAvatarActive3 },
  { id: '7', name: 'Cao Yu', image: imgAvatarActive5 },
];

/**
 * 底部操作按钮组件
 * 复用相同的容器样式，支持自定义图标内容
 */
const ActionButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button 
    className="w-[90px] h-[56px] bg-[#3b3b3b] rounded-[24px] flex items-center justify-center transition-opacity active:opacity-80"
    onClick={onClick}
  >
    {children}
  </button>
);

/**
 * 邀请弹窗组件
 * 包含搜索、用户网格列表及底部分享/复制/更多操作
 */
export function InvitePopup({ onClose }: InvitePopupProps) {
  return (
    // 遮罩层
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" 
      onClick={onClose}
    >
      {/* 弹窗主体 */}
      <div 
        className="relative w-[335px] h-[419px] bg-[#222] rounded-[32px] overflow-hidden flex flex-col items-center" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <p className="mt-[20px] font-['Poppins'] text-[14px] text-white">
          Find Creators
        </p>

        {/* 搜索框 */}
        <SearchInput className="mt-[18px]" />

        {/* 用户列表网格 */}
        <div className="mt-[30px] w-full px-[20px] grid grid-cols-4 gap-y-[24px] gap-x-[16px] justify-items-center">
          {PEOPLE_DATA.map((person) => (
            <div key={person.id} className="flex flex-col items-center gap-[8px]">
              {/* 头像容器 */}
              <div className="relative w-[56px] h-[56px]">
                <img 
                  src={person.image} 
                  alt={person.name} 
                  className="w-full h-full object-cover rounded-full"
                />
                {/* 在线状态指示器 */}
                <div className="absolute bottom-0 right-0 w-[16.8px] h-[16.8px]">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 16.8 16.8">
                    <path 
                      d={svgPaths.statusDot} 
                      fill="#B2DABB" 
                      stroke="#222222" 
                      strokeWidth="2" 
                    />
                  </svg>
                </div>
              </div>
              {/* 用户名 */}
              <span className="font-['Poppins'] font-medium text-[14px] text-white text-center whitespace-nowrap">
                {person.name}
              </span>
            </div>
          ))}
        </div>

        {/* 底部操作栏 */}
        <div className="absolute bottom-[20px] left-[20px] right-[20px] flex justify-between">
          {/* Share Button */}
          <ActionButton>
            <div className="w-[32px] h-[32px]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 26 26">
                <path d={svgPaths.share} fill="white" />
              </svg>
            </div>
          </ActionButton>

          {/* Copy Button */}
          <ActionButton>
            {/* Copy 图标包含特殊的内边距处理 */}
            <div className="w-[32px] h-[32px] relative">
              <div className="absolute inset-[14.42%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.0771 17.0771">
                  <path d={svgPaths.copy} fill="white" />
                </svg>
              </div>
            </div>
          </ActionButton>

          {/* More Button */}
          <ActionButton>
            <div className="w-[32px] h-[32px]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 29 29">
                <path d={svgPaths.more} fill="white" />
              </svg>
            </div>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
