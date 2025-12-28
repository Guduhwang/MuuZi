// 个人信息设置页面 (ProfileSetupPage)
// -----------------------------------------------------------------------------
// 注册流程中的资料完善环节。
// 主要职责：
// 1. 头像上传与预览 (Avatar Upload)。
// 2. 设置用户昵称 (Nickname)。
// 3. 选择感兴趣的行业标签 (Industry Selection)。
// 4. 数据校验与保存，完成后进入推荐关注流程。
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { AuthHeader } from '../../components/Auth/AuthHeader';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { ArrowRightIcon } from '../../components/Auth/AuthIcons';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Camera, Plus, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { authFetch, getValidAccessToken } from '../../lib/tokenManager';
import { normalizeAvatarUrl } from '../../components/ui/utils';

const INDUSTRIES = [
    { id: 1, label: "Technology" },
    { id: 2, label: "Design" },
    { id: 3, label: "Business" },
    { id: 4, label: "Marketing" },
    { id: 5, label: "Art" },
    { id: 6, label: "Education" },
    { id: 7, label: "Health" },
    { id: 8, label: "Finance" },
];

interface ProfileSetupPageProps {
  onBack?: () => void;
  onSave?: () => void;
  email?: string;
  invitationCode?: string;
  inviteCode?: string;
  userId?: number;
}

// 默认头像列表 (位于 public/default-avatars 目录)
const DEFAULT_AVATARS = [
  '/default-avatars/avatar1.png',
  '/default-avatars/avatar2.png',
  '/default-avatars/avatar3.png',
  '/default-avatars/avatar4.png',
];

const getRandomAvatar = (excludeUrl?: string) => {
  const pool = DEFAULT_AVATARS.filter((url) => url !== excludeUrl);
  if (pool.length === 0) return DEFAULT_AVATARS[0];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
};

