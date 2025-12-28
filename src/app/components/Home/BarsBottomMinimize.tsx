// 底部最小化工具栏组件：包含头像组和操作按钮
import React from "react";
import svgPaths from "../../../assets/svgs/svg-3ss7pitubk";
import imgAvatarBorder from "figma:asset/3b3e7870a7bfe82564a33b818bbaaa329358eee9.png";
import imgAvatarBorder1 from "figma:asset/3e67df3a725059f528ffd0b670791411315331cd.png";
import imgAvatarBorder2 from "figma:asset/6345b11bed4d28c9f9b54ae1dc43fcfabf2aba86.png";
import imgAvatarBorder3 from "figma:asset/4242a806b1d693e04bb5a4a0461ea844cd177a96.png";

interface GroupProps {
  onOpenProfile?: () => void;
  participants?: string[];
}

function Group({ onOpenProfile }: GroupProps) {
  return (
    <div className="absolute contents inset-[0_0_0_57.01%]" data-name="Group">
      <div className="absolute inset-[0_15.52%_0_72.54%]" data-name="Other / Button / 40px / White">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(34, 34, 34, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
            <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--fill-0, #222222)" fillRule="evenodd" id="Path Copy" />
          </svg>
        </div>
        <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icon / 24px / Hand">
          <div className="absolute inset-[4.17%_18.34%_4.24%_18.27%]" data-name="hand">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.214 21.9819">
              <g id="hand">
                <path clipRule="evenodd" d={svgPaths.p375d8800} fill="var(--fill-0, white)" fillRule="evenodd" id="Shape" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute inset-[0_0_0_88.06%]" data-name="Other / Button / 40px / White">
        <div onClick={onOpenProfile} className="absolute inset-0 cursor-pointer active:opacity-80" style={{ "--fill-0": "rgba(34, 34, 34, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
            <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--fill-0, #222222)" fillRule="evenodd" id="Path Copy" />
          </svg>
        </div>
        <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%] pointer-events-none" data-name="Icon / 24px / Menu">
          <div className="absolute inset-[20.83%]" data-name="Group">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <g id="Group">
                <path d={svgPaths.p2ad2f00} fill="var(--fill-0, white)" id="Combined Shape" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute inset-[0_31.04%_0_57.01%]" data-name="Other / Button / 40px / White">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(34, 34, 34, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
            <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--fill-0, #222222)" fillRule="evenodd" id="Path Copy" />
          </svg>
        </div>
        <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icon / 24px / Send">
          <div className="absolute inset-[14.04%_15.26%_5.71%_4.5%]" data-name="send-2">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.257 19.2609">
              <g id="send-2">
                <path d={svgPaths.p22351b80} fill="var(--fill-0, white)" id="Combined Shape" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group2({ participants }: { participants?: string[] }) {
  if (participants && participants.length > 0) {
    return (
      <div className="absolute contents left-0 top-0">
        {participants.slice(0, 4).map((src, i) => (
          <div 
            key={i} 
            className="absolute size-[40px] top-0 rounded-full border-[2px] border-[#3b3b3b] overflow-hidden bg-gray-600"
            style={{ 
               left: `${i * 30}px`, 
               zIndex: 4 - i 
            }}
          >
            <img src={src} className="size-full object-cover" alt="" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute left-[90px] size-[40px] top-0" data-name="Avatar / Border">
        <img alt="" className="block max-w-none size-full" height="40" src={imgAvatarBorder} width="40" />
      </div>
      <div className="absolute left-[60px] size-[40px] top-0" data-name="Avatar / Border">
        <img alt="" className="block max-w-none size-full" height="40" src={imgAvatarBorder1} width="40" />
      </div>
      <div className="absolute left-[30px] size-[40px] top-0" data-name="Avatar / Border">
        <img alt="" className="block max-w-none size-full" height="40" src={imgAvatarBorder2} width="40" />
      </div>
      <div className="absolute left-0 size-[40px] top-0" data-name="Avatar / Border">
        <img alt="" className="block max-w-none size-full" height="40" src={imgAvatarBorder3} width="40" />
      </div>
    </div>
  );
}

function Group1({ onOpenProfile, participants }: GroupProps) {
  return (
    <div className="absolute h-[40px] left-1/2 overflow-clip top-[20px] translate-x-[-50%] w-[335px]">
      <Group onOpenProfile={onOpenProfile} />
      <Group2 participants={participants} />
    </div>
  );
}

export default function BarsBottomMinimize({ onOpenProfile, participants }: GroupProps) {
  return (
    <div className="relative size-full" data-name="Bars / Bottom / Minimize">
      <div className="absolute bg-[#3b3b3b] -bottom-[1000px] top-0 left-0 right-0 rounded-tl-[32px] rounded-tr-[32px]" data-name="Rectangle" />
      <Group1 onOpenProfile={onOpenProfile} participants={participants} />
    </div>
  );
}
