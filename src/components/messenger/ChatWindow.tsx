import { useState, useRef, useEffect } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import UserProfileModal from '@/components/messenger/UserProfileModal';
import { User } from '@/types/messenger';

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

interface ChatWindowProps {
  onBack?: () => void;
}

export default function ChatWindow({ onBack }: ChatWindowProps) {
  const { chats, activeChat, sendMessage, messagesMap } = useMessengerStore();
  const { currentUser } = useAuthStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === activeChat);
  const other = chat?.type === 'direct'
    ? chat.participants.find((p) => p.id !== currentUser?.id)
    : null;
  const messages = activeChat ? (messagesMap[activeChat] || []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || !activeChat || !currentUser || sending) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    await sendMessage(activeChat, currentUser.id, msg);
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeChat || !chat) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageCircle" size={28} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Выберите чат для общения</p>
        </div>
      </div>
    );
  }

  const chatName = chat.type === 'group' ? chat.name : other?.displayName;

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--background))] absolute inset-0 md:relative md:inset-auto">
      {/* Шапка */}
      <div className="px-3 py-3.5 border-b border-[hsl(var(--border))] flex items-center gap-2 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden w-9 h-9 rounded-xl hover:bg-[hsl(var(--secondary))] flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Icon name="ArrowLeft" size={20} className="text-[hsl(var(--foreground))]" />
          </button>
        )}
        <button
          onClick={() => other && setProfileUser(other)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          {chat.type === 'group' ? (
            <div className="w-10 h-10 rounded-xl bg-[hsl(280,60%,55%)] flex items-center justify-center text-white flex-shrink-0">
              <Icon name="Users" size={16} />
            </div>
          ) : (
            <UserAvatar src={other?.avatar} name={other?.displayName} size={40} />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{chatName}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {chat.type === 'group'
                ? `${chat.participants.length} участников`
                : other?.isOnline ? 'В сети' : other?.lastSeen || 'Не в сети'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(var(--secondary))] flex items-center justify-center transition-colors">
            <Icon name="Phone" size={17} className="text-[hsl(var(--muted-foreground))]" />
          </button>
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(var(--secondary))] flex items-center justify-center transition-colors">
            <Icon name="Video" size={17} className="text-[hsl(var(--muted-foreground))]" />
          </button>
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(var(--secondary))] flex items-center justify-center transition-colors">
            <Icon name="MoreVertical" size={17} className="text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))] text-sm">
            Начните диалог — напишите первое сообщение
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser?.id;
          const sender = chat.participants.find((p) => p.id === msg.senderId);
          const showName = chat.type === 'group' && !isMe;
          const prevMsg = messages[i - 1];
          const sameAsPrev = prevMsg?.senderId === msg.senderId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-message-in ${sameAsPrev ? 'mt-0.5' : 'mt-2'}`}
            >
              {!isMe && (
                <div className="mr-2 flex-shrink-0 self-end">
                  {!sameAsPrev ? (
                    <UserAvatar src={sender?.avatar} name={sender?.displayName} size={32} />
                  ) : (
                    <div style={{ width: 32 }} />
                  )}
                </div>
              )}

              <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {showName && !sameAsPrev && (
                  <span className="text-[11px] text-[hsl(var(--muted-foreground))] mb-1 px-1">{sender?.displayName}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${isMe
                    ? 'bg-[hsl(var(--primary))] text-white rounded-br-sm'
                    : 'bg-white text-[hsl(var(--foreground))] rounded-bl-sm shadow-sm border border-[hsl(var(--border))]'
                  }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 px-1 flex items-center gap-1">
                  {formatMsgTime(msg.createdAt)}
                  {isMe && (
                    <Icon
                      name="CheckCheck"
                      size={12}
                      className={msg.isRead ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}
                    />
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Поле ввода */}
      <div className="px-4 py-3 pb-24 md:pb-3 border-t border-[hsl(var(--border))] bg-white">
        <div className="flex items-end gap-2">
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(var(--secondary))] flex items-center justify-center transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={18} className="text-[hsl(var(--muted-foreground))]" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Сообщение..."
              rows={1}
              className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] rounded-xl text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] transition-colors resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] hover:opacity-90 flex items-center justify-center transition-all duration-150 flex-shrink-0 disabled:opacity-30 hover:shadow-md hover:shadow-orange-500/25"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Icon name="Send" size={16} className="text-white" />
            }
          </button>
        </div>
      </div>

      {profileUser && (
        <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />
      )}
    </div>
  );
}