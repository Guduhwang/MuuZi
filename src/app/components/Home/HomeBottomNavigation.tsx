// 首页底部导航栏组件：包含Home, Calendar, Notification, Add Tab
// 使用 Flexbox 布局替代原有的绝对定位，提高代码灵活性和可维护性
import React from "react";
import { motion } from "motion/react";
import svgPaths from "../../../assets/svgs/svg-rc4e8rpsig";
import svgPathsActive from "../../../assets/svgs/svg-qntak0q2p6";

export type TabId = 'home' | 'calendar' | 'notification';

interface HomeBottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onAddClick?: () => void;
}

/**
 * 选中态背景组件
 * 包含绿色填充和描边动画
 */
const ActiveBackground = () => (
  <div className="absolute inset-[22.61%_6.98%_29.05%_5.68%]">
    <svg className="block size-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 69.8737 48.3431" aria-hidden="true">
      <motion.path 
          d={svgPathsActive.p27b50d00} 
          stroke="#96C09F"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#96C09F"
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, fillOpacity: 1 }}
          transition={{ 
              pathLength: { duration: 0.8, ease: "easeInOut" },
              fillOpacity: { duration: 0.3, delay: 0.6 }
          }}
      />
    </svg>
  </div>
);

/**
 * 导航 Tab 按钮组件
 * 封装通用的按钮样式、交互及 Active 状态
 */
interface NavTabProps {
  id: TabId;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  label: string;
  children: React.ReactNode; // 具体图标 SVG 内容
}

const NavTab = ({ id, activeTab, onTabChange, label, children }: NavTabProps) => {
  const isActive = activeTab === id;
  return (
    <button 
      type="button"
      aria-label={label}
      onClick={() => onTabChange(id)}
      className={`
        relative h-[96px] w-[80px] 
        cursor-pointer transition-opacity bg-transparent border-none p-0 focus:outline-none
        ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
      `}
    >
      {isActive && <ActiveBackground />}
      {/* 图标容器：统一居中定位 */}
      <div className="absolute z-10 left-1/2 size-[32px] top-[calc(50%_-_2.89px)] translate-x-[-50%] translate-y-[-50%]">
        {children}
      </div>
    </button>
  );
};

export function HomeBottomNavigation({ activeTab, onTabChange, onAddClick }: HomeBottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-[96px] z-50">
      <div className="relative size-full">
        {/* 背景层 */}
        <div className="absolute bg-[#222] inset-0 rounded-tl-[32px] rounded-tr-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.3)]" />
        
        {/* 内容层：Flexbox 布局 */}
        <div className="absolute inset-0 flex justify-center items-center gap-[8px]">
          
          {/* Tab 1: Home (Room) */}
          <NavTab 
            id="home" 
            activeTab={activeTab} 
            onTabChange={onTabChange} 
            label="Home"
          >
            <div className="absolute inset-[6.25%_8.36%_8.44%_6.25%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.3253 27.3" aria-hidden="true">
                <path clipRule="evenodd" d={svgPaths.p3d612a70} fill="white" fillRule="evenodd" />
              </svg>
            </div>
          </NavTab>

          {/* Tab 2: Calendar (Event) */}
          <NavTab 
            id="calendar" 
            activeTab={activeTab} 
            onTabChange={onTabChange} 
            label="Calendar"
          >
            <div className="absolute inset-[7.34%_9.53%_7.35%_9.53%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.9006 27.2979" aria-hidden="true">
                <path d={svgPaths.p2421fa00} fill="white" />
              </svg>
            </div>
          </NavTab>

          {/* Tab 3: Notification (Activity) */}
          <NavTab 
            id="notification" 
            activeTab={activeTab} 
            onTabChange={onTabChange} 
            label="Notifications"
          >
            <div className="absolute inset-[4.92%_13.91%_9.77%_13.91%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.0996 27.3001" aria-hidden="true">
                <path d={svgPaths.p3ed94ac0} fill="white" />
              </svg>
            </div>
          </NavTab>

          {/* Tab 4: Add (特殊按钮) */}
          <button 
            type="button"
            aria-label="Add New"
            className="relative h-[96px] w-[80px] cursor-pointer bg-transparent border-none p-0 focus:outline-none" 
            onClick={(e) => {
                e.stopPropagation();
                onAddClick?.();
            }}
          >
            <div className="absolute contents inset-[20%_15%_27.11%_15%]">
              {/* Add 按钮背景 */}
              <div className="absolute inset-[20%_15%_27.11%_15%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 50.7735" aria-hidden="true">
                  <path clipRule="evenodd" d={svgPaths.p35d18580} fill="#B2DABB" fillRule="evenodd" />
                </svg>
              </div>
              {/* Add 图标 */}
              <div className="absolute inset-[34.44%_35%_41.56%_35%]">
                <div className="absolute inset-[14.42%]">
                  <div className="absolute inset-0" style={{ "--fill-0": "rgba(34, 34, 34, 1)" } as React.CSSProperties}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.0771 16.3945" aria-hidden="true">
                      <path d={svgPaths.p3a317300} fill="#222222" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </button>

        </div>
      </div>
    </nav>
  );
}
