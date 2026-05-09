import { useEffect } from 'react';
import { User } from '@/types/messenger';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
}

export default function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full md:w-80 bg-white md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка с аватаром */}
        <div className="relative bg-gradient-to-br from-[hsl(var(--primary))] to-orange-400 pt-10 pb-6 px-6 flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={16} className="text-white" />
          </button>
          <div className="relative">
            <UserAvatar src={user.avatar} name={user.displayName} size={80} />
            {user.isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[hsl(var(--online))] border-2 border-white" />
            )}
          </div>
          <h2 className="mt-3 text-lg font-bold text-white">{user.displayName}</h2>
          <p className="text-sm text-white/80">@{user.username}</p>
        </div>

        {/* Инфо */}
        <div className="p-5 space-y-4">
          {user.bio && (
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">О себе</p>
              <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{user.bio}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center flex-shrink-0">
              <Icon name="AtSign" size={15} className="text-[hsl(var(--muted-foreground))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Username</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">@{user.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}