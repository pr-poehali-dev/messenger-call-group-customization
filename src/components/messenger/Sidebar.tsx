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
] as const;

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const { currentUser } = useAuthStore();
  const { chats } = useMessengerStore();

  return (
    <nav className="flex items-center gap-0.5 px-1.5 py-1.5 bg-[hsl(var(--sidebar-bg))] rounded-2xl shadow-xl shadow-black/10 border border-[hsl(var(--border))]">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as Tab)}
            title={item.label}
            className={`
              relative flex flex-col items-center justify-center gap-0.5 w-14 h-11 rounded-xl transition-all duration-150
              ${isActive
                ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-orange-500/30'
                : 'text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))]'}
            `}
          >
            <Icon name={item.icon} size={18} />
            <span className="text-[9px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}

      <div className="w-px h-7 bg-[hsl(var(--border))] mx-1 shrink-0" />

      <div
        onClick={() => onSelect('profile')}
        className="w-11 h-11 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0 cursor-pointer hover:bg-orange-100 transition-colors"
      >
        <span className="text-sm font-bold text-[hsl(var(--foreground))]">
          {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
    </nav>
  );
}
