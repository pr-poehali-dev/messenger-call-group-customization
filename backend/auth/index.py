import json
import os
import hashlib
import base64
import uuid
import psycopg2
import boto3

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def upload_avatar(user_id: str, image_b64: str, content_type: str = 'image/jpeg') -> str:
    data = base64.b64decode(image_b64)
    ext = content_type.split('/')[-1].replace('jpeg', 'jpg')
    key = f'avatars/{user_id}/{uuid.uuid4().hex}.{ext}'
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

def handler(event: dict, context) -> dict:
    """Регистрация, вход и обновление профиля пользователей"""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    conn = get_db()
    cur = conn.cursor()

    if action == 'register':
        username = body.get('username', '').strip().lower()
        display_name = body.get('display_name', '').strip()
        password = body.get('password', '')

        if len(username) < 3:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Username должен быть минимум 3 символа'})}
        if len(password) < 6:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'})}

        cur.execute('SELECT id FROM users WHERE username = %s', (username,))
        if cur.fetchone():
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Этот @username уже занят'})}

        cur.execute(
            'INSERT INTO users (username, display_name, password_hash, bio, avatar_url) VALUES (%s, %s, %s, %s, %s) RETURNING id, username, display_name, bio, avatar_url',
            (username, display_name, hash_password(password), '', '')
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {
            'statusCode': 200, 'headers': cors,
            'body': json.dumps({'user': {'id': str(row[0]), 'username': row[1], 'displayName': row[2], 'bio': row[3], 'avatar': row[4], 'isOnline': True}})
        }

    if action == 'login':
        username = body.get('username', '').strip().lower()
        password = body.get('password', '')

        cur.execute(
            'SELECT id, username, display_name, bio, avatar_url FROM users WHERE username = %s AND password_hash = %s',
            (username, hash_password(password))
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
        return {
            'statusCode': 200, 'headers': cors,
            'body': json.dumps({'user': {'id': str(row[0]), 'username': row[1], 'displayName': row[2], 'bio': row[3], 'avatar': row[4] or '', 'isOnline': True}})
        }

    if action == 'update_profile':
        user_id = body.get('user_id')
        display_name = body.get('display_name', '').strip()
        bio = body.get('bio', '').strip()
        new_username = body.get('username', '').strip().lower()
        avatar_b64 = body.get('avatar_b64')
        avatar_content_type = body.get('avatar_content_type', 'image/jpeg')

        avatar_url = None
        if avatar_b64:
            avatar_url = upload_avatar(user_id, avatar_b64, avatar_content_type)

        if new_username:
            if len(new_username) < 3:
                conn.close()
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Username должен быть минимум 3 символа'})}
            cur.execute('SELECT id FROM users WHERE username = %s AND id != %s', (new_username, user_id))
            if cur.fetchone():
                conn.close()
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Этот @username уже занят'})}

        if avatar_url and new_username:
            cur.execute('UPDATE users SET display_name = %s, bio = %s, username = %s, avatar_url = %s WHERE id = %s', (display_name, bio, new_username, avatar_url, user_id))
        elif avatar_url:
            cur.execute('UPDATE users SET display_name = %s, bio = %s, avatar_url = %s WHERE id = %s', (display_name, bio, avatar_url, user_id))
        elif new_username:
            cur.execute('UPDATE users SET display_name = %s, bio = %s, username = %s WHERE id = %s', (display_name, bio, new_username, user_id))
        else:
            cur.execute('UPDATE users SET display_name = %s, bio = %s WHERE id = %s', (display_name, bio, user_id))

        cur.execute('SELECT id, username, display_name, bio, avatar_url FROM users WHERE id = %s', (user_id,))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {
            'statusCode': 200, 'headers': cors,
            'body': json.dumps({'ok': True, 'user': {'id': str(row[0]), 'username': row[1], 'displayName': row[2], 'bio': row[3], 'avatar': row[4] or '', 'isOnline': True}})
        }

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
