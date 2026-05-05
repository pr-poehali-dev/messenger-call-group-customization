import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ui/icon';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarB64, setAvatarB64] = useState<string | null>(null);
  const [avatarContentType, setAvatarContentType] = useState<string>('image/jpeg');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarContentType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      const base64 = result.split(',')[1];
      setAvatarB64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        bio,
        username: username !== currentUser.username ? username : undefined,
        ...(avatarB64 ? { avatar_b64: avatarB64, avatar_content_type: avatarContentType } : {}),
      } as Parameters<typeof updateProfile>[0]);
      setEditing(false);
      setAvatarPreview(null);
      setAvatarB64(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    }
    setSaving(false);
  };

  const avatarSrc = avatarPreview || currentUser.avatar || null;
  const avatarInitial = currentUser.displayName[0]?.toUpperCase() || '?';

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--background))] overflow-y-auto">
      <div className="px-6 py-5 border-b border-[hsl(var(--border))] bg-white">
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Профиль</h2>
      </div>

      <div className="px-6 py-6 max-w-lg">
        <div className="flex items-start gap-5 mb-6">
          {/* Аватар */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {avatarInitial}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="Camera" size={22} className="text-white" />
                </button>
              )}
            </div>
            {editing && (
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-[hsl(var(--primary))] hover:underline"
              >
                Изменить фото
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Инфо */}
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
                  <label className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Username</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] text-sm">@</span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                      className="w-full pl-7 pr-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                    />
                  </div>
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

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2 border border-red-200">
                    <Icon name="AlertCircle" size={14} />
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Сохранить
                  </button>
                  <button
                    onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarB64(null); setError(''); }}
                    className="px-4 py-2 bg-[hsl(var(--secondary))] hover:bg-orange-100 text-[hsl(var(--foreground))] text-sm rounded-xl transition-colors"
                  >
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
                  onClick={() => { setEditing(true); setDisplayName(currentUser.displayName); setBio(currentUser.bio || ''); setUsername(currentUser.username); }}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  <Icon name="Pencil" size={13} />
                  Редактировать
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Инфо об аккаунте */}
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
