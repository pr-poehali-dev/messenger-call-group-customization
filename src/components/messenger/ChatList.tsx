import { useState } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import { Chat } from '@/types/messenger';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';

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
  const isOnline = other?.isOnline;

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 flex items-center gap-3 rounded-xl transition-all duration-150 text-left
        ${isActive ? 'bg-orange-50 border border-orange-200' : 'hover:bg-[hsl(var(--secondary))]'}`}
    >
      <div className="relative flex-shrink-0">
        {chat.type === 'group' ? (
          <div className="w-11 h-11 rounded-xl bg-[hsl(280,60%,55%)] flex items-center justify-center text-white">
            <Icon name="Users" size={18} />
          </div>
        ) : (
          <UserAvatar src={other?.avatar} name={other?.displayName} size={44} />
        )}
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--online))] border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
            {name}
          </span>
          {chat.lastMessage && (
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
          {chat.lastMessage?.text || 'Нет сообщений'}
        </p>
      </div>
    </button>
  );
}

interface ChatListProps {
  onSettings: () => void;
}

export default function ChatList({ onSettings }: ChatListProps) {
  const { chats, activeChat, setActiveChat } = useMessengerStore();
  const [search, setSearch] = useState('');

  const filtered = chats.filter((c) => {
    const name = c.type === 'group' ? c.name : c.participants[1]?.displayName;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-72 flex flex-col bg-white border-r border-[hsl(var(--border))]">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Чаты</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onSettings}
              className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] hover:bg-orange-100 flex items-center justify-center transition-colors"
              title="Настройки"
            >
              <Icon name="Settings" size={15} className="text-[hsl(var(--muted-foreground))]" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] hover:bg-orange-100 flex items-center justify-center transition-colors" title="Новый чат">
              <Icon name="SquarePen" size={15} className="text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-8 pr-3 py-2 bg-[hsl(var(--secondary))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))] text-sm">Нет чатов</div>
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
