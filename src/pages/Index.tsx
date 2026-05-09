import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMessengerStore } from '@/store/messengerStore';
import AuthPage from '@/components/messenger/AuthPage';
import Sidebar from '@/components/messenger/Sidebar';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsPage from '@/components/messenger/ContactsPage';
import CallsPage from '@/components/messenger/CallsPage';
import ProfilePage from '@/components/messenger/ProfilePage';
import SettingsPage from '@/components/messenger/SettingsPage';

type Tab = 'chats' | 'contacts' | 'calls' | 'profile' | 'settings';

export default function Index() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const { loadChats, loadCalls } = useMessengerStore();
  const [activeTab, setActiveTab] = useState<Tab>('chats');

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadChats(currentUser.id);
      loadCalls(currentUser.id);
    }
  }, [isAuthenticated, currentUser?.id, loadChats, loadCalls]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <>
            <ChatList onSettings={() => setActiveTab('settings')} />
            <ChatWindow onBack={() => useMessengerStore.getState().setActiveChat(null)} />
          </>
        );
      case 'contacts':
        return <ContactsPage />;
      case 'calls':
        return <CallsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))] overflow-hidden animate-fade-in">
      <main className="flex-1 flex overflow-hidden pb-20 relative">
        {renderContent()}
      </main>
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar active={activeTab} onSelect={setActiveTab} />
        </div>
      </div>
    </div>
  );
}