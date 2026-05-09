import { create } from 'zustand';
import { Chat, Message, CallRecord } from '@/types/messenger';
import { api } from '@/api';
import { useAuthStore } from '@/store/authStore';

interface MessengerStore {
  chats: Chat[];
  callHistory: CallRecord[];
  activeChat: string | null;
  messagesMap: Record<string, Message[]>;
  loading: boolean;
  setActiveChat: (id: string | null) => void;
  loadChats: (userId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, senderId: string, text: string, mediaUrl?: string, mediaType?: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string, userId: string) => Promise<void>;
  toggleReaction: (chatId: string, messageId: string, userId: string, emoji: string, hasReacted: boolean) => Promise<void>;
  loadCalls: (userId: string) => Promise<void>;
}

export const useMessengerStore = create<MessengerStore>((set, get) => ({
  chats: [],
  callHistory: [],
  activeChat: null,
  messagesMap: {},
  loading: false,

  setActiveChat: (id) => {
    set((state) => ({
      activeChat: id,
      chats: id
        ? state.chats.map((c) => c.id === id ? { ...c, unreadCount: 0 } : c)
        : state.chats,
    }));
    if (id) {
      const { currentUser } = useAuthStore.getState();
      get().loadMessages(id).then(() => {
        if (currentUser) {
          api.chats.markRead(id, currentUser.id).then(() => {
            set((state) => ({
              messagesMap: {
                ...state.messagesMap,
                [id]: (state.messagesMap[id] || []).map((m) =>
                  m.senderId !== currentUser.id ? { ...m, isRead: true } : m
                ),
              },
            }));
          }).catch(() => {});
        }
      });
    }
  },

  loadChats: async (userId) => {
    set({ loading: true });
    try {
      const data = await api.chats.getChats(userId);
      set({ chats: data.chats || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadMessages: async (chatId) => {
    const data = await api.chats.getMessages(chatId);
    set((state) => ({
      messagesMap: { ...state.messagesMap, [chatId]: data.messages || [] },
    }));
  },

  sendMessage: async (chatId, senderId, text, mediaUrl?, mediaType?) => {
    const data = await api.chats.sendMessage(chatId, senderId, text, mediaUrl, mediaType);
    const newMsg: Message = data.message;
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [chatId]: [...(state.messagesMap[chatId] || []), newMsg],
      },
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, lastMessage: newMsg } : c
      ),
    }));
  },

  deleteMessage: async (chatId, messageId, userId) => {
    await api.chats.removeMessage(messageId, userId);
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [chatId]: (state.messagesMap[chatId] || []).map((m) =>
          m.id === messageId ? { ...m, isRemoved: true, text: '', mediaUrl: undefined } : m
        ),
      },
    }));
  },

  toggleReaction: async (chatId, messageId, userId, emoji, hasReacted) => {
    if (hasReacted) {
      await api.chats.removeReaction(messageId, userId, emoji);
    } else {
      await api.chats.addReaction(messageId, userId, emoji);
    }
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [chatId]: (state.messagesMap[chatId] || []).map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...(m.reactions || {}) };
          if (hasReacted) {
            reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
            if (reactions[emoji] === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = (reactions[emoji] || 0) + 1;
          }
          return { ...m, reactions };
        }),
      },
    }));
  },

  loadCalls: async (userId) => {
    const data = await api.calls.getCalls(userId);
    set({ callHistory: data.calls || [] });
  },
}));