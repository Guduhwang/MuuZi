// 登录页面 (LoginPage)
// -----------------------------------------------------------------------------
// 该页面是已注册用户的核心入口。
// 
// 主要职责：
// 1. 邮箱登录逻辑：提供邮箱与密码的验证流程。
// 2. 交互体验：实现邮箱输入后的平滑过渡动画，动态展示密码框及找回密码入口。
// 3. 第三方集成：预留 Google、Apple 等社交账号登录入口，提升转化率。
// 4. 安全反馈：针对登录失败提供友好的弹窗提示，并引导用户进行密码重置。
//
// 布局与适配：
// - 采用 Mobile-first 策略，全宽单列布局 (393x852)。
// - 适配 100dvh 以处理移动端浏览器底部遮挡问题。
// - 遵循语义化 HTML 结构 (main, section, form, footer)。
// -----------------------------------------------------------------------------
import { useState } from 'react';
import { AuthHeader } from '../../components/Auth/AuthHeader';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { AuthDivider } from '../../components/Auth/AuthDivider';
import { GoogleIcon, AppleIcon, ArrowRightIcon } from '../../components/Auth/AuthIcons';
import { Eye, EyeOff } from 'lucide-react';
import { setTokens } from '../../lib/tokenManager';

interface LoginPageProps {
  onBack?: () => void;
  onSignUp?: () => void;
  onLogin?: () => void;
  onForgotPassword?: (email?: string) => void;
}

/**
 * 登录 API 调用 (loginByEmail)
 * 业务逻辑：根据项目规范 (Rule 13) 封装，包含必要的 Header。
 */
