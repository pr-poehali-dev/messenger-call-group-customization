import { useMessengerStore } from '@/store/messengerStore';
import { CallRecord } from '@/types/messenger';
import Icon from '@/components/ui/icon';

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Вчера';
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

const CALL_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  incoming: { icon: 'PhoneIncoming', color: 'text-[hsl(142,71%,40%)]', label: 'Входящий' },
  outgoing: { icon: 'PhoneOutgoing', color: 'text-[hsl(var(--primary))]', label: 'Исходящий' },
  missed: { icon: 'PhoneMissed', color: 'text-red-500', label: 'Пропущенный' },
};

function CallItem({ call }: { call: CallRecord }) {
  const meta = CALL_ICONS[call.type];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--secondary))] transition-colors group">
      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center flex-shrink-0">
        <span className="text-base font-bold text-[hsl(var(--foreground))]">
          {call.contactName[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{call.contactName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Icon name={meta.icon} size={12} className={meta.color} />
          <span className={`text-xs ${meta.color}`}>{meta.label}</span>
          {call.duration && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">· {call.duration}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(call.createdAt)}</span>
        <button className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-orange-100 flex items-center justify-center transition-all">
          <Icon name="Phone" size={15} className="text-[hsl(var(--primary))]" />
        </button>
      </div>
    </div>
  );
}

export default function CallsPage() {
  const { callHistory } = useMessengerStore();

  const stats = {
    total: callHistory.length,
    missed: callHistory.filter((c) => c.type === 'missed').length,
  };

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--background))] overflow-hidden">
      <div className="px-6 py-5 border-b border-[hsl(var(--border))] bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Звонки</h2>
          <button className="px-3 py-1.5 bg-[hsl(var(--primary))] hover:opacity-90 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
            <Icon name="PhoneCall" size={13} />
            Новый звонок
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[hsl(var(--secondary))] rounded-xl p-3">
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Всего звонков</p>
          </div>
          <div className="bg-[hsl(var(--secondary))] rounded-xl p-3">
            <p className="text-2xl font-bold text-red-500">{stats.missed}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Пропущено</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-2 mb-3">
          История звонков
        </p>
        {callHistory.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="PhoneOff" size={32} className="text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Нет звонков</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {callHistory.map((call) => <CallItem key={call.id} call={call} />)}
          </div>
        )}
      </div>
    </div>
  );
}
