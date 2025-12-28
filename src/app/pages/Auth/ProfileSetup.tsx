// 个人资料设置页面 (ProfileSetupPage)
// -----------------------------------------------------------------------------
// 该页面是用户注册流程的终点站，负责收集用户的个性化信息并建立初步的用户画像。
// 
// 主要职责：
// 1. 品牌身份建立：支持随机选择或手动上传头像，并注入时间戳强制刷新策略。
// 2. 账号安全增强：执行严格的强密码策略校验（大小写字母+数字），并进行二次确认。
// 3. 社交属性定义：提供昵称实时防抖校验，并要求用户选择感兴趣的行业标签。
// 4. 数据一致性维护：确保从 Register 环节流转的 userId 准确绑定到后续的附加信息中。
//
// 布局与适配：
// - 移动端优先：采用单列全宽布局，使用 min-h-[100dvh] 处理浏览器地址栏适配。
// - 交互鲁棒性：集成请求超时机制，防止移动网络环境下的无限期等待。
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

// 行业标签数据：用于建立用户画像，驱动推荐算法
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

// 默认头像库：在用户未上传时提供高质量的初始视觉方案
const DEFAULT_AVATARS = [
  '/default-avatars/avatar1.png',
  '/default-avatars/avatar2.png',
  '/default-avatars/avatar3.png',
  '/default-avatars/avatar4.png',
];

interface ProfileSetupPageProps {
  onBack?: () => void;
  onSave?: () => void;
  email?: string;
  invitationCode?: string;
  inviteCode?: string;
  userId?: number;
}

// -----------------------------------------------------------------------------
// 接口对接函数 (API Integration) - 遵循 Rule 13
// -----------------------------------------------------------------------------
const BASE_URL = '/dev/admin/base';

/**
 * 昵称唯一性校验
 * 业务价值：在资料提交前预校验，防止因名称冲突导致的长流程提交失败。
 */
