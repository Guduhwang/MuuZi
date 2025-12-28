// 找回密码页面 (ForgotPasswordPage)
// -----------------------------------------------------------------------------
// 该页面处理用户忘记密码后的账户恢复流程，通过安全验证手段重新确立用户访问权限。
// 
// 主要职责：
// 1. 身份核验启动：接收注册邮箱并触发后台验证码发放逻辑。
// 2. 交互式二次验证：通过 VerificationDialog 强制进行验证码比对，确保持卡人操作。
// 3. 凭证重置：执行强密码策略校验，并提交新密码进行覆盖。
// 4. 静默登录体验：重置成功后自动完成认证，无缝引导用户进入应用首页，消除操作阻断感。
//
// 布局与适配：
// - 移动端优先：单列全宽布局，使用 min-h-[100dvh] 处理移动视口高度。
// - 交互鲁棒性：提交时自动收起软键盘，提升弹窗与 Loading 态的视觉聚焦度。
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AuthHeader } from '../../components/Auth/AuthHeader';
import socialSvgPaths from "../../../assets/svgs/svg-5miuiwkafh";
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { VerificationDialogContent } from '../../components/Auth/VerificationDialogContent';
import { Dialog } from "../../components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { setTokens } from "../../lib/tokenManager";

// 右箭头图标：提升操作按钮的视觉引导性
const ArrowRightIcon = () => (
    <svg className="size-[16px]" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16" aria-hidden="true">
         <path d="M3.33333 8H12.6667" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
         <path d={socialSvgPaths.p1d405500} stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </svg>
);

interface ForgotPasswordPageProps {
  onBack?: () => void;
  onLogin?: () => void;
  initialEmail?: string;
}

// -----------------------------------------------------------------------------
// 接口对接规范 (API Integration) - 遵循 Rule 13
// -----------------------------------------------------------------------------
const BASE_URL = '/dev/admin/base';

/**
 * 通用请求工具封装
 * 职责：注入必需的 Header，执行标准的 code === 1000 业务成功判定。
 */
