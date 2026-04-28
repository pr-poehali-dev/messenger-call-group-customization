import json
import os
import hashlib
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей"""
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
            'INSERT INTO users (username, display_name, password_hash, bio) VALUES (%s, %s, %s, %s) RETURNING id, username, display_name, bio',
            (username, display_name, hash_password(password), '')
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {
            'statusCode': 200, 'headers': cors,
            'body': json.dumps({'user': {'id': str(row[0]), 'username': row[1], 'displayName': row[2], 'bio': row[3], 'isOnline': True}})
        }

    if action == 'login':
        username = body.get('username', '').strip().lower()
        password = body.get('password', '')

        cur.execute(
            'SELECT id, username, display_name, bio FROM users WHERE username = %s AND password_hash = %s',
            (username, hash_password(password))
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
        return {
            'statusCode': 200, 'headers': cors,
            'body': json.dumps({'user': {'id': str(row[0]), 'username': row[1], 'displayName': row[2], 'bio': row[3], 'isOnline': True}})
        }

    if action == 'update_profile':
        user_id = body.get('user_id')
        display_name = body.get('display_name', '').strip()
        bio = body.get('bio', '').strip()
        cur.execute('UPDATE users SET display_name = %s, bio = %s WHERE id = %s', (display_name, bio, user_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
