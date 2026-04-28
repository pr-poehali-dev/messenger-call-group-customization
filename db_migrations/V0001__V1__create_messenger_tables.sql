
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT DEFAULT '',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('direct', 'group')),
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_members (
  chat_id INTEGER REFERENCES chats(id),
  user_id INTEGER REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  sender_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_history (
  id SERIAL PRIMARY KEY,
  caller_id INTEGER REFERENCES users(id),
  callee_id INTEGER REFERENCES users(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('incoming', 'outgoing', 'missed')),
  duration VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_call_history_caller ON call_history(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_history_callee ON call_history(callee_id);
