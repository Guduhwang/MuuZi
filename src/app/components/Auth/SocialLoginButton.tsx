// 社交媒体登录按钮组件
import React from 'react';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface SocialLoginButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function SocialLoginButton({ icon: Icon, label, onClick, className }: SocialLoginButtonProps) {
  return (
    // 社交登录按钮：用于 Google/Apple 快捷登录
    <Button
      variant="outline"
      onClick={onClick}
      className={`w-full h-12 relative flex items-center justify-center gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl transition-all ${className}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-['Poppins'] font-medium text-[15px]">{label}</span>
    </Button>
  );
}