async function loginByEmail(email: string, password: string) {
  // 根据 Rule 13 确定的 Base URL
  const baseUrl = '/dev/admin/base'; 
  
  const res = await fetch(`${baseUrl}/open/loginByEmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 🔴 [多语言支持]: 必须传递 language 头以对齐后端字典映射
      'language': 'en' 
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error('Network error');
  const data = await res.json();

  // 🔴 [成功码校验]: 严格检查 code === 1000
  if (data?.code !== 1000) {
    throw new Error(data?.message || 'Login failed');
  }
  return data.data;
}

export function LoginPage({ onBack, onSignUp, onLogin, onForgotPassword }: LoginPageProps) {
  // -----------------------------------------------------------------------------
  // 状态定义 (States)
  // -----------------------------------------------------------------------------
  
  // 交互控制
  const [showPasswordInput, setShowPasswordInput] = useState(false); // 控制密码框是否展示
  const [showPasswordText, setShowPasswordText] = useState(false);  // 切换密码明文/密文
  const [isLoginFailedDialogOpen, setIsLoginFailedDialogOpen] = useState(false); // 登录失败弹窗状态
  const [errorMessage, setErrorMessage] = useState(''); // 存储具体的错误提示信息

  // 表单数据 (组合状态：建议 4)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // 校验与反馈
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------------------
  // 业务逻辑 (Business Logic)
  // -----------------------------------------------------------------------------

  /**
   * 邮箱格式校验
   */
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  /**
   * 处理邮箱失去焦点 (onBlur)
   * 交互体验：仅在邮箱合法时才展开密码框 (建议 2)
   */
  const handleEmailBlur = () => {
    if (validateEmail(formData.email)) {
      setShowPasswordInput(true);
    }
  };
  
  /**
   * 找回密码处理
   */
  const handleForgotPassword = () => {
    onForgotPassword?.(formData.email);
  };

  /**
   * 登录提交主逻辑
   * 职责：执行前端校验 -> 调用 API -> 处理 Token 存储 -> 路由跳转或错误反馈。
   */
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // 🔴 [键盘收起]: 提交开始时立即收起移动端键盘 (建议 2)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 重置错误状态
    setEmailError('');
    setPasswordError('');
    setErrorMessage('');

    // 前端基础校验
    if (!formData.email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (showPasswordInput && !formData.password) {
      setPasswordError('Password is required');
      return;
    }
    if (showPasswordInput && formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // 执行登录
      const loginResult = await loginByEmail(formData.email.trim(), formData.password);
      
      // 成功处理：规范化 Token 数据模型 (Rule 14)
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
      // 🔴 [监控与反馈]: 增加调试日志及细化错误展示 (建议 3)
      console.error("Login Error:", err);
      setErrorMessage(err.message || 'The email or password you entered is incorrect. Please try again.');
      setIsLoginFailedDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !formData.email || !validateEmail(formData.email) || (showPasswordInput && !formData.password) || loading;

  return (
    <main 
      className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white"
    >
      {/* 顶部头部导航: 返回功能 */}
      <AuthHeader onBack={onBack} />

      {/* 欢迎语区域 (Header Section) */}
      <section className="mt-[40px] mb-[20px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Welcome</span>
          <span className="block">Back!</span>
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Please sign in to continue</p>
      </section>

      {/* 登录表单主体 (Login Form) - 统一管理提交逻辑 (建议 1) */}
      <form className="flex flex-col" onSubmit={handleLoginSubmit}>
        {/* 邮箱输入 (Email Input Wrapper) */}
        <div className="flex flex-col gap-1 mb-[15px]">
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            containerClassName={emailError ? "border-red-500" : ""}
            value={formData.email}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, email: e.target.value }));
              if (emailError) setEmailError('');
            }}
            onBlur={handleEmailBlur}
          />
          {emailError && <span className="text-red-500 text-xs px-1" role="alert">{emailError}</span>}
        </div>

        {/* 密码输入 (Password Input Wrapper) - 带过渡动画 */}
        {showPasswordInput && (
          <div className="flex flex-col gap-1 mb-[15px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <Input 
                type={showPasswordText ? "text" : "password"} 
                placeholder="Password" 
                autoComplete="current-password"
                containerClassName={`mb-0 pr-[50px] ${passwordError ? "border-red-500" : ""}`}
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  if (passwordError) setPasswordError('');
                }}
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
            {passwordError && <span className="text-red-500 text-xs px-1" role="alert">{passwordError}</span>}
          </div>
        )}

        {/* 忘记密码跳转 (Forgot Password Link) */}
        {showPasswordInput && (
          <div className="flex justify-end mb-[15px] animate-in fade-in slide-in-from-top-1 duration-300">
            <button
              type="button"
              className="text-brand-primary text-sm font-medium hover:underline"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* 邮箱登录主操作按钮 - 移动至 Form 内部并支持 Submit (建议 1) */}
        <Button 
          type="submit"
          variant="primary" 
          className="mb-[15px]"
          icon={loading ? null : <ArrowRightIcon />}
          disabled={isButtonDisabled}
        >
            {loading ? 'Checking...' : 'Continue with Email'}
        </Button>
      </form>

      {/* 视觉分割线 */}
      <AuthDivider />

      {/* 第三方快捷登录 (Social Login) (建议 4: 移除不必要的 stopPropagation) */}
      <section className="flex flex-col gap-[12px] mb-[12px]">
          <Button variant="social" icon={<GoogleIcon />}>
              Continue with Google
          </Button>
          
          <Button variant="social" icon={<AppleIcon />}>
              Continue with Apple
          </Button>
      </section>

      {/* 注册引导区域 (Footer Navigation) */}
      <footer className="flex items-center justify-center gap-1 mb-auto">
          <span className="text-text-muted text-lead">Don't have an account?</span>
          <button 
            className="text-brand-primary text-lead font-semibold hover:underline"
            onClick={onSignUp}
          >
            Sign Up
          </button>
      </footer>

      {/* 合规性说明 (Compliance Footer) */}
      <p className="mt-8 mb-6 text-tiny text-text-subtle text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>

      {/* 🔴 [登录失败自定义弹窗]: 支持细化错误提示 (建议 3) */}
      {isLoginFailedDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 (Backdrop) */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsLoginFailedDialogOpen(false)}
          />
          
          {/* 弹窗主体 (Dialog Body) */}
          <div className="relative bg-app-dark border border-white/10 text-white rounded-[20px] w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h3 className="text-lg font-semibold">Login Failed</h3>
              <div className="text-text-muted text-sm">
                <span>{errorMessage}</span>
                <br /><br />
                <span className="text-xs text-text-subtle block">
                  Forgot your password? 
                  <span 
                    className="text-brand-primary font-medium cursor-pointer hover:underline mx-1"
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
            
            {/* 弹窗按钮组 (Action Buttons) */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-transparent hover:bg-white/10 text-white border border-white/20"
                onClick={() => setIsLoginFailedDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-brand-primary text-black hover:bg-brand-primary/90"
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
