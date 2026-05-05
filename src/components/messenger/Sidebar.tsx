import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/store/authStore';

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

  return (
    <nav className="flex items-center gap-1 px-3 py-2 bg-[hsl(var(--sidebar-bg))] rounded-2xl shadow-xl shadow-black/40 border border-[hsl(25,20%,18%)]">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as Tab)}
            title={item.label}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[60px]
              ${isActive
                ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-orange-500/30'
                : 'text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white'}
            `}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}

      <div className="w-px h-8 bg-[hsl(25,20%,22%)] mx-1" />

      <div className="w-10 h-10 rounded-xl bg-[hsl(25,20%,22%)] flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-[hsl(25,15%,70%)]">
          {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
    </nav>
  );
}
