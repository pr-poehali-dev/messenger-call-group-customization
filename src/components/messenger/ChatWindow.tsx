import { useState, useRef, useEffect, useCallback } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import UserProfileModal from '@/components/messenger/UserProfileModal';
import MessageContextMenu from '@/components/messenger/MessageContextMenu';
import { User, Message } from '@/types/messenger';

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

interface ChatWindowProps {
  onBack?: () => void;
}

interface ContextMenu {
  x: number;
  y: number;
  message: Message;
}

export default function ChatWindow({ onBack }: ChatWindowProps) {
  const { chats, activeChat, sendMessage, deleteMessage, toggleReaction, messagesMap } = useMessengerStore();
  const { currentUser } = useAuthStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video'; file: File } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chat = chats.find((c) => c.id === activeChat);
  const other = chat?.type === 'direct'
    ? chat.participants.find((p) => p.id !== currentUser?.id)
    : null;
  const messages = activeChat ? (messagesMap[activeChat] || []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const openMenu = useCallback((e: { clientX: number; clientY: number }, msg: Message) => {
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
  }, []);

  const handleRightClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    openMenu(e, msg);
  };

  const handleTouchStart = (e: React.TouchEvent, msg: Message) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      openMenu({ clientX: touch.clientX, clientY: touch.clientY }, msg);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type, file });
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!text.trim() && !mediaPreview) || !activeChat || !currentUser || sending) return;
    const msg = text.trim();
    setText('');
    setSending(true);

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    if (mediaPreview) {
      const file = mediaPreview.file;
      const b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const res = await api.chats.uploadMedia(currentUser.id, b64, file.type);
      mediaUrl = res.media_url;
      mediaType = res.media_type;
      setMediaPreview(null);
    }

    await sendMessage(activeChat, currentUser.id, msg, mediaUrl, mediaType);
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
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
          const reactionEntries = Object.entries(msg.reactions || {}).filter(([, count]) => count > 0);

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${sameAsPrev ? 'mt-0.5' : 'mt-3'}`}
            >
              {!isMe && (
                <div className="mr-2 flex-shrink-0 self-end mb-5">
                  {!sameAsPrev ? (
                    <UserAvatar src={sender?.avatar} name={sender?.displayName} size={32} />
                  ) : (
                    <div style={{ width: 32 }} />
                  )}
                </div>
              )}

              <div className={`max-w-[72vw] md:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {showName && !sameAsPrev && (
                  <span className="text-[11px] text-[hsl(var(--muted-foreground))] mb-1 px-1">{sender?.displayName}</span>
                )}

                <div
                  onContextMenu={(e) => !msg.isRemoved && handleRightClick(e, msg)}
                  onTouchStart={(e) => !msg.isRemoved && handleTouchStart(e, msg)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={`rounded-2xl overflow-hidden text-sm leading-relaxed select-none cursor-pointer
                    ${msg.isRemoved
                      ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] italic px-4 py-2.5'
                      : isMe
                        ? 'bg-[hsl(var(--primary))] text-white rounded-br-sm'
                        : 'bg-white text-[hsl(var(--foreground))] rounded-bl-sm shadow-sm border border-[hsl(var(--border))]'
                    }`}
                >
                  {msg.isRemoved ? (
                    <span>Сообщение удалено</span>
                  ) : (
                    <>
                      {msg.mediaUrl && msg.mediaType === 'image' && (
                        <img src={msg.mediaUrl} alt="фото" className="max-w-full block" style={{ maxHeight: 280 }} />
                      )}
                      {msg.mediaUrl && msg.mediaType === 'video' && (
                        <video src={msg.mediaUrl} controls className="max-w-full block" style={{ maxHeight: 280 }} />
                      )}
                      {msg.text && <p className="px-4 py-2.5">{msg.text}</p>}
                    </>
                  )}
                </div>

                {/* Реакции */}
                {reactionEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 px-1">
                    {reactionEntries.map(([emoji, count]) => {
                      const hasReacted = false;
                      return (
                        <button
                          key={emoji}
                          onClick={() => currentUser && toggleReaction(activeChat!, msg.id, currentUser.id, emoji, hasReacted)}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white border border-[hsl(var(--border))] text-xs shadow-sm hover:bg-orange-50 transition-colors"
                        >
                          <span>{emoji}</span>
                          <span className="text-[hsl(var(--muted-foreground))]">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 px-1 flex items-center gap-1">
                  {formatMsgTime(msg.createdAt)}
                  {isMe && !msg.isRemoved && (
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

      {/* Превью медиа */}
      {mediaPreview && (
        <div className="px-4 pb-2 bg-white border-t border-[hsl(var(--border))]">
          <div className="relative inline-block mt-2">
            {mediaPreview.type === 'image' ? (
              <img src={mediaPreview.url} alt="превью" className="h-20 rounded-xl object-cover" />
            ) : (
              <video src={mediaPreview.url} className="h-20 rounded-xl" />
            )}
            <button
              onClick={() => setMediaPreview(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center"
            >
              <Icon name="X" size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div className="px-4 py-3 pb-24 md:pb-3 border-t border-[hsl(var(--border))] bg-white">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-xl hover:bg-[hsl(var(--secondary))] flex items-center justify-center transition-colors flex-shrink-0"
          >
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
            disabled={(!text.trim() && !mediaPreview) || sending}
            className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] hover:opacity-90 flex items-center justify-center transition-all duration-150 flex-shrink-0 disabled:opacity-30 hover:shadow-md hover:shadow-orange-500/25"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Icon name="Send" size={16} className="text-white" />
            }
          </button>
        </div>
      </div>

      {/* Контекстное меню */}
      {contextMenu && currentUser && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={contextMenu.message.senderId === currentUser.id}
          onReact={(emoji) => {
            const msg = contextMenu.message;
            const hasReacted = (msg.reactions?.[emoji] || 0) > 0;
            toggleReaction(activeChat!, msg.id, currentUser.id, emoji, hasReacted);
          }}
          onDelete={() => deleteMessage(activeChat!, contextMenu.message.id, currentUser.id)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {profileUser && (
        <UserProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onChat={other ? () => { setProfileUser(null); } : undefined}
        />
      )}
    </div>
  );
}
