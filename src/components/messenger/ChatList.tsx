import { useState } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import { Chat } from '@/types/messenger';
import Icon from '@/components/ui/icon';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffHours = (now.getTime() - d.getTime()) / 3600000;
  if (diffHours < 24) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function ChatItem({ chat, isActive, onClick }: { chat: Chat; isActive: boolean; onClick: () => void }) {
  const { currentUser } = useAuthStore();
  const other = chat.type === 'direct'
    ? chat.participants.find((p) => p.id !== currentUser?.id)
    : null;

  const name = chat.type === 'group' ? chat.name : other?.displayName;
  const initial = name?.[0]?.toUpperCase() || '?';
  const isOnline = other?.isOnline;

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 flex items-center gap-3 rounded-xl transition-all duration-150 text-left
        ${isActive ? 'bg-[hsl(var(--primary))/0.12] border border-[hsl(var(--primary))/0.25]' : 'hover:bg-[hsl(220,14%,13%)]'}`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm
          ${chat.type === 'group' ? 'bg-[hsl(280,60%,50%)]' : 'bg-[hsl(200,70%,45%)]'}`}>
          {chat.type === 'group' ? <Icon name="Users" size={18} /> : initial}
        </div>
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--online))] border-2 border-[hsl(220,18%,11%)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-[hsl(220,10%,85%)]'}`}>
            {name}
          </span>
          {chat.lastMessage && (
            <span className="text-[11px] text-[hsl(220,10%,45%)] flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-[hsl(220,10%,45%)] truncate pr-2">
            {chat.lastMessage?.text || 'Нет сообщений'}
          </p>
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white text-[10px] font-bold flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ChatList() {
  const { chats, activeChat, setActiveChat } = useMessengerStore();
  const [search, setSearch] = useState('');

  const filtered = chats.filter((c) => {
    const name = c.type === 'group' ? c.name : c.participants[1]?.displayName;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-72 flex flex-col bg-[hsl(220,18%,11%)] border-r border-[hsl(220,18%,18%)]">
      <div className="p-4 border-b border-[hsl(220,18%,18%)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Чаты</h2>
          <button className="w-8 h-8 rounded-lg bg-[hsl(220,18%,20%)] hover:bg-[hsl(220,18%,25%)] flex items-center justify-center transition-colors">
            <Icon name="SquarePen" size={15} className="text-[hsl(220,10%,55%)]" />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,40%)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-8 pr-3 py-2 bg-[hsl(220,18%,18%)] rounded-lg text-sm text-[hsl(220,10%,80%)] placeholder-[hsl(220,10%,35%)] focus:outline-none focus:bg-[hsl(220,18%,22%)] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[hsl(220,10%,35%)] text-sm">Нет чатов</div>
        ) : (
          filtered.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChat === chat.id}
              onClick={() => setActiveChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
