// 欢迎页主要操作按钮组件：进入应用的主 CTA，含禁用态
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface LetsGoButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function LetsGoButton({ onClick, disabled = false }: LetsGoButtonProps) {
  return (
    // 核心操作按钮：点击进入应用
    <Button 
      variant="ghost"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "w-[145px] h-[56px] rounded-[21px] shadow-md p-0 flex items-center justify-center transition-all",
        disabled 
          ? "bg-gray-800 cursor-not-allowed opacity-60" 
          : "bg-brand-primary cursor-pointer hover:bg-brand-primary/90"
      )}
    >
      <span 
        className={cn(
          "text-[18px] font-medium",
          disabled ? "text-text-subtle" : "text-black"
        )}
      >
        Let’s Go
      </span>
    </Button>
  );
}
