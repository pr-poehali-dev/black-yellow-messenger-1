"""
Авторизация 2Keys. Роутинг через поле action в теле запроса:
- action=send-code    — отправить OTP на номер телефона
- action=verify-code  — проверить OTP код
- action=register     — зарегистрировать пользователя (имя + пароль)
- action=login        — вход по телефону + пароль
- action=check-phone  — проверить, зарегистрирован ли номер
"""
import json
import os
import random
import hashlib
import time
import urllib.request
import urllib.parse
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def send_sms(phone: str, code: str) -> bool:
    api_key = os.environ.get("SMS_API_KEY", "")
    if not api_key:
        print(f"[2Keys SMS] Код для {phone}: {code}")
        return True
    digits = "".join(c for c in phone if c.isdigit())
    msg = urllib.parse.quote(f"Ваш код 2Keys: {code}. Не передавайте никому.")
    url = f"https://sms.ru/sms/send?api_id={api_key}&to={digits}&msg={msg}&json=1"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("status") == "OK"
    except Exception as e:
        print(f"SMS error: {e}")
        return False


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action", "")

    # ── check-phone ──────────────────────────────────────────────────────────
    if action == "check-phone":
        phone = (body.get("phone") or "").strip()
        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT name FROM {SCHEMA}.users WHERE phone=%s", (phone,))
        row = cur.fetchone()
        cur.close()
        db.close()
        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"registered": bool(row), "name": row[0] if row else None})}

    # ── send-code ────────────────────────────────────────────────────────────
    if action == "send-code":
        phone = (body.get("phone") or "").strip()
        if not phone or len("".join(c for c in phone if c.isdigit())) < 10:
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"error": "Неверный номер телефона"})}

        code = str(random.randint(100000, 999999))
        expires = int(time.time()) + 300

        db = get_db()
        cur = db.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.otp_codes (phone, code, expires_at, attempts) "
            f"VALUES (%s, %s, to_timestamp(%s), 0) "
            f"ON CONFLICT (phone) DO UPDATE SET code=%s, expires_at=to_timestamp(%s), attempts=0",
            (phone, code, expires, code, expires)
        )
        db.commit()
        cur.close()
        db.close()

        ok = send_sms(phone, code)
        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": ok})}

    # ── verify-code ──────────────────────────────────────────────────────────
    if action == "verify-code":
        phone = (body.get("phone") or "").strip()
        code = (body.get("code") or "").strip()

        db = get_db()
        cur = db.cursor()
        cur.execute(
            f"SELECT code, expires_at, attempts FROM {SCHEMA}.otp_codes WHERE phone=%s",
            (phone,)
        )
        row = cur.fetchone()

        if not row:
            cur.close(); db.close()
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"error": "Код не найден. Запросите новый."})}

        stored_code, expires_at, attempts = row

        if attempts >= 5:
            cur.close(); db.close()
            return {"statusCode": 429, "headers": CORS,
                    "body": json.dumps({"error": "Слишком много попыток. Запросите новый код."})}

        if expires_at.timestamp() < time.time():
            cur.close(); db.close()
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"error": "Код устарел. Запросите новый."})}

        if stored_code != code:
            cur.execute(
                f"UPDATE {SCHEMA}.otp_codes SET attempts=attempts+1 WHERE phone=%s", (phone,)
            )
            db.commit()
            cur.close(); db.close()
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"error": "Неверный код"})}

        cur.execute(f"DELETE FROM {SCHEMA}.otp_codes WHERE phone=%s", (phone,))
        cur.execute(f"SELECT name FROM {SCHEMA}.users WHERE phone=%s", (phone,))
        user = cur.fetchone()
        db.commit()
        cur.close()
        db.close()

        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "registered": bool(user), "name": user[0] if user else None})}

    # ── register ─────────────────────────────────────────────────────────────
    if action == "register":
        phone = (body.get("phone") or "").strip()
        name = (body.get("name") or "").strip()
        password = (body.get("password") or "")

        if not phone or not name or len(password) < 6:
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"error": "Заполните все поля. Пароль минимум 6 символов."})}

        pw_hash = hash_password(password)
        db = get_db()
        cur = db.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (phone, name, password_hash) VALUES (%s, %s, %s) "
            f"ON CONFLICT (phone) DO UPDATE SET name=%s, password_hash=%s",
            (phone, name, pw_hash, name, pw_hash)
        )
        db.commit()
        cur.close()
        db.close()

        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "name": name})}

    # ── login ────────────────────────────────────────────────────────────────
    if action == "login":
        phone = (body.get("phone") or "").strip()
        password = (body.get("password") or "")

        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT name, password_hash FROM {SCHEMA}.users WHERE phone=%s", (phone,))
        row = cur.fetchone()
        cur.close()
        db.close()

        if not row:
            return {"statusCode": 404, "headers": CORS,
                    "body": json.dumps({"error": "Номер не зарегистрирован"})}

        name, pw_hash = row
        if hash_password(password) != pw_hash:
            return {"statusCode": 401, "headers": CORS,
                    "body": json.dumps({"error": "Неверный пароль"})}

        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "name": name})}

    return {"statusCode": 400, "headers": CORS,
            "body": json.dumps({"error": "Неизвестное действие"})}