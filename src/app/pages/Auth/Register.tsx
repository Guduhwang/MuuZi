// 注册页面 (RegisterPage)
// -----------------------------------------------------------------------------
// 用户创建新账户的入口页面。
// 主要职责：
// 1. 提供邮箱注册表单。
// 2. 提供邀请码输入表单 (默认预填充，只读，支持复制)。
// 3. 提供第三方社交账号快捷注册入口 (Google, Apple)。
// 4. 引导已有账号用户跳转至登录页。
// 5. 展示服务条款和隐私政策提示。
// -----------------------------------------------------------------------------
import React from 'react';
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

// 默认邀请码
const DEFAULT_INVITATION_CODE = "dGVhbV81XzBfMF8xNA==";

// 将接口调用独立封装，便于复用与统一错误处理
// 返回值：Promise<{ isRegistered: boolean; message?: string }>
async function checkEmailExists(email: string): Promise<boolean> {
  // 使用 /api 前缀触发 Vite 代理，解决跨域问题
  // 目标接口: https://guduu.co/api/admin/base/open/exist
  
  // 设置超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

  try {
    const response = await fetch('/api/admin/base/open/exist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Network error');
    }

    const data = await response.json();

    // 严格校验 code === 1000，非 1000 视为异常
    if (data?.code !== 1000) {
      throw new Error(data?.message || 'Request failed');
    }

    // 部分后端会把布尔值序列化成字符串/数字，字符串 "false" 会被 JS 当做 truthy。
    // 在这里做一次规范化，避免新邮箱也被判定为已注册。
    const existsRaw = data.data;
    const isRegistered = existsRaw === true || existsRaw === 'true' || existsRaw === 1;
    return isRegistered;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

// 发送验证码接口
async function sendVerificationCode(email: string, invitationCode: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

  try {
    const response = await fetch('/api/admin/base/open/sendCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, invitation: invitationCode }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Network error');
    }

    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || 'Send code failed');
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

// 校验验证码接口
async function verifyCode(email: string, code: string): Promise<{ token: string; userId?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

  try {
    const response = await fetch('/api/admin/base/open/verifyCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Network error');
    }

    const data = await response.json();

    if (data.code !== 1000) {
      throw new Error(data.message || 'Verification failed');
    }
    
    // Return token and userId
    const rawData = data.data || {};
    const token = rawData.token || (typeof data.data === 'string' ? data.data : undefined) || data.token;
    const userId = rawData.id || rawData.userId || rawData.userInfo?.id;
    
    return { token, userId };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

export function RegisterPage({ onBack, onSignIn, onNext, initialEmail = '', initialInvitationCode = DEFAULT_INVITATION_CODE }: RegisterPageProps) {
  const [email, setEmail] = React.useState(initialEmail);
  // 邀请码默认预填充，如果 props 没传则用默认常量
  const [invitationCode, setInvitationCode] = React.useState(initialInvitationCode || DEFAULT_INVITATION_CODE);
  const [emailError, setEmailError] = React.useState('');
  const [invitationError, setInvitationError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isRegisteredDialogOpen, setIsRegisteredDialogOpen] = React.useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = React.useState(false);
  const [isSendingCode, setIsSendingCode] = React.useState(false); // 控制发送验证码阶段的 UI
  const [isVerifyFailedDialogOpen, setIsVerifyFailedDialogOpen] = React.useState(false); // 控制验证码错误弹窗
  const [otpValue, setOtpValue] = React.useState("");

  React.useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
    // 确保邀请码始终有值
    setInvitationCode(initialInvitationCode || DEFAULT_INVITATION_CODE);
  }, [initialEmail, initialInvitationCode]);

  // 严格的邮箱验证正则
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleNext = async () => {
    setEmailError('');
    setInvitationError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    // 邀请码在UI上是只读的，但逻辑上仍需校验存在
    if (!invitationCode.trim()) {
      setInvitationError('Invitation code is required');
      return;
    }

    // 只有校验通过后才触发后端校验，减少无效请求
    try {
      setLoading(true);
      setIsSendingCode(true);
      setIsVerificationDialogOpen(true); // 先展示弹窗，提升感知速度

      // 调用接口检查邮箱是否已注册
      const exists = await checkEmailExists(email.trim());

      if (exists) {
        // 邮箱已注册，显示弹窗引导登录
        setIsVerificationDialogOpen(false);
        setIsRegisteredDialogOpen(true);
        return;
      }

      // 邮箱未注册，弹出验证码输入框
      // 调用发送验证码接口
      await sendVerificationCode(email.trim(), invitationCode.trim());
      setIsSendingCode(false);
      // 弹窗已打开，此处只需关闭加载态
    } catch (err: any) {
      // 接口异常或网络错误，提示用户重试
      setIsVerificationDialogOpen(false);
      const errorMessage = err.message === 'Network error' 
        ? 'Network connection failed, please try again' 
        : err.message || 'Request failed, please try again.';
      alert(errorMessage);
    } finally {
      setIsSendingCode(false);
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    // 验证通过后调用 onNext 进入下一步
    // 实际应该调用验证验证码接口
    if (otpValue.length === 6) {
      try {
        setLoading(true);
        // 调用验证码校验接口
        const { token, userId } = await verifyCode(email.trim(), otpValue);
        
        // 保存 token（session 级），供后续页面使用
        if (token) {
          setTokens({ token, persist: 'session' });
          if (userId) {
              sessionStorage.setItem('userId', userId.toString());
          }
          setIsVerificationDialogOpen(false);
          onNext?.(email.trim(), invitationCode.trim());
        } else {
           // 如果没有 token，但后端返回 code: 1000，这通常意味着后端逻辑有问题（比如验证码错误却返回成功）
           // 或者后端确实没返回 token。
           // 无论哪种情况，我们都视为“验证失败”，并强制抛出错误，触发错误弹窗
           console.warn("Verification passed but no token found. Treating as failure.");
           throw new Error("Invalid verification code (Server Error)");
        }
      } catch (err: any) {
        // 验证失败，显示自定义弹窗，而不是 alert
        // const errorMessage = err.message === 'Network error' 
        //   ? 'Network connection failed, please try again' 
        //   : err.message || 'Verification failed, please try again.';
        // alert(errorMessage);
        setIsVerifyFailedDialogOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyInvitationCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      // 可选：添加一个简单的提示，如 toast。这里暂时不做复杂 UI 变动。
      // alert('Invitation code copied!'); 
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const isButtonDisabled = !email || !validateEmail(email) || !invitationCode.trim() || loading;

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      {/* 顶部 Header：包含返回按钮 */}
      <AuthHeader onBack={onBack} />

      {/* 页面标题区 */}
      <section className="mt-[40px] mb-[20px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Create</span>
          <span className="block">Account</span>
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Please sign up to continue</p>
      </section>

      {/* 注册表单区 */}
      <form 
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        {/* 邮箱输入框 */}
        <div className="flex flex-col gap-1 mb-[15px]">
          <Input 
            type="email" 
            placeholder="Email"
            autoComplete="email"
            containerClassName={emailError ? "border-red-500" : ""} 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
          />
          {emailError && <span className="text-red-500 text-xs px-1">{emailError}</span>}
        </div>

        {/* 邀请码输入框 (预填充 + 可编辑 + 复制) */}
        <div className="flex flex-col gap-1 mb-[15px]">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Invitation Code"
              autoComplete="off"
              value={invitationCode}
              className="pr-[40px]" 
              onChange={(e) => {
                setInvitationCode(e.target.value);
                if (invitationError) setInvitationError('');
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
          {invitationError && <span className="text-red-500 text-xs px-1">{invitationError}</span>}
        </div>
      </form>

      {/* 分隔符：OR */}
      <AuthDivider />

      {/* 社交注册按钮组 */}
      <section className="flex flex-col gap-[12px] mb-[12px]">
          <Button variant="social" icon={<GoogleIcon />}>
              Continue with Google
          </Button>
          
          <Button variant="social" icon={<AppleIcon />}>
              Continue with Apple
          </Button>
      </section>

      {/* 下一步按钮 */}
      <Button 
        variant="primary" 
        onClick={handleNext}
        className="mb-[15px]"
        icon={loading ? null : <ArrowRightIcon />}
        disabled={isButtonDisabled}
      >
          {loading ? 'Checking...' : 'Send Verification Code'}
      </Button>

      {/* 底部跳转登录 */}
      <footer className="flex items-center justify-center gap-1 mb-auto">
          <span className="text-text-muted text-lead">Already have an account?</span>
          <button 
            className="text-brand-primary text-lead font-semibold hover:underline"
            onClick={onSignIn}
          >
            Sign In
          </button>
      </footer>

      {/* 底部条款说明 */}
      <p className="mt-8 mb-6 text-tiny text-text-subtle text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>

      {/* 验证码弹窗 */}
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

      {/* 验证码错误提示弹窗 */}
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
                // 不关闭验证码输入框，让用户继续输入
                // setIsVerificationDialogOpen(true); // 已经是 true，不需要设
                setOtpValue(""); // 可选：清空输入框让用户重输
              }}
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 邮箱已注册提示弹窗 */}
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
