// 登录页面 (LoginPage)
// -----------------------------------------------------------------------------
// 已注册用户的入口页面。
// 主要职责：
// 1. 提供邮箱登录功能（输入邮箱后自动显示密码框）。
// 2. 支持第三方社交账号快捷登录 (Google, Apple)。
// 3. 提供注册跳转入口 (Sign Up)。
// 4. 展示服务条款提示。
// -----------------------------------------------------------------------------
import { useState, useEffect } from 'react';
import { AuthHeader } from '../../components/Auth/AuthHeader';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { AuthDivider } from '../../components/Auth/AuthDivider';
import { GoogleIcon, AppleIcon, ArrowRightIcon } from '../../components/Auth/AuthIcons';
import { Eye, EyeOff } from 'lucide-react';
import { setTokens } from '../../lib/tokenManager';
// 移除 Radix UI Alert Dialog，改用手写 Modal 以避免 Ref 问题
// import { ... } from "../../components/ui/alert-dialog";

interface LoginPageProps {
  onBack?: () => void;
  onSignUp?: () => void;
  onLogin?: () => void;
  onForgotPassword?: (email?: string) => void;
}

// 登录 API：仅走 email + password（无需验证码）
async function loginByEmail(email: string, password: string) {
  const res = await fetch('/api/admin/base/open/loginByEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  if (data?.code !== 1000) {
    // 将后端 message 透出，便于提示
    throw new Error(data?.message || 'Login failed');
  }
  return data.data;
}

