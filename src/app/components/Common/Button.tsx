import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'social' | 'tertiary';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', icon, children, loading, disabled, ...props }, ref) => {
    const baseStyles = "w-full flex items-center justify-center transition-all duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "h-[60px] bg-[#b2dabb] rounded-[23px] hover:bg-[#a1c9aa] text-black text-[18px] font-semibold gap-[8px]",
      social: "h-[48px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] hover:bg-[rgba(255,255,255,0.1)] text-white text-[15px] gap-[12px]",
      tertiary: "h-auto bg-transparent border-none text-[#b7b7bc] hover:text-white text-[14px] uppercase underline decoration-solid decoration-1 underline-offset-2 p-0"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={variant === 'primary' ? 24 : 18} />}
        {!loading && icon && variant === 'social' && icon}
        <span>{children}</span>
        {!loading && icon && variant === 'primary' && icon}
      </button>
    );
  }
);

Button.displayName = "Button";
