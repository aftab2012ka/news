from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------- Config ----------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Waqt Ki Awaz API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("wka")

# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(hours=8),
               "type": "access"}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=7),
               "type": "refresh"}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def slugify(text: str) -> str:
    text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[-\s]+', '-', text).strip('-')

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_role(user: dict, roles: List[str]):
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

async def require_editor_or_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("admin", "editor", "reporter"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user

# ---------- Models ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["admin", "editor", "reporter"] = "reporter"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[Literal["admin", "editor", "reporter"]] = None
    password: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "Newspaper"
    order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None

class ArticleCreate(BaseModel):
    title: str
    summary: str = ""
    content: str = ""
    category_slug: str
    image_url: str = ""
    author_name: str = ""
    language: Literal["en", "ur", "kn"] = "en"
    status: Literal["draft", "published", "scheduled"] = "draft"
    is_featured: bool = False
    is_breaking: bool = False
    scheduled_at: Optional[str] = None
    tags: List[str] = []

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category_slug: Optional[str] = None
    image_url: Optional[str] = None
    author_name: Optional[str] = None
    language: Optional[Literal["en", "ur", "kn"]] = None
    status: Optional[Literal["draft", "published", "scheduled"]] = None
    is_featured: Optional[bool] = None
    is_breaking: Optional[bool] = None
    scheduled_at: Optional[str] = None
    tags: Optional[List[str]] = None

class VideoCreate(BaseModel):
    title: str
    description: str = ""
    youtube_url: str
    category_slug: Optional[str] = None

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    youtube_url: Optional[str] = None
    category_slug: Optional[str] = None

class SettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    tagline: Optional[str] = None
    about: Optional[str] = None
    contact_email: Optional[str] = None
    social: Optional[dict] = None

# ---------- Utilities ----------
def extract_youtube_id(url: str) -> Optional[str]:
    if not url:
        return None
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([A-Za-z0-9_-]{11})',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None

def clean_doc(d: dict) -> dict:
    if d is None:
        return d
    d.pop("_id", None)
    return d

# ---------- Auth Endpoints ----------
@api.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["id"], user["email"], user["role"])
    refresh = create_refresh_token(user["id"])
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=28800, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {
        "id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"],
        "access_token": access
    }

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}

# ---------- Categories ----------
@api.get("/categories")
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return cats

@api.post("/categories")
async def create_category(data: CategoryCreate, user: dict = Depends(require_admin)):
    slug = slugify(data.name)
    if await db.categories.find_one({"slug": slug}):
        raise HTTPException(status_code=400, detail="Category already exists")
    doc = {"id": str(uuid.uuid4()), "name": data.name, "slug": slug,
           "icon": data.icon or "Newspaper", "order": data.order,
           "created_at": now_iso()}
    await db.categories.insert_one(doc)
    return clean_doc(doc)

