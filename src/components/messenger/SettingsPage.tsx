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
      className={`w-10 h-6 rounded-full transition-all duration-200 relative ${value ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(220,18%,25%)]'}`}
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
    darkMode: true,
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
    <div className="flex-1 flex flex-col bg-[hsl(220,16%,9%)] overflow-y-auto">
      <div className="px-6 py-5 border-b border-[hsl(220,18%,15%)]">
        <h2 className="text-lg font-bold text-white">Настройки</h2>
      </div>

      <div className="px-6 py-6 max-w-lg space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-[hsl(220,10%,40%)] uppercase tracking-wider mb-2 px-1">{section.title}</p>
            <div className="bg-[hsl(220,18%,13%)] rounded-2xl overflow-hidden">
              {section.items.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < section.items.length - 1 ? 'border-b border-[hsl(220,18%,17%)]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[hsl(220,18%,20%)] flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={15} className="text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(220,10%,85%)]">{item.label}</p>
                    <p className="text-xs text-[hsl(220,10%,42%)]">{item.desc}</p>
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
          <p className="text-xs font-semibold text-[hsl(220,10%,40%)] uppercase tracking-wider mb-2 px-1">Аккаунт</p>
          <div className="bg-[hsl(220,18%,13%)] rounded-2xl overflow-hidden">
            {[
              { icon: 'Lock', label: 'Изменить пароль' },
              { icon: 'Download', label: 'Экспорт данных' },
            ].map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[hsl(220,18%,17%)] transition-colors text-left
                  ${i === 0 ? 'border-b border-[hsl(220,18%,17%)]' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[hsl(220,18%,20%)] flex items-center justify-center">
                  <Icon name={item.icon} size={15} className="text-[hsl(220,10%,55%)]" />
                </div>
                <span className="text-sm text-[hsl(220,10%,75%)]">{item.label}</span>
                <Icon name="ChevronRight" size={14} className="text-[hsl(220,10%,35%)] ml-auto" />
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/5 transition-colors text-left border-t border-[hsl(220,18%,17%)]"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Icon name="LogOut" size={15} className="text-red-400" />
              </div>
              <span className="text-sm text-red-400 font-medium">Выйти из аккаунта</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[hsl(220,10%,30%)] pb-4">
          Messenger v1.0 · Все данные хранятся на устройстве
        </p>
      </div>
    </div>
  );
}
