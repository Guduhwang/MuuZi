// 导入依赖库
// useState, useEffect, useCallback: React 核心 Hooks，用于状态管理和副作用处理
import { useState, useEffect, useCallback } from "react";
// motion: 用于处理页面进出场动画和手势拖拽
import { motion } from "motion/react";
// ChevronDown: 图标组件，用于折叠/展开分组
import { ChevronDown } from "lucide-react";
// svgPaths: 项目内部的 SVG 路径资源
import svgPaths from "../../../assets/svgs/svg-yyiihyc8w3";
// CellAddGroup: 展示单个群组/用户的列表项组件
import { CellAddGroup } from "../../components/Group/CellAddGroup";
// BackHeader: 带有返回按钮的通用头部组件
import { BackHeader } from "../../components/Common/BackHeader";

// 导入 Figma 图片资源 (作为默认头像或 fallback 占位图)
import imgAvatarActive from "figma:asset/02a53d2ffce11f8a350482a0e2d03d0a602c9bb9.png";
import { authFetch, getValidAccessToken } from "../../lib/tokenManager";

// --- Types (类型定义) ---

// UI 层使用的“可用用户/群成员”结构
// 这是一个统一的数据模型，供视图层渲染使用
export interface AvailableUser {
  id: string;           // 唯一标识符
  name: string;         // 显示名称（群名或人名）
  description: string;  // 描述信息（签名或简介）
  avatar: string;       // 头像 URL
  isOnline: boolean;    // 在线状态
  role?: 'AI' | 'Human' | 'Group'; // 角色类型
  groupId?: number;     // 可选：原始的群组 ID（用于后续交互）
}

// UI 展示的桌面分组（一个桌面下包含多个群成员）
interface DesktopGroup {
  id: number;           // 桌面 ID
  title: string;        // 桌面标题（如 "Work", "Life"）
  users: AvailableUser[]; // 该桌面下的成员列表
}

// 后端 API 返回的桌面成员原始字段
// 包含群 id 及可能的展示信息，字段较多且可能存在多种命名风格
interface ApiDesktopMember {
  id?: number | string;
  groupId?: number;
  name?: string;
  nickName?: string;
  guideTitle?: string;
  remark?: string;
  description?: string;
  guideContent?: string;
  avatar?: string;
  guideCover?: string;
  body?: string; // 某些接口可能将图片放在 body 字段
  [key: string]: any; // 允许其他任意字段
}

// 后端 API 返回的桌面对象结构
interface ApiDesktop {
  id: number;
  name: string;
  member: ApiDesktopMember[]; // 成员列表
  sort?: number;
}

// 组件 Props 定义
interface GroupChatPageProps {
  onBack: () => void; // 返回上一页的回调
  onOpenChat: (user: AvailableUser) => void; // 点击进入聊天的回调
  slideDirection?: 'left' | 'right'; // 页面进入的方向，默认从右侧进入
  shouldAnimateEntry?: boolean; // 是否执行进场动画
}

// --- Helpers (辅助函数) ---

// 统一头像地址处理函数
// 作用：将相对路径转换为绝对 URL，若无效则返回默认图
const resolveAvatarUrl = (url?: string): string => {
  if (!url) return imgAvatarActive; // 无 URL 则返回默认图
  // 如果已经是完整 URL (http开头) 或 base64 (data:开头)，直接返回
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  // 补全相对路径
  const path = url.startsWith('/') ? url : `/${url}`;
  return `https://guduu.co${path}`;
};

// 桌面分组排序逻辑
// 规则：
// 1. 名字含 "work" 的分组排在最前面
// 2. 名字含 "external" 的分组排在最后面
// 3. 其他分组按原序或字母序排列（此处保持原序）
const sortDesktopGroups = (groups: DesktopGroup[]): DesktopGroup[] => {
  return [...groups].sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    const isWorkA = titleA.includes("work");
    const isWorkB = titleB.includes("work");
    
    const isExternalA = titleA.includes("external link desktop") || titleA.includes("external desktop");
    const isExternalB = titleB.includes("external link desktop") || titleB.includes("external desktop");

    // 规则 1: Work 优先
    if (isWorkA && !isWorkB) return -1;
    if (!isWorkA && isWorkB) return 1;

    // 规则 2: External 最后
    if (isExternalA && !isExternalB) return 1;
    if (!isExternalA && isExternalB) return -1;

    return 0; // 保持原有相对顺序
  });
};

// --- Component (主组件) ---

