import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/store/authStore';
import { useMessengerStore } from '@/store/messengerStore';

type Tab = 'chats' | 'contacts' | 'calls' | 'profile' | 'settings';

interface SidebarProps {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

const NAV_ITEMS = [
  { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'calls', icon: 'Phone', label: 'Звонки' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
] as const;

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const { currentUser } = useAuthStore();
  const { chats } = useMessengerStore();

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <nav className="flex items-center gap-1 px-2 py-2 bg-[hsl(var(--sidebar-bg))] rounded-2xl shadow-xl shadow-black/10 border border-[hsl(var(--border))]">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const showBadge = item.id === 'chats' && totalUnread > 0;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as Tab)}
            title={item.label}
            className={`
              relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all duration-150
              ${isActive
                ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-orange-500/30'
                : 'text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))]'}
            `}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>

            {showBadge && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[hsl(var(--primary))] text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        );
      })}

      <div className="w-px h-8 bg-[hsl(var(--border))] mx-1 shrink-0" />

      <div className="w-14 h-14 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-[hsl(var(--foreground))]">
          {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
    </nav>
  );
}
