import json
import os
import psycopg2

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """История звонков: получить и сохранить"""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    conn = get_db()
    cur = conn.cursor()

    if action == 'get_calls':
        user_id = int(body['user_id'])
        cur.execute('''
            SELECT ch.id, ch.type, ch.duration, ch.created_at,
                   u_caller.display_name, u_caller.username,
                   u_callee.display_name, u_callee.username,
                   ch.caller_id, ch.callee_id
            FROM call_history ch
            LEFT JOIN users u_caller ON u_caller.id = ch.caller_id
            LEFT JOIN users u_callee ON u_callee.id = ch.callee_id
            WHERE ch.caller_id = %s OR ch.callee_id = %s
            ORDER BY ch.created_at DESC
            LIMIT 100
        ''', (user_id, user_id))
        rows = cur.fetchall()
        calls = []
        for r in rows:
            is_caller = str(r[8]) == str(user_id)
            contact_name = r[6] if is_caller else r[4]
            contact_username = r[7] if is_caller else r[5]
            call_type = r[1]
            calls.append({'id': str(r[0]), 'contactName': contact_name or '?', 'contactUsername': contact_username or '?', 'type': call_type, 'duration': r[2], 'createdAt': r[3].isoformat()})
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'calls': calls})}

    if action == 'save_call':
        caller_id = int(body['caller_id'])
        callee_id = int(body['callee_id'])
        call_type = body['type']
        duration = body.get('duration')
        cur.execute('INSERT INTO call_history (caller_id, callee_id, type, duration) VALUES (%s, %s, %s, %s) RETURNING id', (caller_id, callee_id, call_type, duration))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'id': str(row[0])})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
