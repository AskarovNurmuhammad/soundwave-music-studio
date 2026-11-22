import sqlite3
import os
import hashlib
import secrets
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

DB_PATH = os.path.join(os.path.dirname(__file__), "soundwave.db")

app = FastAPI(title="SoundWave Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        token TEXT,
        created_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        track_id TEXT NOT NULL,
        track_title TEXT NOT NULL,
        artist TEXT NOT NULL,
        cover_url TEXT,
        audio_url TEXT,
        genre TEXT,
        duration INTEGER,
        played_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        track_id TEXT NOT NULL,
        track_title TEXT NOT NULL,
        artist TEXT NOT NULL,
        cover_url TEXT,
        audio_url TEXT,
        genre TEXT,
        duration INTEGER,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, track_id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    conn.commit()
    conn.close()

init_db()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users WHERE token = ?", (token,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return None
    return dict(user)

def require_current_user(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Tizimga kirish talab qilinadi")
    return user

# Pydantic Schemas
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    login: str  # username or email
    password: str

class TrackData(BaseModel):
    id: str
    title: str
    artist: str
    coverUrl: Optional[str] = ""
    audioUrl: Optional[str] = ""
    genre: Optional[str] = ""
    duration: Optional[int] = 0

# Auth Endpoints
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    req.username = req.username.strip()
    req.email = req.email.strip().lower()
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Foydalanuvchi nomi kamida 3 belgidan iborat bo'lishi kerak")
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Parol kamida 4 belgidan iborat bo'lishi kerak")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (req.username, req.email))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Bunday foydalanuvchi nomi yoki email allaqachon mavjud")

    token = secrets.token_hex(24)
    now = datetime.now().isoformat()
    pwd_hash = hash_password(req.password)

    cursor.execute(
        "INSERT INTO users (username, email, password_hash, token, created_at) VALUES (?, ?, ?, ?, ?)",
        (req.username, req.email, pwd_hash, token, now)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "username": req.username,
            "email": req.email,
            "created_at": now
        }
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    login_val = req.login.strip().lower()
    pwd_hash = hash_password(req.password)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, email, password_hash, created_at FROM users WHERE lower(username) = ? OR lower(email) = ?",
        (login_val, login_val)
    )
    user = cursor.fetchone()
    if not user or user["password_hash"] != pwd_hash:
        conn.close()
        raise HTTPException(status_code=400, detail="Login yoki parol noto'g'ri")

    token = secrets.token_hex(24)
    cursor.execute("UPDATE users SET token = ? WHERE id = ?", (token, user["id"]))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
    }

@app.get("/api/auth/me")
def get_me(user = Depends(require_current_user)):
    return {"user": user}

