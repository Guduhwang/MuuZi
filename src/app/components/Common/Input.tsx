// 通用输入框组件
// 包含深色背景和统一样式，支持所有原生 input 属性
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div 
        className={`w-full h-[60px] bg-[#3b3b3b] rounded-[23px] flex items-center px-[24px] cursor-text border border-transparent focus-within:border-[#B2DABB] transition-colors ${containerClassName || ''}`}
      >
        <input
          ref={ref}
          className={`bg-transparent border-none outline-none w-full text-[#b7b7bc] placeholder-[#b7b7bc] text-[18px] font-semibold ${className || ''}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
