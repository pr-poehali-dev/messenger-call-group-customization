import { useState, useRef, useEffect } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ui/icon';

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow() {
  const { chats, activeChat, sendMessage, messagesMap } = useMessengerStore();
  const { currentUser } = useAuthStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
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
      <div className="flex-1 flex items-center justify-center bg-[hsl(220,16%,9%)]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(220,18%,16%)] flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageCircle" size={28} className="text-[hsl(220,10%,35%)]" />
          </div>
          <p className="text-[hsl(220,10%,40%)] text-sm">Выберите чат для общения</p>
        </div>
      </div>
    );
  }

  const chatName = chat.type === 'group' ? chat.name : other?.displayName;
  const chatInitial = chatName?.[0]?.toUpperCase() || '?';

  return (
    <div className="flex-1 flex flex-col bg-[hsl(220,16%,9%)]">
      <div className="px-5 py-3.5 border-b border-[hsl(220,18%,15%)] flex items-center gap-3 bg-[hsl(220,18%,11%)]">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0
          ${chat.type === 'group' ? 'bg-[hsl(280,60%,50%)]' : 'bg-[hsl(200,70%,45%)]'}`}>
          {chat.type === 'group' ? <Icon name="Users" size={16} /> : chatInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{chatName}</p>
          <p className="text-xs text-[hsl(220,10%,45%)]">
            {chat.type === 'group'
              ? `${chat.participants.length} участников`
              : other?.isOnline ? 'В сети' : other?.lastSeen || 'Не в сети'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,18%,18%)] flex items-center justify-center transition-colors">
            <Icon name="Phone" size={17} className="text-[hsl(220,10%,55%)]" />
          </button>
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,18%,18%)] flex items-center justify-center transition-colors">
            <Icon name="Video" size={17} className="text-[hsl(220,10%,55%)]" />
          </button>
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,18%,18%)] flex items-center justify-center transition-colors">
            <Icon name="MoreVertical" size={17} className="text-[hsl(220,10%,55%)]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-[hsl(220,10%,35%)] text-sm">
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
              {!isMe && !sameAsPrev && (
                <div className="w-8 h-8 rounded-lg bg-[hsl(200,70%,45%)] flex items-center justify-center text-white text-xs font-semibold mr-2 flex-shrink-0 self-end">
                  {sender?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              {!isMe && sameAsPrev && <div className="w-8 mr-2" />}

              <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {showName && !sameAsPrev && (
                  <span className="text-[11px] text-[hsl(220,10%,45%)] mb-1 px-1">{sender?.displayName}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${isMe
                    ? 'bg-[hsl(var(--primary))] text-white rounded-br-sm'
                    : 'bg-[hsl(220,18%,18%)] text-[hsl(220,10%,85%)] rounded-bl-sm'
                  }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-[hsl(220,10%,35%)] mt-1 px-1 flex items-center gap-1">
                  {formatMsgTime(msg.createdAt)}
                  {isMe && <Icon name="CheckCheck" size={12} className="text-[hsl(220,10%,40%)]" />}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-[hsl(220,18%,15%)] bg-[hsl(220,18%,11%)]">
        <div className="flex items-end gap-2">
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,18%,20%)] flex items-center justify-center transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={18} className="text-[hsl(220,10%,45%)]" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Сообщение..."
              rows={1}
              className="w-full px-4 py-2.5 bg-[hsl(220,18%,18%)] rounded-xl text-sm text-[hsl(220,10%,85%)] placeholder-[hsl(220,10%,35%)] focus:outline-none focus:bg-[hsl(220,18%,22%)] transition-colors resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] hover:bg-blue-500 flex items-center justify-center transition-all duration-150 flex-shrink-0 disabled:opacity-30 hover:shadow-md hover:shadow-blue-500/25"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Icon name="Send" size={16} className="text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
