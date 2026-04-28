import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ui/icon';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    if (mode === 'login') {
      const result = login(username, password);
      if (!result.success) setError(result.error || '');
    } else {
      const result = register(username, displayName, password);
      if (!result.success) setError(result.error || '');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(220,18%,12%)] to-[hsl(220,18%,8%)]">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Icon name="MessageCircle" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Messenger</h1>
          <p className="text-[hsl(220,15%,55%)] text-sm mt-1">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <div className="bg-[hsl(220,18%,16%)] rounded-2xl p-6 shadow-xl border border-[hsl(220,18%,22%)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-[hsl(220,15%,55%)] uppercase tracking-wider">Имя</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                  required
                  className="w-full mt-1.5 px-4 py-3 bg-[hsl(220,18%,20%)] border border-[hsl(220,18%,26%)] rounded-xl text-white placeholder-[hsl(220,10%,40%)] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors text-sm"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-[hsl(220,15%,55%)] uppercase tracking-wider">Username</label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)] text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                  placeholder="username"
                  required
                  className="w-full pl-8 pr-4 py-3 bg-[hsl(220,18%,20%)] border border-[hsl(220,18%,26%)] rounded-xl text-white placeholder-[hsl(220,10%,40%)] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(220,15%,55%)] uppercase tracking-wider">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full mt-1.5 px-4 py-3 bg-[hsl(220,18%,20%)] border border-[hsl(220,18%,26%)] rounded-xl text-white placeholder-[hsl(220,10%,40%)] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2.5 border border-red-500/20">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[hsl(var(--primary))] hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Загрузка...
                </span>
              ) : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[hsl(220,18%,22%)] text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] transition-colors"
            >
              {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>

          {mode === 'login' && (
            <div className="mt-3 text-center">
              <p className="text-xs text-[hsl(220,10%,38%)]">Демо: @alice / 123456</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
