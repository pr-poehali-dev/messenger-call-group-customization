import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/messenger';
import { api } from '@/api';

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, displayName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (username, password) => {
        try {
          const data = await api.auth.login(username, password);
          set({ currentUser: data.user, isAuthenticated: true });
          return { success: true };
        } catch (e: unknown) {
          return { success: false, error: e instanceof Error ? e.message : 'Ошибка входа' };
        }
      },

      register: async (username, displayName, password) => {
        if (username.length < 3) return { success: false, error: 'Username должен быть минимум 3 символа' };
        if (password.length < 6) return { success: false, error: 'Пароль должен быть минимум 6 символов' };
        try {
          const data = await api.auth.register(username, displayName, password);
          set({ currentUser: data.user, isAuthenticated: true });
          return { success: true };
        } catch (e: unknown) {
          return { success: false, error: e instanceof Error ? e.message : 'Ошибка регистрации' };
        }
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      updateProfile: async (data) => {
        const user = get().currentUser;
        if (!user) return;
        const newName = data.displayName ?? user.displayName;
        const newBio = data.bio ?? user.bio ?? '';
        await api.auth.updateProfile(user.id, newName, newBio);
        set({ currentUser: { ...user, ...data } });
      },
    }),
    { name: 'messenger-auth' }
  )
);
