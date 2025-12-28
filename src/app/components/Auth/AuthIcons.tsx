// 认证流程通用图标：Google / Apple / ArrowRight
import React from 'react';
import socialSvgPaths from "../../../assets/svgs/svg-5miuiwkafh";
import { cn } from "../ui/utils";

interface AuthIconProps {
    className?: string;
}

export const GoogleIcon = ({ className }: AuthIconProps) => (
    <svg className={cn("size-[16px]", className)} fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={socialSvgPaths.p39ee6532} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        <path d={socialSvgPaths.p3adb3b00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        <path d="M14.1133 5.33333H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        <path d={socialSvgPaths.pd56f300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        <path d={socialSvgPaths.p6e81700} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </svg>
);

export const AppleIcon = ({ className }: AuthIconProps) => (
    <svg className={cn("size-[16px]", className)} fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={socialSvgPaths.p1f7dd900} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        <path d={socialSvgPaths.p26069bc0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </svg>
);

export const ArrowRightIcon = ({ className }: AuthIconProps) => (
    <svg className={cn("size-[16px]", className)} fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
         <path d="M3.33333 8H12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
         <path d={socialSvgPaths.p1d405500} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </svg>
);
