import json
import os
import base64
import uuid
import psycopg2
import boto3


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

def handler(event: dict, context) -> dict:
    """Чаты и сообщения: получить список, историю, отправить сообщение, загрузить медиа"""
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
                SELECT u.id, u.username, u.display_name, u.bio, u.is_online, u.last_seen, u.avatar_url
                FROM users u JOIN chat_members cm ON cm.user_id = u.id WHERE cm.chat_id = %s
            ''', (chat_id,))
            members = [{'id': str(r[0]), 'username': r[1], 'displayName': r[2], 'bio': r[3], 'isOnline': r[4], 'lastSeen': str(r[5]) if r[5] else None, 'avatar': r[6] or ''} for r in cur.fetchall()]
            last_msg = None
            if row[4]:
                last_msg = {'id': '0', 'chatId': str(chat_id), 'senderId': str(row[6]) if row[6] else '', 'text': row[4], 'createdAt': row[5].isoformat() if row[5] else '', 'isRead': True}
            result.append({'id': str(chat_id), 'type': row[1], 'name': row[2], 'participants': members, 'lastMessage': last_msg, 'unreadCount': int(row[7]), 'createdAt': row[3].isoformat()})
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'chats': result})}

    if action == 'get_messages':
        chat_id = int(body['chat_id'])
        limit = int(body.get('limit', 50))
        cur.execute('SELECT id, chat_id, sender_id, text, is_read, created_at, media_url, media_type FROM messages WHERE chat_id = %s ORDER BY created_at ASC LIMIT %s', (chat_id, limit))
        rows = cur.fetchall()
        msgs = [{'id': str(r[0]), 'chatId': str(r[1]), 'senderId': str(r[2]) if r[2] else '', 'text': r[3] or '', 'isRead': r[4], 'createdAt': r[5].isoformat(), 'mediaUrl': r[6], 'mediaType': r[7]} for r in rows]
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'messages': msgs})}

    if action == 'send_message':
        chat_id = int(body['chat_id'])
        sender_id = int(body['sender_id'])
        text = (body.get('text') or '').strip()
        media_url = body.get('media_url')
        media_type = body.get('media_type')
        cur.execute(
            'INSERT INTO messages (chat_id, sender_id, text, media_url, media_type) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at',
            (chat_id, sender_id, text, media_url, media_type)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'message': {'id': str(row[0]), 'chatId': str(chat_id), 'senderId': str(sender_id), 'text': text, 'isRead': False, 'createdAt': row[1].isoformat(), 'mediaUrl': media_url, 'mediaType': media_type}})}

    if action == 'upload_media':
        sender_id = body['sender_id']
        file_b64 = body['file_b64']
        content_type = body['content_type']
        ext = content_type.split('/')[-1].split(';')[0]
        key = f'chat-media/{sender_id}/{uuid.uuid4()}.{ext}'
        data = base64.b64decode(file_b64)
        s3 = get_s3()
        s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        media_type = 'video' if content_type.startswith('video') else 'image'
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'media_url': cdn_url, 'media_type': media_type})}

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

    if action == 'mark_read':
        chat_id = int(body['chat_id'])
        user_id = int(body['user_id'])
        cur.execute('UPDATE messages SET is_read = true WHERE chat_id = %s AND sender_id != %s', (chat_id, user_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
