import { useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageContextMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function MessageContextMenu({ x, y, isOwn, onReact, onDelete, onClose }: MessageContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 100,
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 160),
  };

  return (
    <div ref={ref} style={style} className="w-52 bg-white rounded-2xl shadow-2xl border border-[hsl(var(--border))] overflow-hidden animate-fade-in">
      {/* Реакции */}
      <div className="flex items-center justify-around px-2 py-2.5 border-b border-[hsl(var(--border))]">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onReact(emoji); onClose(); }}
            className="text-xl hover:scale-125 transition-transform active:scale-110 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Действия */}
      {isOwn && (
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <Icon name="Trash2" size={15} />
          Удалить сообщение
        </button>
      )}
    </div>
  );
}
