// 个人资料页面：展示用户详细信息、社交链接及课程/商品列表
// 布局参考：Avatar 居中, 社交图标, Tabs (Links/Shop), 卡片列表
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  ChevronLeft, 
  Instagram, 
  Facebook, 
  Music2, 
  DollarSign, 
  MoreHorizontal,
  Pencil,
  X,
  Upload,
  Type,
  Link as LinkIcon,
  MessageSquare,
  Search,
  Copy,
  Share2
} from "lucide-react";
import { GroupCard } from "../../components/Group/GroupCard";
import { ImagePreviewCard } from "../../components/Card/ImagePreviewCard";
import imgAvatarDefault from "figma:asset/cca52c1ba2653720b531334ad6385e8d699abcc2.png";
import imgCard1 from "figma:asset/50d536d538dfc40468ac181b9d21ecd62a45363d.png";
import imgCard2 from "figma:asset/0f1c8e746b4842709f03a5c1141c6429dcaa7094.png";

// Placeholder images
const MOCK_IMAGES = {
  avatar: imgAvatarDefault,
  card1: imgCard1, 
  card2: imgCard2
};

interface UserProfilePageProps {
  onBack: () => void;
}

interface CardData {
  image: string;
  title: string;
  linkText: string;
  linkUrl: string;
  type?: 'link' | 'shop'; // 新增 type 字段区分卡片类型
  selectedItems?: Array<{ title: string; image: string; id: number }>; // 支持多选商品
}

interface ProfileData {
  name: string;
  description: string;
  avatar: string;
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    donate: string;
  };
}