// 昵称唯一性校验接口（按 API_RULES：/sys/user/isExist，优先带 Authorization；无 token 时也尝试调用并给出友好提示）
async function checkNicknameExists(nickName: string, signal?: AbortSignal): Promise<boolean> {
  const response = await authFetch('/api/admin/base/sys/user/isExist', {
    method: 'POST',
    // 同时传递 nickName 和 name，以确保后端能正确进行全量查重（部分后端实现可能依赖 name）
    body: JSON.stringify({ nickName, name: nickName }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Network error');
  }

  const data = await response.json();
  if (data?.code !== 1000) {
    const err: any = new Error(data?.message || 'Request failed');
    err.code = data?.code;
    throw err;
  }

  const existsRaw = data.data;
  return existsRaw === true || existsRaw === 'true' || existsRaw === 1;
}

export function ProfileSetupPage({
  onBack,
  onSave,
  email: initialEmail = "",
  invitationCode = "",
  inviteCode = "",
  userId: initialUserId,
}: ProfileSetupPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [nickname, setNickname] = useState("");

  // 如果 props email 变化了，更新内部状态
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 新增：确认密码状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 新增：确认密码显示状态
  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([]);
  // 初始时随机选择一个默认头像
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // 初始为空，注册场景直接用随机头像
  const [userId, setUserId] = useState<number | undefined>(initialUserId);

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [isIndustryDialogOpen, setIsIndustryDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [nicknameError, setNicknameError] = useState("");
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  // Error Dialog State
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [errorDialogTitle, setErrorDialogTitle] = useState("");
  
  // 注册流程不需要请求后端头像

  // Password validation helper
  const validatePassword = (pwd: string) => {
    // Rule 1: No spaces allowed
    if (/\s/.test(pwd)) {
      return { valid: false, strength: 'weak' as const, error: "No spaces allowed" };
    }

    // Basic criteria
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    
    // Count satisfied character types (excluding length)
    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    
    if (hasLength && hasUpper && hasLower && hasNumber) {
        strength = 'strong';
    } else if (hasLength && typeCount >= 2) {
        strength = 'medium';
    } else {
        strength = 'weak';
    }

    // Return result
    // Strong is required for validity based on "ALL must be satisfied" requirement
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

  React.useEffect(() => {
    // 注册场景：直接给一个随机默认头像
    setAvatarUrl(getRandomAvatar());
  }, []);

  React.useEffect(() => {
    // 尝试获取当前用户信息，以拿到 id / avatar 等字段
    if (userId) return;

    // 兜底方案：先从本地存储查一下，也许 Register/Login 已经存了
    const storedId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    if (storedId) {
        const parsed = parseInt(storedId, 10);
        if (!isNaN(parsed)) {
            setUserId(parsed);
            return;
        }
    }

    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const res = await authFetch('/api/admin/base/comm/person', {
          method: 'GET',
          signal: controller.signal,
        });
        if (!res.ok) {
            console.warn(`Fetch person failed with status: ${res.status}`);
            return;
        }
        const data = await res.json();
        const currentId = data?.data?.id ?? data?.data?.userId;
        if (currentId) {
            setUserId(currentId);
            sessionStorage.setItem('userId', currentId.toString()); // 同步到存储
        }
        if (!avatarUrl && data?.data?.avatar) {
          setAvatarUrl(data.data.avatar);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Fetch profile failed', err);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [userId, avatarUrl]);

  // 昵称唯一性校验（输入防抖 + 可取消）
  React.useEffect(() => {
    if (!nickname.trim()) {
      setNicknameStatus('idle');
      setNicknameError("");
      return;
    }

    const controller = new AbortController();
    const debounceId = setTimeout(async () => {
      // 只有当没有显式错误时才进入 checking 状态，避免闪烁
      setNicknameStatus('checking'); 
      setNicknameError("");
      
      try {
        const exists = await checkNicknameExists(nickname.trim(), controller.signal);
        if (exists) {
            setNicknameStatus('taken');
            // setNicknameError("Nickname already taken"); // Optional: if you want text below input immediately
        } else {
            setNicknameStatus('available');
            setNicknameError("");
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("Nickname check error:", err);
        
        // 如果是 401，可能是 token 过期，暂时不阻断用户输入，但在提交时会再次校验
        if (err.code === 401 || err.message === 'Unauthorized') {
             setNicknameStatus('idle'); 
        } else {
             // 显示具体的检查错误，而不是静默失败
             setNicknameStatus('idle'); // 保持 idle 状态避免阻断
             setNicknameError("Unable to verify nickname"); // 但显示错误文字
        }
      }
    }, 500);

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [nickname]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    
    if (!val) {
      setPasswordError("");
      setPasswordStrength('');
      return;
    }
    
    const result = validatePassword(val);
    setPasswordStrength(result.strength);
    setPasswordError(result.valid ? "" : result.error);
  };

  const toggleIndustry = (industryId: number) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industryId));
    } else {
      setSelectedIndustries([...selectedIndustries, industryId]);
    }
  };

  const handleNextStep = () => {
    // 1. Basic validation
    if (isButtonDisabled) return;

    // 2. Validate Password Strength
    const result = validatePassword(password);
    if (!result.valid) {
      setErrorDialogTitle("Password Too Weak");
      setErrorDialogMessage(result.error);
      setIsErrorDialogOpen(true);
      return;
    }

    // 3. Validate Password Match
    if (password !== confirmPassword) {
      setErrorDialogTitle("Passwords Do Not Match");
      setErrorDialogMessage("Please ensure both passwords match.");
      setIsErrorDialogOpen(true);
      return;
    }

    // 4. Open Industry Selection Dialog
    setIsIndustryDialogOpen(true);
  };

  const handleFinalSave = async () => {
    // 1. 强力校验 userId，如果缺失则报错，避免发送非法请求触发 500
    let currentUserId = userId;
    if (!currentUserId) {
        // 尝试从 sessionStorage 或 localStorage 中读取已存的 id (可能被 Register 或 Login 存入)
        const stored = sessionStorage.getItem('userId') || localStorage.getItem('userId');
        if (stored) {
            currentUserId = parseInt(stored, 10);
            if (!isNaN(currentUserId)) {
                setUserId(currentUserId);
            }
        }
    }

    if (!currentUserId) {
        setErrorDialogTitle("Identity Missing");
        setErrorDialogMessage("Your user ID could not be determined. Please try refreshing the page or logging in again.");
        setIsErrorDialogOpen(true);
        return;
    }

    // 2. 昵称重复性已在输入时校验，这里仅做双重保险
    if (nicknameStatus === 'taken') {
      setErrorDialogTitle("Nickname Taken");
      setErrorDialogMessage("Nickname is already taken. Please choose another one.");
      setIsErrorDialogOpen(true);
      return;
    }
    if (nicknameStatus === 'checking') {
      setErrorDialogTitle("Checking Nickname");
      setErrorDialogMessage("Checking nickname availability, please wait...");
      setIsErrorDialogOpen(true);
      return;
    }

    // Ensure industry is selected (optional validation)
    if (selectedIndustries.length === 0) {
        setErrorDialogTitle("Industry Required");
        setErrorDialogMessage("Please select at least one industry.");
        setIsErrorDialogOpen(true);
        return;
    }

    setIsLoading(true);

    try {
      // 构造请求体
      const industryId = selectedIndustries;
      const resolvedInviteCode = inviteCode || invitationCode || sessionStorage.getItem('invitationCode') || '';
      
      // 构造符合 2.5 /sys/user/additionalInfo 接口的参数
      const payload: any = {
        id: currentUserId, // 确保使用当前获取到的有效 ID
        avatar: avatarUrl || getRandomAvatar(),
        nickName: nickname,
        name: email || nickname, // 关键：name 设为 email，确保 loginByEmail 和 login 都能匹配到
        email: email, // 显式带上 email，防止后端某些逻辑需要此字段同步
        password: password,
        password2: confirmPassword,
        invitationCode: invitationCode || resolvedInviteCode,
        inviteCode: invitationCode || resolvedInviteCode, // 恢复双字段兼容性
        industryId,
      };

      // 优化：使用 Promise.race 处理超时，避免请求过慢导致用户以为无反应
      // 设置 15s 超时
      const fetchPromise = authFetch('/api/admin/base/sys/user/additionalInfo', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      const timeoutPromise = new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      const data = await response.json();
      // console.log("Save profile response:", data); // Removed for security

      if (data.code === 1000) {
        // 成功，立即回调，不加任何人为延迟
        // 注意：成功后可能跳转或卸载组件，暂不置为 false 以保持加载状态直至销毁
        onSave?.();
      } else {
        setIsLoading(false);
        // 如果后端返回昵称/名称重复的错误，更新 UI 状态
        if (data.message && (
            data.message.toLowerCase().includes('nickname') || 
            data.message.toLowerCase().includes('name') || 
            data.message.toLowerCase().includes('taken') ||
            data.message.toLowerCase().includes('exist')
        )) {
            setNicknameStatus('taken');
            setNicknameError(data.message); // 显示后端具体的错误信息
            
            setErrorDialogTitle("Nickname Taken");
            setErrorDialogMessage(data.message);
            setIsErrorDialogOpen(true);
        } else {
            setErrorDialogTitle("Save Failed");
            setErrorDialogMessage(data.message || "Failed to save profile.");
            setIsErrorDialogOpen(true);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Save profile error:", error);
      setErrorDialogTitle("Network Error");
      setErrorDialogMessage("Network error, please try again.");
      setIsErrorDialogOpen(true);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setIsLoading(true);
      const response = await authFetch('/api/admin/base/comm/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const res = await response.json();

      if (res.code === 1000) {
        // 模式 1: 后端返回 OSS 签名，前端直传 OSS (增强兼容性)
        if (res.data && res.data.host && res.data.signature) {
          const ossData = res.data;
          const host = ossData.host;
          const ossFormData = new FormData();
          
          const fileName = `${Date.now()}-${file.name}`;
          const key = ossData.dir ? `${ossData.dir}${fileName}` : `avatar/${fileName}`; 
          
          ossFormData.append('key', key);
          ossFormData.append('policy', ossData.policy);
          ossFormData.append('OSSAccessKeyId', ossData.OSSAccessKeyId);
          ossFormData.append('success_action_status', '200');
          ossFormData.append('signature', ossData.signature);
          ossFormData.append('file', file);
          
          const ossResponse = await fetch(host, {
            method: 'POST',
            body: ossFormData
          });
          
          if (ossResponse.ok) {
            // 确保 host 不带结尾斜杠，key 不带开头斜杠，防止出现双斜杠
            const cleanHost = host.replace(/\/+$/, '');
            const cleanKey = key.replace(/^\/+/, '');
            const finalUrl = `${cleanHost}/${cleanKey}`;
            
            // 使用标准工具规范化
            const normalizedUrl = normalizeAvatarUrl(finalUrl);
            const timestampUrl = `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
            
            console.log("Upload Success (Cloud)! Final URL:", timestampUrl);
            setAvatarUrl(timestampUrl);
            return;
          } else {
            throw new Error(`Cloud upload failed: ${ossResponse.status}`);
          }
        }

        // 模式 2: 后端直接返回 URL 字符串或包含在对象中
        // 增加对 avatar 和 headImg 字段的检查
        const rawData = res.data;
        const url = (typeof rawData === 'string' ? rawData : (rawData?.url || rawData?.token || rawData?.avatar || rawData?.headImg));
        
        if (url) {
          const normalizedUrl = normalizeAvatarUrl(url);
          // 强制添加时间戳绕过浏览器缓存
          const timestampUrl = `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
          
          console.log("Upload Success (Direct)! Final URL:", timestampUrl);
          setAvatarUrl(timestampUrl);
        } else {
          console.error("Upload response data structure not recognized:", res.data);
          throw new Error("Invalid response format: URL field not found");
        }
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      setErrorDialogTitle("Upload Error");
      setErrorDialogMessage(`Error: ${error.message}`);
      setIsErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 随机初始头像已在初始化时处理，暂不提供按钮切换

  // Button is enabled when nickname is filled, password is strong, and passwords match
  const nicknameInvalid = !nickname.trim() || nicknameStatus === 'taken' || nicknameStatus === 'checking' || !!nicknameError;
  const passwordInvalid =
    !password ||
    passwordStrength !== 'strong' ||
    passwordError !== "" ||
    !confirmPassword ||
    password.trim() !== confirmPassword.trim(); // Use trim() to avoid whitespace issues
  const isButtonDisabled = nicknameInvalid || passwordInvalid;

  return (
    <div className="min-h-[100dvh] w-full bg-[#222] relative overflow-hidden flex flex-col px-[25px] font-['Poppins'] text-white">
      {/* 顶部 Header */}
      <AuthHeader onBack={onBack} />

      {/* 页面标题区 */}
      <div className="mt-[40px] mb-[30px]">
        <h1 className="text-[64px] leading-[57px] font-semibold">
          <span className="text-[#b2dabb] block">Final</span>
        </h1>
        <p className="text-[#b7b7bc] text-[14px] mt-4 text-center w-full">
          Complete your profile to get started
        </p>
      </div>

      {/* 头像上传区 */}
      <div className="flex flex-col items-center mb-[40px]">
        <label className="relative cursor-pointer group">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleAvatarChange}
          />
          <Avatar 
            key={avatarUrl}
            className="size-[80px] border-4 border-[#3b3b3b] group-hover:border-[#b2dabb] transition-colors"
          >
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-[#3b3b3b] text-[#b7b7bc]">
                  <Camera className="size-[32px]" />
              </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-[#b2dabb] rounded-full p-1.5 flex items-center justify-center">
              <Plus className="size-[14px] text-black" strokeWidth={3} />
          </div>
        </label>
      </div>

      <form 
        className="flex flex-col flex-1" 
        onSubmit={(e) => {
          e.preventDefault();
          handleNextStep();
        }}
      >
      {/* Hidden username field for browser password manager support */}
      <input 
        type="text" 
        name="username" 
        autoComplete="username" 
        value={nickname} 
        readOnly 
        className="hidden" 
        aria-hidden="true"
      />

      {/* 昵称输入框 */}
      <Input 
        type="text"
        placeholder="Nickname"
        autoComplete="nickname"
        containerClassName={`mb-[15px] ${nicknameStatus === 'taken' ? "border-red-500" : ""}`}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      {nicknameStatus === 'taken' && !nicknameError && (
        <span className="text-red-500 text-xs px-1 mb-[10px]">Nickname taken, please choose another one.</span>
      )}
      {nicknameStatus === 'checking' && !nicknameError && (
        <span className="text-gray-400 text-xs px-1 mb-[10px]">Checking nickname availability…</span>
      )}
      {nicknameError && (
        <span className="text-red-500 text-xs px-1 mb-[10px]">{nicknameError}</span>
      )}

      {/* 密码输入框 */}
      <div className="relative mb-[30px]">
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password"
            containerClassName={`mb-0 pr-[50px] transition-colors ${
                passwordError ? "border-red-500" : 
                passwordStrength === 'strong' ? "border-green-500" :
                passwordStrength === 'medium' ? "border-orange-500" :
                ""
            }`}
            value={password}
            onChange={handlePasswordChange}
          />
          <button
            type="button"
            className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#b7b7bc] hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {/* Password Strength Indicator (Segmented Style) */}
        {password && (
            <div className="flex flex-col gap-1.5 mt-2 w-[60%] mx-auto">
                {/* Segments */}
                <div className="flex gap-1 h-1 w-full">
                    {/* Segment 1 */}
                    <div className={`flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength ? (
                            passwordStrength === 'weak' ? 'bg-red-500' :
                            passwordStrength === 'medium' ? 'bg-orange-500' :
                            'bg-green-500'
                        ) : 'bg-white/10'
                    }`} />
                    
                    {/* Segment 2 */}
                    <div className={`flex-1 rounded-full transition-all duration-300 ${
                        (passwordStrength === 'medium' || passwordStrength === 'strong') ? (
                            passwordStrength === 'medium' ? 'bg-orange-500' :
                            'bg-green-500'
                        ) : 'bg-white/10'
                    }`} />
                    
                    {/* Segment 3 */}
                    <div className={`flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/10'
                    }`} />
                </div>

                {/* Status Text & Requirements */}
                <div className="flex justify-between items-start">
                    <span className={`text-xs font-medium transition-colors ${
                        passwordStrength === 'weak' ? 'text-red-500' :
                        passwordStrength === 'medium' ? 'text-orange-500' :
                        passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-400'
                    }`}>
                        {passwordStrength ? (passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)) : ''}
                    </span>
                    
                    {/* Optional: Tiny requirement hint if not strong */}
                    {passwordStrength !== 'strong' && (
                        <span className="text-[10px] text-gray-500 text-right">
                            8+ chars, Uppercase, Lowercase, Number
                        </span>
                    )}
                </div>
            </div>
        )}
        {passwordError && <span className="text-red-500 text-xs px-1 mt-1 block text-center">{passwordError}</span>}
      </div>

      {/* 确认密码输入框 (仅当输入了密码后显示) */}
      {password && (
        <div className="relative mb-[30px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative">
            <Input 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                autoComplete="new-password"
                containerClassName={`mb-0 pr-[50px] transition-colors ${
                    confirmPassword && password !== confirmPassword ? "border-red-500" : ""
                }`}
                value={confirmPassword}
                onChange={(e) => {
                    setConfirmPassword(e.target.value);
                }}
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
            {confirmPassword && password.trim() !== confirmPassword.trim() && (
                <span className="text-red-500 text-xs px-1 mt-1 block text-center">Passwords do not match</span>
            )}
        </div>
      )}

      {/* 保存按钮 */}
      <Button 
        variant="primary"
        type="submit"
        className="mb-[20px] mt-auto shadow-lg"
        icon={<ArrowRightIcon />}
        disabled={isButtonDisabled}
      >
        Save & Continue
      </Button>
      </form>

      {/* 行业选择弹窗 */}
      <Dialog open={isIndustryDialogOpen} onOpenChange={setIsIndustryDialogOpen}>
        <DialogContent className="bg-app-dark border-white/10 text-white rounded-[20px] max-w-[90vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Industry</DialogTitle>
            <DialogDescription className="text-text-muted">
              Choose the industries you are interested in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-wrap gap-[10px] my-4">
            {INDUSTRIES.map((industry) => (
                <button
                    key={industry.id}
                    onClick={() => toggleIndustry(industry.id)}
                    className={`
                        px-[20px] py-[10px] rounded-[20px] text-[14px] font-medium transition-all
                        ${selectedIndustries.includes(industry.id)
                            ? 'bg-[#b2dabb] text-black shadow-lg'
                            : 'bg-[#3b3b3b] text-[#b7b7bc] hover:bg-[#4a4a4a]'
                        }
                    `}
                >
                    {industry.label}
                </button>
            ))}
          </div>

          <DialogFooter>
            <Button 
                variant="primary"
                onClick={handleFinalSave}
                disabled={selectedIndustries.length === 0}
                className="w-full sm:w-auto"
                loading={isLoading}
            >
                Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="bg-app-dark border-white/10 text-white rounded-[20px] max-w-[90vw] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-500">{errorDialogTitle || "Error"}</DialogTitle>
            <DialogDescription className="text-text-muted text-[15px] pt-2">
              {errorDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
                variant="primary"
                onClick={() => setIsErrorDialogOpen(false)}
                className="w-full"
            >
                Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
