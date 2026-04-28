import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Поиск пользователей по username"""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    conn = get_db()
    cur = conn.cursor()

    if action == 'search':
        query = body.get('query', '').strip().lower()
        exclude_id = body.get('exclude_id')
        cur.execute(
            'SELECT id, username, display_name, bio, is_online FROM users WHERE username ILIKE %s AND id != %s LIMIT 20',
            (f'%{query}%', exclude_id)
        )
        rows = cur.fetchall()
        conn.close()
        users = [{'id': str(r[0]), 'username': r[1], 'displayName': r[2], 'bio': r[3], 'isOnline': r[4]} for r in rows]
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'users': users})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