@api.put("/categories/{cat_id}")
async def update_category(cat_id: str, data: CategoryUpdate, user: dict = Depends(require_admin)):
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    if "name" in upd:
        upd["slug"] = slugify(upd["name"])
    if not upd:
        raise HTTPException(status_code=400, detail="Nothing to update")
    res = await db.categories.update_one({"id": cat_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    cat = await db.categories.find_one({"id": cat_id}, {"_id": 0})
    return cat

@api.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, user: dict = Depends(require_admin)):
    res = await db.categories.delete_one({"id": cat_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

# ---------- Articles ----------
@api.get("/articles")
async def list_articles(
    category: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = "published",
    featured: Optional[bool] = None,
    breaking: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(20, le=100),
    skip: int = 0,
    sort: str = "recent"  # recent | trending
):
    q: dict = {}
    if status:
        q["status"] = status
    if category:
        q["category_slug"] = category
    if language:
        q["language"] = language
    if featured is not None:
        q["is_featured"] = featured
    if breaking is not None:
        q["is_breaking"] = breaking
    if search:
        q["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"summary": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
        ]
    sort_field = ("views", -1) if sort == "trending" else ("published_at", -1)
    cursor = db.articles.find(q, {"_id": 0}).sort([sort_field]).skip(skip).limit(limit)
    return await cursor.to_list(limit)

@api.get("/articles/{article_id}")
async def get_article(article_id: str):
    art = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not art:
        raise HTTPException(status_code=404, detail="Not found")
    await db.articles.update_one({"id": article_id}, {"$inc": {"views": 1}})
    art["views"] = art.get("views", 0) + 1
    # prev/next based on published_at
    prev_art = await db.articles.find_one(
        {"published_at": {"$lt": art.get("published_at", now_iso())}, "status": "published",
         "language": art.get("language", "en")},
        {"_id": 0, "id": 1, "title": 1}, sort=[("published_at", -1)]
    )
    next_art = await db.articles.find_one(
        {"published_at": {"$gt": art.get("published_at", now_iso())}, "status": "published",
         "language": art.get("language", "en")},
        {"_id": 0, "id": 1, "title": 1}, sort=[("published_at", 1)]
    )
    # related: same category, exclude self
    related = await db.articles.find(
        {"category_slug": art.get("category_slug"), "status": "published",
         "id": {"$ne": article_id}, "language": art.get("language", "en")},
        {"_id": 0}
    ).sort("published_at", -1).limit(4).to_list(4)
    return {"article": art, "prev": prev_art, "next": next_art, "related": related}

@api.post("/articles")
async def create_article(data: ArticleCreate, user: dict = Depends(require_editor_or_admin)):
    aid = str(uuid.uuid4())
    pub_at = now_iso() if data.status == "published" else (data.scheduled_at or now_iso())
    doc = {
        "id": aid,
        **data.model_dump(),
        "slug": slugify(data.title) + "-" + aid[:6],
        "author_id": user["id"],
        "author_name": data.author_name or user.get("name", ""),
        "views": 0,
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "published_at": pub_at,
    }
    await db.articles.insert_one(doc)
    return clean_doc(doc)

@api.put("/articles/{article_id}")
async def update_article(article_id: str, data: ArticleUpdate, user: dict = Depends(require_editor_or_admin)):
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    upd["updated_at"] = now_iso()
    if upd.get("status") == "published":
        existing = await db.articles.find_one({"id": article_id})
        if existing and existing.get("status") != "published":
            upd["published_at"] = now_iso()
    res = await db.articles.update_one({"id": article_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    art = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return art

@api.delete("/articles/{article_id}")
async def delete_article(article_id: str, user: dict = Depends(require_editor_or_admin)):
    res = await db.articles.delete_one({"id": article_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

@api.get("/admin/articles")
async def admin_list_articles(user: dict = Depends(require_editor_or_admin),
                              status: Optional[str] = None,
                              limit: int = 100):
    q = {}
    if status:
        q["status"] = status
    cursor = db.articles.find(q, {"_id": 0}).sort("updated_at", -1).limit(limit)
    return await cursor.to_list(limit)

# ---------- Videos ----------
@api.get("/videos")
async def list_videos(category: Optional[str] = None, limit: int = 20):
    q = {}
    if category:
        q["category_slug"] = category
    cursor = db.videos.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    return await cursor.to_list(limit)

@api.post("/videos")
async def create_video(data: VideoCreate, user: dict = Depends(require_editor_or_admin)):
    yid = extract_youtube_id(data.youtube_url)
    if not yid:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    doc = {"id": str(uuid.uuid4()), **data.model_dump(), "youtube_id": yid,
           "created_at": now_iso()}
    await db.videos.insert_one(doc)
    return clean_doc(doc)

@api.put("/videos/{vid}")
async def update_video(vid: str, data: VideoUpdate, user: dict = Depends(require_editor_or_admin)):
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    if "youtube_url" in upd:
        yid = extract_youtube_id(upd["youtube_url"])
        if not yid:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        upd["youtube_id"] = yid
    res = await db.videos.update_one({"id": vid}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.videos.find_one({"id": vid}, {"_id": 0})

@api.delete("/videos/{vid}")
async def delete_video(vid: str, user: dict = Depends(require_editor_or_admin)):
    res = await db.videos.delete_one({"id": vid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

# ---------- Users ----------
@api.get("/users")
async def list_users(user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

@api.post("/users")
async def create_user(data: UserCreate, user: dict = Depends(require_admin)):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    uid = str(uuid.uuid4())
    doc = {"id": uid, "email": email, "name": data.name, "role": data.role,
           "password_hash": hash_password(data.password), "created_at": now_iso()}
    await db.users.insert_one(doc)
    doc.pop("password_hash", None)
    return clean_doc(doc)

@api.put("/users/{uid}")
async def update_user(uid: str, data: UserUpdate, user: dict = Depends(require_admin)):
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    if "password" in upd:
        upd["password_hash"] = hash_password(upd.pop("password"))
    res = await db.users.update_one({"id": uid}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.users.find_one({"id": uid}, {"_id": 0, "password_hash": 0})

@api.delete("/users/{uid}")
async def delete_user(uid: str, user: dict = Depends(require_admin)):
    if uid == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    res = await db.users.delete_one({"id": uid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

# ---------- Settings ----------
@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"id": "site"}, {"_id": 0})
    if not s:
        s = {"id": "site", "site_name": "Waqt Ki Awaz",
             "tagline": "Voice of the Time",
             "about": "Premium multilingual news for Karnataka and beyond.",
             "contact_email": "contact@waqtkiawaz.com",
             "social": {"twitter": "#", "facebook": "#", "instagram": "#", "youtube": "#"}}
    return s

@api.put("/settings")
async def update_settings(data: SettingsUpdate, user: dict = Depends(require_admin)):
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.settings.update_one({"id": "site"}, {"$set": upd}, upsert=True)
    s = await db.settings.find_one({"id": "site"}, {"_id": 0})
    return s

# ---------- Dashboard ----------
@api.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(require_editor_or_admin)):
    total_news = await db.articles.count_documents({})
    published = await db.articles.count_documents({"status": "published"})
    drafts = await db.articles.count_documents({"status": "draft"})
    total_categories = await db.categories.count_documents({})
    total_videos = await db.videos.count_documents({})
    total_users = await db.users.count_documents({})
    agg = await db.articles.aggregate([
        {"$group": {"_id": None, "views": {"$sum": "$views"}}}
    ]).to_list(1)
    total_views = (agg[0]["views"] if agg else 0)
    recent = await db.articles.find({}, {"_id": 0}).sort("updated_at", -1).limit(5).to_list(5)
    return {
        "total_news": total_news,
        "published": published,
        "drafts": drafts,
        "total_categories": total_categories,
        "total_videos": total_videos,
        "total_users": total_users,
        "total_views": total_views,
        "recent": recent,
    }

# ---------- Search ----------
@api.get("/search")
async def search(q: str, language: Optional[str] = None, limit: int = 30):
    if not q.strip():
        return []
    filt = {"status": "published",
            "$or": [
                {"title": {"$regex": q, "$options": "i"}},
                {"summary": {"$regex": q, "$options": "i"}},
                {"content": {"$regex": q, "$options": "i"}},
            ]}
    if language:
        filt["language"] = language
    return await db.articles.find(filt, {"_id": 0}).limit(limit).to_list(limit)

# ---------- App init ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Seed ----------
DEFAULT_CATEGORIES = [
    ("Home", "Home", 0), ("Breaking News", "Zap", 1), ("Politics", "Landmark", 2),
    ("Crime", "ShieldAlert", 3), ("Education", "GraduationCap", 4),
    ("Technology", "Cpu", 5), ("Business", "Briefcase", 6), ("Sports", "Trophy", 7),
    ("Health", "Heart", 8), ("Entertainment", "Film", 9), ("Local News", "MapPin", 10),
    ("Karnataka", "MapPin", 11), ("Bengaluru", "Building2", 12), ("Belagavi", "MapPin", 13),
    ("Davangere", "MapPin", 14), ("Vijayapura", "MapPin", 15), ("Hubballi", "MapPin", 16),
    ("Dharwad", "MapPin", 17), ("National", "Flag", 18), ("International", "Globe", 19),
]

SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557992260-ec58e38d363c?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2070&auto=format&fit=crop",
]

SAMPLE_ARTICLES = [
    ("Bengaluru Metro Phase 3 receives major funding boost",
     "Centre approves Rs 15,611 crore for Bengaluru's metro expansion across two corridors.",
     "bengaluru", True, True, "Aditi Sharma"),
    ("Karnataka announces new education policy for 2026",
     "State cabinet clears comprehensive reforms focused on multilingual learning and STEM.",
     "education", True, False, "Rahul Iyer"),
    ("Tech startup from Hubballi raises USD 12M Series A",
     "Local AI agritech company secures funding from leading silicon valley firms.",
     "technology", False, False, "Meera Patel"),
    ("Davangere cricket academy wins national championship",
     "Under-19 team from Davangere lifts the BCCI Vinoo Mankad trophy after thrilling final.",
     "sports", False, False, "Karan Desai"),
    ("Belagavi to host international film festival next month",
     "Five-day showcase will feature 80 films from 22 countries across multiple venues.",
     "entertainment", False, False, "Sneha Rao"),
    ("Vijayapura health camp screens 12,000 residents",
     "State health department's rural outreach program detects early-stage conditions.",
     "health", False, False, "Dr. Suresh Naik"),
    ("Dharwad farmers adopt precision agriculture tech",
     "Government partners with universities to deploy IoT sensors across 5,000 hectares.",
     "business", False, False, "Vinay Kulkarni"),
    ("National budget session prioritises infrastructure",
     "Finance ministry outlines 18 lakh crore capex for highways, railways, and ports.",
     "national", False, False, "Anita Verma"),
    ("UN climate summit reaches landmark agreement",
     "195 nations commit to accelerated emission cuts under new framework.",
     "international", False, False, "Reuters Desk"),
    ("Bengaluru police bust city-wide cybercrime ring",
     "Coordinated raids across 8 locations recover Rs 40 crore in assets.",
     "crime", False, True, "Crime Reporter"),
    ("Karnataka politics: cabinet reshuffle imminent",
     "CM expected to announce new portfolios after high command meeting in Delhi.",
     "politics", False, False, "Political Desk"),
    ("Local news roundup: civic projects across districts",
     "Updates on water supply, road work, and public transport from across the state.",
     "local-news", False, False, "Regional Desk"),
]

SAMPLE_VIDEOS = [
    ("Bengaluru Metro Phase 3 Explainer", "Routes, stations and timelines.",
     "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "bengaluru"),
    ("Karnataka Education Policy Breakdown", "What changes for students and teachers.",
     "https://www.youtube.com/watch?v=9bZkp7q19f0", "education"),
    ("Tech Startup Spotlight", "Hubballi-based agritech raises Series A.",
     "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "technology"),
]


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Administrator",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": now_iso()
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password")

    # Seed editor and reporter for completeness
    if not await db.users.find_one({"email": "editor@waqtkiawaz.com"}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": "editor@waqtkiawaz.com",
            "name": "Editor", "role": "editor",
            "password_hash": hash_password("editor123"), "created_at": now_iso()
        })
    if not await db.users.find_one({"email": "reporter@waqtkiawaz.com"}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": "reporter@waqtkiawaz.com",
            "name": "Reporter", "role": "reporter",
            "password_hash": hash_password("reporter123"), "created_at": now_iso()
        })


async def seed_categories():
    if await db.categories.count_documents({}) > 0:
        return
    docs = []
    for name, icon, order in DEFAULT_CATEGORIES:
        docs.append({"id": str(uuid.uuid4()), "name": name, "slug": slugify(name),
                     "icon": icon, "order": order, "created_at": now_iso()})
    await db.categories.insert_many(docs)
    logger.info(f"Seeded {len(docs)} categories")


async def seed_articles():
    if await db.articles.count_documents({}) > 0:
        return
    admin = await db.users.find_one({"role": "admin"})
    admin_id = admin["id"] if admin else "system"
    import random
    docs = []
    for i, (title, summary, cat, featured, breaking, author) in enumerate(SAMPLE_ARTICLES):
        aid = str(uuid.uuid4())
        img = SAMPLE_IMAGES[i % len(SAMPLE_IMAGES)]
        content = f"{summary}\n\n" + "This is a detailed news report covering the key developments. " * 6
        docs.append({
            "id": aid, "title": title, "summary": summary, "content": content,
            "category_slug": cat, "image_url": img, "author_id": admin_id,
            "author_name": author, "language": "en", "status": "published",
            "is_featured": featured, "is_breaking": breaking,
            "slug": slugify(title) + "-" + aid[:6],
            "scheduled_at": None, "tags": [],
            "views": random.randint(120, 3500),
            "created_at": now_iso(), "updated_at": now_iso(),
            "published_at": (datetime.now(timezone.utc) - timedelta(hours=i * 6)).isoformat()
        })
    await db.articles.insert_many(docs)
    logger.info(f"Seeded {len(docs)} articles")


async def seed_videos():
    if await db.videos.count_documents({}) > 0:
        return
    docs = []
    for title, desc, url, cat in SAMPLE_VIDEOS:
        yid = extract_youtube_id(url)
        docs.append({"id": str(uuid.uuid4()), "title": title, "description": desc,
                     "youtube_url": url, "youtube_id": yid, "category_slug": cat,
                     "created_at": now_iso()})
    await db.videos.insert_many(docs)


async def seed_settings():
    if not await db.settings.find_one({"id": "site"}):
        await db.settings.insert_one({
            "id": "site", "site_name": "Waqt Ki Awaz",
            "tagline": "Voice of the Time",
            "about": "Premium multilingual news for Karnataka and beyond — English, Urdu and Kannada.",
            "contact_email": "contact@waqtkiawaz.com",
            "social": {"twitter": "#", "facebook": "#", "instagram": "#", "youtube": "#"}
        })


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.articles.create_index([("published_at", -1)])
    await db.articles.create_index("category_slug")
    await db.articles.create_index("language")
    await db.categories.create_index("slug", unique=True)
    await seed_admin()
    await seed_categories()
    await seed_articles()
    await seed_videos()
    await seed_settings()
    logger.info("Startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
