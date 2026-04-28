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
  const { initDemoData } = useMessengerStore();
  const [activeTab, setActiveTab] = useState<Tab>('chats');

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      initDemoData(currentUser.id);
    }
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <>
            <ChatList />
            <ChatWindow />
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
    <div className="h-screen flex bg-[hsl(220,16%,9%)] overflow-hidden animate-fade-in">
      <Sidebar active={activeTab} onSelect={setActiveTab} />
      <main className="flex-1 flex overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
