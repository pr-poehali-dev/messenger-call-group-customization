import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/messenger';

type UserWithPassword = User & { password: string };

interface AuthStore {
  currentUser: User | null;
  users: UserWithPassword[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (username: string, displayName: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const MOCK_USERS: UserWithPassword[] = [
  { id: '1', username: 'alice', displayName: 'Алиса Иванова', bio: 'Дизайнер интерфейсов', isOnline: true, password: '123456' },
  { id: '2', username: 'bob', displayName: 'Борис Смирнов', bio: 'Разработчик', isOnline: false, lastSeen: '5 минут назад', password: '123456' },
  { id: '3', username: 'carol', displayName: 'Карина Волкова', bio: 'Маркетолог', isOnline: true, password: '123456' },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: MOCK_USERS,
      isAuthenticated: false,

      login: (username, password) => {
        const stored = get().users;
        const user = stored.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (!user) return { success: false, error: 'Неверный логин или пароль' };
        const { password: _p, ...cleanUser } = user;
        set({ currentUser: { ...cleanUser, isOnline: true }, isAuthenticated: true });
        return { success: true };
      },

      register: (username, displayName, password) => {
        const stored = get().users;
        if (stored.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
          return { success: false, error: 'Этот @username уже занят' };
        }
        if (username.length < 3) return { success: false, error: 'Username должен быть минимум 3 символа' };
        if (password.length < 6) return { success: false, error: 'Пароль должен быть минимум 6 символов' };
        const newUser: UserWithPassword = {
          id: Date.now().toString(),
          username,
          displayName,
          bio: '',
          isOnline: true,
          password,
        };
        set((state) => ({
          users: [...state.users, newUser],
          currentUser: { id: newUser.id, username: newUser.username, displayName: newUser.displayName, bio: newUser.bio, isOnline: true },
          isAuthenticated: true,
        }));
        return { success: true };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      updateProfile: (data) => {
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
          users: state.users.map((u) =>
            u.id === state.currentUser?.id ? { ...u, ...data } : u
          ),
        }));
      },
    }),
    { name: 'messenger-auth' }
  )
);
