import { create } from 'zustand';
import { Chat, Message, CallRecord } from '@/types/messenger';
import { api } from '@/api';

interface MessengerStore {
  chats: Chat[];
  callHistory: CallRecord[];
  activeChat: string | null;
  messagesMap: Record<string, Message[]>;
  loading: boolean;
  setActiveChat: (id: string | null) => void;
  loadChats: (userId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, senderId: string, text: string) => Promise<void>;
  loadCalls: (userId: string) => Promise<void>;
}

export const useMessengerStore = create<MessengerStore>((set, get) => ({
  chats: [],
  callHistory: [],
  activeChat: null,
  messagesMap: {},
  loading: false,

  setActiveChat: (id) => {
    set({ activeChat: id });
    if (id) get().loadMessages(id);
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

  sendMessage: async (chatId, senderId, text) => {
    const data = await api.chats.sendMessage(chatId, senderId, text);
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

  loadCalls: async (userId) => {
    const data = await api.calls.getCalls(userId);
    set({ callHistory: data.calls || [] });
  },
}));
