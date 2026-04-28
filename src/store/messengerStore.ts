import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, Message, Contact, CallRecord } from '@/types/messenger';

interface MessengerStore {
  chats: Chat[];
  contacts: Contact[];
  callHistory: CallRecord[];
  activeChat: string | null;
  setActiveChat: (id: string | null) => void;
  sendMessage: (chatId: string, senderId: string, text: string) => void;
  initDemoData: (userId: string) => void;
}

export const useMessengerStore = create<MessengerStore>()(
  persist(
    (set, get) => ({
      chats: [],
      contacts: [],
      callHistory: [],
      activeChat: null,

      setActiveChat: (id) => set({ activeChat: id }),

      sendMessage: (chatId, senderId, text) => {
        const newMsg: Message = {
          id: Date.now().toString(),
          chatId,
          senderId,
          text,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, lastMessage: newMsg, unreadCount: 0 }
              : c
          ),
        }));
      },

      initDemoData: (userId) => {
        const existing = get().chats;
        if (existing.length > 0) return;

        const alice = { id: '1', username: 'alice', displayName: 'Алиса Иванова', isOnline: true };
        const bob = { id: '2', username: 'bob', displayName: 'Борис Смирнов', isOnline: false, lastSeen: '5 минут назад' };
        const carol = { id: '3', username: 'carol', displayName: 'Карина Волкова', isOnline: true };
        const me = { id: userId, username: 'me', displayName: 'Я', isOnline: true };

        const chats: Chat[] = [
          {
            id: 'chat-1',
            type: 'direct',
            participants: [me, alice],
            unreadCount: 2,
            createdAt: new Date().toISOString(),
            lastMessage: {
              id: 'm1',
              chatId: 'chat-1',
              senderId: '1',
              text: 'Привет! Как дела?',
              createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              isRead: false,
            },
          },
          {
            id: 'chat-2',
            type: 'direct',
            participants: [me, bob],
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            lastMessage: {
              id: 'm2',
              chatId: 'chat-2',
              senderId: userId,
              text: 'Договорились, увидимся завтра',
              createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              isRead: true,
            },
          },
          {
            id: 'chat-3',
            type: 'group',
            name: 'Команда проекта',
            participants: [me, alice, bob, carol],
            unreadCount: 5,
            createdAt: new Date().toISOString(),
            lastMessage: {
              id: 'm3',
              chatId: 'chat-3',
              senderId: '3',
              text: 'Встреча в 15:00 не забудьте!',
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              isRead: false,
            },
          },
        ];

        const contacts: Contact[] = [
          { user: alice, status: 'friend' },
          { user: bob, status: 'friend' },
          { user: carol, status: 'friend' },
          { user: { id: '4', username: 'denis', displayName: 'Денис Петров', isOnline: false, lastSeen: '1 час назад' }, status: 'pending' },
        ];

        const callHistory: CallRecord[] = [
          { id: 'c1', contactName: 'Алиса Иванова', contactUsername: 'alice', type: 'incoming', duration: '5:23', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
          { id: 'c2', contactName: 'Борис Смирнов', contactUsername: 'bob', type: 'outgoing', duration: '12:07', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
          { id: 'c3', contactName: 'Карина Волкова', contactUsername: 'carol', type: 'missed', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
          { id: 'c4', contactName: 'Алиса Иванова', contactUsername: 'alice', type: 'outgoing', duration: '3:45', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
        ];

        set({ chats, contacts, callHistory });
      },
    }),
    { name: 'messenger-data' }
  )
);
