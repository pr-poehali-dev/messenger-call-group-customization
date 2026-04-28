export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: string;
  theme?: 'light' | 'dark';
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export interface Contact {
  user: User;
  status: 'friend' | 'pending' | 'incoming';
}

export interface CallRecord {
  id: string;
  contactName: string;
  contactUsername: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration?: string;
  createdAt: string;
}
