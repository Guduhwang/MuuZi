// 密码安全验证页面 (PasswordPage)
// -----------------------------------------------------------------------------
// 该页面作为注册流程的安全确认环节，负责设置高强度密码并完成最后的身份核验。
// 
// 主要职责：
// 1. 安全凭证设定：执行符合金融级安全要求的强密码校验（长度、复杂度、空格过滤）。
// 2. 邀请关系确认：允许用户在最后阶段核对或修正邀请码，确保社区激励归属。
// 3. 护航式验证：触发并验证邮箱验证码，实现“注册即登录”的闭环。
// 4. 容错引导：识别已注册账户并提供快速登录入口，减少用户流失。
//
// 布局与适配：
// - 移动端优先：采用单列全宽布局，使用 min-h-[100dvh] 适配移动端视口。
// - 交互鲁棒性：提交开始时自动收起软键盘，提升验证码弹窗的视觉沉浸感。
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { AuthHeader } from '../../components/Auth/AuthHeader';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { ArrowRightIcon } from '../../components/Auth/AuthIcons';
import { VerificationDialogContent } from '../../components/Auth/VerificationDialogContent';
import { Dialog } from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Eye, EyeOff } from 'lucide-react';
import { setTokens } from "../../lib/tokenManager";

interface PasswordPageProps {
  onBack?: () => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLogin?: () => void;
  email?: string;
  initialInvitationCode?: string;
}

// -----------------------------------------------------------------------------
// 接口对接规范 (API Integration) - 遵循 Rule 13
// -----------------------------------------------------------------------------
const BASE_URL = '/dev/admin/base';

/**
 * 通用 Fetch 请求封装
 */
const secureFetch = async (path: string, body: any) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 🔴 [多语言支持]: 必须传递以对齐后端错误字典映射
      'language': 'en' 
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Network error');
  const data = await response.json();
  
  // 🔴 [业务码校验]: 严格执行 1000 成功判定
  if (data?.code !== 1000) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
};