export function UserProfilePage({ onBack }: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
  
  // 用户资料状态
  const [profile, setProfile] = useState<ProfileData>({
    name: "Sophie",
    description: "Health & Fitness Coach",
    avatar: MOCK_IMAGES.avatar,
    socials: {
      instagram: "#",
      facebook: "#",
      tiktok: "#",
      donate: "#"
    }
  });

  // 编辑资料弹窗状态
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  // 分享弹窗状态
  const [isShareOpen, setIsShareOpen] = useState(false);

  // 处理资料保存
  const handleSaveProfile = (newData: ProfileData) => {
    setProfile(newData);
    setIsEditProfileOpen(false);
  };

  // 卡片数据状态管理
  const [cards, setCards] = useState<{ [key: string]: CardData }>({
    card1: {
      image: imgCard2,
      title: "BODY by loaf",
      linkText: "Sign up for coaching",
      linkUrl: "#",
      type: 'link'
    },
    card2: {
      image: MOCK_IMAGES.card1,
      title: "The Midsize Curvy Girl Method",
      linkText: "Enroll in course",
      linkUrl: "#",
      type: 'shop'
    },
    card3: {
      image: MOCK_IMAGES.card2,
      title: "Nutrition & Wellness Guide",
      linkText: "Download PDF",
      linkUrl: "#",
      type: 'link'
    }
  });

  // 当前正在编辑的卡片 ID (null 表示未打开弹窗)
  const [editingId, setEditingId] = useState<string | null>(null);

  // 保存卡片编辑内容
  const handleSaveCard = (newData: CardData) => {
    if (editingId) {
      setCards(prev => ({ ...prev, [editingId]: newData }));
      setEditingId(null);
    }
  };

  return (
    // 使用 dark 类强制深色模式变量，使用语义化背景色
    <motion.div 
      className="fixed inset-0 bg-app-dark text-foreground z-[9999] flex flex-col font-['Poppins'] overflow-hidden dark"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* 顶部导航：返回与菜单 */}
      <header className="flex items-center justify-between px-5 pt-[60px] pb-4 shrink-0 relative z-10 bg-app-dark rounded-b-[32px] shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full active:scale-95 transition-transform shadow-lg shadow-black/20"
        >
           <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <button 
          onClick={() => setIsShareOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full active:scale-95 transition-transform shadow-lg shadow-black/20"
        >
           <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto px-5 pb-10 no-scrollbar">
        
        {/* 用户信息区：头像、姓名、认证标识、头衔 */}
        <div className="flex flex-col items-center mt-4 mb-8 relative w-full">
          {/* 编辑资料按钮 (右上角) */}
          <div className="absolute top-0 right-0">
             <Button 
               variant="ghost" 
               size="icon" 
               className="rounded-full hover:bg-white/10 text-foreground"
               onClick={() => setIsEditProfileOpen(true)}
             >
                <Pencil className="w-5 h-5" />
             </Button>
          </div>

          <div className="relative mb-4">
            <Avatar className="w-[100px] h-[100px] border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar} className="object-cover" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="text-[24px] font-bold leading-tight tracking-tight">{profile.name}</h1>
            {/* 认证标识 */}
            <svg className="w-5 h-5 text-blue-400 fill-current" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-blue-400 opacity-20" />
            </svg>
          </div>
          
          <p className="text-muted-foreground text-[14px]">{profile.description}</p>
        </div>

        {/* 社交链接按钮组 - 绑定状态链接 */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { key: 'instagram', icon: Instagram, label: "Instagram" },
            { key: 'facebook', icon: Facebook, label: "Facebook" },
            { key: 'tiktok', icon: Music2, label: "TikTok" }, 
            { key: 'donate', icon: DollarSign, label: "Donate" }
          ].map((item, i) => (
            <a 
              key={i}
              href={profile.socials[item.key as keyof typeof profile.socials] || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[50px] h-[50px] rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all bg-secondary/30 text-foreground"
              aria-label={item.label}
            >
              <item.icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        {/* Tabs 切换：Links / Shop */}
        <div className="flex justify-center gap-8 mb-8">
          <button 
            onClick={() => setActiveTab('links')}
            className={`px-8 py-3 rounded-full text-[16px] font-medium transition-colors ${
              activeTab === 'links' 
                ? 'bg-brand-primary text-black' 
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Links
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`px-8 py-3 rounded-full text-[16px] font-medium transition-colors ${
              activeTab === 'shop' 
                ? 'bg-brand-primary text-black' 
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Shop
          </button>
        </div>

        {/* 内容列表区：展示 Links 或 Shop 内容 */}
        <div className="flex flex-col gap-6">
          {activeTab === 'links' ? (
            <>
              {/* 卡片 1：动态内容卡片（粉色背景） */}
              <div className="w-full bg-card rounded-[32px] overflow-hidden shadow-lg shadow-black/20 relative group">
                <button 
                  onClick={() => setEditingId('card1')}
                  className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 backdrop-blur-sm transition-all"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                <div className="aspect-video w-full bg-black">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/qXLhDqH5i2I" 
                    title="YouTube video player" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  />
                </div>
                
                <div className="p-4 flex items-center justify-between bg-charcoal-g">
                   <h3 className="text-white text-[15px] font-medium line-clamp-1">{cards.card1.title}</h3>
                   <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wide">YOUTUBE</div>
                </div>
              </div>

              {/* 卡片 3：替换为图片预览卡片 */}
              <ImagePreviewCard 
                image={cards.card3.image}
                title={cards.card3.title}
                tag="DOCUMENT"
                // 传入自定义颜色
                footerClassName="bg-[#645A47]"
                onClick={() => console.log("Open document")}
                onEdit={() => setEditingId('card3')}
              />

            </>
          ) : (
            <GroupCard 
              group={{
                id: "card2",
                category: "RECOMMENDED",
                title: cards.card2.title,
                bgColor: "#645A47",
                // 优先使用 selectedItems 中的图片，如果没有则回退到默认逻辑
                participants: cards.card2.selectedItems?.map(item => item.image) || [imgAvatarDefault, imgAvatarDefault, imgAvatarDefault],
                // 显示选中的商品数量，或者默认数量
                userCount: cards.card2.selectedItems?.length || 88,
                memberNames: ["Sarah West", "John Doe"],
                messageCount: 24
              }}
              onClick={() => setEditingId('card2')}
            />
          )}
        </div>

      </main>

      {/* 底部弹窗区域 */}
      <AnimatePresence>
        {/* 编辑卡片弹窗 - 根据卡片类型显示不同弹窗 */}
        {editingId && (
          cards[editingId].type === 'shop' ? (
            <ShopSearchCard 
              initialData={cards[editingId]}
              onClose={() => setEditingId(null)}
              onSave={handleSaveCard}
            />
          ) : (
            <EditCardModal 
              initialData={cards[editingId]}
              onClose={() => setEditingId(null)}
              onSave={handleSaveCard}
            />
          )
        )}
        
        {/* 编辑个人资料弹窗 (新) */}
        {isEditProfileOpen && (
          <EditProfileModal 
            initialData={profile}
            onClose={() => setIsEditProfileOpen(false)}
            onSave={handleSaveProfile}
          />
        )}
        
        {/* 分享弹窗 */}
        {isShareOpen && (
          <ShareModal 
            onClose={() => setIsShareOpen(false)} 
            profileUrl={`https://muuzi.app/u/${profile.name.toLowerCase().replace(/\s+/g, '')}`}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// 分享弹窗组件
function ShareModal({ onClose, profileUrl = "https://muuzi.app/u/sophie" }: { onClose: () => void, profileUrl?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div 
        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 z-[210] flex flex-col gap-6 border-t border-white/10 shadow-2xl pb-10"
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Share Profile</h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose} 
            className="p-2 bg-jet rounded-full hover:bg-jet/80 transition-colors w-9 h-9"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* 1. 链接复制框 */}
        <div className="flex items-center gap-3 bg-secondary p-2 rounded-xl border border-white/5">
           <div className="flex-1 px-3 text-sm text-gray-400 font-mono truncate">
             {profileUrl}
           </div>
           <Button 
             onClick={handleCopy}
             className={`shrink-0 rounded-lg px-4 h-10 font-medium transition-all ${
               copied ? 'bg-green-500 text-white' : 'bg-brand-primary text-black hover:brightness-90'
             }`}
           >
             {copied ? 'Copied!' : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
           </Button>
        </div>

        {/* 2. 社交媒体分享图标 */}
        <div className="grid grid-cols-4 gap-4">
           {[
             { icon: Instagram, label: "Instagram", color: "bg-pink-600" },
             { icon: Facebook, label: "Facebook", color: "bg-blue-600" },
             { icon: Music2, label: "TikTok", color: "bg-black border border-white/20" },
             { icon: Share2, label: "More", color: "bg-gray-600" },
           ].map((item, i) => (
             <button 
               key={i}
               className="flex flex-col items-center gap-2 group"
               onClick={() => console.log(`Share to ${item.label}`)}
             >
               <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform ${item.color}`}>
                 <item.icon className="w-6 h-6" />
               </div>
               <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
             </button>
           ))}
        </div>
      </motion.div>
    </>
  );
}

// Shop 搜索卡片组件
function ShopSearchCard({ initialData, onClose, onSave }: {
  initialData: CardData,
  onClose: () => void,
  onSave: (data: CardData) => void
}) {
  const [searchTerm, setSearchTerm] = useState("");
  // 修改：支持多选，存储选中的商品 ID 数组
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 模拟搜索结果
  const searchResults = [
    { id: 1, title: "Yoga Mat", image: MOCK_IMAGES.card1 },
    { id: 2, title: "Dumbbells Set", image: MOCK_IMAGES.card2 },
    { id: 3, title: "Protein Powder", image: MOCK_IMAGES.card1 },
    { id: 4, title: "Resistance Bands", image: MOCK_IMAGES.card2 },
  ].filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <motion.div 
        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 z-[210] flex flex-col gap-6 border-t border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center pb-4">
          <h3 className="text-xl font-bold text-white">Select Product</h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose} 
            className="p-2 bg-jet rounded-full hover:bg-[#444] transition-colors w-9 h-9"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="relative shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-secondary text-white pl-12 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all"
            autoFocus
          />
        </div>

        {/* 搜索结果列表 */}
        <div className="grid grid-cols-2 gap-4 overflow-y-auto min-h-[400px] pb-6">
          {searchResults.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedIds(prev => prev.filter(id => id !== item.id));
                  } else {
                    setSelectedIds(prev => [...prev, item.id]);
                  }
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border group h-fit relative ${
                  isSelected 
                    ? 'bg-brand-primary/10 border-brand-primary ring-1 ring-brand-primary' 
                    : 'bg-secondary hover:bg-secondary/80 border-white/5'
                }`}
              >
                {/* 选中状态打勾图标 */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 bg-brand-primary text-black rounded-full p-1 shadow-lg">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="aspect-square rounded-lg overflow-hidden bg-black mb-3 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 transition-colors ${
                    isSelected ? 'bg-transparent' : 'bg-black/20 group-hover:bg-transparent'
                  }`} />
                </div>
                <h4 className={`font-medium text-sm line-clamp-2 ${
                  isSelected ? 'text-brand-primary' : 'text-white'
                }`}>{item.title}</h4>
              </div>
            );
          })}
          
          {/* 添加更多模拟数据以演示滚动 */}
          {[5,6,7,8,9,10].map(id => (
            <div 
               key={id}
               className="bg-secondary p-3 rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors border border-white/5 group opacity-50"
            >
               <div className="aspect-square rounded-lg overflow-hidden bg-black mb-3" />
               <h4 className="text-gray-400 font-medium text-sm">More Item {id}</h4>
            </div>
          ))}
        </div>

        {/* 底部保存按钮 */}
        <div className="pt-4 border-t border-white/10">
          <Button 
            onClick={() => {
              const selectedItems = searchResults.filter(item => selectedIds.includes(item.id));
              if (selectedItems.length > 0) {
                // 保存逻辑：将选中的商品存入 selectedItems，并使用第一个商品的图作为封面
                onSave({ 
                  ...initialData, 
                  title: `${selectedItems.length} Products Selected`, 
                  image: selectedItems[0].image,
                  selectedItems: selectedItems 
                });
              }
            }}
            disabled={selectedIds.length === 0}
            className="w-full bg-brand-primary hover:bg-[#9ec5a7] text-white py-6 rounded-xl font-bold text-lg active:scale-95 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Products ({selectedIds.length})
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// 编辑卡片弹窗组件
function EditCardModal({ initialData, onClose, onSave }: { 
  initialData: CardData, 
  onClose: () => void, 
  onSave: (data: CardData) => void 
}) {
  const [formData, setFormData] = useState(initialData);

  // 处理图片上传预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <motion.div 
        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* 弹窗主体 - 底部抽屉样式 */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 z-[210] flex flex-col gap-6 border-t border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Edit Card</h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose} 
            className="p-2 bg-jet rounded-full hover:bg-[#444] transition-colors w-9 h-9"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>
        
        {/* 表单输入区域 */}
        <div className="space-y-5">
           {/* 1. 图片上传 */}
           <div>
             <Label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
               <Upload className="w-4 h-4" /> Cover Image
             </Label>
             <div className="flex items-center gap-4">
               <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/20 border border-white/5 shrink-0">
                  <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
               </div>
               <label className="flex-1 bg-jet hover:bg-jet/80 text-white py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition border border-white/5 font-medium">
                 <span>Choose New Image</span>
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
               </label>
             </div>
           </div>

           {/* 2. 标题文字 */}
           <div>
             <Label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
               <Type className="w-4 h-4" /> Title Text
             </Label>
             <Input 
               type="text"
               value={formData.title} 
               onChange={(e) => setFormData({...formData, title: e.target.value})}
               className="w-full bg-secondary text-white p-4 h-auto rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-primary border border-white/5 transition-all" 
               placeholder="Enter title..."
             />
           </div>

           {/* 3. 链接 URL */}
           <div>
              <Label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Link URL
              </Label>
              <Input 
                type="text"
                value={formData.linkUrl} 
                onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                className="w-full bg-secondary text-white p-4 h-auto rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-primary border border-white/5 transition-all font-mono text-sm" 
                placeholder="https://..."
              />
           </div>

            {/* 4. 链接文字 (可选) */}
           <div>
              <Label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Button Text
              </Label>
              <Input 
                type="text"
                value={formData.linkText} 
                onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                className="w-full bg-secondary text-white p-4 h-auto rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-primary border border-white/5 transition-all mb-3" 
                placeholder="Enter button text..."
              />
              <div className="flex flex-wrap gap-2">
                {['YouTube', 'Bilibili', 'TikTok', 'Spotify', 'Apple Music'].map(tag => (
                  <Button
                    key={tag}
                    variant="ghost"
                    onClick={() => setFormData({...formData, linkText: tag})}
                    className={`px-4 py-2 h-auto rounded-full text-sm font-medium transition-all border ${
                      formData.linkText === tag 
                        ? 'bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/25 hover:bg-brand-primary hover:text-black' 
                        : 'bg-secondary text-gray-400 border-white/5 hover:bg-secondary/80 hover:text-white'
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
           </div>
        </div>

        {/* 保存按钮 */}
        <Button 
          onClick={() => onSave(formData)}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black py-4 h-auto rounded-xl font-bold text-lg active:scale-95 transition shadow-lg shadow-brand-primary/20 mt-2"
        >
          Save Changes
        </Button>
      </motion.div>
    </>
  );
}

// 编辑个人资料弹窗组件
function EditProfileModal({ initialData, onClose, onSave }: {
  initialData: ProfileData,
  onClose: () => void,
  onSave: (data: ProfileData) => void
}) {
  const [formData, setFormData] = useState(initialData);

  // 处理头像上传预览
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <motion.div 
        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* 弹窗主体 - 底部抽屉样式 */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 z-[210] flex flex-col gap-6 border-t border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Edit Profile</h3>
          <button 
            onClick={onClose} 
            className="p-2 bg-jet rounded-full hover:bg-[#444] transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="space-y-5">
           {/* 头像上传 */}
           <div>
             <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
               <Upload className="w-4 h-4" /> Profile Avatar
             </label>
             <div className="flex items-center gap-4">
               <div className="w-20 h-20 rounded-full overflow-hidden bg-black/20 border border-white/5 shrink-0">
                 <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
               </div>
               <label className="flex-1 bg-jet hover:bg-jet/80 text-white py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition border border-white/5 font-medium">
                 <span>Change Avatar</span>
                 <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
               </label>
             </div>
           </div>

           {/* 基本信息 */}
           <div>
             <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
               <Type className="w-4 h-4" /> Nickname
             </label>
             <input
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               className="w-full bg-secondary text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all"
             />
           </div>

           <div>
             <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
               <MessageSquare className="w-4 h-4" /> Description
             </label>
             <input
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               className="w-full bg-secondary text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all"
             />
           </div>

           {/* 社交链接 */}
           <div className="space-y-4 border-t border-white/10 pt-4">
             <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
               <LinkIcon className="w-4 h-4" /> Social Links
             </label>
             
             <div className="space-y-3">
               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                 </div>
                 <input
                   value={formData.socials.instagram}
                   onChange={(e) => setFormData({ 
                     ...formData, 
                     socials: { ...formData.socials, instagram: e.target.value } 
                   })}
                   className="w-full bg-secondary text-white pl-12 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all text-sm"
                   placeholder="Instagram URL"
                 />
               </div>

               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                 </div>
                 <input
                   value={formData.socials.facebook}
                   onChange={(e) => setFormData({ 
                     ...formData, 
                     socials: { ...formData.socials, facebook: e.target.value } 
                   })}
                   className="w-full bg-secondary text-white pl-12 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all text-sm"
                   placeholder="Facebook URL"
                 />
               </div>

               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-2">
                    <Music2 className="w-4 h-4" />
                 </div>
                 <input
                   value={formData.socials.tiktok}
                   onChange={(e) => setFormData({ 
                     ...formData, 
                     socials: { ...formData.socials, tiktok: e.target.value } 
                   })}
                   className="w-full bg-secondary text-white pl-12 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all text-sm"
                   placeholder="TikTok URL"
                 />
               </div>

               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                 </div>
                 <input
                   value={formData.socials.donate}
                   onChange={(e) => setFormData({ 
                     ...formData, 
                     socials: { ...formData.socials, donate: e.target.value } 
                   })}
                   className="w-full bg-secondary text-white pl-12 p-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary border border-white/5 transition-all text-sm"
                   placeholder="Donate URL"
                 />
               </div>
             </div>
           </div>
        </div>

        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-brand-primary hover:bg-[#9ec5a7] text-white py-4 rounded-xl font-bold text-lg active:scale-95 transition shadow-lg shadow-brand-primary/20 mt-2"
        >
          Save Changes
        </button>
      </motion.div>
    </>
  );
}
