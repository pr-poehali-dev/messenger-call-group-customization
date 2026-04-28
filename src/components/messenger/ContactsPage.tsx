import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMessengerStore } from '@/store/messengerStore';
import { User } from '@/types/messenger';
import { api } from '@/api';
import Icon from '@/components/ui/icon';

function UserCard({ user, onChat }: { user: User; onChat?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(220,14%,13%)] transition-colors group">
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-[hsl(200,70%,45%)] flex items-center justify-center text-white font-semibold">
          {user.displayName[0].toUpperCase()}
        </div>
        {user.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--online))] border-2 border-[hsl(220,18%,11%)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[hsl(220,10%,85%)]">{user.displayName}</p>
        <p className="text-xs text-[hsl(220,10%,45%)]">@{user.username}</p>
        {user.bio && <p className="text-xs text-[hsl(220,10%,38%)] truncate">{user.bio}</p>}
      </div>
      {onChat && (
        <button
          onClick={onChat}
          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-[hsl(220,18%,22%)] flex items-center justify-center transition-all"
        >
          <Icon name="MessageCircle" size={15} className="text-[hsl(var(--primary))]" />
        </button>
      )}
    </div>
  );
}

export default function ContactsPage() {
  const { currentUser } = useAuthStore();
  const { loadChats } = useMessengerStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const data = await api.contacts.search(q.trim(), currentUser?.id || '0');
    setResults(data.users || []);
    setSearching(false);
  };

  const handleStartChat = async (user: User) => {
    if (!currentUser) return;
    await api.chats.createChat(currentUser.id, user.id);
    await loadChats(currentUser.id);
    setSearch('');
    setResults([]);
  };

  return (
    <div className="flex-1 flex flex-col bg-[hsl(220,16%,9%)] overflow-hidden">
      <div className="px-6 py-5 border-b border-[hsl(220,18%,15%)]">
        <h2 className="text-lg font-bold text-white mb-4">Контакты</h2>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,40%)] text-sm">@</span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value.replace(/\s/g, '').toLowerCase())}
              placeholder="Найти пользователя по username..."
              className="w-full pl-7 pr-3 py-2.5 bg-[hsl(220,18%,16%)] rounded-xl text-sm text-[hsl(220,10%,80%)] placeholder-[hsl(220,10%,35%)] focus:outline-none focus:bg-[hsl(220,18%,20%)] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {searching && (
          <div className="text-center py-8 text-[hsl(220,10%,40%)] text-sm flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-[hsl(220,10%,30%)] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
            Поиск...
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[hsl(220,10%,40%)] uppercase tracking-wider px-2 mb-2">
              Результаты поиска · {results.length}
            </p>
            <div className="space-y-0.5">
              {results.map((u) => (
                <UserCard key={u.id} user={u} onChat={() => handleStartChat(u)} />
              ))}
            </div>
          </div>
        )}

        {search.length >= 2 && results.length === 0 && !searching && (
          <div className="text-center py-12">
            <Icon name="UserX" size={32} className="text-[hsl(220,10%,30%)] mx-auto mb-3" />
            <p className="text-[hsl(220,10%,40%)] text-sm">Пользователь @{search} не найден</p>
          </div>
        )}

        {search.length < 2 && (
          <div className="text-center py-16">
            <Icon name="Users" size={36} className="text-[hsl(220,10%,28%)] mx-auto mb-3" />
            <p className="text-[hsl(220,10%,38%)] text-sm font-medium">Найдите пользователей</p>
            <p className="text-[hsl(220,10%,30%)] text-xs mt-1">Введите минимум 2 символа username</p>
          </div>
        )}
      </div>
    </div>
  );
}
