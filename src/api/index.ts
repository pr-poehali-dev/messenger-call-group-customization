const URLS: Record<string, string> = {
  auth: 'https://functions.poehali.dev/b9938f15-6052-4e77-ae8e-87838198bbb7',
  calls: 'https://functions.poehali.dev/283c2f35-4d1f-4d67-9b45-f0e332f66462',
  chats: 'https://functions.poehali.dev/1f4e7ec1-b68f-4cea-8536-f8467fe605d0',
  contacts: 'https://functions.poehali.dev/e6fb252c-7040-4595-9706-3e95fbded6c3',
};

async function post(fn: string, body: object) {
  const res = await fetch(URLS[fn], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = typeof text === 'string' ? JSON.parse(text) : text;
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      post('auth', { action: 'login', username, password }),
    register: (username: string, display_name: string, password: string) =>
      post('auth', { action: 'register', username, display_name, password }),
    updateProfile: (user_id: string, display_name: string, bio: string) =>
      post('auth', { action: 'update_profile', user_id, display_name, bio }),
  },
  chats: {
    getChats: (user_id: string) =>
      post('chats', { action: 'get_chats', user_id }),
    getMessages: (chat_id: string, limit = 50) =>
      post('chats', { action: 'get_messages', chat_id, limit }),
    sendMessage: (chat_id: string, sender_id: string, text: string) =>
      post('chats', { action: 'send_message', chat_id, sender_id, text }),
    createChat: (user_id: string, other_id: string) =>
      post('chats', { action: 'create_chat', user_id, other_id }),
  },
  calls: {
    getCalls: (user_id: string) =>
      post('calls', { action: 'get_calls', user_id }),
    saveCall: (caller_id: string, callee_id: string, type: string, duration?: string) =>
      post('calls', { action: 'save_call', caller_id, callee_id, type, duration }),
  },
  contacts: {
    search: (query: string, exclude_id: string) =>
      post('contacts', { action: 'search', query, exclude_id }),
  },
};