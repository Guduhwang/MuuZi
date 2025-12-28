// 认证页面通用头部：包含返回按钮与居中 Logo，并提供占位防止内容被遮挡
import svgPaths from "../../../assets/svgs/svg-jqn2vvzcdy";

interface AuthHeaderProps {
  onBack?: () => void;
}

export const AuthHeader = ({ onBack }: AuthHeaderProps) => {
  return (
    <>
        <header className="fixed top-0 left-0 z-50 w-full h-[120px] bg-app-dark rounded-b-[32px] shadow-[0_5px_20px_rgba(0,0,0,0.3)] flex items-center justify-between px-[20px] pt-[60px] pb-[20px]">
           {/* 返回按钮：置于左侧，点击调用 onBack */}
           <button 
             type="button"
             aria-label="Go back"
             className="relative w-[40px] h-[40px] cursor-pointer z-10 bg-transparent border-none p-0 hover:opacity-80 transition-opacity" 
             onClick={onBack}
           >
             <div className="absolute inset-0">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
                    <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--color-jet)" fillRule="evenodd" />
                </svg>
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[8px] h-[14px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.64273 13.9954">
                        <path clipRule="evenodd" d={svgPaths.p3451d900} fill="white" fillRule="evenodd" />
                    </svg>
                </div>
             </div>
           </button>

           {/* 居中 Logo：绝对定位于头部中间 */}
           <div className="absolute inset-x-0 top-[60px] h-[40px] flex items-center justify-center pointer-events-none">
              <div className="relative flex flex-col items-center">
                  {/* Text */}
                  <span className="text-[32px] text-white leading-normal text-center whitespace-nowrap z-10">
                    🏡 MuuZi
                  </span>
                  {/* Underline */}
                  <div className="w-[139px] h-[10px] -mt-1">
                     <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 138.649 10.0001">
                        <mask height="10" id="header-mask-underline" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="139" x="0" y="0">
                            <path clipRule="evenodd" d={svgPaths.p26062b80} fill="white" fillRule="evenodd" />
                        </mask>
                        <g mask="url(#header-mask-underline)">
                            <path clipRule="evenodd" d={svgPaths.p10af5900} fill="var(--color-brand-primary)" fillRule="evenodd" />
                        </g>
                     </svg>
                  </div>
              </div>
           </div>
        </header>
        {/* 占位：防止内容被固定头部遮挡 */}
        <div className="w-full h-[120px] shrink-0" aria-hidden="true" />
    </>
  );
};
