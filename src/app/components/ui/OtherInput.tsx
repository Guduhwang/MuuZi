import React from 'react';

interface OtherInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const OtherInput = React.forwardRef<HTMLInputElement, OtherInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`w-full h-[60px] bg-[#3b3b3b] rounded-[23px] px-6 text-[18px] font-['Poppins'] font-semibold text-white placeholder:text-[#b7b7bc] outline-none focus:ring-1 focus:ring-[#b2dabb] transition-all ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
OtherInput.displayName = "OtherInput";
