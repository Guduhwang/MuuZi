// 找回密码页面 (ForgotPasswordPage)
// -----------------------------------------------------------------------------
// 处理用户忘记密码的流程。
// 主要职责：
// 1. 第一步：输入注册邮箱，请求发送重置验证码。
// 2. 第二步：输入验证码验证身份 (VerificationDialog)。
// 3. 第三步：设置并确认新密码。
// 4. 完成重置后直接登录，进入首页。
//
// 布局考虑：
// - 移动端优先：采用单列全宽布局，适应 393x852 设计稿。
// - 语义化结构：使用 main, section, form, label 等元素。
// - 交互体验：包含密码强度校验、Loading 状态、弹窗验证。
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

// 右箭头图标：用于主操作按钮
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

export function ForgotPasswordPage({ onBack, onLogin, initialEmail = "" }: ForgotPasswordPageProps) {
  // -----------------------------------------------------------------------------
  // 状态定义 (States)
  // -----------------------------------------------------------------------------
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [dialogDescription, setDialogDescription] = useState(`We've sent a code to ${initialEmail || 'your email'}.`);
  const [dialogButtonText, setDialogButtonText] = useState("Verify Code");
  const [isDialogBusy, setIsDialogBusy] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [passwordError, setPasswordError] = useState("");
  const [, setLoading] = useState(false);

  // -----------------------------------------------------------------------------
  // 业务逻辑与校验 (Logic & Validation)
  // -----------------------------------------------------------------------------

  // 密码强度校验逻辑
  const validatePassword = (pwd: string) => {
    if (/\s/.test(pwd)) {
      return { valid: false, strength: 'weak' as const, error: "No spaces allowed" };
    }

    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (hasLength && hasUpper && hasLower && hasNumber) {
      strength = 'strong';
    } else if (hasLength && typeCount >= 2) {
      strength = 'medium';
    }

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
    setNewPassword(val);

    if (!val) {
      setPasswordError("");
      setPasswordStrength('');
      return;
    }

    const result = validatePassword(val);
    setPasswordStrength(result.strength);
    setPasswordError(result.valid ? "" : result.error);
  };

  // -----------------------------------------------------------------------------
  // 接口对接 (API Calls)
  // -----------------------------------------------------------------------------

  // 1. 发送重置验证码
  const handleSendCode = async () => {
    if (email) {
      try {
        setLoading(true);
        setIsDialogOpen(true);
        setIsDialogBusy(true);
        setDialogButtonText("Sending...");
        setDialogDescription(`Sending code to ${email.trim()}...`);
        
        // 使用通用的发送验证码接口
        const response = await fetch('/api/admin/base/open/sendCode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });

        if (!response.ok) {
           throw new Error(`Failed to send code: ${response.status}`);
        }
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        if (!text || data.code === 1000) {
           setDialogDescription(`We've sent a code to ${email.trim()}.`);
           setDialogButtonText("Verify Code");
           setIsDialogBusy(false);
        } else {
           // 容错：如果后端需要 invitation
           if (data.message?.includes("invitation")) {
               const retryResponse = await fetch('/api/admin/base/open/sendCode', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email.trim(), invitation: "reset" }),
               });
               const retryData = await retryResponse.json();
               if (retryData.code === 1000) {
                   setDialogDescription(`We've sent a code to ${email.trim()}.`);
                   setDialogButtonText("Verify Code");
                   setIsDialogBusy(false);
                   return;
               }
           }
           alert(data.message || "Failed to send code");
           setIsDialogOpen(false);
        }
      } catch (error: any) {
        alert(error.message || "Network error");
        setIsDialogOpen(false);
      } finally {
        setIsDialogBusy(false);
        setDialogButtonText("Verify Code");
        setLoading(false);
      }
    }
  };

  // 2. 验证收到的验证码
  const handleVerify = async () => {
     if (otpValue.length !== 6) return;
     
     try {
       setLoading(true);
       setIsDialogBusy(true);
       setDialogButtonText("Verifying...");
       
       const response = await fetch('/api/admin/base/open/verifyCode', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: email.trim(), code: otpValue }),
       });

       const data = await response.json();

       if (data.code === 1000) {
          setVerifiedCode(otpValue);
         setIsDialogOpen(false);
         setStep('reset');
       } else {
         alert(data.message || "Invalid verification code");
       }
     } catch (error: any) {
       alert(error.message || "Verification failed");
     } finally {
       setLoading(false);
      setIsDialogBusy(false);
      setDialogButtonText("Verify Code");
     }
  };

  // 3. 执行重置密码并自动登录
  const handleResetAndLogin = async () => {
      if (newPassword && confirmPassword) {
          if (!verifiedCode) {
            alert("Please verify the code first.");
            setStep('email');
            return;
          }

          const result = validatePassword(newPassword);
          if (!result.valid) {
            alert(result.error);
            return;
          }

          if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
          }

          try {
            setLoading(true);
            
            // 步骤 1: 重置密码
            const resetResponse = await fetch('/api/admin/base/sys/user/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    code: verifiedCode,
                    password: newPassword
                })
            });

            if (!resetResponse.ok) {
              const errText = await resetResponse.text();
              throw new Error(errText || 'Failed to reset password');
            }

            const resetData = await resetResponse.json();
            if (resetData.code !== 1000) {
              throw new Error(resetData.message || 'Failed to reset password');
            }

            // 步骤 2: 重置成功后执行登录
            const loginResponse = await fetch('/api/admin/base/open/loginByEmail', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ email: email.trim(), password: newPassword })
            });

            if (!loginResponse.ok) {
              const errText = await loginResponse.text();
              throw new Error(errText || 'Failed to login after reset');
            }

            const loginData = await loginResponse.json();
            if (loginData?.code !== 1000) {
              throw new Error(loginData?.message || 'Login failed after reset');
            }

            // 存储认证令牌并跳转
            setTokens({
              token: loginData.data?.token,
              refreshToken: loginData.data?.refreshToken,
              expire: loginData.data?.expire,
              refreshExpire: loginData.data?.refreshExpire,
              persist: 'local',
            });

            alert("Password reset successfully. Redirecting to Home...");
            onLogin?.();
          } catch (error: any) {
            alert(error.message || "Network error");
          } finally {
            setLoading(false);
          }
      }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      {/* 顶部导航区 (Header Section) */}
      <AuthHeader onBack={step === 'email' ? onBack : () => setStep('email')} />

      {step === 'email' ? (
        <>
            {/* 第一步：邮箱输入标题区 (Email Step Header) */}
            <section className="mt-[40px] mb-[20px]">
                <h1 className="text-display font-semibold">
                <span className="text-brand-primary block">Forgot</span>
                <span className="block">Password</span>
                </h1>
                <p className="text-text-muted text-lead mt-4 text-center w-full">
                Enter your email address to receive a verification code to reset your password.
                </p>
            </section>

            {/* 邮箱输入表单 (Email Form) */}
            <form 
                className="flex flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (email) handleSendCode();
                }}
            >
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
                        aria-required="true"
                    />
                </div>

                {/* 发送验证码按钮 (Submit Button) */}
                <Button 
                    variant="primary"
                    className="mb-[15px] shadow-lg"
                    icon={<ArrowRightIcon />}
                    disabled={!email}
                    type="submit"
                    aria-label="Send verification code to your email"
                >
                    Send verification code
                </Button>
            </form>
        </>
      ) : (
        <>
            {/* 第二步：重置密码标题区 (Reset Step Header) */}
            <section className="mt-[40px] mb-[20px]">
                <h1 className="text-display font-semibold">
                <span className="text-brand-primary block">Reset</span>
                <span className="block">Password</span>
                </h1>
                <p className="text-text-muted text-lead mt-4 text-center w-full">
                Enter your new password below.
                </p>
            </section>

            {/* 重置密码表单 (Reset Form) */}
            <form
                className="flex flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleResetAndLogin();
                }}
            >
                {/* 只读邮箱显示 (Read-only Email) */}
                <div className="mb-[15px] opacity-60">
                    <label htmlFor="readonly-email" className="sr-only">Your Email</label>
                    <Input 
                        id="readonly-email"
                        type="email"
                        value={email}
                        readOnly
                        aria-readonly="true"
                    />
                </div>

                {/* 新密码输入 (New Password Input) */}
                <div className="relative mb-[30px]">
                  <div className="relative">
                    <label htmlFor="new-password" className="sr-only">New Password</label>
                    <Input 
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        containerClassName={`mb-0 pr-[50px] transition-colors ${
                            passwordError ? "border-red-500" : 
                            passwordStrength === 'strong' ? "border-green-500" :
                            passwordStrength === 'medium' ? "border-orange-500" :
                            ""
                        }`}
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        autoFocus
                        required
                    />
                    {/* 切换密码显示按钮 (Toggle Visibility) */}
                    <button
                      type="button"
                      className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#b7b7bc] hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* 密码强度指示器 (Password Strength Indicator) */}
                  {newPassword && (
                      <div className="flex flex-col gap-1.5 mt-2 w-[60%] mx-auto" aria-live="polite">
                          <div className="flex gap-1 h-1 w-full">
                              <div className={`flex-1 rounded-full transition-all duration-300 ${
                                  passwordStrength ? (
                                      passwordStrength === 'weak' ? 'bg-red-500' :
                                      passwordStrength === 'medium' ? 'bg-orange-500' :
                                      'bg-green-500'
                                  ) : 'bg-white/10'
                              }`} />
                              <div className={`flex-1 rounded-full transition-all duration-300 ${
                                  (passwordStrength === 'medium' || passwordStrength === 'strong') ? (
                                      passwordStrength === 'medium' ? 'bg-orange-500' :
                                      'bg-green-500'
                                  ) : 'bg-white/10'
                              }`} />
                              <div className={`flex-1 rounded-full transition-all duration-300 ${
                                  passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/10'
                              }`} />
                          </div>

                          <div className="flex justify-between items-start">
                              <span className={`text-xs font-medium transition-colors ${
                                  passwordStrength === 'weak' ? 'text-red-500' :
                                  passwordStrength === 'medium' ? 'text-orange-500' :
                                  passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-400'
                              }`}>
                                  {passwordStrength ? (passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)) : ''}
                              </span>
                              {passwordStrength !== 'strong' && (
                                  <span className="text-[10px] text-gray-500 text-right">
                                      8+ chars, Uppercase, Lowercase, Number
                                  </span>
                              )}
                          </div>
                      </div>
                  )}
                  {passwordError && <span className="text-red-500 text-xs px-1 mt-1 block text-center" role="alert">{passwordError}</span>}
                </div>

                {/* 确认密码输入 (Confirm Password Input) */}
                {newPassword && (
                  <div className="relative mb-[30px] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                      <Input 
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          containerClassName={`mb-0 pr-[50px] transition-colors ${
                              confirmPassword && newPassword !== confirmPassword ? "border-red-500" : ""
                          }`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                      />
                      <button
                          type="button"
                          className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#b7b7bc] hover:text-white transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                        <span className="text-red-500 text-xs px-1 mt-1 block text-center" role="alert">Passwords do not match</span>
                    )}
                  </div>
                )}

                {/* 重置并登录按钮 (Submit Button) */}
                <Button 
                    variant="primary"
                    className="mb-[15px] shadow-lg"
                    icon={<ArrowRightIcon />}
                    disabled={
                      !newPassword ||
                      !confirmPassword ||
                      passwordStrength !== 'strong' ||
                      newPassword !== confirmPassword
                    }
                    type="submit"
                >
                    Login
                </Button>
            </form>
        </>
      )}

      {/* 验证码校验弹窗 (OTP Dialog) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <VerificationDialogContent 
          otpValue={otpValue}
          setOtpValue={setOtpValue}
          onVerify={handleVerify}
          title="Enter Verification Code"
          description={dialogDescription}
          buttonText={dialogButtonText}
          isVerifying={isDialogBusy}
        />
      </Dialog>
    </main>
  );
}