export function GroupChatPage({ onBack, onOpenChat, slideDirection = 'right', shouldAnimateEntry = true }: GroupChatPageProps) {
  // 计算进场/离场方向，用于 Framer Motion 动画
  // isFromRight: true 表示从右滑入，false 表示从左滑入
  const isFromRight = slideDirection === 'right';
  // initialX: 初始位置
  const initialX = shouldAnimateEntry ? (isFromRight ? "100%" : "-100%") : 0;
  // exitX: 退出位置
  const exitX = isFromRight ? "100%" : "-100%";

  // State: 存储处理后的桌面分组数据
  const [desktopGroups, setDesktopGroups] = useState<DesktopGroup[]>([]);
  // State: 记录每个分组的折叠/展开状态 (key 为分组标题, value 为是否折叠)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // State: 加载状态
  const [loading, setLoading] = useState(true);
  // State: 错误信息
  const [error, setError] = useState<string | null>(null);

  // 核心数据获取逻辑
  // 使用 useCallback 避免重复定义，依赖为空数组表示只初始化一次
  const fetchDesktops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 获取当前用户 ID（可选）
      // 这个 ID 可能用于后续接口过滤，或者仅作为上下文信息
      // 如果获取失败，不应该阻塞主流程，所以 catch 中只做 warn
      let userId: number | undefined;
      let token = await getValidAccessToken();
      
      // 如果没有 token，尝试重新读取一次（可能是刚登录写入还没同步）
      if (!token) {
         await new Promise(resolve => setTimeout(resolve, 500)); // 稍微等一下
         token = await getValidAccessToken();
      }

      if (!token) {
        setLoading(false);
        setError("Authentication token missing");
        // 尝试重定向到登录页或重新获取token
        console.warn("Token missing in GroupChat, redirecting to login...");
        // 暂时注释掉强制跳转，避免死循环闪退，改为只显示错误，方便排查
        // window.location.href = "/"; 
        return;
      }
      try {
          const userResp = await authFetch('/api/admin/base/comm/person');
          const userData = await userResp.json();
          if (userData.code === 1000) {
              userId = userData.data.id;
          }
      } catch (e) {
          console.warn("Failed to get user id, proceeding without it", e);
      }

      // 2. 获取桌面列表（核心数据源）
      // POST 请求，携带 userId
      const response = await authFetch('/api/admin/base/desktop/list', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.code === 1000 && Array.isArray(data.data)) {
        const rawDesktops: ApiDesktop[] = data.data;

        // 如果没有桌面，或者所有桌面的 member 都是空的，则尝试直接获取用户的群组列表作为兜底
        // 这是一个“自动纠错”机制：防止用户有群组但没配置到桌面上导致看不到
        const hasMembers = rawDesktops.some(d => d.member && d.member.length > 0);
        
        if (!hasMembers) {
            console.log("No desktop members found, fallback to fetching all user groups...");
            // 兜底逻辑：获取用户所有群组并显示在默认分类下
            const groupResp = await authFetch('/api/admin/base/group/list', {
                method: 'POST',
                body: JSON.stringify({ userId, type: 1 })
            });
            const groupData = await groupResp.json();
            if (groupData.code === 1000 && Array.isArray(groupData.data)) {
                const myGroups: DesktopGroup = {
                    id: 0,
                    title: "All Groups",
                    users: groupData.data.map((g: any) => ({
                        id: String(g.id),
                        name: g.name || g.nickName || "Unknown Group",
                        description: g.remark || g.description || "No description",
                        avatar: resolveAvatarUrl(g.avatar || g.headImage),
                        isOnline: false,
                        role: 'Group',
                        groupId: g.id
                    }))
                };
                setDesktopGroups([myGroups]);
                setLoading(false);
                return;
            }
        }

        // 3. 收集所有需要批量查询详情的 groupId
        const groupIdsToFetch = new Set<number>();
        rawDesktops.forEach(desktop => {
            if (Array.isArray(desktop.member)) {
                desktop.member.forEach(m => {
                    const gid = m.groupId || m.id;
                    if (gid) {
                        const numericId = Number(gid);
                        if (!isNaN(numericId) && numericId > 0) {
                            groupIdsToFetch.add(numericId);
                        }
                    }
                });
            }
        });

        // 4. 批量获取群详情
        const groupDetailsMap = new Map<string, any>(); 
        if (groupIdsToFetch.size > 0) {
            try {
                const groupResp = await authFetch('/api/admin/base/group/list', {
                    method: 'POST',
                    body: JSON.stringify({ ids: Array.from(groupIdsToFetch) })
                });
                const groupData = await groupResp.json();
                console.log("Group Details Batch Response:", groupData); 

                if (groupData.code === 1000 && Array.isArray(groupData.data)) {
                    groupData.data.forEach((g: any) => groupDetailsMap.set(String(g.id), g));
                }
            } catch (err) {
                console.error("Failed to fetch group details:", err);
            }
        }

        // 5. 数据映射
        const groups: DesktopGroup[] = rawDesktops.map(item => ({
          id: item.id,
          title: item.name || `Desktop ${item.id}`,
          users: Array.isArray(item.member) ? item.member.map(m => {
              // --- 字段解析逻辑 ---
              const memName = m.name || m.nickName;
              const memDesc = m.remark || m.description;
              const memAvatar = m.avatar || m.body;
              
              const guideTitle = m.guideTitle;
              const guideContent = m.guideContent;
              const guideCover = m.guideCover;

              let finalName = guideTitle || memName || "Unknown";
              let finalDesc = guideContent || memDesc || "No description";
              let finalAvatar = guideCover || memAvatar;

              const rawId = m.groupId || m.id;
              const targetId = rawId ? String(rawId) : undefined;

              if (targetId && groupDetailsMap.has(targetId)) {
                  const groupDetail = groupDetailsMap.get(targetId);
                  
                  // 获取群详情里的字段 (兼容 payload 嵌套情况)
                  const detail = groupDetail.payload || groupDetail;

                  const groupName = detail.name || detail.groupName || detail.nickName || detail.title;
                  const groupDesc = detail.remark || detail.intro || detail.description || detail.signature;
                  const groupAvatar = detail.avatar || detail.body || detail.headImage || detail.icon;

                  if (!guideTitle && groupName) finalName = groupName;
                  if (!guideContent && groupDesc) finalDesc = groupDesc;
                  if (!guideCover && groupAvatar) finalAvatar = groupAvatar;
              }

              return {
                  id: String(m.id || Math.random()),
                  name: finalName,
                  description: finalDesc,
                  avatar: resolveAvatarUrl(finalAvatar),
                  isOnline: false,
                  role: 'Group',
                  groupId: m.groupId
              };
          }) : []
        }));

        setDesktopGroups(sortDesktopGroups(groups));
      } else {
          setError(data.message || "Failed to load desktops");
      }
    } catch (error) {
      console.error("Failed to fetch desktops:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect: 组件挂载时触发数据加载
  useEffect(() => {
    fetchDesktops();
  }, [fetchDesktops]);

  // 处理分组折叠/展开的函数
  const toggleGroup = useCallback((title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }, []);

  return (
    // motion.div: 全屏容器，支持拖拽手势
    <motion.div 
      className="fixed inset-0 bg-[#222] z-[100] flex flex-col font-['Poppins'] text-white h-[100dvh]"
      initial={{ x: initialX }}
      animate={{ x: 0 }}
      exit={{ x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag="x" // 允许水平拖拽
      dragConstraints={{ left: 0, right: 0 }} // 限制拖拽范围
      dragElastic={{ 
        left: isFromRight ? 0 : 0.5, 
        right: isFromRight ? 0.5 : 0 
      }}
      onDragEnd={(_, { offset, velocity }) => {
        // 根据拖拽距离 (offset) 或速度 (velocity) 判定是否触发返回
        if (isFromRight) {
          if (offset.x > 100 || velocity.x > 500) onBack();
        } else {
          if (offset.x < -100 || velocity.x < -500) onBack();
        }
      }}
    >
      {/* 顶部导航栏 */}
      <BackHeader 
        title="Group Chat"
        onBack={onBack}
        rightElement={
          <>
             <button className="w-10 h-10 flex items-center justify-center bg-[#3B3B3B] rounded-full shrink-0 transition-transform active:scale-95" aria-label="Search">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p3dcb2d80} fill="white" />
                </svg>
             </button>
             <button className="w-10 h-10 flex items-center justify-center bg-[#3B3B3B] rounded-full shrink-0 transition-transform active:scale-95" aria-label="Add Group">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p13970200} fill="white" />
                </svg>
             </button>
          </>
        }
      />

      {/* 主要内容区域：可滚动 */}
      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-20">
        {/* Loading 状态展示 */}
        {loading ? (
            <div className="flex flex-col justify-center items-center h-[50vh] text-gray-500 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                <span className="text-sm">Loading desktops...</span>
            </div>
        ) : error ? (
            /* Error 状态展示，提供重试按钮 */
            <div className="flex flex-col justify-center items-center h-[50vh] text-red-400 gap-2">
                <span>{error}</span>
                <button onClick={fetchDesktops} className="text-white underline text-sm">Retry</button>
            </div>
        ) : (
            /* 数据列表渲染 */
            desktopGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.title];
            return (
                <section key={group.id} className="mb-6">
                    {/* 分组标题栏：点击可折叠 */}
                    <div 
                        className="flex items-center justify-between mb-2 cursor-pointer active:opacity-70 transition-opacity select-none"
                        onClick={() => toggleGroup(group.title)}
                    >
                        <h2 className="text-[16px] font-semibold">{group.title}</h2>
                        {/* 折叠指示箭头：根据状态旋转 */}
                        <ChevronDown 
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : '0'}`} 
                        />
                    </div>
                    
                    {/* 分组内容：使用 motion 实现高度动画 */}
                    <motion.div
                        initial={false}
                        animate={{ height: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-0">
                        {group.users.map((user) => (
                            <CellAddGroup 
                                key={user.id}
                                name={user.name}
                                description={user.description}
                                avatar={user.avatar}
                                isOnline={user.isOnline}
                                role={user.role}
                                buttonText="+ Chat"
                                onButtonClick={() => onOpenChat(user)}
                            />
                        ))}
                        {/* 空状态展示 */}
                        {group.users.length === 0 && (
                            <div className="text-gray-500 text-sm py-4 text-center bg-[#2a2a2a] rounded-xl">
                                No groups available
                            </div>
                        )}
                        </div>
                    </motion.div>
                </section>
            );
            })
        )}
      </main>
    </motion.div>
  );
}