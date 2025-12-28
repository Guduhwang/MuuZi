import React from 'react';

// SVG path for search icon
const SEARCH_ICON_PATH = "M18.9633 18.9633C19.2854 18.6411 19.7912 18.6148 20.1439 18.8832L20.2367 18.9633L22.1361 20.8637C22.4876 21.2151 22.4876 21.7847 22.1361 22.1361C21.814 22.4583 21.3082 22.4857 20.9555 22.2172L20.8637 22.1361L18.9633 20.2367C18.6118 19.8852 18.6118 19.3148 18.9633 18.9633ZM11.5248 1.6C15.0707 1.6 18.3476 3.49208 20.1205 6.56289C21.8932 9.63363 21.8934 13.417 20.1205 16.4877C18.3476 19.5585 15.0706 21.4496 11.5248 21.4496C6.04347 21.4495 1.6 17.0062 1.6 11.5248C1.60011 6.04353 6.04353 1.60011 11.5248 1.6ZM11.5248 3.3998C7.03765 3.39991 3.39991 7.03765 3.3998 11.5248C3.3998 16.0121 7.03758 19.6497 11.5248 19.6498C14.4276 19.6498 17.1105 18.1012 18.5619 15.5873C20.0131 13.0735 20.0132 9.97606 18.5619 7.4623C17.1105 4.94842 14.4276 3.3998 11.5248 3.3998Z";

interface SearchInputProps {
  className?: string;
  placeholder?: string;
}

// 搜索输入框组件：包含搜索图标和文本输入
export function SearchInput({ className = "", placeholder = "Search for creators" }: SearchInputProps) {
  return (
    <div className={`w-[295px] h-[40px] bg-[#3b3b3b] rounded-[15px] flex items-center px-[8px] gap-[8px] border border-transparent focus-within:border-[#B2DABB] transition-colors duration-200 ${className}`}>
      <div className="w-[24px] h-[24px] flex items-center justify-center opacity-40">
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
          <path d={SEARCH_ICON_PATH} fill="white" />
        </svg>
      </div>
      <input 
        type="text"
        className="bg-transparent outline-none font-['Poppins'] text-[14px] text-white w-full placeholder-[#b7b7bc]"
        placeholder={placeholder}
      />
    </div>
  );
}