export function PasswordPage({ 
  onBack, 
  onSignUp, 
  onForgotPassword, 
  onLogin, 
  email = "", 
  initialInvitationCode = "" 
}: PasswordPageProps) {
  // -----------------------------------------------------------------------------
  // 状态定义 (States)
  // -----------------------------------------------------------------------------
  
  // 聚合表单数据：减少 useState 数量，使数据流向更集中 (Rule 6)
  const [formData, setFormData] = useState({
    password: "",
    invitationCode: initialInvitationCode,
    otpValue: ""
  });

  // UI 交互状态
  const [uiStates, setUiStates] = useState({
    loading: false,
    showPassword: false,
    passwordError: "",
    invitationError: ""
  });

  // 弹窗状态
  const [dialogs, setDialogs] = useState({
    verification: false,
    registered: false
  });

  // -----------------------------------------------------------------------------
  // 业务逻辑 (Business Logic)
  // -----------------------------------------------------------------------------

  useEffect(() => {
    if (initialInvitationCode) {
      setFormData(prev => ({ ...prev, invitationCode: initialInvitationCode }));
    }
  }, [initialInvitationCode]);

  /**
   * 强密码校验逻辑
   * 业务价值：在注册阶段强制提升账户安全性，防范暴力破解。
   */
  const validatePassword = (pwd: string): boolean => {
    // 规则：8-64位，包含大写、小写、数字、特殊字符，禁止空格
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?!.*\s).{8,64}$/;
    return regex.test(pwd);
  };

  /**
   * 发送验证码主流程
   * 职责：前端校验 -> 查重拦截 -> 发送指令
   */
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // 🔴 [交互体验]: 提交开始时立即收起移动端键盘
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 1. 基础合法性检查
    if (!validatePassword(formData.password)) {
      setUiStates(prev => ({ ...prev, passwordError: "Must be 8–64 chars with mixed cases, numbers & symbols." }));
      return;
    }
    if (!formData.invitationCode.trim()) {
      setUiStates(prev => ({ ...prev, invitationError: "Invitation code is required." }));
      return;
    }
    
    setUiStates(prev => ({ ...prev, passwordError: "", invitationError: "", loading: true }));

    try {
      // 2. 邮箱存在性自检：避免重复注册导致的 500 错误
      const existData = await secureFetch('/open/exist', { email });
      const existsRaw = existData.data;
      const isRegistered = existsRaw === true || existsRaw === 'true' || existsRaw === 1;

      if (isRegistered) {
        setDialogs(prev => ({ ...prev, registered: true }));
        return;
      } 
      
      // 3. 触发验证码发送
      await secureFetch('/open/sendCode', { email, invitation: formData.invitationCode.trim() });
      setDialogs(prev => ({ ...prev, verification: true }));

    } catch (err: any) {
      alert(err.message || "Network error, please try again.");
    } finally {
      setUiStates(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * 最终验证逻辑
   * 业务价值：完成注册闭环，并进行“验证即登录”的护航处理。
   */
  const handleVerify = async () => {
    if (formData.otpValue.length !== 6) return;
    
    setUiStates(prev => ({ ...prev, loading: true }));
    try {
      const verifyData = await secureFetch('/open/verifyCode', { email, code: formData.otpValue });
      
      // 🔴 [模型持久化]: 存储 Token 进入会话 (Rule 14)
      if (verifyData.data?.token) {
        setTokens({
          token: verifyData.data.token,
          refreshToken: verifyData.data.refreshToken,
          expire: verifyData.data.expire,
          refreshExpire: verifyData.data.refreshExpire,
          persist: 'session',
        });
        onSignUp?.();
      }
    } catch (err: any) {
      alert(err.message || "Verification failed, please try again.");
    } finally {
      setUiStates(prev => ({ ...prev, loading: false }));
    }
  };

  const isButtonDisabled = !formData.password || !formData.invitationCode || uiStates.loading;

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      {/* 顶部公共头部 (AuthHeader) */}
      <AuthHeader onBack={onBack} />

      {/* 欢迎标题区 (Header Section) */}
      <section className="mt-[40px] mb-[20px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Final</span>
          <span className="block">Step</span>
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Secure your account</p>
      </section>

      {/* 密码表单区域 (Password Form) */}
      <form className="flex flex-col" onSubmit={handleSendCode}>
        {/* 密码输入框：含实时强度反馈样式 */}
        <div className="flex flex-col gap-1 mb-[15px]">
          <div className="relative">
            <Input 
              type={uiStates.showPassword ? "text" : "password"}
              placeholder="Password"
              containerClassName={`mb-0 pr-[50px] ${uiStates.passwordError ? "border-red-500" : ""}`}
              autoFocus
              value={formData.password}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, password: e.target.value }));
                if (uiStates.passwordError) setUiStates(p => ({ ...p, passwordError: "" }));
              }}
            />
            <button
              type="button"
              className="absolute right-[20px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              onClick={() => setUiStates(p => ({ ...p, showPassword: !p.showPassword }))}
              aria-label={uiStates.showPassword ? "Hide password" : "Show password"}
            >
              {uiStates.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {uiStates.passwordError && <span className="text-red-500 text-xs px-1 leading-tight" role="alert">{uiStates.passwordError}</span>}
        </div>

        {/* 邀请码输入框 */}
        <div className="flex flex-col gap-1 mb-[30px]">
            <Input 
              type="text"
              placeholder="Invitation Code"
              containerClassName={uiStates.invitationError ? "border-red-500" : ""}
              value={formData.invitationCode}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, invitationCode: e.target.value }));
                if (uiStates.invitationError) setUiStates(p => ({ ...p, invitationError: "" }));
              }}
            />
            {uiStates.invitationError && <span className="text-red-500 text-xs px-1" role="alert">{uiStates.invitationError}</span>}
        </div>

        {/* 🔴 [语义化提交按钮]: 位于 form 内并支持 type="submit" */}
        <Button 
          type="submit"
          variant="primary"
          className="mb-[15px] shadow-lg"
          icon={uiStates.loading ? null : <ArrowRightIcon />}
          disabled={isButtonDisabled}
        >
          {uiStates.loading ? "Checking..." : "Send Verification Code"}
        </Button>
      </form>

      {/* 找回密码入口 (Secondary Navigation) */}
      <section className="w-full flex justify-center mb-[20px]">
        <button 
          onClick={onForgotPassword}
          className="text-brand-primary text-lead underline underline-offset-4 hover:opacity-80 transition-colors"
        >
          Forgot your password?
        </button>
      </section>

      {/* 底部合规说明 (Footer Section) */}
      <footer className="mt-auto mb-6">
        <p className="text-tiny text-text-subtle text-center">
            By clicking "Send Verification Code", you agree to our Terms of Service.
        </p>
      </footer>

      {/* 验证码校验弹窗 (OTP Dialog) */}
      <Dialog open={dialogs.verification} onOpenChange={(o) => setDialogs(p => ({ ...p, verification: o }))}>
        <VerificationDialogContent 
          otpValue={formData.otpValue}
          setOtpValue={(val) => setFormData(prev => ({ ...prev, otpValue: val }))}
          onVerify={handleVerify}
          buttonText="Verify & Sign Up"
          isVerifying={uiStates.loading}
        />
      </Dialog>

      {/* 冲突处理：账户已存在弹窗 */}
      <AlertDialog open={dialogs.registered} onOpenChange={(o) => setDialogs(p => ({ ...p, registered: o }))}>
        <AlertDialogContent className="bg-app-dark border-white/10 text-white rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Account Exists</AlertDialogTitle>
            <AlertDialogDescription className="text-text-muted">
              This email is already registered. Please sign in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogAction 
               className="bg-brand-primary text-black hover:bg-brand-primary/90"
               onClick={() => {
                 setDialogs(p => ({ ...p, registered: false }));
                 onLogin?.();
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
