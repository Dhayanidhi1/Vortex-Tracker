"""
LinkedIn Post Extractor — Configuration
"""
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# ── Credentials ──────────────────────────────────────────────
LINKEDIN_EMAIL    = os.getenv("LINKEDIN_EMAIL", "")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD", "")

# ── Keywords ─────────────────────────────────────────────────
KEYWORDS = [k.strip() for k in os.getenv("KEYWORDS", "Shayak Mazumder,Adya AI").split(",") if k.strip()]

# ── Search Configuration ─────────────────────────────────────
MAX_PAGES = int(os.getenv("MAX_PAGES", "5"))

# ── Date Range ───────────────────────────────────────────────
MONTHS_BACK = int(os.getenv("MONTHS_BACK", "6"))
START_DATE  = datetime.now() - timedelta(days=MONTHS_BACK * 30)
END_DATE    = datetime.now()

# ── Directories ───────────────────────────────────────────────
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./output")
LOG_DIR    = os.getenv("LOG_DIR",    "./logs")

# ── Browser ───────────────────────────────────────────────────
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"

# ── Proxy (optional) ─────────────────────────────────────────
USE_PROXY      = os.getenv("USE_PROXY", "false").lower() == "true"
PROXY_SERVER   = os.getenv("PROXY_SERVER",   os.getenv("PROXY_URL", ""))
PROXY_USERNAME = os.getenv("PROXY_USERNAME", "")
PROXY_PASSWORD = os.getenv("PROXY_PASSWORD", "")

# ── Timing ────────────────────────────────────────────────────
REQUEST_DELAY_MIN = float(os.getenv("REQUEST_DELAY_MIN", "1.5"))
REQUEST_DELAY_MAX = float(os.getenv("REQUEST_DELAY_MAX", "3.0"))
MAX_RETRIES       = int(os.getenv("MAX_RETRIES",   "3"))
TIMEOUT           = int(os.getenv("TIMEOUT",       "30"))

# ── Database / Cookies ────────────────────────────────────────
DATABASE_NAME = os.getenv("DATABASE_NAME", "linkedin_posts.db")
DATABASE_PATH = os.path.join(OUTPUT_DIR, DATABASE_NAME)

COOKIES_FILE = os.getenv("COOKIES_FILE", "linkedin_state.json")
COOKIES_PATH = os.path.join(OUTPUT_DIR, COOKIES_FILE)

# ── Post Types ────────────────────────────────────────────────
POST_TYPES = {
    "original": "Original Post",
    "repost":   "Repost",
    "article":  "Article",
    "shared":   "Shared Post",
    "unknown":  "Unknown",
}

# ── URLs ──────────────────────────────────────────────────────
LINKEDIN_LOGIN_URL  = "https://www.linkedin.com/login"
LINKEDIN_FEED_URL   = "https://www.linkedin.com/feed/"
LINKEDIN_SEARCH_URL = "https://www.linkedin.com/search/results/content/"


def get_search_url(keyword: str) -> str:
    """Generate LinkedIn exact-phrase search URL."""
    encoded = keyword.replace(" ", "%20")
    return (
        f"{LINKEDIN_SEARCH_URL}"
        f"?keywords=%22{encoded}%22"
        f"&origin=FACETED_SEARCH"
        f"&sortBy=%22date_posted%22"
    )


def ensure_directories():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(LOG_DIR,    exist_ok=True)
