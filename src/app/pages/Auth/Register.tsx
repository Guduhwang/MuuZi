// 注册页面 (RegisterPage)
// -----------------------------------------------------------------------------
// 该页面是用户进入应用的首选注册入口，负责初始身份核验与安全过滤。
// 
// 主要职责：
// 1. 邮箱验证：通过发送 6 位验证码确保邮箱真实性。
// 2. 准入控制：验证邀请码 (Invitation Code) 以维护社区质量。
// 3. 冲突检查：实时检测邮箱是否已注册，并提供平滑的登录引导。
// 4. 流程衔接：验证通过后将 userId 存入缓存，引导用户进入资料设置 (ProfileSetup)。
//
// 布局与适配：
// - 采用 Mobile-first 策略，单列全宽布局，适配 393x852 设计标准。
// - 针对移动端软键盘交互，执行提交时自动收起键盘以优化视觉焦点。
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { AuthHeader } from '../../components/Auth/AuthHeader';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { AuthDivider } from '../../components/Auth/AuthDivider';
import { GoogleIcon, AppleIcon, ArrowRightIcon } from '../../components/Auth/AuthIcons';
import { VerificationDialogContent } from '../../components/Auth/VerificationDialogContent';
import { Dialog } from "../../components/ui/dialog";
import { Copy } from 'lucide-react';
import { setTokens } from '../../lib/tokenManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

interface RegisterPageProps {
  onBack?: () => void;
  onSignIn?: () => void;
  onNext?: (email: string, invitationCode: string) => void;
  initialEmail?: string;
  initialInvitationCode?: string;
}

// 系统默认邀请码：确保在用户未通过外链进入时仍有基础访问权限
const DEFAULT_INVITATION_CODE = "dGVhbV81XzBfMF8xNA==";

// -----------------------------------------------------------------------------
// 接口对接函数 (API Integration) - 遵循 Rule 13
// -----------------------------------------------------------------------------
const BASE_URL = '/dev/admin/base';

/**
 * 通用 Fetch 封装：注入必需的 Header
 */
const authRequest = async (path: string, body: any) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 🔴 [多语言对齐]: 必须传递 language 以确保后端返回正确的错误提示字典
      'language': 'en' 
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error('Network error');
  const data = await response.json();
  
  // 🔴 [成功码判定]: 严格遵守 code === 1000 规范
  if (data?.code !== 1000) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
};

