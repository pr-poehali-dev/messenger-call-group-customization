import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Чаты и сообщения: получить список, историю, отправить сообщение"""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    conn = get_db()
    cur = conn.cursor()

    if action == 'get_chats':
        user_id = int(body['user_id'])
        cur.execute('''
            SELECT c.id, c.type, c.name, c.created_at,
                   (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_text,
                   (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_time,
                   (SELECT sender_id FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender,
                   (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND is_read = false AND sender_id != %s) as unread
            FROM chats c
            JOIN chat_members cm ON cm.chat_id = c.id
            WHERE cm.user_id = %s
            ORDER BY last_time DESC NULLS LAST
        ''', (user_id, user_id))
        chats_rows = cur.fetchall()
        result = []
        for row in chats_rows:
            chat_id = row[0]
            cur.execute('''
                SELECT u.id, u.username, u.display_name, u.bio, u.is_online, u.last_seen
                FROM users u JOIN chat_members cm ON cm.user_id = u.id WHERE cm.chat_id = %s
            ''', (chat_id,))
            members = [{'id': str(r[0]), 'username': r[1], 'displayName': r[2], 'bio': r[3], 'isOnline': r[4], 'lastSeen': str(r[5]) if r[5] else None} for r in cur.fetchall()]
            last_msg = None
            if row[4]:
                last_msg = {'id': '0', 'chatId': str(chat_id), 'senderId': str(row[6]) if row[6] else '', 'text': row[4], 'createdAt': row[5].isoformat() if row[5] else '', 'isRead': True}
            result.append({'id': str(chat_id), 'type': row[1], 'name': row[2], 'participants': members, 'lastMessage': last_msg, 'unreadCount': int(row[7]), 'createdAt': row[3].isoformat()})
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'chats': result})}

    if action == 'get_messages':
        chat_id = int(body['chat_id'])
        limit = int(body.get('limit', 50))
        cur.execute('SELECT id, chat_id, sender_id, text, is_read, created_at FROM messages WHERE chat_id = %s ORDER BY created_at ASC LIMIT %s', (chat_id, limit))
        rows = cur.fetchall()
        msgs = [{'id': str(r[0]), 'chatId': str(r[1]), 'senderId': str(r[2]) if r[2] else '', 'text': r[3], 'isRead': r[4], 'createdAt': r[5].isoformat()} for r in rows]
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'messages': msgs})}

    if action == 'send_message':
        chat_id = int(body['chat_id'])
        sender_id = int(body['sender_id'])
        text = body['text'].strip()
        cur.execute('INSERT INTO messages (chat_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, created_at', (chat_id, sender_id, text))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'message': {'id': str(row[0]), 'chatId': str(chat_id), 'senderId': str(sender_id), 'text': text, 'isRead': False, 'createdAt': row[1].isoformat()}})}

    if action == 'create_chat':
        user_id = int(body['user_id'])
        other_id = int(body['other_id'])
        cur.execute('''
            SELECT c.id FROM chats c
            JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
            JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
            WHERE c.type = 'direct'
        ''', (user_id, other_id))
        existing = cur.fetchone()
        if existing:
            conn.close()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'chat_id': str(existing[0])})}
        cur.execute("INSERT INTO chats (type) VALUES ('direct') RETURNING id")
        chat_id = cur.fetchone()[0]
        cur.execute('INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)', (chat_id, user_id, chat_id, other_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'chat_id': str(chat_id)})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
