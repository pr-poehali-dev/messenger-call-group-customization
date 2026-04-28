import { useState } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { Contact } from '@/types/messenger';
import Icon from '@/components/ui/icon';

const STATUS_COLORS: Record<string, string> = {
  friend: 'bg-[hsl(142,71%,45%)]',
  pending: 'bg-[hsl(38,92%,50%)]',
  incoming: 'bg-[hsl(217,91%,55%)]',
};

const STATUS_LABELS: Record<string, string> = {
  friend: 'Друг',
  pending: 'Ожидание',
  incoming: 'Входящий',
};

function ContactCard({ contact }: { contact: Contact }) {
  const { user, status } = contact;
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
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
        <span className="text-xs text-[hsl(220,10%,45%)]">{STATUS_LABELS[status]}</span>
        {status === 'friend' && (
          <button className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-[hsl(220,18%,22%)] flex items-center justify-center transition-all">
            <Icon name="MessageCircle" size={15} className="text-[hsl(var(--primary))]" />
          </button>
        )}
        {status === 'incoming' && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))/0.15] hover:bg-[hsl(var(--primary))/0.25] flex items-center justify-center transition-colors">
              <Icon name="Check" size={14} className="text-[hsl(var(--primary))]" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
              <Icon name="X" size={14} className="text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const { contacts } = useMessengerStore();
  const [search, setSearch] = useState('');
  const [addUsername, setAddUsername] = useState('');

  const filtered = contacts.filter((c) =>
    c.user.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.username.toLowerCase().includes(search.toLowerCase())
  );

  const friends = filtered.filter((c) => c.status === 'friend');
  const pending = filtered.filter((c) => c.status !== 'friend');

  return (
    <div className="flex-1 flex flex-col bg-[hsl(220,16%,9%)] overflow-hidden">
      <div className="px-6 py-5 border-b border-[hsl(220,18%,15%)]">
        <h2 className="text-lg font-bold text-white mb-4">Контакты</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,40%)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск контактов..."
              className="w-full pl-8 pr-3 py-2.5 bg-[hsl(220,18%,16%)] rounded-xl text-sm text-[hsl(220,10%,80%)] placeholder-[hsl(220,10%,35%)] focus:outline-none focus:bg-[hsl(220,18%,20%)] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,40%)] text-sm">@</span>
            <input
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value)}
              placeholder="username"
              className="w-full pl-7 pr-3 py-2.5 bg-[hsl(220,18%,16%)] rounded-xl text-sm text-[hsl(220,10%,80%)] placeholder-[hsl(220,10%,35%)] focus:outline-none focus:bg-[hsl(220,18%,20%)] transition-colors"
            />
          </div>
          <button className="px-4 py-2.5 bg-[hsl(var(--primary))] hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5">
            <Icon name="UserPlus" size={15} />
            Добавить
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {friends.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[hsl(220,10%,40%)] uppercase tracking-wider px-2 mb-2">
              Друзья · {friends.length}
            </p>
            <div className="space-y-0.5">
              {friends.map((c) => <ContactCard key={c.user.id} contact={c} />)}
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[hsl(220,10%,40%)] uppercase tracking-wider px-2 mb-2">
              Запросы · {pending.length}
            </p>
            <div className="space-y-0.5">
              {pending.map((c) => <ContactCard key={c.user.id} contact={c} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Icon name="UserX" size={32} className="text-[hsl(220,10%,30%)] mx-auto mb-3" />
            <p className="text-[hsl(220,10%,40%)] text-sm">Контакты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