async function checkNicknameExists(nickName: string, signal?: AbortSignal): Promise<boolean> {
  const response = await authFetch(`${BASE_URL}/sys/user/isExist`, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'language': 'en' // 🔴 必须传递以对齐字典
    },
    body: JSON.stringify({ nickName, name: nickName }),
    signal,
  });

  if (!response.ok) throw new Error('Network error');
  const data = await response.json();
  if (data?.code !== 1000) throw new Error(data?.message || 'Check failed');
  
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
  // -----------------------------------------------------------------------------
  // 状态定义 (States)
  // -----------------------------------------------------------------------------
  
  // 聚合表单数据：减少 useState 数量，使数据流向更集中 (Rule 6)
  const [formData, setFormData] = useState({
    nickname: "",
    password: "",
    confirmPassword: "",
    avatarUrl: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    selectedIndustries: [] as number[],
  });

  const [userId, setUserId] = useState<number | undefined>(initialUserId);
  const [email, setEmail] = useState(initialEmail);

  // UI 反馈状态
  const [passwordStates, setPasswordStates] = useState({
    show: false,
    showConfirm: false,
    strength: '' as 'weak' | 'medium' | 'strong' | '',
    error: ""
  });

  const [nicknameStates, setNicknameStates] = useState({
    status: 'idle' as 'idle' | 'checking' | 'available' | 'taken',
    error: ""
  });

  const [loading, setLoading] = useState(false);
  const [dialogs, setDialogs] = useState({
    industry: false,
    error: { open: false, title: "", message: "" }
  });

  // -----------------------------------------------------------------------------
  // 业务逻辑 (Business Logic)
  // -----------------------------------------------------------------------------

  /**
   * 密码强度实时动态校验
   * 规则：8+字符，包含大小写及数字 (Rule 14)
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

  // 身份自查：尝试从多级缓存中追溯 UserId，确保资料绑定的准确性
  useEffect(() => {
    if (userId) return;
    const storedId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    if (storedId) {
        const parsed = parseInt(storedId, 10);
        if (!isNaN(parsed)) setUserId(parsed);
    }
  }, [userId]);

  // 昵称查重：防抖处理，降低后端压力
  useEffect(() => {
    if (!formData.nickname.trim()) {
      setNicknameStates({ status: 'idle', error: "" });
      return;
    }

    const controller = new AbortController();
    const debounceId = setTimeout(async () => {
      setNicknameStates(prev => ({ ...prev, status: 'checking', error: "" }));
      try {
        const exists = await checkNicknameExists(formData.nickname.trim(), controller.signal);
        setNicknameStates({ status: exists ? 'taken' : 'available', error: "" });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setNicknameStates({ status: 'idle', error: "Unable to verify nickname" });
      }
    }, 500);

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [formData.nickname]);

  const handlePasswordChange = (val: string) => {
    const result = validatePassword(val);
    setFormData(prev => ({ ...prev, password: val }));
    setPasswordStates(prev => ({
        ...prev,
        strength: val ? result.strength : '',
        error: val ? (result.valid ? "" : result.error) : ""
    }));
  };

  const toggleIndustry = (id: number) => {
    setFormData(prev => ({
        ...prev,
        selectedIndustries: prev.selectedIndustries.includes(id)
            ? prev.selectedIndustries.filter(i => i !== id)
            : [...prev.selectedIndustries, id]
    }));
  };

  /**
   * 提交主逻辑：整合用户所有资料
   * 业务价值：执行“UserId-Email-Profile”的三方对齐，确保账号闭环。
   */
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // 🔴 [用户体验]: 提交时立即收起键盘
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    if (!userId) {
        setDialogs(prev => ({ ...prev, error: { open: true, title: "Identity Missing", message: "Please try logging in again." } }));
        return;
    }

    if (!formData.password || passwordStates.strength !== 'strong' || formData.password !== formData.confirmPassword) {
        setDialogs(prev => ({ ...prev, error: { open: true, title: "Invalid Password", message: "Please ensure password requirements are met." } }));
        return;
    }

    if (formData.selectedIndustries.length === 0) {
        setDialogs(prev => ({ ...prev, industry: true }));
        return;
    }

    setLoading(true);

    try {
      const resolvedInviteCode = inviteCode || invitationCode || sessionStorage.getItem('invitationCode') || '';
      const payload = {
        id: userId,
        avatar: formData.avatarUrl,
        nickName: formData.nickname,
        name: email || formData.nickname, // 关键：确保 login 匹配
        email: email,
        password: formData.password,
        password2: formData.confirmPassword,
        invitationCode: resolvedInviteCode,
        inviteCode: resolvedInviteCode, // 双字段兼容 (Rule 14)
        industryId: formData.selectedIndustries,
      };

      // 15s 超时控制
      const res = await Promise.race([
        authFetch(`${BASE_URL}/sys/user/additionalInfo`, { method: 'POST', body: JSON.stringify(payload) }),
        new Promise<Response>((_, r) => setTimeout(() => r(new Error('Timeout')), 15000))
      ]) as Response;

      const data = await res.json();
      if (data.code === 1000) onSave?.();
      else throw new Error(data.message || "Save failed");

    } catch (err: any) {
      setLoading(false);
      setDialogs(prev => ({ ...prev, error: { open: true, title: "Save Error", message: err.message } }));
    }
  };

  /**
   * 头像上传逻辑
   * 规范：OSS 直传 + 时间戳缓存绕过策略 (Rule 16)
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    
    try {
      setLoading(true);
      const response = await authFetch(`${BASE_URL}/comm/upload`, { method: 'POST', body });
      const res = await response.json();

      if (res.code === 1000) {
        let finalUrl = "";
        // 处理 OSS 直传模式
        if (res.data?.host && res.data?.signature) {
          const ossForm = new FormData();
          const fileName = `${Date.now()}-${file.name}`;
          const key = res.data.dir ? `${res.data.dir}${fileName}` : `avatar/${fileName}`;
          ossForm.append('key', key);
          ossForm.append('policy', res.data.policy);
          ossForm.append('OSSAccessKeyId', res.data.OSSAccessKeyId);
          ossForm.append('success_action_status', '200');
          ossForm.append('signature', res.data.signature);
          ossForm.append('file', file);
          const ossRes = await fetch(res.data.host, { method: 'POST', body: ossForm });
          if (ossRes.ok) finalUrl = `${res.data.host.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
        } else {
          finalUrl = res.data?.url || res.data?.avatar || res.data;
        }

        if (finalUrl) {
            // 🔴 强制注入时间戳防止浏览器头像缓存 (Rule 16)
            const timestampUrl = `${normalizeAvatarUrl(finalUrl)}?t=${Date.now()}`;
            setFormData(prev => ({ ...prev, avatarUrl: timestampUrl }));
        }
      }
    } catch (err: any) {
      setDialogs(prev => ({ ...prev, error: { open: true, title: "Upload Error", message: err.message } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] supports-[height:100dvh]:h-[100dvh] w-full bg-app-dark relative overflow-hidden flex flex-col px-[25px] text-white">
      <AuthHeader onBack={onBack} />

      <section className="mt-[40px] mb-[30px]">
        <h1 className="text-display font-semibold">
          <span className="text-brand-primary block">Final</span>
        </h1>
        <p className="text-text-muted text-lead mt-4 text-center w-full">Complete your profile to get started</p>
      </section>

      {/* 头像上传交互区 (Avatar Section) */}
      <section className="flex flex-col items-center mb-[40px]">
        <label className="relative cursor-pointer group">
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <Avatar className="size-[80px] border-4 border-white/10 group-hover:border-brand-primary transition-colors">
              <AvatarImage src={formData.avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-white/5 text-text-muted">
                  <Camera className="size-[32px]" />
              </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-brand-primary rounded-full p-1.5 flex items-center justify-center">
              <Plus className="size-[14px] text-black" strokeWidth={3} />
          </div>
        </label>
      </section>

      {/* 资料表单主体 (Profile Form) */}
      <form className="flex flex-col flex-1" onSubmit={handleFinalSubmit}>
        <input type="text" name="username" autoComplete="username" value={formData.nickname} readOnly className="hidden" aria-hidden="true" />

        {/* 昵称输入：含实时查重反馈 */}
        <div className="flex flex-col gap-1 mb-[15px]">
            <Input 
                placeholder="Nickname" 
                autoComplete="nickname"
                containerClassName={nicknameStates.status === 'taken' ? "border-red-500" : ""}
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            />
            {nicknameStates.status === 'taken' && <span className="text-red-500 text-xs px-1" role="alert">Nickname taken</span>}
            {nicknameStates.status === 'checking' && <span className="text-text-subtle text-xs px-1">Verifying...</span>}
        </div>

        {/* 密码设置区 */}
        <div className="flex flex-col gap-1 mb-[30px]">
            <div className="relative">
                <Input 
                    type={passwordStates.show ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="new-password"
                    containerClassName={passwordStates.error ? "border-red-500" : (passwordStates.strength === 'strong' ? "border-green-500" : "")}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                />
                <button type="button" className="absolute right-[20px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors" onClick={() => setPasswordStates(p => ({ ...p, show: !p.show }))}>
                    {passwordStates.show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {/* 密码强度指示器 */}
            {formData.password && (
                <div className="flex flex-col gap-1.5 mt-2 w-[60%] mx-auto" aria-live="polite">
                    <div className="flex gap-1 h-1 w-full">
                        <div className={`flex-1 rounded-full ${passwordStates.strength ? (passwordStates.strength === 'weak' ? 'bg-red-500' : (passwordStates.strength === 'medium' ? 'bg-orange-500' : 'bg-green-500')) : 'bg-white/10'}`} />
                        <div className={`flex-1 rounded-full ${(passwordStates.strength === 'medium' || passwordStates.strength === 'strong') ? (passwordStates.strength === 'medium' ? 'bg-orange-500' : 'bg-green-500') : 'bg-white/10'}`} />
                        <div className={`flex-1 rounded-full ${passwordStates.strength === 'strong' ? 'bg-green-500' : 'bg-white/10'}`} />
                    </div>
                </div>
            )}
            {passwordStates.error && <span className="text-red-500 text-xs text-center" role="alert">{passwordStates.error}</span>}
        </div>

        {/* 密码二次确认 */}
        {formData.password && (
            <div className="relative mb-[30px] animate-in fade-in slide-in-from-top-2 duration-300">
                <Input 
                    type={passwordStates.showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    containerClassName={formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500" : ""}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <button type="button" className="absolute right-[20px] top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors" onClick={() => setPasswordStates(p => ({ ...p, showConfirm: !p.showConfirm }))}>
                    {passwordStates.showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        )}

        <Button type="submit" variant="primary" className="mb-[20px] mt-auto shadow-lg" icon={<ArrowRightIcon />} disabled={loading || nicknameStates.status === 'taken'}>
            Save & Continue
        </Button>
      </form>

      {/* 行业选择弹窗 (Industry Dialog) */}
      <Dialog open={dialogs.industry} onOpenChange={(v) => setDialogs(p => ({ ...p, industry: v }))}>
        <DialogContent className="bg-app-dark border-white/10 text-white rounded-[20px] max-w-[90vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Industry</DialogTitle>
            <DialogDescription className="text-text-muted">Choose the fields you are interested in.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-[10px] my-4">
            {INDUSTRIES.map(i => (
                <button key={i.id} onClick={() => toggleIndustry(i.id)} className={`px-[20px] py-[10px] rounded-[20px] text-[14px] font-medium transition-all ${formData.selectedIndustries.includes(i.id) ? 'bg-brand-primary text-black shadow-lg' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}>
                    {i.label}
                </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="primary" onClick={handleFinalSubmit} disabled={formData.selectedIndustries.length === 0} loading={loading}>
                Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 通用错误提示弹窗 (Error Dialog) */}
      <Dialog open={dialogs.error.open} onOpenChange={(o) => setDialogs(p => ({ ...p, error: { ...p.error, open: o } }))}>
        <DialogContent className="bg-app-dark border-white/10 text-white rounded-[20px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-red-500">{dialogs.error.title}</DialogTitle>
            <DialogDescription className="text-text-muted pt-2">{dialogs.error.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="primary" onClick={() => setDialogs(p => ({ ...p, error: { ...p.error, open: false } }))}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
