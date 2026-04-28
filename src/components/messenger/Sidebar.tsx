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
    <aside className="w-16 flex flex-col items-center py-4 gap-1 bg-[hsl(220,18%,13%)] border-r border-[hsl(220,18%,18%)]">
      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
        <Icon name="MessageCircle" size={20} className="text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-1 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as Tab)}
              title={item.label}
              className={`
                w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-150
                ${isActive
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-blue-500/20'
                  : 'text-[hsl(220,10%,45%)] hover:bg-[hsl(220,18%,20%)] hover:text-[hsl(220,10%,70%)]'}
              `}
            >
              <Icon name={item.icon} size={20} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-2 px-2 w-full">
        <div className="w-full aspect-square rounded-xl bg-[hsl(220,18%,22%)] flex items-center justify-center">
          <span className="text-sm font-bold text-[hsl(220,10%,70%)]">
            {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
      </div>
    </aside>
  );
}