const authRequest = async (path: string, body: any) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 🔴 [多语言支持]: 必须传递以对齐后端返回的校验提示字典
      'language': 'en' 
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Network Error: ${response.status}`);
  const data = await response.json();
  
  if (data?.code !== 1000) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
};

export function ForgotPasswordPage({ onBack, onLogin, initialEmail = "" }: ForgotPasswordPageProps) {
  // -----------------------------------------------------------------------------
  // 状态定义 (States)
  // -----------------------------------------------------------------------------
  
  // 流程控制
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState(initialEmail);
  
  // 表单数据
  const [passwordData, setPasswordData] = useState({
    new: "",
    confirm: "",
    verifiedCode: ""
  });

  // UI 交互状态
  const [uiStates, setUiStates] = useState({
    loading: false,
    showNew: false,
    showConfirm: false,
    strength: '' as 'weak' | 'medium' | 'strong' | '',
    error: ""
  });

  // 验证码弹窗控制
  const [dialog, setDialog] = useState({
    open: false,
    busy: false,
    otp: "",
    desc: `We've sent a code to ${initialEmail || 'your email'}.`,
    btn: "Verify Code"
  });

  // -----------------------------------------------------------------------------
  // 业务逻辑与校验 (Logic & Validation)
  // -----------------------------------------------------------------------------

  /**
   * 密码强度校验核心逻辑
   * 业务价值：在重置阶段强制提升安全等级，防止账户被二次弱口令攻击。
   */
  const validatePassword = (pwd: string) => {
    if (/\s/.test(pwd)) return { valid: false, strength: 'weak' as const, error: "No spaces allowed" };
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (hasLength && hasUpper && hasLower && hasNumber) strength = 'strong';
    else if (hasLength && typeCount >= 2) strength = 'medium';

    const isValid = strength === 'strong';
    let errorMsg = "";
    if (!isValid) {
      if (!hasLength) errorMsg = "Must be at least 8 characters";
      else if (!hasUpper) errorMsg = "Must contain an uppercase letter";
      else if (!hasLower) errorMsg = "Must contain a lowercase letter";
      else if (!hasNumber) errorMsg = "Must contain a number";
      else errorMsg = "Password is too weak";
    }
    return { valid: isValid, strength, error: errorMsg };
  };

  const handlePasswordChange = (val: string) => {
    const result = validatePassword(val);
    setPasswordData(p => ({ ...p, new: val }));
    setUiStates(p => ({ ...p, strength: val ? result.strength : '', error: val ? (result.valid ? "" : result.error) : "" }));
  };

  /**
   * 1. 发送重置验证码
   * 职责：触发邮件 -> 唤起验证弹窗 -> 等待用户输入
   */
  const handleSendCode = async () => {
    if (!email) return;

    // 🔴 [交互优化]: 提交开始立即收起移动端键盘
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    try {
      setUiStates(p => ({ ...p, loading: true }));
      setDialog(p => ({ ...p, open: true, busy: true, btn: "Sending...", desc: `Sending code to ${email.trim()}...` }));
      
      await authRequest('/open/sendCode', { email: email.trim() });

      setDialog(p => ({ ...p, busy: false, btn: "Verify Code", desc: `We've sent a code to ${email.trim()}.` }));
    } catch (err: any) {
      alert(err.message || "Failed to send code");
      setDialog(p => ({ ...p, open: false }));
    } finally {
      setUiStates(p => ({ ...p, loading: false }));
    }
  };

  /**
   * 2. 验证并进入重置阶段
   * 业务价值：确保重置操作发生在验证流程成功之后，形成严格的逻辑锁。
   */
  const handleVerify = async () => {
     if (dialog.otp.length !== 6) return;
     try {
       setDialog(p => ({ ...p, busy: true, btn: "Verifying..." }));
       await authRequest('/open/verifyCode', { email: email.trim(), code: dialog.otp });
       
       setPasswordData(p => ({ ...p, verifiedCode: dialog.otp }));
       setDialog(p => ({ ...p, open: false, busy: false }));
       setStep('reset');
     } catch (err: any) {
       alert(err.message || "Verification failed");
       setDialog(p => ({ ...p, busy: false, btn: "Verify Code" }));
     }
  };

  /**
   * 3. 执行重置密码并自动登录
   * 业务价值：实现“重置成功即登录”的护航体验，极大提升用户活跃留存。
   */
  const handleResetAndLogin = async () => {
      if (passwordData.new && passwordData.confirm) {
          if (!passwordData.verifiedCode) return setStep('email');
          if (uiStates.strength !== 'strong') return alert(uiStates.error);
          if (passwordData.new !== passwordData.confirm) return alert("Passwords do not match");

          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

          try {
            setUiStates(p => ({ ...p, loading: true }));
            
            // 阶段 1: 重置密码指令
            await authRequest('/sys/user/resetPassword', {
                email: email.trim(),
                code: passwordData.verifiedCode,
                password: passwordData.new
            });

            // 阶段 2: 静默登录获权
            const loginData = await authRequest('/open/loginByEmail', { 
                email: email.trim(), 
                password: passwordData.new 
            });

            // 存储认证令牌进入本地持久化
            setTokens({
              token: loginData.data?.token,
              refreshToken: loginData.data?.refreshToken,
              expire: loginData.data?.expire,
              refreshExpire: loginData.data?.refreshExpire,
              persist: 'local',
            });

            alert("Password reset successfully. Redirecting...");
            onLogin?.();
          } catch (err: any) {
            alert(err.message || "Operation failed");
          } finally {
            setUiStates(p => ({ ...p, loading: false }));
          }
      }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      {/* 顶部头部：根据步骤决定返回逻辑 */}
      <AuthHeader onBack={step === 'email' ? onBack : () => setStep('email')} />

      {step === 'email' ? (
        <section className="flex flex-col animate-in fade-in duration-500">
            {/* 步骤一：邮箱识别标题区 */}
            <div className="mt-[40px] mb-[20px]">
                <h1 className="text-display font-semibold">
                  <span className="text-brand-primary block">Forgot</span>
                  <span className="block">Password</span>
                </h1>
                <p className="text-text-muted text-lead mt-4 text-center w-full">
                  Enter your email address to receive a verification code to reset your password.
                </p>
            </div>

            {/* 邮箱提交表单 */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="flex flex-col">
                <div className="flex flex-col mb-[30px]">
                    <label htmlFor="email-input" className="sr-only">Email Address</label>
                    <Input 
                        id="email-input"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <Button 
                    variant="primary"
                    className="mb-[15px] shadow-lg"
                    icon={<ArrowRightIcon />}
                    disabled={!email || uiStates.loading}
                    type="submit"
                >
                    {uiStates.loading ? "Checking..." : "Send verification code"}
                </Button>
            </form>
        </section>
      ) : (
        <section className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            {/* 步骤二：凭证重置标题区 */}
            <div className="mt-[40px] mb-[20px]">
                <h1 className="text-display font-semibold">
                  <span className="text-brand-primary block">Reset</span>
                  <span className="block">Password</span>
                </h1>
                <p className="text-text-muted text-lead mt-4 text-center w-full">
                  Enter your new password below.
                </p>
            </div>

            {/* 凭证提交表单 */}
            <form onSubmit={(e) => { e.preventDefault(); handleResetAndLogin(); }} className="flex flex-col">
                {/* 账号回显 (只读状态) */}
                <div className="mb-[15px] opacity-60">
                    <Input type="email" value={email} readOnly />
                </div>

                {/* 新密码设置：含实时强度对撞机 */}
                <div className="relative mb-[30px]">
                  <div className="relative">
                    <Input 
                        type={uiStates.showNew ? "text" : "password"}
                        placeholder="New Password"
                        containerClassName={`mb-0 pr-[50px] transition-colors ${
                            uiStates.error ? "border-red-500" : (uiStates.strength === 'strong' ? "border-green-500" : "")
                        }`}
                        value={passwordData.new}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        autoFocus
                        required
                    />
                    <button
                      type="button"
                      className="absolute right-[20px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                      onClick={() => setUiStates(p => ({ ...p, showNew: !p.showNew }))}
                    >
                      {uiStates.showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* 密码强度指示器 (业务逻辑反馈) */}
                  {passwordData.new && (
                      <div className="flex flex-col gap-1.5 mt-2 w-[60%] mx-auto" aria-live="polite">
                          <div className="flex gap-1 h-1 w-full">
                              <div className={`flex-1 rounded-full transition-all duration-300 ${uiStates.strength ? (uiStates.strength === 'weak' ? 'bg-red-500' : (uiStates.strength === 'medium' ? 'bg-orange-500' : 'bg-green-500')) : 'bg-white/10'}`} />
                              <div className={`flex-1 rounded-full transition-all duration-300 ${(uiStates.strength === 'medium' || uiStates.strength === 'strong') ? (uiStates.strength === 'medium' ? 'bg-orange-500' : 'bg-green-500') : 'bg-white/10'}`} />
                              <div className={`flex-1 rounded-full transition-all duration-300 ${uiStates.strength === 'strong' ? 'bg-green-500' : 'bg-white/10'}`} />
                          </div>
                      </div>
                  )}
                  {uiStates.error && <span className="text-red-500 text-xs mt-1 block text-center" role="alert">{uiStates.error}</span>}
                </div>

                {/* 确认密码 (Confirm Password) */}
                {passwordData.new && (
                  <div className="relative mb-[30px] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <Input 
                          type={uiStates.showConfirm ? "text" : "password"}
                          placeholder="Confirm Password"
                          containerClassName={passwordData.confirm && passwordData.new !== passwordData.confirm ? "border-red-500" : ""}
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                          required
                      />
                      <button
                          type="button"
                          className="absolute right-[20px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                          onClick={() => setUiStates(p => ({ ...p, showConfirm: !p.showConfirm }))}
                      >
                          {uiStates.showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                        <span className="text-red-500 text-xs mt-1 block text-center" role="alert">Passwords do not match</span>
                    )}
                  </div>
                )}

                <Button 
                    variant="primary"
                    className="mb-[15px] shadow-lg"
                    icon={<ArrowRightIcon />}
                    disabled={!passwordData.new || !passwordData.confirm || uiStates.strength !== 'strong' || passwordData.new !== passwordData.confirm || uiStates.loading}
                    type="submit"
                >
                    {uiStates.loading ? "Updating..." : "Login"}
                </Button>
            </form>
        </section>
      )}

      {/* 验证码校验弹窗 (Verification Dialog) */}
      <Dialog open={dialog.open} onOpenChange={(o) => setDialog(p => ({ ...p, open: o }))}>
        <VerificationDialogContent 
          otpValue={dialog.otp}
          setOtpValue={(v) => setDialog(p => ({ ...p, otp: v }))}
          onVerify={handleVerify}
          title="Enter Verification Code"
          description={dialog.desc}
          buttonText={dialog.btn}
          isVerifying={dialog.busy}
        />
      </Dialog>
    </main>
  );
}
