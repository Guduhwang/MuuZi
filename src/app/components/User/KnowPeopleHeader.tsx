import React from 'react';
import svgPaths from "../../../assets/svgs/svg-o29lotiajt";

interface BackButtonProps {
    onClick?: () => void;
}

function Group() {
  return (
    <div className="absolute contents inset-[49.17%_5.33%_17.5%_84%]">
      <div className="absolute inset-[49.17%_5.33%_17.5%_84%]" data-name="Other / Button / 40px / Gray">
        <div className="absolute inset-0 overflow-clip">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
            <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--fill-0, #3B3B3B)" fillRule="evenodd" id="Path Copy" />
          </svg>
          <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icon / 24px / Search">
            <div className="absolute inset-[6.67%]" data-name="Combined Shape">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.7997 20.8">
                <path d={svgPaths.p673b980} fill="var(--fill-0, white)" id="Combined Shape" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group2Copy({ onClick }: BackButtonProps) {
  return (
    <button 
        className="absolute contents inset-[49.17%_84%_17.5%_5.33%] cursor-pointer" 
        data-name="Group 2 Copy"
        onClick={onClick}
    >
      <div className="absolute inset-[49.17%_84%_17.5%_5.33%]" data-name="Other / Button / 40px / Gray">
        <div className="absolute inset-0 overflow-clip">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
            <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--fill-0, #3B3B3B)" fillRule="evenodd" id="Path Copy" />
          </svg>
          <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icon / 24px / Back">
            <div className="absolute inset-[20.83%_42.43%_20.85%_25.73%]" data-name="arrow-left-3">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.64273 13.9954">
                <g id="arrow-left-3">
                  <path clipRule="evenodd" d={svgPaths.p3451d900} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

interface KnowPeopleHeaderProps {
    onBack?: () => void;
    onSearch?: () => void;
    title?: string;
}

export function KnowPeopleHeader({ onBack, onSearch, title = "People" }: KnowPeopleHeaderProps) {
  return (
    <header className="relative w-full h-[120px] shrink-0" data-name="Bars / Navigation / Back - Right - 2 Icons">
      <p className="absolute font-['Poppins'] font-medium leading-[normal] left-[20.27%] not-italic right-[20%] text-[18px] text-nowrap text-white top-[65.83%] translate-y-[-50%]">
        Suggested Creators
      </p>
      {/* Retain only one search/action button on the right */}
      <div 
        className="absolute contents inset-[49.17%_5.33%_17.5%_84%] cursor-pointer" 
        onClick={onSearch}
      >
        <div className="absolute inset-[49.17%_5.33%_17.5%_84%]" data-name="Other / Button / 40px / Gray">
          <div className="absolute inset-0 overflow-clip">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
              <path clipRule="evenodd" d={svgPaths.p23913300} fill="var(--fill-0, #3B3B3B)" fillRule="evenodd" id="Path Copy" />
            </svg>
            <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Icon / 24px / Search">
              <div className="absolute inset-[6.67%]" data-name="Combined Shape">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.7997 20.8">
                  <path d={svgPaths.p673b980} fill="var(--fill-0, white)" id="Combined Shape" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Group2Copy onClick={onBack} />
    </header>
  );
}
