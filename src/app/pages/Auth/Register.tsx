// 注册页面 (RegisterPage)
// -----------------------------------------------------------------------------
// 该文件定义了用户注册流程的首个页面，负责邮箱验证和初步身份核验。
// 主要逻辑包括：格式校验、邮箱唯一性检查、验证码发送及验证。
// -----------------------------------------------------------------------------

import React from 'react'; // 引入 React 核心库以使用组件化开发功能
import { AuthHeader } from '../../components/Auth/AuthHeader'; // 引入权限页面公共头部组件
import { Input } from '../../components/Common/Input'; // 引入通用输入框组件
import { Button } from '../../components/Common/Button'; // 引入通用按钮组件
import { AuthDivider } from '../../components/Auth/AuthDivider'; // 引入“或”字样的横向分割线
import { GoogleIcon, AppleIcon, ArrowRightIcon } from '../../components/Auth/AuthIcons'; // 引入 Google、Apple 和 箭头图标
import { VerificationDialogContent } from '../../components/Auth/VerificationDialogContent'; // 引入验证码弹窗的 UI 内容
import { Dialog } from "../../components/ui/dialog"; // 引入基础弹窗容器组件
import { Copy } from 'lucide-react'; // 引入 Lucide 图标库中的复制图标
import { setTokens } from '../../lib/tokenManager'; // 引入 Token 存储和管理工具
import {
  AlertDialog, // 警告对话框根组件
  AlertDialogAction, // 警告对话框确认动作
  AlertDialogCancel, // 警告对话框取消动作
  AlertDialogContent, // 警告对话框内容容器
  AlertDialogDescription, // 警告对话框描述文本
  AlertDialogFooter, // 警告对话框底部操作区
  AlertDialogHeader, // 警告对话框头部区
  AlertDialogTitle, // 警告对话框标题
} from "../../components/ui/alert-dialog"; // 从 UI 库导入预定义的警告组件

// 定义组件接收的属性接口
interface RegisterPageProps {
  onBack?: () => void; // 点击返回按钮时的回调函数
  onSignIn?: () => void; // 点击“去登录”链接时的回调函数
  onNext?: (email: string, invitationCode: string) => void; // 注册成功并进入下一步资料设置时的回调函数
  initialEmail?: string; // 可选：从其他流程（如欢迎页）传进来的初始邮箱
  initialInvitationCode?: string; // 可选：从 URL 或缓存传进来的初始邀请码
}

// 定义系统默认的固定邀请码（若用户未提供则使用此值）
const DEFAULT_INVITATION_CODE = "dGVhbV81XzBfMF8xNA==";

/**
 * 异步函数：检查邮箱是否已经在系统注册过
 * @param email 待核对的邮箱地址字符串
 */
async function checkEmailExists(email: string): Promise<boolean> {
  const controller = new AbortController(); // 创建请求控制器，用于超时取消
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 设置 10 秒后自动强行中断请求

  try {
    const response = await fetch('/api/admin/base/open/exist', { // 请求后端检查接口
      method: 'POST', // 后端要求使用 POST 方法
      headers: { 'Content-Type': 'application/json' }, // 声明发送的数据是标准 JSON 格式
      // #############################################################################
      // 🔴 [重要 API 对接字段]: email
      // 作用: 后端据此在数据库检索用户是否存在。
      // #############################################################################
      body: JSON.stringify({ 
        email 
      }),
      signal: controller.signal, // 将中断信号与 fetch 绑定
    });

    clearTimeout(timeoutId); // 请求成功返回，清除定时器

    if (!response.ok) { // 如果 HTTP 状态码不是 200-299 范围
      throw new Error('Network error'); // 抛出网络异常
    }

    const data = await response.json(); // 将响应体解析为 JSON 对象

    if (data?.code !== 1000) { // 检查后端约定的业务成功码是否为 1000
      throw new Error(data?.message || 'Request failed'); // 否则显示后端返回的错误信息
    }

    const existsRaw = data.data; // 获取后端返回的 data 字段
    // 将 data.data 规范化为 JS 布尔值
    const isRegistered = existsRaw === true || existsRaw === 'true' || existsRaw === 1;
    return isRegistered; // 返回 true 表示已注册，false 表示新用户
  } catch (error: any) {
    clearTimeout(timeoutId); // 出错清理
    if (error.name === 'AbortError') { 
      throw new Error('Request timed out. Please try again.'); 
    }
    throw error; 
  }
}

/**
 * 异步函数：请求后端发送 6 位邮箱验证码
 */
