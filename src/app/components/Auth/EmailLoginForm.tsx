// 邮箱登录表单组件：提供邮箱输入、提交按钮和注册链接
import { Button } from '../ui/button';
import { OtherInput } from '../ui/OtherInput';
import { ArrowRight } from 'lucide-react';

export function EmailLoginForm() {
  return (
    <form 
      className="w-full flex flex-col gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* 输入区：邮箱 */}
      <div className="relative">
        <OtherInput 
          type="email" 
          placeholder="Email" 
          aria-label="Email"
          required
        />
      </div>

      {/* 提交按钮区 */}
      <Button 
        type="submit"
        className="
          w-full h-[60px] rounded-[23px] font-['Poppins'] font-semibold text-[18px] flex items-center justify-center gap-2
          bg-[color:var(--color-brand-primary,#b2dabb)] hover:bg-[color:var(--color-brand-primary-hover,#b2dabb)] text-[color:var(--color-text-on-brand,#000)]
        "
      >
        <span>Continue with Email</span>
        <ArrowRight className="w-4 h-4" />
      </Button>

      {/* 注册引导区 */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-[color:var(--color-text-muted,#b7b7bc)] text-sm font-['Poppins']">Don't have an account?</span>
        <button 
          type="button"
          className="text-[color:var(--color-brand-primary,#b2dabb)] text-sm font-['Poppins'] font-semibold hover:underline"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}
