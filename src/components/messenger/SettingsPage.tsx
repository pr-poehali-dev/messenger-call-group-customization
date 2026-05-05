import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ui/icon';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-6 rounded-full transition-all duration-200 relative ${value ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm ${value ? 'left-5' : 'left-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    readReceipts: true,
    onlineStatus: true,
    messagePreview: false,
    twoFactor: false,
    darkMode: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const sections = [
    {
      title: 'Уведомления',
      items: [
        { key: 'notifications', icon: 'Bell', label: 'Push-уведомления', desc: 'Получать уведомления о новых сообщениях' },
        { key: 'sounds', icon: 'Volume2', label: 'Звуки', desc: 'Звуковые уведомления' },
        { key: 'messagePreview', icon: 'Eye', label: 'Предпросмотр', desc: 'Показывать текст в уведомлениях' },
      ],
    },
    {
      title: 'Конфиденциальность',
      items: [
        { key: 'readReceipts', icon: 'CheckCheck', label: 'Подтверждения прочтения', desc: 'Показывать, что вы прочитали сообщение' },
        { key: 'onlineStatus', icon: 'Circle', label: 'Статус в сети', desc: 'Показывать, когда вы онлайн' },
        { key: 'twoFactor', icon: 'Shield', label: 'Двухфакторная аутентификация', desc: 'Дополнительная защита аккаунта' },
      ],
    },
    {
      title: 'Внешний вид',
      items: [
        { key: 'darkMode', icon: 'Moon', label: 'Тёмная тема', desc: 'Тёмный интерфейс' },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--background))] overflow-y-auto">
      <div className="px-6 py-5 border-b border-[hsl(var(--border))] bg-white">
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Настройки</h2>
      </div>

      <div className="px-6 py-6 max-w-lg space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 px-1">{section.title}</p>
            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
              {section.items.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < section.items.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={15} className="text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                  </div>
                  <Toggle
                    value={settings[item.key as keyof typeof settings]}
                    onChange={() => toggle(item.key as keyof typeof settings)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 px-1">Аккаунт</p>
          <div className="bg-white border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
            {[
              { icon: 'Lock', label: 'Изменить пароль' },
              { icon: 'Download', label: 'Экспорт данных' },
            ].map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[hsl(var(--secondary))] transition-colors text-left
                  ${i === 0 ? 'border-b border-[hsl(var(--border))]' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                  <Icon name={item.icon} size={15} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <span className="text-sm text-[hsl(var(--foreground))]">{item.label}</span>
                <Icon name="ChevronRight" size={14} className="text-[hsl(var(--muted-foreground))] ml-auto" />
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-left border-t border-[hsl(var(--border))]"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Icon name="LogOut" size={15} className="text-red-500" />
              </div>
              <span className="text-sm text-red-500 font-medium">Выйти из аккаунта</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] pb-4">
          BobroChat v1.0 · Все данные хранятся безопасно
        </p>
      </div>
    </div>
  );
}