async function sendVerificationCode(email: string, invitationCode: string): Promise<void> {
  const controller = new AbortController(); // 初始化请求中断逻辑
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时设置

  try {
    const response = await fetch('/api/admin/base/open/sendCode', { // 请求发送验证码接口
      method: 'POST', // POST 方式提交
      headers: { 'Content-Type': 'application/json' }, // 设置 JSON 头
      // #############################################################################
      // 🔴 [重要 API 对接字段]: email, invitation
      // email: 接收验证码的邮箱
      // invitation: 用户的邀请码，后端用于绑定推荐关系
      // #############################################################################
      body: JSON.stringify({ 
        email,      
        invitation: invitationCode 
      }),
      signal: controller.signal, // 绑定中断控制器
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

/**
 * 异步函数：校验用户输入的验证码并获取登录凭证
 */
async function verifyCode(email: string, code: string): Promise<{ token: string; userId?: number }> {
  const controller = new AbortController(); // 创建控制器
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒限制

  try {
    const response = await fetch('/api/admin/base/open/verifyCode', { // 请求校验接口
      method: 'POST', // POST 提交方式
      headers: { 'Content-Type': 'application/json' }, // 标准 JSON 头
      // #############################################################################
      // 🔴 [重要 API 对接字段]: email, code
      // email: 待验证的邮箱
      // code: 用户收到的 6 位数字验证码
      // #############################################################################
      body: JSON.stringify({ 
        email, 
        code   
      }),
      signal: controller.signal, // 挂载中断信号
    });

    clearTimeout(timeoutId); 

    if (!response.ok) { 
      throw new Error('Network error'); 
    }

    const data = await response.json(); 

    if (data.code !== 1000) { 
      throw new Error(data.message || 'Verification failed'); 
    }
    
    // #############################################################################
    // 🔴 [API 响应关键字段提取]
    // token: 登录凭证，后续所有请求必须带上
    // userId: 用户唯一ID，必须传递给资料设置页
    // #############################################################################
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

// 主组件：注册页面实现
export function RegisterPage({ onBack, onSignIn, onNext, initialEmail = '', initialInvitationCode = DEFAULT_INVITATION_CODE }: RegisterPageProps) {
  // 定义本地状态
  const [email, setEmail] = React.useState(initialEmail); 
  const [invitationCode, setInvitationCode] = React.useState(initialInvitationCode || DEFAULT_INVITATION_CODE); 
  const [emailError, setEmailError] = React.useState(''); 
  const [invitationError, setInvitationError] = React.useState(''); 
  const [loading, setLoading] = React.useState(false); 
  const [isRegisteredDialogOpen, setIsRegisteredDialogOpen] = React.useState(false); 
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = React.useState(false); 
  const [isSendingCode, setIsSendingCode] = React.useState(false); 
  const [isVerifyFailedDialogOpen, setIsVerifyFailedDialogOpen] = React.useState(false); 
  const [otpValue, setOtpValue] = React.useState(""); 

  // 监听 Props 变化
  React.useEffect(() => {
    if (initialEmail) { 
      setEmail(initialEmail); 
    }
    setInvitationCode(initialInvitationCode || DEFAULT_INVITATION_CODE);
  }, [initialEmail, initialInvitationCode]); 

  // 辅助函数：校验邮箱格式
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return re.test(email); 
  };

  /**
   * 提交表单逻辑
   */
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
    if (!invitationCode.trim()) { 
      setInvitationError('Invitation code is required'); 
      return; 
    }

    try {
      setLoading(true); 
      setIsSendingCode(true); 
      setIsVerificationDialogOpen(true); 

      const exists = await checkEmailExists(email.trim());

      if (exists) { 
        setIsVerificationDialogOpen(false); 
        setIsRegisteredDialogOpen(true); 
        return; 
      }

      await sendVerificationCode(email.trim(), invitationCode.trim());
      setIsSendingCode(false); 
    } catch (err: any) {
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

  /**
   * 验证逻辑
   */
  const handleVerify = async () => {
    if (otpValue.length === 6) { 
      try {
        setLoading(true);
        const { token, userId } = await verifyCode(email.trim(), otpValue);
        
        if (token) { 
          // #############################################################################
          // 🔴 [关键缓存逻辑]
          // 必须将 token 存入 session，否则后续 authFetch 会报 401
          // 必须将 userId 存入 session，否则 ProfileSetup.tsx 无法进行资料绑定！
          // #############################################################################
          setTokens({ token, persist: 'session' });
          if (userId) { 
              sessionStorage.setItem('userId', userId.toString());
          }
          setIsVerificationDialogOpen(false); 
          onNext?.(email.trim(), invitationCode.trim()); 
        } else {
           console.warn("Verification passed but no token found."); 
           throw new Error("Invalid verification code (Server Error)"); 
        }
      } catch (err: any) {
        setIsVerifyFailedDialogOpen(true); 
      } finally {
        setLoading(false); 
      }
    }
  };

  /**
   * 复制功能
   */
  const handleCopyInvitationCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode); 
    } catch (err) {
      console.error('Failed to copy: ', err); 
    }
  };

  // 按钮禁用计算
  const isButtonDisabled = !email || !validateEmail(email) || !invitationCode.trim() || loading;

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      <AuthHeader onBack={onBack} />

      <section className="mt-[40px] mb-[20px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Create</span> 
          <span className="block">Account</span> 
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Please sign up to continue</p> 
      </section>

      <form 
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault(); 
          handleNext(); 
        }}
      >
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

      <AuthDivider />

      <section className="flex flex-col gap-[12px] mb-[12px]">
          <Button variant="social" icon={<GoogleIcon />}>
              Continue with Google
          </Button>
          
          <Button variant="social" icon={<AppleIcon />}>
              Continue with Apple
          </Button>
      </section>

      <Button 
        variant="primary" 
        onClick={handleNext} 
        className="mb-[15px]"
        icon={loading ? null : <ArrowRightIcon />} 
        disabled={isButtonDisabled} 
      >
          {loading ? 'Checking...' : 'Send Verification Code'} 
      </Button>

      <footer className="flex items-center justify-center gap-1 mb-auto">
          <span className="text-text-muted text-lead">Already have an account?</span>
          <button 
            className="text-brand-primary text-lead font-semibold hover:underline" 
            onClick={onSignIn} 
          >
            Sign In
          </button>
      </footer>

      <p className="mt-8 mb-6 text-tiny text-text-subtle text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>

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