export function RegisterPage({ onBack, onSignIn, onNext, initialEmail = '', initialInvitationCode = DEFAULT_INVITATION_CODE }: RegisterPageProps) {
  // -----------------------------------------------------------------------------
  // 状态定义 (States)
  // -----------------------------------------------------------------------------
  
  // 表单数据组合管理 (建议 4)
  const [formData, setFormData] = useState({
    email: initialEmail,
    invitationCode: initialInvitationCode || DEFAULT_INVITATION_CODE
  });

  // UI 交互状态
  const [loading, setLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  
  // 弹窗控制
  const [isRegisteredDialogOpen, setIsRegisteredDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isVerifyFailedDialogOpen, setIsVerifyFailedDialogOpen] = useState(false);

  // 错误提示
  const [errors, setErrors] = useState({ email: '', invitation: '' });

  // -----------------------------------------------------------------------------
  // 业务逻辑 (Business Logic)
  // -----------------------------------------------------------------------------

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: initialEmail || prev.email,
      invitationCode: initialInvitationCode || prev.invitationCode
    }));
  }, [initialEmail, initialInvitationCode]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * 提交首屏表单：核验邮箱并发送验证码
   * 职责：拦截重复注册 -> 触发邮件发放 -> 开启验证弹窗
   */
  const handleRegisterSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // 🔴 [用户体验]: 提交开始时立即收起键盘
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setErrors({ email: '', invitation: '' });

    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    try {
      setLoading(true);
      setIsSendingCode(true);
      setIsVerificationDialogOpen(true);

      // 1. 检查邮箱是否已注册
      const existData = await authRequest('/open/exist', { email: formData.email.trim() });
      const existsRaw = existData.data;
      const isRegistered = existsRaw === true || existsRaw === 'true' || existsRaw === 1;

      if (isRegistered) {
        setIsVerificationDialogOpen(false);
        setIsRegisteredDialogOpen(true);
        return;
      }

      // 2. 发送验证码
      await authRequest('/open/sendCode', { 
        email: formData.email.trim(), 
        invitation: formData.invitationCode.trim() 
      });
      
      setIsSendingCode(false);
    } catch (err: any) {
      setIsVerificationDialogOpen(false);
      alert(err.message || 'Request failed, please try again.');
    } finally {
      setIsSendingCode(false);
      setLoading(false);
    }
  };

  /**
   * 验证验证码：获取凭证并进入下一步
   * 业务价值：实现“验证即登录”的护航体验
   */
  const handleVerify = async () => {
    if (otpValue.length !== 6) return;

    try {
      setLoading(true);
      const data = await authRequest('/open/verifyCode', { 
        email: formData.email.trim(), 
        code: otpValue 
      });

      // 🔴 [关键模型提取]: 根据 Rule 14 提取 UserId 和 Token
      const rawData = data.data || {};
      const token = rawData.token || (typeof data.data === 'string' ? data.data : undefined);
      const userId = rawData.id || rawData.userId || rawData.userInfo?.id;

      if (token) {
        // 存储 Token 维持会话
        setTokens({ token, persist: 'session' });
        // 🔴 [必要逻辑]: 将 userId 存入 sessionStorage 供 ProfileSetup 绑定
        if (userId) {
          sessionStorage.setItem('userId', userId.toString());
        }
        setIsVerificationDialogOpen(false);
        onNext?.(formData.email.trim(), formData.invitationCode.trim());
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err: any) {
      setIsVerifyFailedDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvitationCode = async () => {
    try {
      await navigator.clipboard.writeText(formData.invitationCode);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isButtonDisabled = !formData.email || !validateEmail(formData.email) || loading;

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      {/* 顶部导航 */}
      <AuthHeader onBack={onBack} />

      {/* 标题引导区 */}
      <section className="mt-[40px] mb-[20px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Create</span> 
          <span className="block">Account</span> 
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Please sign up to continue</p> 
      </section>

      {/* 🔴 [语义化表单]: 使用原生 onSubmit 替代手动点击事件 */}
      <form className="flex flex-col" onSubmit={handleRegisterSubmit}>
        {/* 邮箱输入容器 */}
        <div className="flex flex-col gap-1 mb-[15px]">
          <Input 
            type="email" 
            placeholder="Email" 
            autoComplete="email" 
            containerClassName={errors.email ? "border-red-500" : ""} 
            value={formData.email} 
            onChange={(e) => {
              setFormData(prev => ({ ...prev, email: e.target.value }));
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
          />
          {errors.email && <span className="text-red-500 text-xs px-1" role="alert">{errors.email}</span>}
        </div>

        {/* 邀请码输入容器 */}
        <div className="flex flex-col gap-1 mb-[15px]">
          <div className="relative"> 
            <Input 
              type="text" 
              placeholder="Invitation Code"
              autoComplete="off"
              value={formData.invitationCode}
              className="pr-[40px]" 
              onChange={(e) => {
                setFormData(prev => ({ ...prev, invitationCode: e.target.value }));
                if (errors.invitation) setErrors(prev => ({ ...prev, invitation: '' }));
              }}
            />
            <button
              type="button"
              onClick={handleCopyInvitationCode} 
              className="absolute right-[12px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              aria-label="Copy invitation code"
            >
              <Copy size={16} /> 
            </button>
          </div>
        </div>

        {/* 视觉分割线 */}
        <AuthDivider />

        {/* 第三方快捷入口 */}
        <section className="flex flex-col gap-[12px] mb-[12px]">
            <Button variant="social" icon={<GoogleIcon />}>
                Continue with Google
            </Button>
            <Button variant="social" icon={<AppleIcon />}>
                Continue with Apple
            </Button>
        </section>

        {/* 🔴 [主操作按钮]: 位于 form 内，支持 type="submit" */}
        <Button 
          type="submit"
          variant="primary" 
          className="mb-[15px]"
          icon={loading ? null : <ArrowRightIcon />} 
          disabled={isButtonDisabled} 
        >
            {loading ? 'Checking...' : 'Send Verification Code'} 
        </Button>
      </form>

      {/* 底部跳转链接 */}
      <footer className="flex items-center justify-center gap-1 mb-auto">
          <span className="text-text-muted text-lead">Already have an account?</span>
          <button 
            className="text-brand-primary text-lead font-semibold hover:underline" 
            onClick={onSignIn} 
          >
            Sign In
          </button>
      </footer>

      {/* 合规说明 */}
      <p className="mt-8 mb-6 text-tiny text-text-subtle text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>

      {/* 验证码校验弹窗 (OTP Dialog) */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <VerificationDialogContent 
          otpValue={otpValue} 
          setOtpValue={setOtpValue} 
          onVerify={handleVerify} 
          buttonText={loading ? (isSendingCode ? "Sending code..." : "Verifying...") : "Verify & Next"} 
          isVerifying={loading} 
          description={isSendingCode ? "Sending code, please wait..." : "We've sent a code to your email."} 
        />
      </Dialog>

      {/* 校验失败提示 */}
      <AlertDialog open={isVerifyFailedDialogOpen} onOpenChange={setIsVerifyFailedDialogOpen}>
        <AlertDialogContent className="bg-app-dark border-white/10 text-white rounded-[20px] max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Verification Failed</AlertDialogTitle>
            <AlertDialogDescription className="text-text-muted text-sm text-center">
              Invalid verification code. Please check and try again. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              className="bg-brand-primary text-black hover:bg-brand-primary/90 w-full sm:w-auto min-w-[120px]"
              onClick={() => {
                setIsVerifyFailedDialogOpen(false); 
                setOtpValue(""); 
              }}
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 冲突处理弹窗：邮箱已注册 */}
      <AlertDialog open={isRegisteredDialogOpen} onOpenChange={setIsRegisteredDialogOpen}>
        <AlertDialogContent className="bg-app-dark border-white/10 text-white rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Email already registered</AlertDialogTitle>
            <AlertDialogDescription className="text-text-muted text-sm">
              <span>This email is already registered. Please log in instead.</span>
              <br /><br />
              <span className="text-xs text-text-subtle block">
                If you didn't receive a verification code previously, please go to the 
                <span 
                  className="text-brand-primary font-medium cursor-pointer hover:underline mx-1"
                  onClick={() => {
                    setIsRegisteredDialogOpen(false);
                    onSignIn?.(); 
                  }}
                >
                  login page
                </span> 
                and click <span className="text-brand-primary font-medium">"Forgot Password"</span> to verify your email.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
              onClick={() => setIsRegisteredDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-brand-primary text-black hover:bg-brand-primary/90"
              onClick={() => {
                setIsRegisteredDialogOpen(false);
                onSignIn?.(); 
              }}
            >
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