@app.post("/api/auth/logout")
def logout(user = Depends(require_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET token = NULL WHERE id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return {"success": True}

# History Endpoints
@app.get("/api/history")
def get_history(user = Depends(require_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, track_id, track_title, artist, cover_url, audio_url, genre, duration, played_at FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 50",
        (user["id"],)
    )
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "historyId": r["id"],
            "id": r["track_id"],
            "title": r["track_title"],
            "artist": r["artist"],
            "coverUrl": r["cover_url"],
            "audioUrl": r["audio_url"],
            "genre": r["genre"],
            "duration": r["duration"],
            "playedAt": r["played_at"]
        })
    return {"history": history}

@app.post("/api/history")
def add_to_history(track: TrackData, user = Depends(require_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    # Delete recent duplicate to keep history clean
    cursor.execute("DELETE FROM history WHERE user_id = ? AND track_id = ?", (user["id"], track.id))
    cursor.execute(
        """
        INSERT INTO history (user_id, track_id, track_title, artist, cover_url, audio_url, genre, duration, played_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (user["id"], track.id, track.title, track.artist, track.coverUrl, track.audioUrl, track.genre, track.duration, now)
    )
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/history")
def clear_history(user = Depends(require_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history WHERE user_id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return {"success": True}

# Favorites Endpoints
@app.get("/api/favorites")
def get_favorites(user = Depends(require_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, track_id, track_title, artist, cover_url, audio_url, genre, duration, created_at FROM favorites WHERE user_id = ? ORDER BY id DESC",
        (user["id"],)
    )
    rows = cursor.fetchall()
    conn.close()

    favs = []
    for r in rows:
        favs.append({
            "favId": r["id"],
            "id": r["track_id"],
            "title": r["track_title"],
            "artist": r["artist"],
            "coverUrl": r["cover_url"],
            "audioUrl": r["audio_url"],
            "genre": r["genre"],
            "duration": r["duration"],
            "createdAt": r["created_at"]
        })
    return {"favorites": favs}

@app.post("/api/favorites/toggle")
def toggle_favorite(track: TrackData, user = Depends(require_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM favorites WHERE user_id = ? AND track_id = ?", (user["id"], track.id))
    existing = cursor.fetchone()

    is_favorite = False
    if existing:
        cursor.execute("DELETE FROM favorites WHERE id = ?", (existing["id"],))
        is_favorite = False
    else:
        now = datetime.now().isoformat()
        cursor.execute(
            """
            INSERT INTO favorites (user_id, track_id, track_title, artist, cover_url, audio_url, genre, duration, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user["id"], track.id, track.title, track.artist, track.coverUrl, track.audioUrl, track.genre, track.duration, now)
        )
        is_favorite = True

    conn.commit()
    conn.close()
    return {"success": True, "isFavorite": is_favorite}

# Live Internet Music Search & Trending via iTunes API
@app.get("/api/search")
def search_music(q: str):
    query = q.strip()
    if not query:
        return {"results": []}

    try:
        resp = requests.get(
            "https://itunes.apple.com/search",
            params={
                "term": query,
                "media": "music",
                "entity": "song",
                "limit": 25
            },
            timeout=8
        )
        if resp.status_code != 200:
            return {"results": []}

        data = resp.json()
        results = []
        for item in data.get("results", []):
            preview_url = item.get("previewUrl")
            if not preview_url:
                continue
            artwork = item.get("artworkUrl100", "")
            if artwork:
                # Upgrade to high resolution 600x600 artwork
                artwork = artwork.replace("100x100bb.jpg", "600x600bb.jpg")

            duration_sec = int((item.get("trackTimeMillis", 0)) / 1000)

            results.append({
                "id": f"itunes_{item.get('trackId')}",
                "title": item.get("trackName", "Noma'lum nom"),
                "artist": item.get("artistName", "Noma'lum ijrochi"),
                "album": item.get("collectionName", "Yakka ijro"),
                "coverUrl": artwork,
                "audioUrl": preview_url,
                "genre": item.get("primaryGenreName", "Pop"),
                "duration": duration_sec,
                "isOnline": True
            })

        return {"results": results}
    except Exception as e:
        return {"results": [], "error": str(e)}

@app.get("/api/trending")
def get_trending():
    trending_queries = ["top hits", "synthwave", "lo-fi chill", "global top"]
    query = "top hits 2026"
    try:
        resp = requests.get(
            "https://itunes.apple.com/search",
            params={
                "term": query,
                "media": "music",
                "entity": "song",
                "limit": 15
            },
            timeout=8
        )
        if resp.status_code != 200:
            return {"results": []}

        data = resp.json()
        results = []
        for item in data.get("results", []):
            preview_url = item.get("previewUrl")
            if not preview_url:
                continue
            artwork = item.get("artworkUrl100", "").replace("100x100bb.jpg", "600x600bb.jpg")
            duration_sec = int((item.get("trackTimeMillis", 0)) / 1000)

            results.append({
                "id": f"itunes_{item.get('trackId')}",
                "title": item.get("trackName"),
                "artist": item.get("artistName"),
                "album": item.get("collectionName"),
                "coverUrl": artwork,
                "audioUrl": preview_url,
                "genre": item.get("primaryGenreName", "Pop"),
                "duration": duration_sec,
                "isOnline": True
            })
        return {"results": results}
    except Exception as e:
        return {"results": [], "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
