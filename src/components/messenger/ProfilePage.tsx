import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ui/icon';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ displayName, bio });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarColors = [
    'bg-[hsl(25,95%,53%)]', 'bg-[hsl(280,60%,55%)]', 'bg-[hsl(142,71%,40%)]',
    'bg-[hsl(200,70%,50%)]', 'bg-[hsl(0,72%,55%)]', 'bg-[hsl(38,92%,50%)]',
  ];
  const [selectedColor, setSelectedColor] = useState(0);

  if (!currentUser) return null;

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--background))] overflow-y-auto">
      <div className="px-6 py-5 border-b border-[hsl(var(--border))] bg-white">
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Профиль</h2>
      </div>

      <div className="px-6 py-6 max-w-lg">
        <div className="flex items-start gap-5 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-20 h-20 rounded-2xl ${avatarColors[selectedColor]} flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
              {currentUser.displayName[0].toUpperCase()}
            </div>
            <div className="flex gap-1">
              {avatarColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-4 h-4 rounded-full ${c} transition-transform ${selectedColor === i ? 'scale-125 ring-2 ring-gray-300' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 pt-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Имя</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">О себе</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-2 bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium rounded-xl transition-colors">
                    Сохранить
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 bg-[hsl(var(--secondary))] hover:bg-orange-100 text-[hsl(var(--foreground))] text-sm rounded-xl transition-colors">
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{currentUser.displayName}</h3>
                  {saved && (
                    <span className="text-xs text-[hsl(142,71%,40%)] flex items-center gap-1">
                      <Icon name="Check" size={12} /> Сохранено
                    </span>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--primary))] mb-1">@{currentUser.username}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{currentUser.bio || 'Нет описания'}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  <Icon name="Pencil" size={13} />
                  Редактировать
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Сообщений', value: '248', icon: 'MessageCircle' },
            { label: 'Контактов', value: '12', icon: 'Users' },
            { label: 'Звонков', value: '34', icon: 'Phone' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[hsl(var(--border))] rounded-xl p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">{s.value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Аккаунт</p>
          </div>
          {[
            { icon: 'AtSign', label: 'Username', value: `@${currentUser.username}` },
            { icon: 'Shield', label: 'Статус', value: 'В сети' },
            { icon: 'Calendar', label: 'Регистрация', value: 'Апрель 2026' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))] last:border-0">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={15} className="text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                <p className="text-sm text-[hsl(var(--foreground))]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
