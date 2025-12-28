import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { WelcomePage } from "./pages/Auth/Welcome";
import { LoginPage } from "./pages/Auth/Login";
import { RegisterPage } from "./pages/Auth/Register";
import { PasswordPage } from "./pages/Auth/Password";
import { ForgotPasswordPage } from "./pages/Auth/ForgotPassword";
import { ProfileSetupPage } from "./pages/Auth/ProfileSetup";
import { HomePage } from "./pages/Home/Home";
import { GroupChatPage } from "./pages/Home/GroupChat";
import { AvailableUser } from "./pages/Home/GroupChat"; // AvailableUser interface is exported from GroupChat now
import { ChatListPage, ChatUser } from "./pages/Home/ChatList";
import { DetailMessagePage } from "./pages/Home/DetailMessage";
import { KnowPeoplePage } from "./pages/KnowPeople";
import { GroupCardPage } from "./pages/Home/GroupCard";
import { ActivityPage } from "./pages/Home/Activity";
import { MuuZiPage } from "./pages/Home/Events";
import { GroupDetailsPage } from "./pages/Home/GroupDetails";
import { Group } from "./components/Group/GroupCard";
import { HomeHeader } from "./components/Home/HomeHeader";
import { HomeBottomNavigation, TabId } from "./components/Home/HomeBottomNavigation";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'login' | 'register' | 'password' | 'forgot-password' | 'profile-setup' | 'know-people' | 'home' | 'group-chat' | 'chat-list' | 'detail-message' | 'group-card-page' | 'activity' | 'profile-details' | 'events'>('welcome');
  const [selectedChatUser, setSelectedChatUser] = useState<AvailableUser | ChatUser | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [returnPage, setReturnPage] = useState<'group-chat' | 'chat-list'>('chat-list');
  const [previousTab, setPreviousTab] = useState<'home' | 'events' | 'activity'>('home');
  const [isReturningFromDetail, setIsReturningFromDetail] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerInvitationCode, setRegisterInvitationCode] = useState('');

  // Helper to determine if we are on a side page
  const isSidePage = ['group-chat', 'chat-list', 'detail-message'].includes(currentPage);

  // 计算当前 Active Tab
  const getActiveTab = (): TabId => {
    if (currentPage === 'activity') return 'notification';
    if (currentPage === 'events') return 'calendar';
    return 'home'; // 默认为 home
  };

  // 处理 Tab 切换
  const handleTabChange = (tab: TabId) => {
    if (tab === 'home') setCurrentPage('home');
    if (tab === 'calendar') setCurrentPage('events');
    if (tab === 'notification') setCurrentPage('activity');
  };

  // 判断是否需要显示共享的 Header 和 BottomNav
  const showSharedLayout = ['home', 'events', 'activity', 'group-chat', 'chat-list', 'group-card-page'].includes(currentPage);

  return (
    <div className="size-full overflow-hidden relative bg-app-dark">
      {currentPage === 'welcome' && (
        <WelcomePage onLogin={() => setCurrentPage('login')} />
      )}
      {currentPage === 'login' && (
        <LoginPage 
          onBack={() => setCurrentPage('welcome')} 
          onSignUp={() => setCurrentPage('register')}
          onLogin={() => setCurrentPage('home')}
          onForgotPassword={(email) => {
            setRegisterEmail(email || '');
            setCurrentPage('forgot-password');
          }}
        />
      )}
      {currentPage === 'register' && (
        <RegisterPage 
          onBack={() => setCurrentPage('welcome')}
          onSignIn={() => setCurrentPage('login')}
          initialEmail={registerEmail}
          initialInvitationCode={registerInvitationCode}
          onNext={(email, invitationCode) => {
            setRegisterEmail(email);
            setRegisterInvitationCode(invitationCode);
            // 验证码验证通过后，直接跳转到 ProfileSetup (根据最新需求)
            // 原流程是去 PasswordPage: setCurrentPage('password');
            setCurrentPage('profile-setup');
          }}
        />
      )}
      {currentPage === 'password' && (
        <PasswordPage 
          onBack={() => setCurrentPage('register')}
          onSignUp={() => setCurrentPage('profile-setup')}
          onForgotPassword={() => setCurrentPage('forgot-password')}
          onLogin={() => setCurrentPage('login')}
          email={registerEmail}
          initialInvitationCode={registerInvitationCode}
        />
      )}
      {currentPage === 'forgot-password' && (
        <ForgotPasswordPage 
          onBack={() => setCurrentPage('login')}
          onLogin={() => setCurrentPage('home')}
          initialEmail={registerEmail}
        />
      )}
      {currentPage === 'profile-setup' && (
        <ProfileSetupPage 
          onBack={() => setCurrentPage('password')}
          onSave={() => setCurrentPage('know-people')}
          email={registerEmail}
          invitationCode={registerInvitationCode}
          inviteCode={registerInvitationCode}
        />
      )}
      
      {/* Know People Page */}
      <AnimatePresence>
        {currentPage === 'know-people' && (
          <KnowPeoplePage 
            onBack={() => setCurrentPage('home')}
            onNext={() => setCurrentPage('home')}
          />
        )}
      </AnimatePresence>
      
      {/* 共享布局：Header */}
      {showSharedLayout && <HomeHeader />}

      {/* Home Page Flow */}
      {['home', 'group-chat', 'chat-list', 'detail-message', 'events', 'activity'].includes(currentPage) && (
        <div className="absolute inset-0 z-0">
             {/* 
                Home Page 作为背景层，始终存在于 Tab 切换和 Drawer 覆盖中
             */}
             <AnimatePresence>
               {(currentPage === 'home' || (isSidePage && previousTab === 'home')) && (
                  <HomePage 
                    key="home-page"
                    onOpenGroupChat={() => {
                      setPreviousTab('home');
                      setIsReturningFromDetail(false);
                      setSlideDirection('left');
                      setCurrentPage('group-chat');
                    }}
                    onOpenChat={() => {
                      setPreviousTab('home');
                      setIsReturningFromDetail(false);
                      setSlideDirection('right');
                      setCurrentPage('chat-list');
                    }}
                    onOpenKnowPeople={() => setCurrentPage('know-people')}
                    onOpenGroupCardPage={(group) => {
                      setSelectedGroup(group);
                      setCurrentPage('group-card-page');
                    }}
                    onOpenActivity={() => setCurrentPage('activity')}
                    onOpenCalendar={() => setCurrentPage('events')}
                  />
               )}
             </AnimatePresence>
        </div>
      )}

      {/* Events Page (Tab) */}
      <AnimatePresence>
        {(currentPage === 'events' || (isSidePage && previousTab === 'events')) && (
          <MuuZiPage 
            onOpenGroupChat={() => {
              setPreviousTab('events');
              setIsReturningFromDetail(false);
              setSlideDirection('left');
              setCurrentPage('group-chat');
            }}
            onOpenChat={() => {
              setPreviousTab('events');
              setIsReturningFromDetail(false);
              setSlideDirection('right');
              setCurrentPage('chat-list');
            }}
          />
        )}
      </AnimatePresence>

      {/* Activity Page (Tab) */}
      <AnimatePresence>
        {(currentPage === 'activity' || (isSidePage && previousTab === 'activity')) && (
          <ActivityPage 
            onOpenGroupChat={() => {
              setPreviousTab('activity');
              setIsReturningFromDetail(false);
              setSlideDirection('left');
              setCurrentPage('group-chat');
            }}
            onOpenChat={() => {
              setPreviousTab('activity');
              setIsReturningFromDetail(false);
              setSlideDirection('right');
              setCurrentPage('chat-list');
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Group Chat List (Left Side) */}
      <AnimatePresence>
        {(currentPage === 'group-chat' || (currentPage === 'detail-message' && returnPage === 'group-chat')) && (
           <GroupChatPage 
             slideDirection="left"
             shouldAnimateEntry={!isReturningFromDetail && currentPage === 'group-chat'}
             onBack={() => setCurrentPage(previousTab)} 
             onOpenChat={(user) => {
               setSelectedChatUser(user);
               setReturnPage('group-chat');
               setCurrentPage('detail-message');
             }}
           />
        )}
      </AnimatePresence>

      {/* Chat List (Right Side) */}
      <AnimatePresence>
        {(currentPage === 'chat-list' || (currentPage === 'detail-message' && returnPage === 'chat-list')) && (
           <ChatListPage 
             shouldAnimateEntry={!isReturningFromDetail && currentPage === 'chat-list'}
             onBack={() => setCurrentPage(previousTab)} 
             onOpenChat={(user) => {
               setSelectedChatUser(user);
               setReturnPage('chat-list');
               setCurrentPage('detail-message');
             }}
           />
        )}
      </AnimatePresence>

      {/* Detail Message Page (Chat) */}
      <AnimatePresence>
        {currentPage === 'detail-message' && (
          <DetailMessagePage 
            onBack={() => {
              setIsReturningFromDetail(true);
              setCurrentPage(returnPage);
            }}
            userName={selectedChatUser?.name}
            userAvatar={selectedChatUser?.avatar}
          />
        )}
      </AnimatePresence>

      {/* Group Card Page */}
      {currentPage === 'group-card-page' && (
        <GroupCardPage 
          group={selectedGroup} 
          onBack={() => setCurrentPage('home')} 
          onOpenProfile={() => setCurrentPage('profile-details')}
        />
      )}

      {/* Profile Details Page */}
      <AnimatePresence>
        {currentPage === 'profile-details' && (
          <GroupDetailsPage 
            onBack={() => setCurrentPage('group-card-page')}
          />
        )}
      </AnimatePresence>

      {/* 共享布局：Bottom Navigation */}
      {showSharedLayout && (
        <HomeBottomNavigation 
            activeTab={getActiveTab()}
            onTabChange={handleTabChange}
            onAddClick={() => setCurrentPage('know-people')}
        />
      )}
    </div>
  );
}