export function LoginPage({ onBack, onSignUp, onLogin, onForgotPassword }: LoginPageProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false); // Controls if password field is visible
  const [showPasswordText, setShowPasswordText] = useState(false); // Controls password visibility (eye icon)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginFailedDialogOpen, setIsLoginFailedDialogOpen] = useState(false); // 控制登录失败弹窗

  // 调试日志：监控弹窗状态变化
  useEffect(() => {
    if (isLoginFailedDialogOpen) console.log("Login failed dialog opened");
  }, [isLoginFailedDialogOpen]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // 新增：找回密码时带上当前输入的邮箱
  const handleForgotPassword = () => {
    // 调用回调并传递当前邮箱
    onForgotPassword?.(email);
  };

  const handleLoginSubmit = async () => {
    // 1. Basic validation
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (showPasswordInput && !password) {
      setPasswordError('Password is required');
      return;
    }
    if (showPasswordInput && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // 2. Login via API（仅 email + password）
      const loginResult = await loginByEmail(email.trim(), password);
      
      // 登录成功：保存 token / refreshToken（含过期时间如果有）
      // 增强容错：如果后端只返回了 data，尝试从 data 中解构
      const rawData = loginResult.data || loginResult;

      const tokenPayload = {
        token: rawData.token,
        refreshToken: rawData.refreshToken,
        expire: rawData.expire || rawData.token_deadtime,
        refreshExpire: rawData.refreshExpire || rawData.refreshToken_deadtime,
        persist: 'local' as const,
      };
      
      setTokens(tokenPayload);
      onLogin?.();

    } catch (err: any) {
      console.error("Login error:", err);
      // 登录失败：显示通用错误弹窗，避免账号枚举风险
      setIsLoginFailedDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !email || !validateEmail(email) || (showPasswordInput && !password) || loading;
  // Button is green (primary) when valid, otherwise it might be disabled or default style.
  // The Button component likely handles disabled state styling.

  return (
    <main 
      className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white"
      onClick={() => {
        // Optional: click outside logic
      }}
    >
      {/* 顶部 Header：包含返回按钮 */}
      <AuthHeader onBack={onBack} />

      {/* 欢迎标题区 */}
      <section className="mt-[40px] mb-[20px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Welcome</span>
          <span className="block">Back!</span>
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Please sign in to continue</p>
      </section>

      {/* 登录表单区 */}
      <form 
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          handleLoginSubmit();
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
            onClick={(e) => {
              e.stopPropagation();
              setShowPasswordInput(true);
            }}
            onFocus={() => setShowPasswordInput(true)}
          />
          {emailError && <span className="text-red-500 text-xs px-1">{emailError}</span>}
        </div>

        {/* 密码输入框：仅在需要时显示 */}
        {showPasswordInput && (
          <div className="flex flex-col gap-1 mb-[15px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <Input 
                type={showPasswordText ? "text" : "password"} 
                placeholder="Password" 
                autoComplete="current-password"
                containerClassName={`mb-0 pr-[50px] ${passwordError ? "border-red-500" : ""}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                className="absolute right-[20px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                onClick={() => setShowPasswordText(!showPasswordText)}
                aria-label={showPasswordText ? "Hide password" : "Show password"}
              >
                {showPasswordText ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && <span className="text-red-500 text-xs px-1">{passwordError}</span>}
          </div>
        )}

        {/* 找回密码入口 - 仅在密码框显示时出现 */}
        {showPasswordInput && (
          <div className="flex justify-end mb-[15px] animate-in fade-in slide-in-from-top-1 duration-300">
            <button
              type="button"
              className="text-brand-primary text-sm font-medium hover:underline"
              onClick={() => {
                // TODO: 导航到找回密码页面
                handleForgotPassword();
              }}
            >
              Forgot Password?
            </button>
          </div>
        )}
      </form>

      {/* 分隔符：OR */}
      <AuthDivider />

      {/* 社交登录按钮组 */}
      <section 
        className="flex flex-col gap-[12px] mb-[12px]"
        onClick={(e) => e.stopPropagation()}
      >
          <Button variant="social" icon={<GoogleIcon />}>
              Continue with Google
          </Button>
          
          <Button variant="social" icon={<AppleIcon />}>
              Continue with Apple
          </Button>
      </section>

      {/* 邮箱登录/继续按钮 */}
      <Button 
        variant="primary" 
        onClick={(e) => {
            e.stopPropagation();
            handleLoginSubmit();
        }}
        className="mb-[15px]"
        icon={loading ? null : <ArrowRightIcon />}
        disabled={isButtonDisabled}
      >
          {loading ? 'Checking...' : 'Continue with Email'}
      </Button>

      {/* 底部跳转注册 */}
      <footer 
        className="flex items-center justify-center gap-1 mb-auto"
        onClick={(e) => e.stopPropagation()}
      >
          <span className="text-text-muted text-lead">Don't have an account?</span>
          <button 
            className="text-brand-primary text-lead font-semibold hover:underline"
            onClick={onSignUp}
          >
            Sign Up
          </button>
      </footer>

      {/* 底部条款说明 */}
      <p 
        className="mt-8 mb-6 text-tiny text-text-subtle text-center"
        onClick={(e) => e.stopPropagation()}
      >
          By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>

      {/* 登录失败弹窗 (Custom Modal) */}
      {isLoginFailedDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsLoginFailedDialogOpen(false)}
          />
          
          {/* Dialog Content */}
          <div className="relative bg-[#1a1a1a] border border-white/10 text-white rounded-[20px] w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h3 className="text-lg font-semibold">Login Failed</h3>
              <div className="text-[#b7b7bc] text-sm">
                <span>The email or password you entered is incorrect. Please try again.</span>
                <br /><br />
                <span className="text-xs text-[#888] block">
                  Forgot your password? 
                  <span 
                    className="text-[#b2dabb] font-medium cursor-pointer hover:underline mx-1"
                    onClick={() => {
                      setIsLoginFailedDialogOpen(false);
                      handleForgotPassword();
                    }}
                  >
                    Reset Password
                  </span> 
                </span>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-transparent hover:bg-white/10 text-white border border-white/20"
                onClick={() => setIsLoginFailedDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-[#b2dabb] text-black hover:bg-[#a1c9aa]"
                onClick={() => setIsLoginFailedDialogOpen(false)}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
